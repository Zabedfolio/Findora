
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Image as ImageIcon, Lock, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    picture: "",
    password: "",
    confirmPassword: "",
  });
  // jlhzjlhhhdsh
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        image: formData.picture,
      });

      if (authError) {
        throw new Error(authError.message || "Registration failed");
      }

      router.push("/auth/signin");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
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
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Create an Account</h1>
            <p className="text-sm text-neutral-400 mt-2">Join Findora to explore and report items securely.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Shifath Ahmed"
                  className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00] transition-colors"
                />
              </div>
            </div>

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

            {/* Picture URL */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">Profile Picture URL</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <ImageIcon className="w-5 h-5" />
                </span>
                <input
                  type="url"
                  name="picture"
                  value={formData.picture}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">Password</label>
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
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
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Link to Sign In Page */}
          <div className="mt-6 text-center text-sm text-neutral-400">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-[#CCFF00] font-semibold hover:underline">
              Sign In
            </Link>
          </div>

        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full px-6 py-4 border-t border-neutral-900 text-center text-xs text-neutral-500">
        All rights reserved @findora © 2026
      </footer>

    </div>
  );
}



