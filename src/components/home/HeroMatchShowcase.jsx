"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { 
  Zap, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Layers,
  Fingerprint
} from "lucide-react";

const MATCH_SCENARIOS = [
  {
    id: "macbook",
    tabLabel: "Apple MacBook Pro",
    category: "Laptops & Computing",
    score: "99.2%",
    matchSpeed: "1.4s",
    lost: {
      title: "MacBook Pro 14\" (Space Gray)",
      details: "M2 Pro • Distinct Next.js sticker on bottom right",
      location: "Dhanmondi 27 Cafe, Dhaka",
      time: "Today at 09:15 AM",
      reporter: "Zabed M. (Owner)",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    },
    found: {
      title: "Apple Laptop in Dark Gray Sleeve",
      details: "Left at table 4, turned in to cafe front counter",
      location: "Gloria Jean's Coffee, Dhanmondi",
      time: "Today at 09:24 AM",
      reporter: "Barista Counter (Finder)",
      image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
    },
    criteria: ["Serial hash match", "Location < 40m", "Photo embeddings 99.2%"],
  },
  {
    id: "wallet",
    tabLabel: "Leather Wallet",
    category: "Personal Accessories",
    score: "98.4%",
    matchSpeed: "2.1s",
    lost: {
      title: "Bellroy Leather Bifold (Caramel Brown)",
      details: "Contains University ID and Metro Pass",
      location: "City Metro Station Exit 2",
      time: "Yesterday, 06:40 PM",
      reporter: "Samiul K. (Owner)",
      image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    },
    found: {
      title: "Tan Brown Wallet with Multiple Cards",
      details: "Secured at Metro Security Information Booth",
      location: "City Center Metro Concourse",
      time: "Yesterday, 07:05 PM",
      reporter: "Station Security (Finder)",
      image: "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80",
    },
    criteria: ["ID name initials match", "Same transit gate", "Color & brand match"],
  },
  {
    id: "keys",
    tabLabel: "BMW Smart Key",
    category: "Keys & Security",
    score: "97.9%",
    matchSpeed: "0.9s",
    lost: {
      title: "BMW Smart Key with Blue Leather Strap",
      details: "Includes circular gym locker tag #304",
      location: "Banani Club Parking Area",
      time: "2 days ago, 04:30 PM",
      reporter: "Nafis R. (Owner)",
      image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    },
    found: {
      title: "Smart Car Key with Leather Lanyard",
      details: "Found on floor near parking pillar B-12",
      location: "Banani Security Desk",
      time: "2 days ago, 05:10 PM",
      reporter: "Security Patrol (Finder)",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
    },
    criteria: ["Key fob model match", "Parking lot proximity", "Gym tag identified"],
  },
];

export default function HeroMatchShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const current = MATCH_SCENARIOS[activeTab];

  return (
    <div className="w-full max-w-5xl mx-auto mt-14 sm:mt-16 text-left">
      {/* Top tabs selector */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#7bb800]" />
          <span>Interactive Match Demo:</span>
        </span>
        {MATCH_SCENARIOS.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === idx
                ? "bg-slate-950 text-white shadow-md shadow-slate-950/20"
                : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-600"
            }`}
          >
            {item.tabLabel}
          </button>
        ))}
      </div>

      {/* Main Glassmorphic Showcase Box */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xl shadow-slate-200/70 p-5 sm:p-7 lg:p-8">
        {/* Ambient background blur */}
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute -top-24 right-0 w-80 h-80 bg-gradient-to-br from-[#9ae600]/20 via-emerald-100/20 to-transparent blur-3xl rounded-full" 
        />
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute -bottom-24 left-0 w-80 h-80 bg-gradient-to-tr from-lime-100/30 via-slate-100/40 to-transparent blur-3xl rounded-full" 
        />

        {/* Showcase Header */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9ae600] opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#7bb800]" />
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                AI Match Engine
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#9ae600]/20 text-slate-900 text-[10px] font-mono font-bold">
                Active Match
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Matched in <strong className="text-slate-900">{current.matchSpeed}</strong></span>
            </div>
            <span>•</span>
            <span className="text-slate-600 font-medium">{current.category}</span>
          </div>
        </div>

        {/* Match Pair Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-11 gap-4 lg:gap-3 items-center">
          {/* 1. LOST ITEM CARD (Left: 5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-white to-slate-50/70 rounded-2xl border border-rose-100 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3.5">
              <StatusBadge status="lost" />
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {current.lost.time}
              </span>
            </div>

            <div className="flex gap-4 items-start">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-inner">
                <Image
                  src={current.lost.image}
                  alt={current.lost.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate mb-1">
                  {current.lost.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2.5">
                  {current.lost.details}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{current.lost.location}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">{current.lost.reporter}</span>
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                Verified Report
              </span>
            </div>
          </div>

          {/* 2. MATCH CONNECTOR (Center: 1 col on desktop, full width on mobile) */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 lg:py-0">
            {/* Visual connecting pill */}
            <div className="flex lg:flex-col items-center gap-2 p-2.5 rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20 border border-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#9ae600] text-slate-950">
                <Zap className="w-4 h-4 fill-slate-950" />
              </div>
              <div className="text-center">
                <div className="text-[11px] font-mono font-extrabold text-[#9ae600] tracking-tight">
                  {current.score}
                </div>
                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider hidden lg:block">
                  Match
                </div>
              </div>
            </div>
          </div>

          {/* 3. FOUND ITEM CARD (Right: 5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-white to-slate-50/70 rounded-2xl border border-[#9ae600]/40 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3.5">
              <StatusBadge status="found" />
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {current.found.time}
              </span>
            </div>

            <div className="flex gap-4 items-start">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-inner">
                <Image
                  src={current.found.image}
                  alt={current.found.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate mb-1">
                  {current.found.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2.5">
                  {current.found.details}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-[#7bb800] shrink-0" />
                  <span className="truncate">{current.found.location}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">{current.found.reporter}</span>
              <span className="text-[11px] text-[#7bb800] font-semibold bg-[#9ae600]/15 px-2 py-0.5 rounded-full">
                Safe Custody
              </span>
            </div>
          </div>
        </div>

        {/* Showcase Footer: Similarity criteria & handover CTA */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-[#7bb800]" />
              Matched signals:
            </span>
            {current.criteria.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
              >
                <CheckCircle2 className="w-3 h-3 text-[#7bb800]" />
                {c}
              </span>
            ))}
          </div>

          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-[#7bb800] transition-colors shrink-0 group"
          >
            <span>Explore Live Match Queue</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
