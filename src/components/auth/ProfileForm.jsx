"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Camera, Trash2, Save, CheckCircle2, Loader2 } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import toast from "@/lib/toast";
import { cn } from "@/utils/cn";

export default function ProfileForm() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill fields whenever user changes or hydrates
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAvatarPreview(user.image || "");
    }
  }, [user]);

  // Handle local avatar file upload with instant base64 preview
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar image size must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove avatar image
  const handleRemoveAvatar = () => {
    setAvatarPreview("");
  };

  // Save profile updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        image: avatarPreview || "/default-avatar.png",
      });
      toast.success("Profile information updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(err?.message || "Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#070b04] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-6"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
            Personal Information
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Update your public profile details and verified contact methods.
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          Account ID: {user?.id || "user_current"}
        </span>
      </div>

      {/* Avatar Upload, Preview, and Remove */}
      <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
        <div className="relative group shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-slate-100 dark:ring-white/10 shadow-md bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={name || "User Avatar"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
            ) : (
              <User size={32} className="text-slate-400" />
            )}
          </div>

          <label
            htmlFor="avatar-upload-input"
            className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-[#9ae600] text-slate-950 shadow-md hover:bg-[#88cc00] transition-transform hover:scale-110 cursor-pointer"
            title="Upload new photo"
          >
            <Camera size={13} strokeWidth={2.4} />
            <input
              id="avatar-upload-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs font-bold text-slate-900 dark:text-white">Profile Picture</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            JPG, GIF or PNG. Recommended size: 400x400px (Max 2MB).
          </p>

          <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <label
              htmlFor="avatar-upload-input"
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.15] text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              Choose Photo
            </label>

            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <Trash2 size={12} />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Full Legal Name
          </label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zabed Mahmud"
              required
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#9ae600]"
            />
          </div>
        </div>

        {/* Read-Only Email */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              Read-only
            </span>
          </div>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={user?.email || "member@findora.app"}
              readOnly
              disabled
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] text-xs font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Primary Phone Number (SMS / WhatsApp)
          </label>
          <div className="relative">
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1712-345678"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#9ae600]"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Your phone number is protected with blind masking and only shared with verified claimants.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-white/[0.06]">
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "btn-primary-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 shadow-md cursor-pointer transition-all",
            submitting && "opacity-75 cursor-wait"
          )}
        >
          {submitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          <span>{submitting ? "Saving Changes..." : "Save Changes"}</span>
        </button>
      </div>
    </form>
  );
}
