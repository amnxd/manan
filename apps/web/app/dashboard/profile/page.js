"use client";

import { useState, useEffect } from "react";
import { User, Mail, GraduationCap, MapPin, Save, Award, Calendar, Shield, Loader2 } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

// Simple internal icon components
function TrendingUpIcon({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
    );
}

function CheckCircleIcon({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    );
}

// Skeleton loader for text fields
function SkeletonLine({ wide }) {
    return (
        <div className={`h-4 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse ${wide ? "w-3/4" : "w-1/2"}`} />
    );
}

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE}/student/profile`);
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Section 1: Header */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 pt-12">
                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-lg bg-gray-200 dark:bg-slate-800 flex items-center justify-center text-gray-400 overflow-hidden">
                        <User size={64} className="opacity-50" />
                    </div>

                    <div className="flex-1 text-center md:text-left mb-2">
                        {isLoading ? (
                            <div className="space-y-3">
                                <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse w-48 mx-auto md:mx-0" />
                                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse w-64 mx-auto md:mx-0" />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.name ?? "—"}</h1>
                                <p className="text-blue-600 font-medium">{profile?.branch ?? "—"}</p>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full">
                                        {profile?.year ?? "—"}
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold rounded-full flex items-center gap-1">
                                        <Shield size={12} />
                                        {profile?.role ?? "Student"}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mb-2">
                        <button className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                            Edit Cover
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Section 2: Edit Details Form */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-lg">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <User size={20} className="text-blue-500" />
                        Personal Details
                        {isLoading && <Loader2 size={16} className="animate-spin text-gray-400 ml-1" />}
                    </h2>

                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    {isLoading ? (
                                        <div className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                            <SkeletonLine wide />
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            defaultValue={profile?.name ?? ""}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    {isLoading ? (
                                        <div className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                            <SkeletonLine wide />
                                        </div>
                                    ) : (
                                        <input
                                            type="email"
                                            defaultValue={profile?.email ?? ""}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Branch / Major</label>
                                <div className="relative">
                                    <GraduationCap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    {isLoading ? (
                                        <div className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                            <SkeletonLine wide />
                                        </div>
                                    ) : (
                                        <select
                                            defaultValue={profile?.branch ?? ""}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white appearance-none"
                                        >
                                            <option>Computer Science &amp; Engineering</option>
                                            <option>Mechanical Engineering</option>
                                            <option>Electrical Engineering</option>
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    {isLoading ? (
                                        <div className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                            <SkeletonLine />
                                        </div>
                                    ) : (
                                        <select
                                            defaultValue={profile?.semester ?? "Semester 6"}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white appearance-none"
                                        >
                                            <option>Semester 6</option>
                                            <option>Semester 5</option>
                                            <option>Semester 4</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                            <button type="button" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30">
                                <Save size={18} />
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section 3: Academic Stats */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-lg">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Award className="text-yellow-500" />
                            Academic Performance
                        </h3>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Current CGPA</p>
                                    {isLoading ? (
                                        <div className="h-8 w-16 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse mt-1" />
                                    ) : (
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{profile?.cgpa ?? "—"}</p>
                                    )}
                                </div>
                                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                                    <TrendingUpIcon size={20} />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Attendance</p>
                                    {isLoading ? (
                                        <div className="h-8 w-16 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse mt-1" />
                                    ) : (
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{profile?.attendance ?? "—"}%</p>
                                    )}
                                </div>
                                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600">
                                    <CheckCircleIcon size={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                        <p className="text-indigo-100 text-sm">Update your GitHub and LinkedIn links in settings to boost your profile score for recruiters.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
