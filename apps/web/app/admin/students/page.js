"use client";

import { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const API_BASE = "http://127.0.0.1:8000";

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
        fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_BASE}/teacher/students`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                teacher_id: user.uid,
                token: token
            })
        });
        const data = await res.json();
        if (data.students) {
            setStudents(data.students);
        }
    } catch (error) {
        console.error("Failed to fetch students", error);
    } finally {
        setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-zinc-900 uppercase tracking-tight">Student Roster</h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium uppercase tracking-wide">Manage enrolled students across your courses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border border-zinc-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 focus:border-zinc-900 outline-none text-zinc-900 placeholder-zinc-400 text-sm font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 hover:border-zinc-900 transition-colors overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-zinc-500 text-sm font-medium">Loading roster...</div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">Name/Email</th>
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Branch</th>
                    <th className="px-6 py-4">Year</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-900 font-heading">
                            {student.avatar}
                        </div>
                        <div>
                          <span className="block font-bold text-zinc-900 text-sm font-heading">{student.name}</span>
                          <span className="text-xs text-zinc-500 font-mono">{student.email}</span>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-mono text-xs group-hover:text-zinc-900">
                        {student.roll}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 text-sm font-medium">
                        {student.branch}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 text-sm font-medium">
                        {student.year}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition">
                            <Eye size={16} />
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                {filteredStudents.length === 0 && (
                     <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-zinc-500 text-sm">
                            No students found.
                        </td>
                     </tr>
                )}
                </tbody>
            </table>
            </div>
        )}
      </div>
    </div>
  );
}
