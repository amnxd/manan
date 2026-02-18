"use client";

import { Book, FileUp, MoreVertical, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function CurriculumPage() {
    const subjects = [
        { id: 1, title: "Data Structures", code: "CS101", doubts: 120, coverage: 80, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
        { id: 2, title: "Operating Systems", code: "CS204", doubts: 95, coverage: 65, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
        { id: 3, title: "Database Systems", code: "CS305", doubts: 45, coverage: 92, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
        { id: 4, title: "Computer Networks", code: "CS401", doubts: 78, coverage: 50, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30" },
        { id: 5, title: "Algorithms", code: "CS202", doubts: 150, coverage: 40, color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
    ];

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

    const handleDrop = (e) => {
        e.preventDefault();
        setDraggingId(null);
        // Handle upload
        alert("Syllabus uploaded!");
    };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in zoom-in duration-300">
      
      {/* Main Grid */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Book className="text-red-600" />
                Curriculum Manager
            </h1>
            <span className="text-sm text-gray-500 font-medium">{subjects.length} Active Subjects</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((subject) => (
                <div key={subject.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${subject.color}`}>
                            <Book size={24} />
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <MoreVertical size={20} />
                        </button>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{subject.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-6">{subject.code}</p>

                    <div className="space-y-3 mb-6">
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Total Doubts</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{subject.doubts}</span>
                         </div>
                         <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Syllabus Coverage</span>
                                <span className={`font-semibold ${subject.coverage < 50 ? "text-red-600" : "text-green-600"}`}>{subject.coverage}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${subject.coverage < 50 ? "bg-red-500" : "bg-green-500"}`} 
                                    style={{ width: `${subject.coverage}%` }}
                                />
                            </div>
                         </div>
                    </div>

                    {/* Dropzone */}
                    <div 
                        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                            draggingId === subject.id 
                                ? "border-red-500 bg-red-50 dark:bg-red-900/20" 
                                : "border-gray-200 dark:border-slate-800 hover:border-red-300 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                        }`}
                        onDragOver={(e) => handleDragOver(e, subject.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <FileUp size={20} className={`mb-2 ${draggingId === subject.id ? "text-red-600" : "text-gray-400"}`} />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Upload Syllabus</span>
                        <span className="text-xs text-gray-400">Drag & drop PDF</span>
                    </div>
                </div>
            ))}
            
            {/* Add New Subject Placeholder */}
             <button className="border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-slate-800/50 transition-all min-h-[300px]">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="text-2xl font-light">+</span>
                </div>
                <span className="font-medium">Add New Subject</span>
            </button>
        </div>
      </div>

      {/* Sidebar / Insight */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="text-orange-500" size={20} />
                Difficult Topics
            </h3>
            <div className="space-y-4">
                {difficultTopics.map((topic, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                         <span className="w-6 h-6 rounded-full bg-orange-200 dark:bg-orange-800 flex items-center justify-center text-xs font-bold text-orange-700 dark:text-orange-200 flex-shrink-0">
                             {index + 1}
                         </span>
                         <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{topic}</span>
                    </div>
                ))}
            </div>
            <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                 <div className="flex items-start gap-2">
                     <AlertTriangle className="text-yellow-500 flex-shrink-0" size={16} />
                     <p className="text-xs text-gray-600 dark:text-gray-400">
                         Recommendation: Schedule remedial classes for "Dynamic Programming" as doubt frequency has increased by 15%.
                     </p>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
