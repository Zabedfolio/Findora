
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const { data: session } = authClient.useSession();
    const user = session?.user;

    console.log(user);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data, error: authError } = await authClient.signIn.email({
                email: formData.email,
                password: formData.password,
            });

            if (authError) {
                throw new Error(authError.message || "Invalid email or password");
            }

            setLoading(false);
            redirect("/dashboard");
        } catch (err) {
            if (err.message === "NEXT_REDIRECT") {
                throw err;
            }
            setError(err.message || "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between selection:bg-[#CCFF00] selection:text-black">

            {/* Main Form Section */}
            <main className="flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-md bg-[#121212] border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">

                    {/* Subtle background glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back</h1>
                        <p className="text-sm text-neutral-400 mt-2">Sign in to your Findora account to continue.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Email Address */}
                        <div>
                            <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                                    <Mail className="w-5 h-5" />
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="hello@findora.app"
                                    className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase">Password</label>
                                <Link href="/auth/forgot-password" className="text-xs text-[#CCFF00] hover:underline">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                                    <Lock className="w-5 h-5" />
                                </span>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 py-3.5 px-4 bg-[#CCFF00] hover:bg-[#b3e600] text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                        >
                            {loading ? (
                                <span className="inline-block w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Link to Sign Up Page */}
                    <div className="mt-6 text-center text-sm text-neutral-400">
                        Don't have an account?{" "}
                        <Link href="/auth/signup" className="text-[#CCFF00] font-semibold hover:underline">
                            Create One
                        </Link>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="w-full px-6 py-4 border-t border-neutral-900 text-center text-xs text-neutral-500">
                All rights reserved @findora © 2026
            </footer>

        </div>
    );
}






