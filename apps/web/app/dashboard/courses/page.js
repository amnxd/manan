"use client";

import { BookOpen, PlayCircle, MoreVertical, Clock, Calendar } from "lucide-react";

// ─── ProgressBar Component ────────────────────────────────────────────────────
function ProgressBar({ value, colorClass }) {
    return (
        <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
                className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-out`}
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

export default function CoursesPage() {
    const courses = [
        {
            id: 1,
            title: "Operating Systems",
            professor: "Dr. A. Silberschatz",
            progress: 75,
            totalLessons: 24,
            completedLessons: 18,
            color: "from-blue-500 to-blue-600",
            next_assignment_date: "Feb 22, 2026",
        },
        {
            id: 2,
            title: "Data Structures & Alg.",
            professor: "Prof. T. H. Cormen",
            progress: 45,
            totalLessons: 40,
            completedLessons: 18,
            color: "from-purple-500 to-purple-600",
            next_assignment_date: "Feb 20, 2026",
        },
        {
            id: 3,
            title: "Database Management",
            professor: "Dr. R. Elmasri",
            progress: 90,
            totalLessons: 30,
            completedLessons: 27,
            color: "from-emerald-500 to-emerald-600",
            next_assignment_date: "Mar 1, 2026",
        },
        {
            id: 4,
            title: "Computer Networks",
            professor: "Prof. A. S. Tanenbaum",
            progress: 30,
            totalLessons: 20,
            completedLessons: 6,
            color: "from-orange-500 to-orange-600",
            next_assignment_date: "Feb 25, 2026",
        },
        {
            id: 5,
            title: "Software Engineering",
            professor: "Dr. I. Sommerville",
            progress: 10,
            totalLessons: 25,
            completedLessons: 3,
            color: "from-indigo-500 to-indigo-600",
            next_assignment_date: "Mar 5, 2026",
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="text-blue-600" />
                    My Courses
                </h1>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {courses.length} Active Courses
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                        {/* Course Header / Banner */}
                        <div className={`h-32 bg-gradient-to-r ${course.color} p-6 relative`}>
                            <div className="absolute top-4 right-4">
                                <button className="p-1 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                            <div className="absolute bottom-[-1.5rem] left-6">
                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-md flex items-center justify-center text-2xl font-bold text-gray-700 dark:text-white">
                                    {course.title.charAt(0)}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="pt-10 px-6 pb-6 space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1" title={course.title}>
                                    {course.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {course.professor}
                                </p>
                            </div>

                            {/* Progress */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
                                    <span>Progress</span>
                                    <span>{course.progress}%</span>
                                </div>
                                <ProgressBar value={course.progress} colorClass={course.color} />
                                <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {Math.floor(course.completedLessons)}/{course.totalLessons} Lessons
                                    </span>
                                </div>
                            </div>

                            {/* Next Assignment */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                <Calendar size={14} className="text-blue-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 leading-none">Next Assignment</p>
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{course.next_assignment_date}</p>
                                </div>
                            </div>

                            {/* Action */}
                            <button className="w-full mt-2 py-3 bg-gray-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-gray-700 dark:text-gray-300 font-medium rounded-xl flex items-center justify-center gap-2 transition-all group-hover:bg-blue-600 group-hover:text-white">
                                <PlayCircle size={18} />
                                Continue Learning
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add New Course Card Placeholder */}
                <button className="border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-all min-h-[340px]">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-900 flex items-center justify-center">
                        <span className="text-2xl font-light">+</span>
                    </div>
                    <span className="font-medium">Enroll in New Course</span>
                </button>
            </div>
        </div>
    );
}
