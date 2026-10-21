"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { HeartHandshake, Award, Users, Clock } from "lucide-react";

export default function StatsStrip() {
  const { t } = useLanguage();

  const stats = [
    {
      id: "reunited",
      value: t("home.stats.reunitedCount", "1,250+"),
      label: t("home.stats.reunited", "Items Reunited"),
      icon: HeartHandshake,
      accent: "text-emerald-600 bg-emerald-50",
    },
    {
      id: "successRate",
      value: t("home.stats.successRateCount", "94%"),
      label: t("home.stats.successRate", "Recovery Rate"),
      icon: Award,
      accent: "text-[#7bb800] bg-[#9ae600]/15",
    },
    {
      id: "community",
      value: t("home.stats.communityCount", "15,000+"),
      label: t("home.stats.community", "Active Members"),
      icon: Users,
      accent: "text-indigo-600 bg-indigo-50",
    },
    {
      id: "responseTime",
      value: t("home.stats.responseTimeCount", "< 24h"),
      label: t("home.stats.responseTime", "Avg. Response"),
      icon: Clock,
      accent: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <section className="relative border-y border-slate-200/80 bg-slate-50/80 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-2xl transition-transform hover:-translate-y-0.5"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.accent}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-500">
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
