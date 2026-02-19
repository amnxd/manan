"use client";

import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const { user, userRole, signIn, loading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If already logged in, redirect
    useEffect(() => {
        if (!loading && user && userRole) {
            router.replace(userRole === "admin" ? "/admin" : "/dashboard");
        }
    }, [user, userRole, loading, router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setIsSubmitting(true);

        try {
            const { role } = await signIn(email, password);
            if (role === "admin") {
                router.push("/admin");
            } else if (role) {
                router.push("/dashboard");
            } else {
                setErrorMsg("Logged in but could not sync with server. Please try again.");
            }
        } catch (error) {
            if (error?.code === "auth/user-not-found" || error?.code === "auth/wrong-password" || error?.code === "auth/invalid-credential") {
                setErrorMsg("Invalid email or password.");
            } else if (error?.code === "auth/invalid-email") {
                setErrorMsg("Please enter a valid email address.");
            } else if (error?.code === "auth/too-many-requests") {
                setErrorMsg("Too many failed attempts. Please try again later.");
            } else {
                setErrorMsg(error?.message || "Login failed. Please try again.");
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
            <div className="w-full max-w-sm">

                {/* Logo / Header */}
                <div className="mb-10 text-center">
                    <h1 className="font-heading font-bold text-3xl uppercase tracking-tighter border-zinc-900 inline-block px-1">
                        Manan AI
                    </h1>
                    <p className="mt-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        Student Portal
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600 uppercase tracking-wide flex items-center gap-2">
                        <span className="text-lg">!</span> {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
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
                                className="w-full bg-white border-b-2 border-zinc-200 px-0 py-2 text-zinc-900 placeholder-zinc-300 focus:border-zinc-900 focus:outline-none transition-colors font-medium rounded-none"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-zinc-900 text-white font-bold uppercase tracking-widest text-xs py-4 hover:bg-zinc-800 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isSubmitting ? "Authenticating..." : "Access Dashboard"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-zinc-100 pt-6">
                    <p className="text-xs text-zinc-500">
                        New Student?{" "}
                        <Link href="/signup" className="text-zinc-900 font-bold hover:underline underline-offset-4 decoration-zinc-900">
                            REGISTER HERE
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
