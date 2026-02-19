"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen, User } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const API_BASE = "http://127.0.0.1:8000";

export default function AdminCoursesPage() {
    const { user, userRole } = useAuth();
    const [courses, setCourses] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: "", description: "" });
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/courses`);
            const data = await res.json();
            if (data.courses) {
                setCourses(data.courses);
            }
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE}/courses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newCourse.title,
                    description: newCourse.description,
                    teacher_id: user.uid,
                    teacher_name: user.email.split("@")[0],
                    token: token
                })
            });

            if (res.ok) {
                setShowCreateModal(false);
                setNewCourse({ title: "", description: "" });
                fetchCourses();
            } else {
                alert("Failed to create course");
            }
        } catch (error) {
            console.error("Error creating course:", error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-heading font-bold text-zinc-900 uppercase tracking-tight">Course Management</h1>
                    <p className="text-xs text-zinc-500 mt-1 font-medium uppercase tracking-wide">Create and manage your courses</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                >
                    <Plus size={16} />
                    Create New Course
                </button>
            </div>

            {/* Course List */}
            {loading ? (
                <div className="text-center py-10 text-zinc-500 text-sm font-medium">Loading courses...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white border border-zinc-200 p-6 hover:border-zinc-900 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-zinc-100 border border-zinc-200 text-zinc-900">
                                    <BookOpen size={20} />
                                </div>
                                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">ID: {course.id.slice(0, 6)}...</span>
                            </div>
                            <h3 className="text-lg font-heading font-bold text-zinc-900 mb-2">{course.title}</h3>
                            <p className="text-zinc-500 text-sm mb-4 line-clamp-2 font-medium">{course.description}</p>
                            
                            <div className="flex items-center gap-2 text-xs text-zinc-400 border-t border-zinc-100 pt-4 group-hover:text-zinc-600 transition-colors">
                                <User size={14} />
                                <span className="font-mono">{course.teacher_name}</span>
                            </div>
                        </div>
                    ))}
                    
                    {courses.length === 0 && (
                            <div className="col-span-full text-center py-10 bg-zinc-50 border-2 border-dashed border-zinc-200">
                                <p className="text-zinc-500 text-sm font-medium">No courses found. Create your first course!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/20 backdrop-blur-sm p-4">
                    <div className="bg-white border border-zinc-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-zinc-200">
                            <h2 className="text-lg font-heading font-bold text-zinc-900 uppercase tracking-tight">Create New Course</h2>
                        </div>
                        <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Course Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newCourse.title}
                                    onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                                    className="w-full border border-zinc-200 px-4 py-2 text-zinc-900 focus:border-zinc-900 outline-none text-sm font-medium"
                                    placeholder="e.g. Advanced Python"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Description</label>
                                <textarea 
                                    required
                                    value={newCourse.description}
                                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                                    className="w-full border border-zinc-200 px-4 py-2 text-zinc-900 focus:border-zinc-900 outline-none h-24 text-sm font-medium resize-none"
                                    placeholder="Brief description of the course..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-zinc-600 hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors text-xs font-bold uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={creating}
                                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-70 flex items-center gap-2 transition-colors"
                                >
                                    {creating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    Create Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
