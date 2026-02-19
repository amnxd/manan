"use client";

import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
    const { user, userRole, signUp, loading } = useAuth();
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If already logged in, redirect
    useEffect(() => {
        if (!loading && user && userRole) {
            router.replace(userRole === "admin" ? "/admin" : "/dashboard");
        }
    }, [user, userRole, loading, router]);

    const handleSignup = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        // Validate confirm password
        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setErrorMsg("Password must be at least 6 characters.");
            return;
        }



        setIsSubmitting(true);
        try {
            const { role } = await signUp(email, password, selectedRole);
            if (role === "admin") {
                router.push("/admin");
            } else if (role) {
                router.push("/dashboard");
            } else {
                setErrorMsg("Account created but failed to sync with server. Try logging in.");
            }
        } catch (error) {
            if (error?.code === "auth/email-already-in-use") {
                setErrorMsg("This email is already registered. Try logging in.");
            } else if (error?.code === "auth/invalid-email") {
                setErrorMsg("Please enter a valid email address.");
            } else if (error?.code === "auth/weak-password") {
                setErrorMsg("Password is too weak. Use at least 6 characters.");
            } else {
                setErrorMsg(error?.message || "Signup failed. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || (user && userRole)) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin border-2 border-zinc-200 border-t-zinc-900 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-4 font-sans text-zinc-950">
            <div className="w-full max-w-md">

                {/* Logo / Header */}
                <div className="mb-10 text-center">
                    <h1 className="font-heading font-bold text-3xl uppercase tracking-tighter border-zinc-900 inline-block px-1">
                        Manan AI
                    </h1>
                    <p className="mt-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        Create Account
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600 uppercase tracking-wide flex items-center gap-2">
                        <span className="text-lg">!</span> {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-6">
                    {/* Role Selection */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500">
                            I am a...
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => { setSelectedRole("student"); setErrorMsg(""); }}
                                className={`group flex flex-col items-center justify-center p-4 border transition-all ${selectedRole === "student"
                                    ? "bg-zinc-900 border-zinc-900 text-white"
                                    : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900"
                                    }`}
                            >
                                <span className="text-xl mb-2 grayscale group-hover:grayscale-0">🎓</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Student</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => { setSelectedRole("admin"); setErrorMsg(""); }}
                                className={`group flex flex-col items-center justify-center p-4 border transition-all ${selectedRole === "admin"
                                    ? "bg-zinc-900 border-zinc-900 text-white"
                                    : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900"
                                    }`}
                            >
                                <span className="text-xl mb-2 grayscale group-hover:grayscale-0">👨‍🏫</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Faculty</span>
                            </button>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-zinc-500">
                            Email Address
                        </label>
                        <div className="relative group">
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@university.edu"
                                required
                                className="w-full bg-white border-b-2 border-zinc-200 px-0 py-2 text-zinc-900 placeholder-zinc-300 focus:border-zinc-900 focus:outline-none transition-colors font-medium rounded-none"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-zinc-500">
                                Password
                            </label>
                            <div className="relative group">
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-white border-b-2 border-zinc-200 px-0 py-2 text-zinc-900 placeholder-zinc-300 focus:border-zinc-900 focus:outline-none transition-colors font-medium rounded-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-widest text-zinc-500">
                                Confirm
                            </label>
                            <div className="relative group">
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-white border-b-2 border-zinc-200 px-0 py-2 text-zinc-900 placeholder-zinc-300 focus:border-zinc-900 focus:outline-none transition-colors font-medium rounded-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-zinc-900 text-white font-bold uppercase tracking-widest text-xs py-4 hover:bg-zinc-800 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                    >
                        {isSubmitting ? "Creating Profile..." : "Complete Registration"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-zinc-100 pt-6">
                    <p className="text-xs text-zinc-500">
                        Already have an account?{" "}
                        <Link href="/login" className="text-zinc-900 font-bold hover:underline underline-offset-4 decoration-zinc-900">
                            SIGN IN
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
