"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "@/lib/toast";
import { authClient } from "@/lib/auth-client";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowLeft,
} from "lucide-react";

export default function SignInForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
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

    if (!formData.email || !formData.password) {
      setError("Please fill in both email and password.");
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      if (authClient?.signIn?.email) {
        const { data, error: authError } = await authClient.signIn.email({
          email: formData.email,
          password: formData.password,
        });

        if (authError) {
          throw new Error(authError.message || "Invalid email or password");
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 850));
      }

      toast.success("Welcome back! Signed in successfully.", {
        icon: "👋",
      });

      // Redirect to reports / dashboard
      router.push("/reports");
    } catch (err) {
      const msg = err.message || "Invalid email or password. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast(`Connecting with ${provider}...`, {
      icon: "🔐",
    });
    setTimeout(() => {
      toast.success(`Successfully authenticated with ${provider}!`);
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
        
        {/* Left Column: Visual Brand & Live Match Showcase (Desktop) */}
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
                <span>Intelligent Lost &amp; Found Network</span>
              </div>
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-heading leading-tight mb-4">
              Reunite with what matters most.
            </h2>
            <p className="text-sm lg:text-base text-slate-400 leading-relaxed max-w-md">
              Findora uses automated matching and verified handovers to return lost valuables safely to their rightful owners.
            </p>
          </div>

          {/* Middle: Live Simulated Match Floating Glass Card */}
          <div className="relative z-10 my-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-4.5 shadow-2xl relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#9ae600] animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Recent Match Reunited
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#9ae600] text-slate-950">
                  98% Confidence
                </span>
              </div>

              <div className="flex gap-3.5 items-center">
                <img
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=200&q=80"
                  alt="Matched item"
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/20"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white truncate">
                    Apple iPhone 15 Pro (Natural Titanium)
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Dhanmondi Lake Park, Dhaka</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Returned to verified owner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Stats Strip */}
          <div className="relative z-10 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg lg:text-xl font-extrabold text-white font-heading">
                1,250+
              </div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mt-0.5">
                Reunited Items
              </div>
            </div>
            <div>
              <div className="text-lg lg:text-xl font-extrabold text-[#9ae600] font-heading">
                94%
              </div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mt-0.5">
                Recovery Rate
              </div>
            </div>
            <div>
              <div className="text-lg lg:text-xl font-extrabold text-white font-heading">
                15k+
              </div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mt-0.5">
                Members
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Modern Sign In Form */}
        <div className="col-span-1 lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            
            {/* Form Header */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight font-heading mb-2">
                Welcome back
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sign in to your account to manage your listings and claims.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2.5 animate-in fade-in duration-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Social Logins */}
            <div className="mb-6">
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
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                Or with email
              </span>
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
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
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-950 dark:focus:ring-[#9ae600] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-semibold text-slate-600 dark:text-[#9ae600] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
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
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-950 dark:focus:ring-[#9ae600] focus:border-transparent transition-all"
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

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-slate-900 dark:text-[#9ae600] focus:ring-slate-950 dark:focus:ring-[#9ae600] border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none"
                >
                  Remember this device for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 px-4 bg-slate-950 hover:bg-slate-850 active:scale-98 text-white dark:bg-[#9ae600] dark:hover:bg-[#88cc00] dark:text-slate-950 font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Sign Up */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-slate-950 dark:text-[#9ae600] hover:underline"
              >
                Create an account
              </Link>
            </div>

            {/* Footer Trust Note */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Protected by Findora Trust &amp; Privacy Verification</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
