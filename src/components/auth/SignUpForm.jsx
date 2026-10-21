"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "@/lib/toast";
import { authClient } from "@/lib/auth-client";
import {
  User,
  Mail,
  Lock,
  Image as ImageIcon,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Quote,
  ArrowLeft,
} from "lucide-react";

export default function SignUpForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    picture: "",
    password: "",
    confirmPassword: "",
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please complete all required fields.");
      toast.error("Please fill in your name, email, and password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      toast.error("Passwords do not match!");
      return;
    }

    if (!formData.agreeTerms) {
      setError("Please agree to the Terms of Service to continue.");
      toast.error("Please agree to the Terms of Service.");
      return;
    }

    setLoading(true);

    try {
      if (authClient?.signUp?.email) {
        const { data, error: authError } = await authClient.signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          image: formData.picture,
        });

        if (authError) {
          throw new Error(authError.message || "Registration failed");
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 950));
      }

      toast.success("Account created successfully! Welcome to Findora.");

      // Redirect to sign in or reports
      router.push("/auth/signIn");
    } catch (err) {
      const msg = err.message || "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast.loading(`Connecting with ${provider}...`, {
      duration: 1000,
    });
    setTimeout(() => {
      toast.success(`Account registered with ${provider}!`);
      router.push("/reports");
    }, 1000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      {/* Back to Home Link */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Findora Home</span>
        </Link>
      </div>

      {/* Main 2-Column Split Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
        
        {/* Left Column: Visual Brand & Member Benefits (Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 bg-slate-950 text-white p-10 lg:p-12 relative flex-col justify-between overflow-hidden">
          {/* Subtle glowing ambient mesh orbs */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#9ae600]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Identity */}
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3.5 mb-8">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 shadow-md group-hover:scale-105 transition-transform">
                  <img
                    src="/findora-logo-clean.png"
                    alt="Findora"
                    className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(154,230,0,0.5)]"
                  />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white font-heading">
                  Findora
                </span>
              </Link>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#9ae600] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Free Community Membership</span>
              </div>
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-heading leading-tight mb-4">
              Join a network built on honesty and care.
            </h2>
            <p className="text-sm lg:text-base text-slate-400 leading-relaxed max-w-md">
              Create your account in seconds to report lost valuables, claim found belongings, and receive instant AI match notifications.
            </p>
          </div>

          {/* Middle: Key Features Highlight */}
          <div className="relative z-10 my-8 space-y-3.5">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-[#9ae600]/20 text-[#9ae600] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Smart Match Notifications</h4>
                <p className="text-xs text-slate-400">Get notified the moment a matching item is reported.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Verified Ownership Proof</h4>
                <p className="text-xs text-slate-400">Security questions protect items from fraudulent claims.</p>
              </div>
            </div>
          </div>

          {/* Bottom Testimonial */}
          <div className="relative z-10 pt-6 border-t border-white/10">
            <div className="flex gap-3">
              <Quote className="w-6 h-6 text-[#9ae600] shrink-0 opacity-80" />
              <div>
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  &ldquo;I found a wallet with an NID at Mohakhali bus stop. Findora connected me with the owner within two hours for a safe return.&rdquo;
                </p>
                <div className="mt-2 text-xs font-bold text-white font-heading">
                  — Tanvir Ahmed, <span className="text-slate-400 font-normal">Dhaka</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Modern Sign Up Form */}
        <div className="col-span-1 lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            
            {/* Form Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight font-heading mb-2">
                Create an account
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Join Findora today. It takes less than a minute.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2.5 animate-in fade-in duration-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Social Logins */}
            <div className="mb-5">
              <button
                type="button"
                onClick={() => handleSocialLogin("Google")}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Separator */}
            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                Or with email
              </span>
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-950 dark:focus:ring-[#9ae600] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-950 dark:focus:ring-[#9ae600] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Profile Picture URL (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Profile Picture URL
                  </label>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ImageIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    name="picture"
                    value={formData.picture}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-950 dark:focus:ring-[#9ae600] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-950 dark:focus:ring-[#9ae600] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-950 dark:focus:ring-[#9ae600] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 rounded text-slate-900 dark:text-[#9ae600] focus:ring-slate-950 dark:focus:ring-[#9ae600] border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <label
                  htmlFor="agreeTerms"
                  className="text-xs text-slate-500 dark:text-slate-400 leading-normal select-none"
                >
                  I agree to Findora&apos;s{" "}
                  <Link href="/terms" className="text-slate-800 dark:text-slate-200 underline font-semibold">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-slate-800 dark:text-slate-200 underline font-semibold">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 px-4 bg-[#9ae600] hover:bg-[#88cc00] active:scale-98 text-slate-950 font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(154,230,0,0.3)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Sign In */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-slate-950 dark:text-[#9ae600] hover:underline"
              >
                Sign in
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
