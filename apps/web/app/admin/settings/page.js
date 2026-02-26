"use client";

import { Settings, Shield, ToggleLeft, ToggleRight, Save, Bell, Loader2, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

const API_BASE = "https://manan-383u.onrender.com";

export default function AdminSettingsPage() {
    const { user } = useAuth();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [examMode, setExamMode] = useState(false);
    const [attendanceThreshold, setAttendanceThreshold] = useState(75);
    const [cgpaThreshold, setCgpaThreshold] = useState(5.0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/settings`);
            const data = await res.json();
            if (data.status === "success" && data.settings) {
                setMaintenanceMode(data.settings.maintenance_mode || false);
                setExamMode(data.settings.exam_mode || false);
                setAttendanceThreshold(data.settings.attendance_threshold || 75);
                setCgpaThreshold(data.settings.cgpa_threshold || 5.0);
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_BASE}/admin/settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    maintenance_mode: maintenanceMode,
                    exam_mode: examMode,
                    attendance_threshold: Number(attendanceThreshold),
                    cgpa_threshold: Number(cgpaThreshold)
                })
            });
            const data = await res.json();
            if (data.status === "success") {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                alert("Failed to save: " + data.message);
            }
        } catch (err) {
            console.error("Error saving settings:", err);
            alert("Error saving settings");
        } finally {
            setIsSaving(false);
        }
    };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
          <div className="bg-white border border-zinc-200 p-8">
              <h1 className="text-xl font-heading font-bold text-zinc-900 flex items-center gap-3 mb-2 uppercase tracking-tight">
                  <Settings className="text-zinc-900" />
            System Configuration
        </h1>
              <p className="text-xs text-zinc-500 mb-8 ml-9 font-medium uppercase tracking-wide">Manage global settings for the Manan platform</p>

        {/* Section 1: System Controls */}
        <div className="space-y-6">
                  <h2 className="text-sm font-heading font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-200 pb-2 uppercase tracking-wider">
                      <Shield size={16} className="text-zinc-900" />
                System Controls
            </h2>
            
                  <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200">
                <div className="flex-1">
                          <h3 className="font-heading font-bold text-zinc-900 text-sm">Maintenance Mode</h3>
                          <p className="text-xs text-zinc-500 mt-1 font-medium">Disable student access to the platform. Admins can still log in.</p>
                </div>
                <button 
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                          className={`p-1 transition-colors ${maintenanceMode ? "text-red-600" : "text-zinc-400 hover:text-zinc-900"}`}
                >
                    {maintenanceMode ? <ToggleRight size={48} className="fill-current" /> : <ToggleLeft size={48} />}
                </button>
            </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200">
                <div className="flex-1">
                          <h3 className="font-heading font-bold text-zinc-900 text-sm">Exam Mode</h3>
                          <p className="text-xs text-zinc-500 mt-1 font-medium">Disable "Ask Manan" doubt solver and social features during exam hours.</p>
                </div>
                <button 
                    onClick={() => setExamMode(!examMode)}
                          className={`p-1 transition-colors ${examMode ? "text-red-600" : "text-zinc-400 hover:text-zinc-900"}`}
                >
                    {examMode ? <ToggleRight size={48} className="fill-current" /> : <ToggleLeft size={48} />}
                </button>
            </div>
        </div>

        {/* Section 2: Notification Rules */}
        <div className="space-y-6 mt-10">
                  <h2 className="text-sm font-heading font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-200 pb-2 uppercase tracking-wider">
                      <Bell size={16} className="text-zinc-900" />
                Notification Rules
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Auto-alert Attendance Threshold (%)</label>
                     <input 
                        type="number" 
                              value={attendanceThreshold}
                              onChange={(e) => setAttendanceThreshold(e.target.value)}
                              className="w-full px-4 py-2 bg-white border border-zinc-200 focus:border-zinc-900 outline-none text-zinc-900 text-sm font-medium"
                     />
                          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Students below this will be marked "At-Risk".</p>
                 </div>

                 <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Auto-alert CGPA Threshold</label>
                     <input 
                        type="number" 
                              value={cgpaThreshold}
                        step={0.1}
                              onChange={(e) => setCgpaThreshold(e.target.value)}
                              className="w-full px-4 py-2 bg-white border border-zinc-200 focus:border-zinc-900 outline-none text-zinc-900 text-sm font-medium"
                     />
                          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Students below this will be marked "Critical".</p>
                 </div>
            </div>
        </div>

              <div className="pt-8 flex justify-end items-center gap-4">
                  {saveSuccess && (
                      <span className="text-emerald-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                          <CheckCircle size={16} />
                          Saved Successfully
                      </span>
                  )}
                  <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                  >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {isSaving ? "Saving..." : "Save System Configuration"}
            </button>
        </div>

      </div>
    </div>
  );
}

