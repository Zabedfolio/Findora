"use client";

import React from "react";
import { Package, Search, ShieldAlert, Users, CheckCircle, TrendingUp } from "lucide-react";

export default function StatsCards({ stats = {}, loading = false }) {

  const statItems = [
    {
      label: "Lost Items",
      value: stats.lostItems ?? 0,
      icon: Package,
      trend: "+8% this month",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
    },
    {
      label: "Found Items",
      value: stats.foundItems ?? 0,
      icon: Search,
      trend: "+14% this month",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
    },
    {
      label: "Active Claims",
      value: stats.activeClaims ?? 0,
      icon: ShieldAlert,
      trend: "+5% today",
      color: "text-[#CCFF00]",
      bg: "bg-[#CCFF00]/10",
      border: "border-[#CCFF00]/20",
    },
    {
      label: "Total Users",
      value: stats.users ?? 0,
      icon: Users,
      trend: "+22% this month",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
    },
    {
      label: "Successful Returns",
      value: stats.successfulReturns ?? 0,
      icon: CheckCircle,
      trend: "+18% this month",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="bg-[#121212] border border-neutral-800 rounded-2xl p-6 h-32 animate-pulse flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 bg-neutral-800 rounded-xl"></div>
              <div className="w-16 h-4 bg-neutral-800 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="w-20 h-7 bg-neutral-800 rounded"></div>
              <div className="w-24 h-3 bg-neutral-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {statItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div
            key={index}
            className="bg-[#121212] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-6 shadow-xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden group"
          >
            {/* Subtle top corner ambient glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-[#CCFF00]/10 transition-colors pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center ${item.color}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              {item.trend && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <TrendingUp className="w-3 h-3" />
                  {item.trend}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
                {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
              </h3>
              <p className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                {item.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}