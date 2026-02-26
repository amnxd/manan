"use client";

import { FileText, Mic, Upload, ArrowRight, Sparkles, CheckCircle2, Loader2, Star, X, Brain, AlertCircle, XCircle, CheckCircle } from "lucide-react";
import { useState, useRef } from "react";

const API_BASE = "https://manan-383u.onrender.com";

export default function CareerPage() {
    // --- Resume Roaster State ---
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // --- Mock Test State ---
    const [quizStatus, setQuizStatus] = useState("idle"); // idle, config, loading, active, finished
    const [quizConfig, setQuizConfig] = useState({ subject: "", topic: "" });
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({}); // { index: "option value" }
    const [quizScore, setQuizScore] = useState(0);

    // --- Resume Handlers ---
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadedFileName(file.name);
            setAnalysisResult(null);
        }
    };
    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadedFileName(file.name);
            setAnalysisResult(null);
        }
    };

    const analyzeResume = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            const res = await fetch(`${API_BASE}/analyze-resume`, { method: "POST", body: formData });
            if (res.ok) {
                const data = await res.json();
                setAnalysisResult(data);
            } else {
                setAnalysisResult({ score: 0, feedback: ["Server error. Please try again."] });
            }
        } catch (err) {
            console.error("Resume upload error:", err);
            setAnalysisResult({ score: 0, feedback: ["Could not connect to the server."] });
        } finally {
            setIsUploading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 75) return { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", label: "Excellent" };
        if (score >= 50) return { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", label: "Good" };
        return { text: "text-red-700", bg: "bg-red-50", border: "border-red-200", label: "Needs Work" };
    };

    // --- Quiz Handlers ---
    const startQuizConfig = () => setQuizStatus("config");
    
    const fetchQuiz = async (e) => {
        e.preventDefault();
        setQuizStatus("loading");
        try {
            const res = await fetch(`${API_BASE}/generate-quiz`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(quizConfig)
            });
            const data = await res.json();
            if (data.status === "success" && data.quiz) {
                setQuestions(data.quiz);
                setCurrentQuestionIndex(0);
                setUserAnswers({});
                setQuizStatus("active");
            } else {
                alert(data.message || "Failed to generate quiz. Please try again.");
                setQuizStatus("idle");
            }
        } catch (error) {
            console.error(error);
            alert("Error generating quiz: " + error.message);
            setQuizStatus("idle");
        }
    };

    const handleAnswerSelect = (option) => {
        setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }));
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const submitQuiz = () => {
        let score = 0;
        questions.forEach((q, idx) => {
            if (userAnswers[idx] === q.answer) score++;
        });
        setQuizScore(score);
        setQuizStatus("finished");
    };

    const resetQuiz = () => {
        setQuizStatus("idle");
        setQuizConfig({ subject: "", topic: "" });
        setUserAnswers({});
        setQuestions([]);
    };

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto animate-in fade-in zoom-in duration-300 flex-1 min-h-0">
            <div className="text-center space-y-0.5 py-3 shrink-0 mb-2">
                <h1 className="text-2xl font-heading font-bold text-zinc-900 inline-flex items-center gap-2 uppercase tracking-tighter">
                    <Sparkles className="text-zinc-900" size={22} />
                    Manan Career Agent
                </h1>
                <p className="text-zinc-500 text-xs max-w-2xl mx-auto font-medium">
                    Level up your career with AI-powered tools designed to help you land your dream job.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 min-h-0 overflow-hidden md:overflow-hidden overflow-y-auto">
                {/* Card A: Resume Roaster */}
                <div className="bg-white border border-zinc-200 p-5 shadow-sm transition-all relative overflow-hidden group flex flex-col min-h-0 hover:border-zinc-900">
                    
                    <div className="relative z-10 flex flex-col h-full overflow-y-auto pr-1">
                        <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 text-zinc-900 flex items-center justify-center mb-4">
                            <FileText size={18} />
                        </div>

                        <h2 className="text-xl font-bold font-heading text-zinc-900 mb-1.5 uppercase tracking-tight">Resume Roaster</h2>
                        <p className="text-zinc-500 text-xs mb-4 leading-relaxed">
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
                            className={`border-2 border-dashed p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden ${isDragging ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50"}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !isUploading && fileInputRef.current?.click()}
                        >
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2 py-1">
                                    <Loader2 size={28} className="animate-spin text-zinc-900" />
                                    <p className="font-bold text-zinc-900 text-[10px] uppercase tracking-widest">Analyzing your resume...</p>
                                    <p className="text-[10px] text-zinc-400 font-mono">{uploadedFileName}</p>
                                </div>
                            ) : (
                                <>
                                        <div className="w-9 h-9 bg-white border border-zinc-100 flex items-center justify-center mb-2 text-zinc-900">
                                            <Upload size={16} />
                                    </div>
                                        <p className="font-bold text-zinc-900 text-xs uppercase tracking-wide">Click to upload or drag &amp; drop</p>
                                        <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wider">PDF, DOCX, or TXT (Max 5MB)</p>
                                    {uploadedFileName && (
                                            <div className="mt-2 bg-zinc-50 px-3 py-1.5 border border-zinc-200">
                                                <p className="text-[10px] font-bold text-zinc-900 flex items-center gap-1.5 font-mono">
                                                    <FileText size={10} />
                                                {uploadedFileName}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        
                        {/* Analyze Button */}
                        {selectedFile && !isUploading && !analysisResult && (
                            <button 
                                onClick={analyzeResume}
                                className="mt-3 w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                <Sparkles size={14} />
                                Analyze Resume
                            </button>
                        )}

                        {/* Feature tags */}
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {['ATS Score', 'Formatting Check', 'Keyword Optimization'].map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-zinc-50 border border-zinc-100 text-zinc-500 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <div className="w-1 h-1 bg-zinc-900 rounded-none transform rotate-45"></div>
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Report Card */}
                        {analysisResult && (
                            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                    <div className="flex flex-col">
                                        <h3 className="text-base font-heading font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-tight">
                                            <Star size={16} className="text-zinc-900 fill-zinc-900" />
                                            Analysis Report
                                        </h3>
                                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{analysisResult.details.candidate_name} • {analysisResult.details.role}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setAnalysisResult(null); setUploadedFileName(null); }}
                                        className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Score Badge */}
                                {(() => {
                                    const sc = getScoreColor(analysisResult.score);
                                    return (
                                        <div className={`flex items-center gap-4 p-4 border ${sc.bg} ${sc.border}`}>
                                            <div className={`text-5xl font-heading font-bold ${sc.text}`}>{analysisResult.score}</div>
                                            <div className="flex-1">
                                                <p className={`text-lg font-heading font-bold ${sc.text} mb-0.5 uppercase tracking-tight`}>{sc.label}</p>
                                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wide">Overall ATS Compatibility Score</p>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Category Breakdown */}
                                <div className="grid grid-cols-2 gap-2">
                                    {analysisResult.details.category_scores.map((cat, i) => (
                                        <div key={i} className="bg-zinc-50 p-3 border border-zinc-100 flex justify-between items-center group hover:border-zinc-300 transition-colors">
                                            <span className="font-bold text-zinc-600 text-[10px] uppercase tracking-wide">{cat.name}</span>
                                            <span className="font-heading font-bold text-zinc-900 text-sm">{cat.score}%</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Keywords */}
                                <div className="space-y-3">
                                    <h4 className="font-bold text-zinc-900 flex items-center gap-2 text-xs uppercase tracking-wide">
                                        <Sparkles size={14} className="text-zinc-900" />
                                        Keyword Analysis
                                    </h4>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-[9px] font-bold text-emerald-600 mb-1.5 uppercase tracking-wider">✅ Strong Matches</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {analysisResult.details.keywords.strong.map((k, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-700 text-[9px] font-bold uppercase tracking-wider">{k}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-red-600 mb-1.5 uppercase tracking-wider">❌ Missing Keywords</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {analysisResult.details.keywords.missing.map((k, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-white border border-red-200 text-red-700 text-[9px] font-bold uppercase tracking-wider">{k}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-zinc-50 p-3 border border-zinc-200">
                                        <p className="text-[10px] text-zinc-900 font-bold uppercase tracking-wide mb-0.5">💡 Recommendation</p>
                                        <p className="text-xs text-zinc-600">{analysisResult.details.recommendation}</p>
                                    </div>
                                </div>

                                {/* Projects Review */}
                                <div className="space-y-3">
                                    <h4 className="font-bold text-zinc-900 flex items-center gap-2 text-xs uppercase tracking-wide">
                                        <FileText size={14} className="text-zinc-900" />
                                        Project Evaluation
                                    </h4>
                                    <div className="space-y-3">
                                        {analysisResult.details.projects.map((proj, i) => (
                                            <div key={i} className="border border-zinc-200 p-3">
                                                <h5 className="font-bold text-zinc-900 mb-1.5 text-xs uppercase tracking-wide">{proj.name}</h5>
                                                <div className="space-y-1.5">
                                                    <div className="flex gap-2 text-[10px]">
                                                        <span className="font-bold text-emerald-600 uppercase tracking-wider min-w-[70px]">Strengths:</span>
                                                        <p className="text-zinc-600">{proj.strengths.join(", ")}</p>
                                                    </div>
                                                    <div className="flex gap-2 text-[10px]">
                                                        <span className="font-bold text-amber-600 uppercase tracking-wider min-w-[70px]">Improvement:</span>
                                                        <p className="text-zinc-600">{proj.improvements.join(", ")}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ATS Checks Table */}
                                <div className="space-y-1.5">
                                    <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wide">📑 ATS Formatting Check</h4>
                                    <div className="bg-white border border-zinc-200 overflow-hidden">
                                        <table className="w-full text-[10px] text-left">
                                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                                <tr>
                                                    <th className="px-3 py-1.5 font-bold text-zinc-500 uppercase tracking-wider">Check</th>
                                                    <th className="px-3 py-1.5 font-bold text-zinc-500 text-right uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                {analysisResult.details.ats_formatting.map((item, i) => (
                                                    <tr key={i}>
                                                        <td className="px-3 py-2 text-zinc-900 font-medium">{item.check}</td>
                                                        <td className="px-3 py-2 text-right font-medium">
                                                            <span className={`inline-flex items-center gap-1 ${item.icon === "✅" ? "text-emerald-700" : "text-zinc-400"}`}>
                                                                {item.icon} {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card B: Mock Test */}
                <div className="bg-white border border-zinc-200 p-5 shadow-sm transition-all relative overflow-hidden flex flex-col min-h-0 hover:border-zinc-900">
                    <div className="relative z-10 flex flex-col h-full overflow-y-auto pr-1">
                        
                        {/* Header Area */}
                        {(quizStatus === "idle" || quizStatus === "config") && (
                            <>
                                <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 text-zinc-900 flex items-center justify-center mb-4">
                                    <Brain size={18} />
                                </div>
                                <h2 className="text-xl font-bold font-heading text-zinc-900 mb-1.5 uppercase tracking-tight">AI Mock Test</h2>
                                <p className="text-zinc-500 text-xs mb-4 leading-relaxed">
                                    Generate personalized quizzes on any subject. Test your knowledge with AI-crafted questions and get instant feedback.
                                </p>
                            </>
                        )}

                        {/* IDLE STATE */}
                        {quizStatus === "idle" && (
                            <div className="mt-auto">
                                <div className="space-y-2 mb-5">
                                    {['Choose Topic', 'Take Quiz', 'View Results'].map((step, i) => (
                                        <div key={i} className="flex items-center gap-2.5 p-2.5 bg-zinc-50 border border-zinc-100">
                                            <div className="w-5 h-5 bg-zinc-900 text-white flex items-center justify-center font-bold text-[10px]">{i + 1}</div>
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{step}</span>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={startQuizConfig} className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all group">
                                    <Brain size={14} />
                                    Generate New Quiz
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}

                        {/* CONFIG STATE */}
                        {quizStatus === "config" && (
                            <form onSubmit={fetchQuiz} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">

                                <div className="mb-4">
                                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">💡 Quick Start Suggestions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { s: "Computer Science", t: "Data Structures", icon: "💻" },
                                            { s: "Computer Science", t: "Algorithms", icon: "🧮" },
                                            { s: "Computer Science", t: "Networking", icon: "🌐" },
                                            { s: "History", t: "World War II", icon: "🎖️" },
                                            { s: "Automotive", t: "Engines", icon: "🚗" }
                                        ].map((item, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setQuizConfig({ subject: item.s, topic: item.t })}
                                                className="border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-700 transition-colors flex items-center gap-1.5"
                                            >
                                                <span>{item.icon}</span> {item.t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Subject</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="e.g. Computer Science, History"
                                        className="w-full px-3 py-2.5 rounded-none border border-zinc-200 bg-white focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-300 text-sm font-medium"
                                        value={quizConfig.subject}
                                        onChange={e => setQuizConfig({...quizConfig, subject: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Topic</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="e.g. Data Structures, WWII"
                                        className="w-full px-3 py-2.5 rounded-none border border-zinc-200 bg-white focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-300 text-sm font-medium"
                                        value={quizConfig.topic}
                                        onChange={e => setQuizConfig({...quizConfig, topic: e.target.value})}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setQuizStatus("idle")} className="flex-1 py-2.5 text-zinc-600 hover:bg-zinc-50 border border-zinc-200 font-bold text-[10px] uppercase tracking-widest transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[10px] uppercase tracking-widest transition-colors shadow-lg shadow-zinc-900/10">
                                        Start Quiz
                                    </button>
                                </div>
                            </form>
                        )}
                        
                        {/* LOADING STATE */}
                        {quizStatus === "loading" && (
                             <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in">
                                <Loader2 size={40} className="text-zinc-900 animate-spin mb-3" />
                                <h3 className="text-base font-bold font-heading text-zinc-900 uppercase tracking-tight">Generating Quiz...</h3>
                                <p className="text-zinc-500 text-xs mt-1.5">Crafting questions on <span className="text-zinc-900 font-semibold">{quizConfig.topic}</span></p>
                             </div>
                        )}

                        {/* ACTIVE STATE */}
                        {quizStatus === "active" && questions.length > 0 && (
                            <div className="flex-1 flex flex-col animate-in fade-in">
                                <div className="flex justify-between items-center mb-5 border-b border-zinc-100 pb-3">
                                    <span className="text-[10px] font-bold text-white bg-zinc-900 px-2.5 py-0.5 uppercase tracking-wider">
                                        Question {currentQuestionIndex + 1} / {questions.length}
                                    </span>
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Time: Unlimited</span>
                                </div>
                                
                                <h3 className="text-base font-bold text-zinc-900 mb-5 leading-relaxed font-heading">
                                    {questions[currentQuestionIndex].question}
                                </h3>

                                <div className="space-y-2 mb-5">
                                    {questions[currentQuestionIndex].options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswerSelect(option)}
                                            className={`w-full text-left p-3 border transition-all flex items-center group ${
                                                userAnswers[currentQuestionIndex] === option
                                                    ? "border-zinc-900 bg-zinc-900 text-white"
                                                    : "border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 text-zinc-700"
                                            }`}
                                        >
                                            <span className={`mr-3 font-mono text-[10px] border w-5 h-5 flex items-center justify-center ${
                                                userAnswers[currentQuestionIndex] === option ? "border-white text-white" : "border-zinc-300 text-zinc-400 group-hover:border-zinc-900 group-hover:text-zinc-900"
                                            }`}>{String.fromCharCode(65 + idx)}</span>
                                            <span className="text-xs font-medium">{option}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-auto flex justify-end">
                                    {currentQuestionIndex < questions.length - 1 ? (
                                        <button 
                                            onClick={nextQuestion}
                                            disabled={!userAnswers[currentQuestionIndex]}
                                            className="px-6 py-2.5 bg-zinc-900 text-white font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-all"
                                        >
                                            Next Question
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={submitQuiz}
                                            disabled={!userAnswers[currentQuestionIndex]}
                                                className="px-6 py-2.5 bg-zinc-900 text-white font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-all"
                                        >
                                            Submit Quiz
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* FINISHED STATE */}
                        {quizStatus === "finished" && (
                            <div className="flex-1 flex flex-col animate-in fade-in space-y-4 overflow-y-auto custom-scrollbar pr-1">
                                <div className="text-center py-4 bg-zinc-50 border border-zinc-200">
                                    <div className="inline-flex items-center justify-center w-20 h-20 border-4 border-zinc-900 text-zinc-900 mb-3 rounded-full">
                                        <span className="text-2xl font-heading font-bold">{Math.round((quizScore / questions.length) * 100)}%</span>
                                    </div>
                                    <h2 className="text-xl font-heading font-bold text-zinc-900 uppercase tracking-tight">Quiz Completed</h2>
                                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider mt-1.5 font-bold">You got {quizScore} out of {questions.length} correct</p>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-bold text-[10px] uppercase tracking-wider text-zinc-500 border-b border-zinc-200 pb-1.5">Review Breakdown</h3>
                                    {questions.map((q, idx) => {
                                        const isCorrect = userAnswers[idx] === q.answer;
                                        return (
                                            <div key={idx} className={`p-3 border ${isCorrect ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                                                <div className="flex items-start gap-2">
                                                    {isCorrect ? <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={15} /> : <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={15} />}
                                                    <div>
                                                        <p className="font-bold text-zinc-900 text-xs mb-1.5">{q.question}</p>
                                                        {!isCorrect && (
                                                            <div className="text-[10px] text-red-700 mb-0.5 font-mono">
                                                                <span className="font-bold uppercase tracking-wider">Your Ans:</span> {userAnswers[idx]}
                                                            </div>
                                                        )}
                                                        <div className="text-[10px] text-emerald-700 font-mono">
                                                            <span className="font-bold uppercase tracking-wider">Correct:</span> {q.answer}
                                                        </div>
                                                        <p className="text-[10px] text-zinc-500 mt-2 pt-1.5 border-t border-zinc-200/50 italic">{q.explanation}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button onClick={resetQuiz} className="w-full py-3 bg-zinc-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-colors">
                                    Take Another Quiz
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
