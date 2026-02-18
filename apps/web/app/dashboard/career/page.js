"use client";

import { FileText, Mic, Upload, ArrowRight, Sparkles, CheckCircle2, Loader2, Star, X } from "lucide-react";
import { useState, useRef } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function CareerPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = async (file) => {
        setUploadedFileName(file.name);
        setAnalysisResult(null);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${API_BASE}/analyze-resume`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setAnalysisResult(data);
            } else {
                setAnalysisResult({ score: 0, feedback: ["Server error. Please try again."] });
            }
        } catch (err) {
            console.error("Resume upload error:", err);
            setAnalysisResult({ score: 0, feedback: ["Could not connect to the server. Is the API running?"] });
        } finally {
            setIsUploading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 75) return { text: "text-green-600", bg: "bg-green-100", ring: "ring-green-500", label: "Excellent" };
        if (score >= 50) return { text: "text-yellow-600", bg: "bg-yellow-100", ring: "ring-yellow-500", label: "Good" };
        return { text: "text-red-600", bg: "bg-red-100", ring: "ring-red-500", label: "Needs Work" };
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-3 py-6">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 inline-flex items-center gap-3">
                    <Sparkles className="text-yellow-500" size={32} />
                    Nova Career Agent
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                    Level up your career with AI-powered tools designed to help you land your dream job.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Card A: Resume Roaster */}
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-100"></div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                            <FileText size={28} />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Resume Roaster</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Get your resume roasted by an AI recruiter. Receive brutal, honest feedback and actionable scores to improve your CV.
                        </p>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            className="hidden"
                            onChange={handleFileInputChange}
                        />

                        {/* Dropzone */}
                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/30 bg-gray-50 dark:bg-slate-800/50"
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !isUploading && fileInputRef.current?.click()}
                        >
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-3 py-2">
                                    <Loader2 size={36} className="animate-spin text-blue-500" />
                                    <p className="font-medium text-blue-600">Analyzing your resume...</p>
                                    <p className="text-xs text-gray-400">{uploadedFileName}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-3 text-blue-500">
                                        <Upload size={20} />
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-white">Click to upload or drag &amp; drop</p>
                                    <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or TXT (Max 5MB)</p>
                                    {uploadedFileName && !analysisResult && (
                                        <p className="text-xs text-blue-500 mt-2 font-medium">{uploadedFileName}</p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Feature tags */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {['ATS Score', 'Formatting Check', 'Keyword Optimization'].map(tag => (
                                <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-full flex items-center gap-1">
                                    <CheckCircle2 size={12} className="text-green-500" />
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Report Card */}
                        {analysisResult && (
                            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Star size={16} className="text-yellow-500" />
                                        AI Report Card
                                    </h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setAnalysisResult(null); setUploadedFileName(null); }}
                                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 transition"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Score Badge */}
                                {(() => {
                                    const sc = getScoreColor(analysisResult.score);
                                    return (
                                        <div className={`flex items-center gap-4 p-4 rounded-2xl ${sc.bg} ring-1 ${sc.ring} mb-4`}>
                                            <div className={`text-4xl font-black ${sc.text}`}>{analysisResult.score}</div>
                                            <div>
                                                <p className={`font-bold ${sc.text}`}>{sc.label}</p>
                                                <p className="text-xs text-gray-500">ATS Score / 100</p>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Feedback bullets */}
                                <ul className="space-y-2">
                                    {analysisResult.feedback.map((point, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card B: Mock Interview */}
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-100"></div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                            <Mic size={28} />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mock Interview</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                            Practice behavioral and technical interviews with voice AI. Simulate real pressure and receive instant feedback on your answers.
                        </p>

                        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-2 h-8 bg-purple-500 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-12 bg-purple-600 rounded-full animate-pulse delay-150"></div>
                                <div className="w-2 h-6 bg-purple-400 rounded-full animate-pulse delay-100"></div>
                                <div className="w-2 h-10 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                            </div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">&quot;Tell me about a time you failed...&quot;</p>
                        </div>

                        <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1">
                            <Mic size={20} />
                            Start Interview Session
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
