"use client";

import { useState, useEffect } from "react";
import { Users, AlertCircle, HelpCircle, Send, TrendingUp, AlertTriangle, BookOpen, GraduationCap, CheckCircle, Clock, MessageCircle, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from "../../context/AuthContext";

const API_BASE = "https://manan-383u.onrender.com";

export default function AdminDashboardPage() {
    const [notificationSent, setNotificationSent] = useState(false);
    const [stats, setStats] = useState([
        { label: "Total Students", value: "...", icon: Users, color: "text-zinc-900", bg: "bg-zinc-100" },
        { label: "Active Courses", value: "...", icon: BookOpen, color: "text-zinc-900", bg: "bg-zinc-100" },
        { label: "Unsolved Doubts", value: "...", icon: HelpCircle, color: "text-zinc-900", bg: "bg-zinc-100" },
    ]);
    const { user } = useAuth();

    // Doubt management state
    const [recentDoubts, setRecentDoubts] = useState([]);
    const [loadingDoubts, setLoadingDoubts] = useState(false);
    const [resolvingId, setResolvingId] = useState(null);

    // Notification form state
    const [notifTitle, setNotifTitle] = useState("");
    const [notifType, setNotifType] = useState("info");
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState("");
    const [recentNotifs, setRecentNotifs] = useState([]);

    // Students state
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        if (user) {
            fetchStats();
            fetchDoubts();
            fetchRecentNotifs();
            fetchStudents();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE}/admin/stats`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, teacher_id: user.uid })
            });
            const data = await res.json();
            
            if (data.total_students !== undefined) {
                setStats([
                    { label: "Total Students", value: data.total_students, icon: Users, color: "text-zinc-900", bg: "bg-zinc-100" },
                    { label: "Active Courses", value: data.active_courses, icon: BookOpen, color: "text-zinc-900", bg: "bg-zinc-100" },
                    { label: "Unsolved Doubts", value: data.unsolved_doubts, icon: HelpCircle, color: "text-zinc-900", bg: "bg-zinc-100" },
                ]);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchDoubts = async () => {
        setLoadingDoubts(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE}/admin/doubts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, teacher_id: user.uid })
            });
            const data = await res.json();
            if (data.status === "success") {
                setRecentDoubts(data.doubts || []);
            }
        } catch (error) {
            console.error("Error fetching doubts:", error);
        } finally {
            setLoadingDoubts(false);
        }
    };

    const handleResolveDoubt = async (doubtId) => {
        setResolvingId(doubtId);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE}/doubts/${doubtId}/resolve`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            });
            if (res.ok) {
                setRecentDoubts(prev => prev.filter(d => d.id !== doubtId));
                fetchStats();
            }
        } catch (error) {
            console.error("Error resolving doubt:", error);
        } finally {
            setResolvingId(null);
        }
    };

    const fetchRecentNotifs = async () => {
        try {
            const res = await fetch(`${API_BASE}/notifications?limit=5`);
            const data = await res.json();
            if (data.status === "success") {
                setRecentNotifs(data.notifications || []);
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };

    const handleSendNotification = async () => {
        if (!notifTitle.trim()) return;
        setIsSending(true);
        setSendError("");
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE}/notifications`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, title: notifTitle.trim(), type: notifType }),
            });
            const data = await res.json();
            if (data.status === "success") {
                setNotifTitle("");
                setNotifType("info");
                setNotificationSent(true);
                setTimeout(() => setNotificationSent(false), 3000);
                fetchRecentNotifs();
            } else {
                setSendError(data.message || "Failed to send");
            }
        } catch (err) {
            setSendError("Network error");
        } finally {
            setIsSending(false);
        }
    };

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE}/admin/students`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            });
            const data = await res.json();
            if (data.status === "success") {
                setStudents(data.students || []);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const doubtsData = [
        { name: 'Dyn. Prog.', count: 45 },
        { name: 'Semaphores', count: 32 },
        { name: 'React Hooks', count: 28 },
        { name: 'SQL Joins', count: 24 },
        { name: 'REST APIs', count: 18 },
        { name: 'Graph Theory', count: 15 },
    ];

    const handleBatchNotify = async () => {
        // Filter "Critical" or "Warning" students, or all if none are critical
        // The UI implies "Batch Notify", let's notify the "At Risk" ones primarily
        const atRiskStudents = students.filter(s => {
            const status = s.academic_stats?.risk_status || "Safe";
            return status === "At Risk" || status === "Critical" || status === "Warning";
        });

        const targets = atRiskStudents.length > 0 ? atRiskStudents : students;
        const targetIds = targets.map(s => s.uid).filter(Boolean);

        if (targetIds.length === 0) return;

        setIsSending(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE}/admin/notify/batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    student_ids: targetIds,
                    title: "Important: Please check your academic status",
                    type: "urgent"
                })
            });
            const data = await res.json();

            if (data.status === "success") {
                setNotificationSent(true);
                setTimeout(() => setNotificationSent(false), 3000);
            }
        } catch (error) {
            console.error("Batch notify error:", error);
        } finally {
            setIsSending(false);
        }
    };

    const atRiskCount = students.filter(s => {
        const status = s.academic_stats?.risk_status || "Safe";
        return status === "At Risk" || status === "Critical" || status === "Warning";
    }).length;

    const getRelativeTime = (isoStr) => {
        if (!isoStr) return "";
        const diff = Date.now() - new Date(isoStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

  return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300">
        
        {/* Section C: Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <div key={idx} className="bg-white p-6 border border-zinc-200 hover:border-zinc-900 transition-colors group">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-heading font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</h3>
                            <Icon size={20} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-heading font-bold text-zinc-900">{stat.value}</span>
                        </div>
                    </div>
                )
            })}
        </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Section A: The "At-Risk" Heatmap */}
              <div className="bg-white border border-zinc-200 hover:border-zinc-900 transition-colors flex flex-col">
                  <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                          <h3 className="text-lg font-heading font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-tight">
                              <AlertCircle className="text-red-600" size={20} />
                            Critical Attention Needed
                        </h3>
                          <p className="text-xs text-zinc-500 mt-1 font-medium uppercase tracking-wide">Students falling below thresholds</p>
                    </div>
                    
                    <button 
                        onClick={handleBatchNotify}
                          disabled={atRiskCount === 0 || isSending}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-300 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                          <Send size={14} />
                        Batch Notify ({atRiskCount})
                    </button>
                </div>

                {notificationSent && (
                      <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 text-sm animate-in slide-in-from-top-2">
                          <p className="font-bold uppercase tracking-wide text-xs">Success!</p>
                          <p className="text-sm">Alert sent to {atRiskCount} at-risk students.</p>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                              <tr className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                  <th className="px-6 py-4">Student Name</th>
                                  <th className="px-6 py-4">Roll No</th>
                                  <th className="px-6 py-4">Attendance</th>
                                  <th className="px-6 py-4">CGPA</th>
                                  <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                          <tbody className="divide-y divide-zinc-100">
                              {loadingStudents ? (
                                  <tr>
                                      <td colSpan="5" className="px-6 py-8 text-center text-zinc-500 text-sm">Loading students...</td>
                                  </tr>
                              ) : students.length > 0 ? (
                                  students.map((student) => {
                                      const stats = student.academic_stats || {};
                                      const status = stats.risk_status || "Safe";
                                      return (
                                          <tr key={student.id} className="hover:bg-zinc-50 transition-colors group">
                                              <td className="px-6 py-4 font-bold text-zinc-900 text-sm font-heading">
                                                  {student.name || student.email}
                                              </td>
                                              <td className="px-6 py-4 text-zinc-500 font-mono text-xs group-hover:text-zinc-900">
                                                  {student.roll || "N/A"}
                                              </td>
                                              <td className="px-6 py-4">
                                                  <span className={`font-mono font-bold text-xs ${stats.attendance_percent < 75 ? "text-red-600" : "text-zinc-600"}`}>
                                                      {stats.attendance_percent !== undefined ? `${stats.attendance_percent}%` : "N/A"}
                                                  </span>
                                              </td>
                                              <td className="px-6 py-4">
                                                  <span className={`font-mono font-bold text-xs ${stats.cgpa < 5.0 ? "text-red-600" : "text-zinc-600"}`}>
                                                      {stats.cgpa !== undefined ? stats.cgpa : "N/A"}
                                                  </span>
                                              </td>
                                              <td className="px-6 py-4">
                                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${(status === 'Critical' || status === 'At Risk') ? "bg-red-50 text-red-600 border-red-200" :
                                                      status === 'Warning' ? "bg-amber-50 text-amber-600 border-amber-200" :
                                                          "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                      }`}>
                                                      {(status === 'Critical' || status === 'At Risk') && <AlertTriangle size={10} />}
                                                      {status}
                                                  </span>
                                              </td>
                                          </tr>
                                      );
                                  })
                              ) : (
                                  <tr>
                                      <td colSpan="5" className="px-6 py-8 text-center text-zinc-500 text-sm">No registered students found.</td>
                                  </tr>
                              )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section B: Curriculum Analytics */}
              <div className="bg-white border border-zinc-200 hover:border-zinc-900 transition-colors p-6 flex flex-col">
                  <h3 className="text-lg font-heading font-bold text-zinc-900 mb-2 flex items-center gap-2 uppercase tracking-tight">
                      <TrendingUp className="text-zinc-900" size={20} />
                      Most Asked Doubts
                </h3>
                  <p className="text-xs text-zinc-500 mb-6 font-medium uppercase tracking-wide">Topic-wise breakdown (Weekly)</p>

                <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={doubtsData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e4e4e7" />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={100} 
                                  tick={{ fontSize: 11, fill: '#52525b', fontWeight: 600, fontFamily: 'monospace' }} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip 
                                  cursor={{ fill: '#f4f4f5' }}
                                  contentStyle={{ borderRadius: '0px', border: '1px solid #e4e4e7', boxShadow: 'none', backgroundColor: '#fff' }}
                                  itemStyle={{ color: '#18181b', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}
                            />
                              <Bar dataKey="count" barSize={16}>
                                {doubtsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#18181b' : '#71717a'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                  <div className="mt-6 bg-zinc-50 border border-zinc-200 p-4 flex gap-4">
                      <div className="bg-zinc-900 p-2 h-fit text-white">
                          <TrendingUp size={16} />
                    </div>
                    <div>
                          <p className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1">AI Insight</p>
                          <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                              <span className="font-bold text-zinc-900">60%</span> of doubts are about <span className="font-bold border-b-2 border-zinc-900">Dynamic Programming</span>. Scheduling a remedial class is highly recommended.
                        </p>
                    </div>
                </div>
            </div>
        </div>

          {/* Section D: Send Notification */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white border border-zinc-200 hover:border-zinc-900 transition-colors p-6">
                  <h3 className="text-lg font-heading font-bold text-zinc-900 mb-4 flex items-center gap-2 uppercase tracking-tight">
                      <Bell className="text-zinc-900" size={20} />
                      Send Notification
                  </h3>

                  <div className="space-y-4">
                      <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Title</label>
                          <input
                              type="text"
                              value={notifTitle}
                              onChange={(e) => setNotifTitle(e.target.value)}
                              placeholder="e.g. Assignment 3 is due tomorrow"
                              className="w-full px-3 py-2.5 border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
                          />
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Type</label>
                          <select
                              value={notifType}
                              onChange={(e) => setNotifType(e.target.value)}
                              className="w-full px-3 py-2.5 border border-zinc-200 text-sm text-zinc-900 bg-white focus:outline-none focus:border-zinc-900 transition-colors uppercase font-mono"
                          >
                              <option value="info">Info</option>
                              <option value="urgent">Urgent</option>
                              <option value="success">Success</option>
                              <option value="warning">Warning</option>
                          </select>
                      </div>

                      {sendError && (
                          <p className="text-xs text-red-600 font-bold uppercase tracking-wide">{sendError}</p>
                      )}

                      <button
                          onClick={handleSendNotification}
                          disabled={isSending || !notifTitle.trim()}
                          className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                      >
                          {isSending ? (
                              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                          ) : (
                              <Send size={14} />
                          )}
                          {isSending ? "Sending..." : "Send Notification"}
                      </button>
                  </div>
              </div>

              {/* Recent Notifications Sent */}
              <div className="bg-white border border-zinc-200 hover:border-zinc-900 transition-colors p-6">
                  <h3 className="text-lg font-heading font-bold text-zinc-900 mb-4 flex items-center gap-2 uppercase tracking-tight">
                      <CheckCircle className="text-zinc-900" size={20} />
                      Recent Notifications
                  </h3>
                  {recentNotifs.length === 0 ? (
                      <p className="text-sm text-zinc-400 font-medium">No notifications sent yet.</p>
                  ) : (
                      <div className="space-y-3">
                          {recentNotifs.map((n) => (
                              <div key={n.id} className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-100">
                                  <span className={`mt-0.5 text-[10px] px-1.5 py-0.5 border font-bold uppercase tracking-wider shrink-0 ${n.type === 'urgent' ? 'border-red-200 text-red-600 bg-red-50' :
                                      n.type === 'warning' ? 'border-amber-200 text-amber-600 bg-amber-50' :
                                          n.type === 'success' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                                              'border-zinc-200 text-zinc-500 bg-zinc-50'
                                      }`}>{n.type}</span>
                                  <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-zinc-900 truncate">{n.title}</p>
                                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">{getRelativeTime(n.created_at)}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>

          {/* Recent Doubts Section */}
          <div className="bg-white border border-zinc-200 hover:border-zinc-900 transition-colors">
              <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                      <h3 className="text-lg font-heading font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-tight">
                          <MessageCircle className="text-zinc-900" size={20} />
                          Recent Student Doubts
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1 font-medium uppercase tracking-wide">Open doubts from your courses</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 border border-zinc-200 px-3 py-1">
                      {recentDoubts.length} Open
                  </span>
              </div>

              {loadingDoubts ? (
                  <div className="p-8 text-center">
                      <div className="inline-block animate-spin h-5 w-5 border-2 border-zinc-900 border-t-transparent"></div>
                  </div>
              ) : recentDoubts.length > 0 ? (
                  <div className="divide-y divide-zinc-100">
                      {recentDoubts.map((doubt) => (
                          <div key={doubt.id} className="p-5 hover:bg-zinc-50 transition-colors group">
                              <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                      <p className="text-sm text-zinc-800 font-medium">{doubt.question}</p>
                                      <div className="flex items-center gap-3 mt-2">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                              {doubt.student_email || "Unknown Student"}
                                          </span>
                                          <span className="text-zinc-200">|</span>
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                              {doubt.course_title || doubt.course_id}
                                          </span>
                                          {doubt.created_at && (
                                              <>
                                                  <span className="text-zinc-200">|</span>
                                                  <span className="text-[10px] font-mono text-zinc-400">
                                                      {new Date(doubt.created_at).toLocaleString()}
                                                  </span>
                                              </>
                                          )}
                                      </div>
                                  </div>
                                  <button
                                      onClick={() => handleResolveDoubt(doubt.id)}
                                      disabled={resolvingId === doubt.id}
                                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shrink-0 disabled:opacity-50"
                                  >
                                      {resolvingId === doubt.id ? (
                                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      ) : (
                                          <CheckCircle size={12} />
                                      )}
                                      Resolve
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="p-8 text-center text-zinc-400">
                      <p className="text-sm font-medium">No open doubts — all caught up! 🎉</p>
                  </div>
              )}
          </div>
    </div>
  );
}
