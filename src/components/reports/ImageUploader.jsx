"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Plus, AlertCircle } from "lucide-react";

/**
 * ImageUploader Component:
 * Allows drag-and-drop or browsing image files, with live thumbnail previews,
 * deletion, and fallback image URL entry.
 */
export default function ImageUploader({ images = [], onChange, maxImages = 4 }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFiles = (newFiles) => {
    const fileList = Array.from(newFiles);
    const validImages = fileList.filter((file) => file.type.startsWith("image/"));
    
    if (validImages.length === 0) return;

    const previews = validImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    const updated = [...images, ...previews].slice(0, maxImages);
    onChange(updated);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newImage = {
      file: null,
      url: urlInput.trim(),
      name: "Web Image",
    };

    const updated = [...images, newImage].slice(0, maxImages);
    onChange(updated);
    setUrlInput("");
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Photos of Item <span className="text-slate-400 font-normal lowercase">(optional, max {maxImages})</span>
        </label>
        
        {!showUrlInput && images.length < maxImages && (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="text-xs font-semibold text-[#66a300] hover:text-[#528200] dark:text-[#9ae600] transition-colors cursor-pointer"
          >
            + Add image by URL
          </button>
        )}
      </div>

      {/* URL Input Bar */}
      {showUrlInput && (
        <div className="flex gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-in fade-in duration-150">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/item-photo.jpg"
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#9ae600]"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-[#9ae600] text-slate-950 font-bold text-xs rounded-lg hover:bg-[#85c900] transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Zone */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-[#9ae600] bg-[#9ae600]/10 scale-[1.01]"
              : "border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-850 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-slate-600">
              <UploadCloud className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                <span className="text-[#68a600] dark:text-[#9ae600] font-bold">Click to upload</span> or drag and drop
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, WEBP up to 10MB each
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnails Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {images.map((img, idx) => {
            const url = typeof img === "string" ? img : img.url;
            return (
              <div
                key={idx}
                className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs"
              >
                <img
                  src={url}
                  alt={`Upload preview ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(idx);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-[#9ae600]">
                    Cover
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
