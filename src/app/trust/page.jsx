"use client";

import React from "react";
import TrustHero from "@/components/trust/TrustHero";
import SafeHandoverSimulator from "@/components/trust/SafeHandoverSimulator";
import ScamThreatMatrix from "@/components/trust/ScamThreatMatrix";
import TrustFaqAccordion from "@/components/trust/TrustFaqAccordion";

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070905] text-slate-900 dark:text-white transition-colors">
      {/* 1. Hero: The Findora Trust Architecture & 4 Core Pillars */}
      <TrustHero />

      {/* 2. Safe Handover Interactive Simulator & Safe Zones */}
      <SafeHandoverSimulator />

      {/* 3. Scam Threat Matrix & Proactive Countermeasures */}
      <ScamThreatMatrix />

      {/* 4. Accessible Safety FAQ using mutually exclusive details */}
      <TrustFaqAccordion />
    </main>
  );
}
