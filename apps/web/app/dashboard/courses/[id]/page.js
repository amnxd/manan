"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { BookOpen, FileText, ArrowLeft, HelpCircle, Send, CheckCircle, Clock, X, MessageCircle } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

export default function CourseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    // Doubt State
    const [doubtOpen, setDoubtOpen] = useState(false);
    const [doubtQuestion, setDoubtQuestion] = useState("");
    const [submittingDoubt, setSubmittingDoubt] = useState(false);
    const [doubtSuccess, setDoubtSuccess] = useState(false);

    // Past Doubts
    const [myDoubts, setMyDoubts] = useState([]);
    const [loadingDoubts, setLoadingDoubts] = useState(false);

    useEffect(() => {
        if (user && id) {
            fetchCourseDetails();
            fetchMyDoubts();
        }
    }, [user, id]);

    const fetchCourseDetails = async () => {
        try {
            const res = await fetch(`${API_BASE}/courses/${id}`);
            const data = await res.json();
            if (data.status === "success" && data.course) {
                setCourse(data.course);
            } else {
                // Fallback: try fetching from /courses list
                const listRes = await fetch(`${API_BASE}/courses`);
                const listData = await listRes.json();
                if (listData.courses) {
                    const found = listData.courses.find(c => c.id === id);
                    if (found) setCourse(found);
                    else {
                        alert("Course not found");
                        router.push("/dashboard/courses");
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching course:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyDoubts = async () => {
        if (!user) return;
        setLoadingDoubts(true);
        try {
            const res = await fetch(`${API_BASE}/courses/${id}/doubts?student_id=${user.uid}`);
            const data = await res.json();
            if (data.status === "success") {
                setMyDoubts(data.doubts || []);
            }
        } catch (error) {
            console.error("Error fetching doubts:", error);
        } finally {
            setLoadingDoubts(false);
        }
    };

    const handleSubmitDoubt = async (e) => {
        e.preventDefault();
        setSubmittingDoubt(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE}/courses/doubts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_id: user.uid,
                    course_id: id,
                    question: doubtQuestion,
                    token: token
                })
            });

            if (res.ok) {
                setDoubtOpen(false);
                setDoubtQuestion("");
                setDoubtSuccess(true);
                setTimeout(() => setDoubtSuccess(false), 4000);
                // Refresh doubts list
                fetchMyDoubts();
            } else {
                alert("Failed to submit doubt.");
            }
        } catch (error) {
            console.error("Error submitting doubt:", error);
        } finally {
            setSubmittingDoubt(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-zinc-900 border-t-transparent"></div>
        </div>
    );
    if (!course) return <div className="p-10 text-center text-zinc-500 font-medium uppercase tracking-wider text-sm">Course not found.</div>;

    const syllabusTopics = course.syllabus_topics || [];

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-zinc-200">
                <button onClick={() => router.back()} className="p-2 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-heading font-bold text-zinc-900 uppercase tracking-tight">{course.title}</h1>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mt-1">
                        INSTR: {course.teacher_name || course.instructor || "Unknown"}
                    </p>
                </div>
            </div>

            {/* Success Banner */}
            {doubtSuccess && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 text-sm animate-in slide-in-from-top-2 flex items-center gap-3">
                    <CheckCircle size={18} />
                    <div>
                        <p className="font-bold uppercase tracking-wide text-xs">Doubt Submitted!</p>
                        <p className="text-sm">Your question has been sent to the instructor. You'll be notified when they respond.</p>
                    </div>
                </div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Overview, Syllabus & Doubts History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Course Overview */}
                    <div className="bg-white border border-zinc-200 hover:border-zinc-900 transition-colors">
                        <div className="p-6 border-b border-zinc-100">
                            <h2 className="text-lg font-heading font-bold uppercase tracking-tight flex items-center gap-2 text-zinc-900">
                                <BookOpen className="text-zinc-900" size={20} />
                                Course Overview
                            </h2>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                                {course.description || "No description provided for this course."}
                            </p>
                        </div>
                    </div>

                    {/* Syllabus */}
                    <div className="bg-white border border-zinc-200 hover:border-zinc-900 transition-colors">
                        <div className="p-6 border-b border-zinc-100">
                            <h2 className="text-lg font-heading font-bold uppercase tracking-tight flex items-center gap-2 text-zinc-900">
                                <FileText className="text-zinc-900" size={20} />
                                Syllabus
                            </h2>
                        </div>
                        <div className="p-6">
                            {syllabusTopics.length > 0 ? (
                                <div className="space-y-0">
                                    {syllabusTopics.map((topic, idx) => (
                                        <div key={idx} className="flex items-start gap-4 py-3 border-b border-zinc-100 last:border-0 group">
                                            <span className="text-xs font-bold text-zinc-400 font-mono w-8 shrink-0 pt-0.5 group-hover:text-zinc-900 transition-colors">
                                                {String(idx + 1).padStart(2, "0")}
                                            </span>
                                            <span className="text-sm text-zinc-700 font-medium group-hover:text-zinc-900 transition-colors">
                                                {topic}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : course.syllabus_uploaded ? (
                                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200">
                                    <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                            <h3 className="font-heading font-bold text-zinc-900 text-sm uppercase tracking-tight">Course Syllabus</h3>
                                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Available</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-400 bg-zinc-50 border border-dashed border-zinc-200">
                                    <p className="text-sm font-medium">Syllabus has not been uploaded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* My Doubts History */}
                    <div className="bg-white border border-zinc-200 hover:border-zinc-900 transition-colors">
                        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                            <h2 className="text-lg font-heading font-bold uppercase tracking-tight flex items-center gap-2 text-zinc-900">
                                <MessageCircle className="text-zinc-900" size={20} />
                                My Doubts
                            </h2>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 border border-zinc-200 px-2 py-1">
                                {myDoubts.length} Total
                            </span>
                        </div>
                        <div className="divide-y divide-zinc-100">
                            {loadingDoubts ? (
                                <div className="p-6 text-center">
                                    <div className="inline-block animate-spin h-5 w-5 border-2 border-zinc-900 border-t-transparent"></div>
                                </div>
                            ) : myDoubts.length > 0 ? (
                                myDoubts.map((doubt) => (
                                    <div key={doubt.id} className="p-5 hover:bg-zinc-50 transition-colors group">
                                        <div className="flex items-start justify-between gap-4">
                                            <p className="text-sm text-zinc-800 font-medium flex-1">{doubt.question}</p>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider shrink-0 ${doubt.status === "resolved"
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                    : "bg-amber-50 text-amber-600 border-amber-200"
                                                }`}>
                                                {doubt.status === "resolved" ? <CheckCircle size={10} /> : <Clock size={10} />}
                                                {doubt.status}
                                            </span>
                                        </div>
                                        {doubt.faculty_answer && (
                                            <div className="mt-3 pl-4 border-l-2 border-zinc-200">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Faculty Reply</p>
                                                <p className="text-sm text-zinc-600">{doubt.faculty_answer}</p>
                                            </div>
                                        )}
                                        {doubt.created_at && (
                                            <p className="text-[10px] text-zinc-400 mt-2 font-mono">
                                                {new Date(doubt.created_at).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                ))
                                ) : (
                                <div className="p-8 text-center text-zinc-400">
                                    <p className="text-sm font-medium">No doubts asked yet. Use the panel on the right to ask your first question!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Ask Doubt */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-900 text-white">
                        <div className="p-6">
                            <h2 className="text-lg font-heading font-bold mb-2 flex items-center gap-2 uppercase tracking-tight">
                                <HelpCircle className="text-zinc-400" size={20} />
                                Have a Doubt?
                            </h2>
                            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-6">
                                Ask your instructor directly. Get clarifications on topics you find difficult.
                            </p>
                            <button
                                onClick={() => setDoubtOpen(true)}
                                className="w-full py-3 bg-white text-zinc-900 font-heading font-bold text-xs uppercase tracking-widest hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2"
                            >
                                Ask Question
                            </button>
                        </div>
                    </div>

                    {/* Course Info Card */}
                    {(course.department || course.semester || course.code) && (
                        <div className="bg-white border border-zinc-200 hover:border-zinc-900 transition-colors">
                            <div className="p-6 border-b border-zinc-100">
                                <h3 className="text-sm font-heading font-bold uppercase tracking-widest text-zinc-500">Course Info</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {course.code && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Code</span>
                                        <span className="text-sm font-mono font-bold text-zinc-900">{course.code}</span>
                                    </div>
                                )}
                                {course.department && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Department</span>
                                        <span className="text-sm font-mono font-bold text-zinc-900">{course.department}</span>
                                    </div>
                                )}
                                {course.semester && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Semester</span>
                                        <span className="text-sm font-mono font-bold text-zinc-900">{course.semester}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Doubt Modal */}
            {doubtOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-zinc-900 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-zinc-200 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-heading font-bold text-zinc-900 uppercase tracking-tight">Ask a Doubt</h2>
                                <p className="text-xs text-zinc-500 mt-1 font-medium">Post query to course instructor.</p>
                            </div>
                            <button onClick={() => setDoubtOpen(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitDoubt} className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">Your Question</label>
                                <textarea
                                    required
                                    value={doubtQuestion}
                                    onChange={(e) => setDoubtQuestion(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-900 p-4 h-32 outline-none transition-colors text-sm font-medium resize-none placeholder:text-zinc-400"
                                    placeholder="TYPE YOUR QUESTION HERE..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setDoubtOpen(false)}
                                    className="px-6 py-3 text-zinc-600 hover:text-zinc-900 border border-transparent hover:border-zinc-200 font-heading font-bold text-xs uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingDoubt}
                                    className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-heading font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all disabled:opacity-70"
                                >
                                    {submittingDoubt && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    SUBMIT
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
