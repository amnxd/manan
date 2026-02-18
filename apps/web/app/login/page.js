"use client";

import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { user, googleSignIn, loading, setUserRole } = useAuth();
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState("student");
    const [isSyncing, setIsSyncing] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Taking control of redirection away from AuthContext or useEffect hooks to ensure we sync first
    // access tokens might be needed.

    const handleSignIn = async () => {
        if (isSyncing) return; // guard against double-clicks
        setErrorMsg("");
        setIsSyncing(true);
        try {
            await googleSignIn();
            // After googleSignIn resolves, onAuthStateChanged fires and updates `user`.
            // The useEffect below picks that up and handles the /auth/sync call + redirect.
        } catch (error) {
            // Silently ignore if a previous popup was cancelled (user opened a new one)
            if (error?.code === "auth/cancelled-popup-request") {
                setIsSyncing(false);
                return;
            }
            console.error(error);
            setErrorMsg("Login failed. Please try again.");
            setIsSyncing(false);
        }
    };

    // We need to change AuthContext to return the result of signInWithPopup.
    // However, I can't change AuthContext *logic* too much without risking breaking other things if dependent.
    // But `googleSignIn` returning the promise result is standard.

    // Alternative: Watch `user` in `useEffect`. 
    // If `user` becomes available AND we are on this page...
    // But we need to know if we just logged in to trigger sync.
    // If user is already logged in (persistence), we might still want to check role or redirect.

    // Let's use the `useEffect` that listens to `user`.
    useEffect(() => {
        const syncUser = async () => {
            if (user && !isSyncing) {
                // Only sync if we haven't already or if we aren't in the middle of it?
                // Problem: `useEffect` runs on mount. If user is already logged in, `user` is non-null.
                // We should sync to get the role.

                setIsSyncing(true);
                try {
                    const token = await user.getIdToken();

                    const response = await fetch("http://127.0.0.1:8000/auth/sync", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            token: token,
                            role: selectedRole,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error("Failed to sync user with backend");
                    }

                    const data = await response.json();

                    // Update role in context
                    if (setUserRole) setUserRole(data.role);

                    // Redirect
                    if (data.role === "admin") {
                        router.push("/admin");
                    } else {
                        router.push("/dashboard");
                    }
                } catch (err) {
                    console.error("Sync error:", err);
                    setErrorMsg("Failed to synchronize user data. Backend might be down.");
                    // Optionally logout if sync fails?
                } finally {
                    setIsSyncing(false);
                }
            }
        };

        syncUser();
    }, [user, router]); // Dependency on `selectedRole` is tricky. if user changes role *after* login? No, role selection is pre-login.

    // Issue: If `user` is already present (re-visit page), `selectedRole` defaults to "student". 
    // If they were actually an admin, the backend will correct it (logic: "If Existing User: Read the existing role").
    // So `selectedRole` is only relevant for NEW users. Perfect.

    if (loading || isSyncing) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isSyncing ? "Syncing profile..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
                    Nova Scholar
                </h1>
                <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
                    Select your role to continue
                </p>

                {errorMsg && (
                    <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {errorMsg}
                    </div>
                )}

                <div className="mb-8 grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setSelectedRole("student")}
                        className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${selectedRole === "student"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 hover:border-blue-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                            }`}
                    >
                        <span className="text-2xl mb-2">🎓</span>
                        <span className={`font-medium ${selectedRole === "student" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>
                            Student
                        </span>
                    </button>

                    <button
                        onClick={() => setSelectedRole("admin")}
                        className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${selectedRole === "admin"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 hover:border-blue-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                            }`}
                    >
                        <span className="text-2xl mb-2">👨‍🏫</span>
                        <span className={`font-medium ${selectedRole === "admin" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>
                            Admin/Faculty
                        </span>
                    </button>
                </div>

                <button
                    onClick={handleSignIn}
                    disabled={isSyncing}
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-white border border-gray-300 px-4 py-3 text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google logo"
                        className="h-6 w-6"
                    />
                    <span className="text-base font-medium">Sign in with Google</span>
                </button>
            </div>
        </div>
    );
}
