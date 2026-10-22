"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";

export default function TrustHero() {
  const trustMetrics = [
    {
      icon: EyeOff,
      title: "Blind Verification",
      desc: "Serial numbers, IMEIs, and identifying marks are automatically masked from public view to prevent fraudulent claims.",
    },
    {
      icon: Lock,
      title: "Zero Remote Demands",
      desc: "Findora strictly prohibits upfront shipping fees or courier deposits. Handover is direct and peer-verified.",
    },
    {
      icon: MapPin,
      title: "Safe Handover Hubs",
      desc: "Standardized protocols encouraging meetings in verified public locations, campus security desks, and police stations.",
    },
    {
      icon: ShieldCheck,
      title: "4-Stage Ownership Audit",
      desc: "Multi-layered verification requiring specific item proof, location matching, and timestamp validation.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-20 border-b border-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(154,230,0,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9ae600]/10 border border-[#9ae600]/30 text-[#9ae600] text-xs font-mono font-bold mb-6">
            <ShieldCheck className="w-4 h-4 text-[#9ae600]" />
            <span>FINDORA TRUST & SAFETY PROTOCOL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-white leading-[1.1]">
            Built on Verified Trust, <br className="hidden sm:inline" />
            <span className="text-[#9ae600]">Not Blind Faith.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Returning lost items shouldn&apos;t feel hazardous. Findora implements active anti-fraud architecture, secret identifier masking, and safe exchange protocols to protect both finders and owners.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/match-radar"
              className="inline-flex items-center gap-2 btn-primary-glow px-6 py-3 rounded-2xl text-slate-950 font-bold text-sm tracking-tight"
            >
              <span>Explore Match Radar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#safe-handover"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm transition-colors"
            >
              <span>Safe Handover Protocol</span>
            </a>
          </div>
        </div>

        {/* 4 Pillars of Trust */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
          {trustMetrics.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#9ae600]/40 hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#9ae600]/10 border border-[#9ae600]/25 text-[#9ae600] flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-heading group-hover:text-[#9ae600] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
