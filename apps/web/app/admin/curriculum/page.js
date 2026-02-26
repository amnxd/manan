"use client";

import { Book, FileUp, MoreVertical, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

export default function CurriculumPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetch("https://manan-383u.onrender.com/courses")
                .then(res => res.json())
                .then(data => {
                    if (data.courses) {
                         const mapped = data.courses.map(c => ({
                             id: c.id,
                             title: c.title,
                             code: c.id.substring(0, 6).toUpperCase(),
                             doubts: c.doubts_count || 0,
                             coverage: c.syllabus_uploaded ? 100 : 0,
                             syllabus_uploaded: c.syllabus_uploaded
                         }));
                         setCourses(mapped);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const difficultTopics = [
        "Dynamic Programming (CS202)",
        "Semaphores (CS204)",
        "B-Trees (CS305)",
        "TCP Congestion (CS401)",
        "Graph Traversals (CS101)"
    ];

    const [draggingId, setDraggingId] = useState(null);

    const handleDragOver = (e, id) => {
        e.preventDefault();
        setDraggingId(id);
    };

    const handleDragLeave = () => {
        setDraggingId(null);
    };

    const handleDrop = async (e, courseId) => {
        e.preventDefault();
        setDraggingId(null);

        try {
            const token = await user.getIdToken();
            const res = await fetch(`https://manan-383u.onrender.com/courses/${courseId}/syllabus`, {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ token, file_url: "https://example.com/mock-syllabus.pdf" })
            });
            if (res.ok) {
                alert("Syllabus marked as uploaded!");
                setCourses(prev => prev.map(c => c.id === courseId ? { ...c, coverage: 100, syllabus_uploaded: true } : c));
            } else {
                alert("Upload failed");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const [deleteMenuOpen, setDeleteMenuOpen] = useState(null);

    const handleDelete = async (courseId) => {
        if (!confirm("Are you sure you want to delete this course?")) return;

        try {
            const token = await user.getIdToken();
            const res = await fetch(`https://manan-383u.onrender.com/courses/${courseId}?token=${token}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.status === "success") {
                setCourses(prev => prev.filter(c => c.id !== courseId));
                setDeleteMenuOpen(null);
            } else {
                alert("Failed to delete: " + data.message);
            }
        } catch (error) {
            console.error("Error deleting course:", error);
        }
    };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in zoom-in duration-300">
      
      {/* Main Grid */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
                  <h1 className="text-xl font-heading font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-tight">
                      <Book className="text-zinc-900" />
                Curriculum Manager
            </h1>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{courses.length} Active Courses</span>
        </div>

        {loading ? (
                  <p className="text-center text-zinc-500 text-sm font-medium">Loading courses...</p>
        ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {courses.map((subject) => (
                <div key={subject.id} className="bg-white border border-zinc-200 p-6 hover:border-zinc-900 transition-colors relative group">
                    <div className="flex justify-between items-start mb-4 relative">
                        <div className="p-2 bg-zinc-100 border border-zinc-200 text-zinc-900">
                            <Book size={20} />
                        </div>
                        <div className="relative">
                            <button 
                                onClick={() => setDeleteMenuOpen(deleteMenuOpen === subject.id ? null : subject.id)}
                                className="text-zinc-400 hover:text-zinc-900 p-1 transition-colors"
                            >
                                <MoreVertical size={18} />
                            </button>
                            
                            {deleteMenuOpen === subject.id && (
                                <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-zinc-200 shadow-lg z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                                    <button 
                                        onClick={() => handleDelete(subject.id)}
                                        className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <h3 className="text-lg font-heading font-bold text-zinc-900 line-clamp-1">{subject.title}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono mb-6 uppercase tracking-widest">{subject.code}</p>

                    <div className="space-y-3 mb-6">
                         <div className="flex justify-between text-sm">
                            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Doubts</span>
                            <span className="font-heading font-bold text-zinc-900">{subject.doubts}</span>
                         </div>
                         <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Syllabus Status</span>
                                <span className={`text-xs font-bold uppercase tracking-wider ${!subject.syllabus_uploaded ? "text-red-600" : "text-emerald-600"}`}>
                                    {subject.syllabus_uploaded ? "Uploaded" : "Pending"}
                                </span>
                            </div>
                            <div className="w-full h-1 bg-zinc-100 overflow-hidden">
                                <div 
                                    className={`h-full ${!subject.syllabus_uploaded ? "bg-red-500" : "bg-emerald-500"}`} 
                                    style={{ width: `${subject.coverage}%` }}
                                />
                            </div>
                         </div>
                    </div>

                    {/* Dropzone */}
                    <div 
                        className={`border-2 border-dashed p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                            draggingId === subject.id 
                            ? "border-zinc-900 bg-zinc-50"
                            : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
                        }`}
                        onDragOver={(e) => handleDragOver(e, subject.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, subject.id)}
                        onClick={() => document.getElementById(`file-upload-${subject.id}`).click()}
                    >
                        <input 
                            type="file" 
                            id={`file-upload-${subject.id}`}
                            className="hidden" 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    handleDrop({ preventDefault: () => {} }, subject.id, e.target.files[0]);
                                }
                            }}
                        />

                        {subject.syllabus_uploaded ? (
                             <>
                                <CheckCircle size={18} className="mb-2 text-emerald-500" />
                                <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Syllabus Added</span>
                             </>
                        ) : (
                             <>
                                    <FileUp size={18} className={`mb-2 ${draggingId === subject.id ? "text-zinc-900" : "text-zinc-400"}`} />
                                    <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Upload Syllabus</span>
                                    <span className="text-[10px] text-zinc-400 mt-1">Drag & drop or Click to Browse</span>
                             </>
                        )}
                    </div>
                </div>
            ))}
            
            {/* Add New Subject Placeholder */}
                          <button className="border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-3 text-zinc-400 hover:text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50 transition-all min-h-[300px]">
                              <div className="w-10 h-10 bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                                  <span className="text-xl font-light">+</span>
                </div>
                              <span className="text-xs font-bold uppercase tracking-widest">Add New Subject</span>
            </button>
        </div>
        )}
      </div>

      {/* Sidebar / Insight */}
      <div className="w-full lg:w-80 space-y-6">
              <div className="bg-white border border-zinc-200 hover:border-zinc-900 transition-colors p-6">
                  <h3 className="text-lg font-heading font-bold text-zinc-900 mb-4 flex items-center gap-2 uppercase tracking-tight">
                      <TrendingUp className="text-zinc-900" size={18} />
                Difficult Topics
            </h3>
                  <div className="space-y-3">
                {difficultTopics.map((topic, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-100 hover:border-zinc-300 transition-colors">
                        <span className="w-5 h-5 bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                             {index + 1}
                         </span>
                        <span className="text-sm font-medium text-zinc-700">{topic}</span>
                    </div>
                ))}
            </div>
                  <div className="mt-6 p-4 bg-zinc-50 border border-zinc-200">
                 <div className="flex items-start gap-2">
                          <AlertTriangle className="text-amber-500 flex-shrink-0" size={14} />
                          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                              Recommendation: Schedule remedial classes for <span className="font-bold text-zinc-900 border-b border-zinc-900">Dynamic Programming</span> as doubt frequency has increased by <span className="font-bold text-zinc-900">15%</span>.
                     </p>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
