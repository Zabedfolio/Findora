import Hero from "@/components/home/Hero";
import StatsStrip from "@/components/home/StatsStrip";
import HowItWorks from "@/components/home/HowItWorks";
import LatestReports from "@/components/home/LatestReports";
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

      {/* 4. Latest Reports */}
      <LatestReports />

      {/* 5. Call To Action Banner */}
      <CallToAction />
    </main>
  );
}
