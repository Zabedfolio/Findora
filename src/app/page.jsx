import Hero from "@/components/home/Hero";
import StatsStrip from "@/components/home/StatsStrip";
import HowItWorks from "@/components/home/HowItWorks";
import RecentLostSection from "@/components/home/RecentLostSection";
import RecentFoundSection from "@/components/home/RecentFoundSection";
import CallToAction from "@/components/home/CallToAction";

export const metadata = {
  title: "Findora — Intelligent Lost & Found Platform",
  description:
    "The modern platform for lost and found belongings. Findora connects individuals with finders through automated matching, verified ownership claims, and secure local handovers.",
};

export default function HomePage() {
  return (
    <main className="flex-1 w-full bg-white">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Stats Strip */}
      <StatsStrip />

      {/* 3. How It Works */}
      <HowItWorks />

      {/* 4. Separated Lost Items Section */}
      <RecentLostSection />

      {/* 5. Separated Found Items Section */}
      <RecentFoundSection />

      {/* 6. Call To Action Banner */}
      <CallToAction />
    </main>
  );
}
