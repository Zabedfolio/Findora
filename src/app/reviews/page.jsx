"use client";

import React from "react";
import ReviewList from "@/components/reviews/ReviewList";

const sampleReviews = [
  {
    _id: "1",
    name: "Shifath Ahmed",
    role: "Full-Stack Developer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    rating: 5,
    comment: "Findora's verification workflow made returning my lost laptop smooth and secure. Incredible design system!",
    date: "2 days ago",
  },
  {
    _id: "2",
    name: "Sarah Jenkins",
    role: "Community Member",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    rating: 5,
    comment: "Found a set of keys near the park and returned them within an hour. The handover scheduler is top-notch.",
    date: "1 week ago",
  },
  {
    _id: "3",
    name: "Sarah Karim",
    role: "Community Member",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    rating: 5,
    comment: "Found a set of keys near the park and returned them within an hour. The handover scheduler is top-notch.",
    date: "1 week ago",
  },
];

export default function TestimonialsSection() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 sm:p-12">
      <section className="max-w-7xl mx-auto py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Community Testimonials
          </h2>
          <p className="text-sm text-neutral-400">
            See how Findora is helping people reunite with their belongings safely.
          </p>
        </div>

        <ReviewList reviews={sampleReviews} loading={false} />
      </section>
    </div>
  );
}