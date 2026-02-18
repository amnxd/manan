"use client";

import { useState, useEffect, useRef } from "react";
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

export default function DashboardPage() {
    // --- Widget A: Academic Predictor State ---
    const [attendance, setAttendance] = useState(85);
    const [marks, setMarks] = useState(80);
    const [prediction, setPrediction] = useState({ risk_level: "Low", predicted_cgpa: 8.2 });
    const [isPredicting, setIsPredicting] = useState(false);
    const debounceRef = useRef(null);

    // Debounced API call on slider change
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setIsPredicting(true);
            try {
                const res = await fetch(`${API_BASE}/predict`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ attendance, marks }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setPrediction(data);
                }
            } catch (err) {
                console.error("Prediction API error:", err);
            } finally {
                setIsPredicting(false);
            }
        }, 500);
        return () => clearTimeout(debounceRef.current);
    }, [attendance, marks]);

    // Derive risk display from API response
    const getRiskDisplay = () => {
        const level = prediction?.risk_level ?? "Low";
        if (level === "High") return { level: "High", color: "text-red-500", bg: "bg-red-500", badgeBg: "bg-red-50 border-red-200" };
        if (level === "Medium") return { level: "Medium", color: "text-yellow-500", bg: "bg-yellow-500", badgeBg: "bg-yellow-50 border-yellow-200" };
        return { level: "Low", color: "text-green-500", bg: "bg-green-500", badgeBg: "bg-green-50 border-green-200" };
    };

    const risk = getRiskDisplay();
    const predictedCgpa = prediction?.predicted_cgpa ?? "-";

    // --- Widget B: Recent Activity Data ---
    const notifications = [
        { id: 1, text: "Assignment 3 is due tomorrow", type: "urgent", time: "2h ago" },
        { id: 2, text: "New grade posted for Physics", type: "info", time: "5h ago" },
        { id: 3, text: "Career fair registration is open", type: "success", time: "1d ago" },
        { id: 4, text: "Library book overdue", type: "warning", time: "2d ago" },
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'urgent': return <AlertTriangle size={18} className="text-red-500" />;
            case 'success': return <CheckCircle size={18} className="text-green-500" />;
            case 'warning': return <Clock size={18} className="text-yellow-500" />;
            default: return <TrendingUp size={18} className="text-blue-500" />;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Widget A: Academic Predictor/Simulator */}
            <div className="md:col-span-2 lg:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all hover:shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="text-blue-600" />
                            Academic Risk Simulator
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">Adjust sliders to see how your performance affects your academic risk.</p>
                    </div>

                    {/* Risk Badge */}
                    <div className={`px-4 py-2 rounded-full border ${risk.badgeBg} flex items-center gap-2 transition-all duration-300`}>
                        {isPredicting ? (
                            <Loader2 size={14} className="animate-spin text-gray-500" />
                        ) : (
                            <span className={`w-3 h-3 rounded-full ${risk.bg} animate-pulse`}></span>
                        )}
                        <span className={`font-bold ${risk.color}`}>Risk: {risk.level}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Attendance</label>
                                <span className="text-sm font-bold text-blue-600">{attendance}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={attendance}
                                onChange={(e) => setAttendance(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Danger (&lt;75%)</span>
                                <span>Good (&gt;85%)</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Marks</label>
                                <span className="text-sm font-bold text-indigo-600">{marks}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={marks}
                                onChange={(e) => setMarks(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        {/* Predicted CGPA display */}
                        <div className={`p-4 rounded-2xl border transition-all duration-300 ${risk.badgeBg}`}>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Predicted CGPA</p>
                            <div className="flex items-center gap-2">
                                {isPredicting ? (
                                    <Loader2 size={20} className="animate-spin text-gray-400" />
                                ) : (
                                    <span className={`text-3xl font-bold ${risk.color}`}>{predictedCgpa}</span>
                                )}
                                <span className="text-gray-400 text-sm">/ 10.0</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual Gauge */}
                    <div className="flex flex-col items-center justify-center p-4">
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-100 dark:text-slate-800" />
                                {/* Attendance arc */}
                                <circle
                                    cx="50" cy="50" r="45" fill="none"
                                    stroke="currentColor" strokeWidth="10"
                                    strokeDasharray="283"
                                    strokeDashoffset={283 - (283 * attendance) / 100}
                                    className="text-blue-500 transition-all duration-500 ease-out"
                                    transform="rotate(-90 50 50)"
                                    strokeLinecap="round"
                                />
                                {/* Marks arc (inner) */}
                                <circle
                                    cx="50" cy="50" r="35" fill="none"
                                    stroke="currentColor" strokeWidth="10"
                                    strokeDasharray="220"
                                    strokeDashoffset={220 - (220 * marks) / 100}
                                    className="text-indigo-500 transition-all duration-500 ease-out opacity-80"
                                    transform="rotate(-90 50 50)"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                {isPredicting ? (
                                    <Loader2 size={24} className="animate-spin text-gray-400" />
                                ) : (
                                    <>
                                        <span className={`text-2xl font-bold ${risk.color}`}>{predictedCgpa}</span>
                                        <span className="text-xs text-gray-500">CGPA</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center">Live prediction from AI model</p>
                    </div>
                </div>
            </div>

            {/* Widget B: Recent Activity */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="text-indigo-600" size={20} />
                    Recent Activity
                </h3>

                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {notifications.map((note) => (
                        <div key={note.id} className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-gray-100 dark:hover:border-slate-700 transition-all">
                            <div className={`mt-1 p-2 rounded-full ${note.type === 'urgent' ? 'bg-red-100' :
                                note.type === 'success' ? 'bg-green-100' :
                                    note.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                                }`}>
                                {getIcon(note.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                                    {note.text}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{note.time}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 font-medium transition-colors text-center border-t border-gray-100 dark:border-slate-800 pt-3">
                    View All Notifications
                </button>
            </div>

            {/* Widget C: Career CTA */}
            <div className="md:col-span-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Unlock Your Career Potential</h3>
                        <p className="text-indigo-100 max-w-xl">
                            Nova's AI Career Agent can help you find internships and jobs tailored to your skills and academic performance.
                        </p>
                    </div>
                    <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all transform hover:-translate-y-1">
                        Launch Career Agent
                    </button>
                </div>
            </div>

        </div>
    );
}
