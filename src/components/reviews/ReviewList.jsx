"use client";

import React from "react";
import ReviewCard from "./ReviewCard";
import { MessageSquare } from "lucide-react";

export default function ReviewList({ reviews = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-[#121212] border border-neutral-800 rounded-2xl p-6 h-48 animate-pulse flex flex-col justify-between"
          >
            <div className="w-24 h-4 bg-neutral-800 rounded"></div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-neutral-800 rounded"></div>
              <div className="w-3/4 h-4 bg-neutral-800 rounded"></div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 bg-neutral-800 rounded-full"></div>
              <div className="space-y-1">
                <div className="w-24 h-3 bg-neutral-800 rounded"></div>
                <div className="w-16 h-3 bg-neutral-800 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-8 text-center text-neutral-400 flex flex-col items-center justify-center gap-2">
        <MessageSquare className="w-8 h-8 text-neutral-600" />
        <p className="text-sm">No testimonials or reviews available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review, index) => (
        <ReviewCard key={review._id || review.id || index} review={review} />
      ))}
    </div>
  );
}