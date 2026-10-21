"use client";

import React, { useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { Image as ImageIcon, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * ImageGallery Component:
 * Displays report photos with interactive thumbnail switching,
 * status badge overlays, and responsive presentation.
 */
export default function ImageGallery({ report }) {
  const images = [];

  if (report?.images && Array.isArray(report.images) && report.images.length > 0) {
    report.images.forEach((img) => {
      const url = typeof img === "string" ? img : img.url;
      if (url) images.push(url);
    });
  }

  if (images.length === 0 && report?.imageUrl) {
    images.push(report.imageUrl);
  }

  // Fallback placeholder image if report has no photos
  if (images.length === 0) {
    images.push(
      report?.type === "found"
        ? "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1200&q=80"
        : "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80"
    );
  }

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-3">
      {/* Main Image Stage */}
      <div className="relative aspect-4/3 sm:aspect-16/10 rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg group">
        <img
          src={images[activeIndex]}
          alt={report?.title || "Report Photo"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
        />

        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
          <StatusBadge status={report?.status || report?.type} />
          {report?.category && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/75 backdrop-blur-md text-slate-200 border border-white/10 shadow-xs">
              {report.category}
            </span>
          )}
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-lg bg-slate-950/75 backdrop-blur-md text-white text-xs font-semibold shadow-xs">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                activeIndex === idx
                  ? "border-[#9ae600] ring-2 ring-[#9ae600]/30 scale-102"
                  : "border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
