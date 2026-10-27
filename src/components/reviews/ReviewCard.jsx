"use client";

import React from "react";
import Image from "next/image";
import StarRating from "./StarRating";

export default function ReviewCard({ review = {} }) {
  const {
    name = "Anonymous User",
    role = "Verified Finder",
    avatar = "",
    rating = 5,
    comment = "",
    date = "Recently",
  } = review;

  return (
    <div className="bg-[#121212] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-6 shadow-xl transition-all duration-200 flex flex-col justify-between gap-4 relative overflow-hidden group">
      
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#CCFF00]/5 rounded-full blur-2xl group-hover:bg-[#CCFF00]/10 transition-colors pointer-events-none"></div>

      {/* Top: Star Rating & Quote Icon */}
      <div className="flex items-center justify-between">
        <StarRating value={rating} readOnly size="sm" />
        <Quote className="w-5 h-5 text-neutral-700" />
      </div>

      {/* Testimonial Comment */}
      <p className="text-neutral-300 text-sm leading-relaxed italic">
        &ldquo;{comment || "Findora helped me recover my lost item within hours. Absolutely amazing community support!"}&rdquo;
      </p>

      {/* Bottom: Reviewer Profile Info */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700 shrink-0">
            {avatar ? (
              <Image src={avatar} alt={name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#CCFF00]">
                {name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">{name}</h4>
            <p className="text-[11px] text-neutral-400">{role}</p>
          </div>
        </div>

        <span className="text-[11px] text-neutral-500 font-medium">{date}</span>
      </div>

    </div>
  );
}