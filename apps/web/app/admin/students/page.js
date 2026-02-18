"use client";

import { useState } from "react";
import { Search, Filter, Plus, ChevronLeft, ChevronRight, Edit2, Eye, MoreHorizontal } from "lucide-react";

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Dummy Data
  const students = [
    { id: 1, name: "Arjun Singh", roll: "CS2101", branch: "CSE", year: "3rd", cgpa: 4.8, attendance: 65, avatar: "AS" },
    { id: 2, name: "Priya Sharma", roll: "CS2104", branch: "CSE", year: "3rd", cgpa: 8.5, attendance: 88, avatar: "PS" },
    { id: 3, name: "Rahul Verma", roll: "CS2109", branch: "ECE", year: "2nd", cgpa: 6.2, attendance: 72, avatar: "RV" },
    { id: 4, name: "Ananya Gupta", roll: "CS2115", branch: "CSE", year: "3rd", cgpa: 9.1, attendance: 92, avatar: "AG" },
    { id: 5, name: "Vikram Das", roll: "CS2120", branch: "MECH", year: "4th", cgpa: 4.5, attendance: 60, avatar: "VD" },
    { id: 6, name: "Neha Patel", roll: "CS2122", branch: "CSE", year: "3rd", cgpa: 5.8, attendance: 74, avatar: "NP" },
    { id: 7, name: "Rohan Mehta", roll: "CS2125", branch: "ECE", year: "2nd", cgpa: 7.9, attendance: 81, avatar: "RM" },
    { id: 8, name: "Sanya Kapoor", roll: "CS2128", branch: "CSE", year: "3rd", cgpa: 8.8, attendance: 95, avatar: "SK" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Roster</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage all registered students and viewing their performance.</p>
        </div>
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-red-500/20">
          <Plus size={18} />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
        <div className="flex gap-4">
            <div className="relative">
                <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select className="pl-10 pr-8 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none text-gray-900 dark:text-white appearance-none cursor-pointer">
                    <option>All Branches</option>
                    <option>CSE</option>
                    <option>ECE</option>
                    <option>MECH</option>
                </select>
            </div>
             <div className="relative">
                <select className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none text-gray-900 dark:text-white appearance-none cursor-pointer">
                    <option>All Years</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                </select>
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Roll No</th>
                <th className="px-6 py-4 font-semibold">Branch</th>
                <th className="px-6 py-4 font-semibold">Year</th>
                <th className="px-6 py-4 font-semibold">CGPA</th>
                <th className="px-6 py-4 font-semibold">Attendance</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        {student.avatar}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {student.roll}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                    {student.branch}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                    {student.year}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${student.cgpa < 5.0 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                        {student.cgpa}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${student.attendance < 75 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                      {student.attendance}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-slate-800 rounded-lg transition">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-white">1-8</span> of <span className="font-semibold text-gray-900 dark:text-white">128</span> students
            </span>
            <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50" disabled>
                    <ChevronLeft size={16} />
                </button>
                <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
