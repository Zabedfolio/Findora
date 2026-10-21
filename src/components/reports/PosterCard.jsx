"use client";

import React, { useState } from "react";
import {
  User as UserIcon,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import toast from "@/lib/toast";

/**
 * PosterCard Component:
 * Shows verified profile card for the report creator (owner or finder),
 * trust credentials, and protected direct contact buttons.
 */
export default function PosterCard({ report }) {
  const [showPhone, setShowPhone] = useState(false);
  const owner = report?.owner || {
    name: "Community Member",
    email: "contact@findora.app",
    phone: "+880 1700-000000",
    image: "/default-avatar.png",
  };

  const avatarSrc = owner.image?.trim() ? owner.image : "/default-avatar.png";

  const handleMessage = () => {
    toast.success("Opening chat connection with poster...");
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        <span>Reported By</span>
      </div>

      <div className="flex items-center gap-3.5 mb-4">
        <div className="relative w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-slate-200 dark:ring-slate-700 shadow-xs shrink-0">
          <img
            src={avatarSrc}
            alt={owner.name || "Poster"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/default-avatar.png";
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-base font-bold text-slate-950 dark:text-white truncate font-heading">
              {owner.name || "Findora Member"}
            </h4>
            <ShieldCheck className="w-4 h-4 text-[#72ad00] dark:text-[#9ae600] shrink-0" title="Verified Member" />
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-3 h-3" />
              <span>Verified Account</span>
            </span>
          </div>
        </div>
      </div>

      {/* Contact Actions */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setShowPhone(!showPhone)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <Phone className="w-4 h-4 text-slate-500" />
          <span>{showPhone ? owner.phone || "+880 1712-345678" : "Show Phone Number"}</span>
        </button>

        <button
          type="button"
          onClick={handleMessage}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#9ae600]/15 hover:bg-[#9ae600]/25 text-[#457000] dark:text-[#9ae600] border border-[#9ae600]/30 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Message Finder</span>
        </button>
      </div>
    </div>
  );
}
