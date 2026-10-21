"use client";

import React, { useState } from "react";
import { CATEGORIES } from "@/services/reportService";
import { reportSchema } from "@/validations";
import ImageUploader from "./ImageUploader";
import {
  Tag,
  Calendar,
  MapPin,
  HelpCircle,
  AlertCircle,
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";

/**
 * ReportForm Component:
 * Reusable form for creating and editing lost or found listings.
 * Validates with Zod schema and builds FormData payload for submission.
 *
 * @param {Object} props
 * @param {Object} [props.initialValues] - Pre-filled data when editing
 * @param {Function} props.onSubmit - Callback receiving FormData and parsed object
 * @param {boolean} [props.isLoading=false] - Submission state indicator
 * @param {string} [props.submitLabel="Publish Report"] - Button text
 */
export default function ReportForm({
  initialValues = {},
  onSubmit,
  isLoading = false,
  submitLabel = "Publish Report",
}) {
  const [type, setType] = useState(initialValues.type || "lost");
  const [title, setTitle] = useState(initialValues.title || "");
  const [category, setCategory] = useState(initialValues.category || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [date, setDate] = useState(
    initialValues.dateRaw
      ? initialValues.dateRaw.split("T")[0]
      : initialValues.date
      ? new Date(initialValues.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [location, setLocation] = useState(initialValues.location || "");
  const [itemCurrentLocation, setItemCurrentLocation] = useState(
    initialValues.itemCurrentLocation || ""
  );
  const [images, setImages] = useState(
    initialValues.images && initialValues.images.length > 0
      ? initialValues.images
      : initialValues.imageUrl
      ? [{ url: initialValues.imageUrl, name: "Current Cover" }]
      : []
  );

  const [errors, setErrors] = useState({});

  // Maximum allowed date is today
  const todayStr = new Date().toISOString().split("T")[0];

  // Selectable categories excluding "All Categories"
  const selectableCategories = CATEGORIES.filter((c) => c !== "All Categories");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const formDataPayload = {
      type,
      title: title.trim(),
      category,
      description: description.trim(),
      date,
      location: location.trim(),
      itemCurrentLocation: itemCurrentLocation.trim(),
    };

    // Validate using Zod schema from validations.js
    const result = reportSchema.safeParse(formDataPayload);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Build FormData for upload (fields + images)
    const fd = new FormData();
    fd.append("type", type);
    fd.append("title", title.trim());
    fd.append("category", category);
    fd.append("description", description.trim());
    fd.append("date", date);
    fd.append("location", location.trim());
    if (type === "found" && itemCurrentLocation) {
      fd.append("itemCurrentLocation", itemCurrentLocation.trim());
    }

    // Attach image files or URLs
    images.forEach((img, idx) => {
      if (img.file) {
        fd.append("images", img.file);
      } else if (img.url) {
        fd.append(`imageUrl_${idx}`, img.url);
      }
    });

    if (images.length > 0) {
      const coverUrl = typeof images[0] === "string" ? images[0] : images[0].url;
      fd.append("imageUrl", coverUrl);
    }

    // Send payload to parent onSubmit handler
    onSubmit(fd, {
      ...formDataPayload,
      images,
      imageUrl: images.length > 0 ? (typeof images[0] === "string" ? images[0] : images[0].url) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {/* 1. Type Toggle (Lost vs Found) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
          Report Type <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              setType("lost");
              if (errors.type) setErrors((prev) => ({ ...prev, type: null }));
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              type === "lost"
                ? "bg-slate-950 text-white shadow-md dark:bg-white dark:text-slate-950"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span>I Lost an Item</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType("found");
              if (errors.type) setErrors((prev) => ({ ...prev, type: null }));
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              type === "found"
                ? "bg-[#9ae600] text-slate-950 shadow-md shadow-[#9ae600]/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
            <span>I Found an Item</span>
          </button>
        </div>
        {errors.type && <p className="text-xs text-rose-500 mt-1.5">{errors.type}</p>}
      </div>

      {/* 2. Title Field */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label
            htmlFor="title"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Item Title <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">{title.length}/80</span>
        </div>
        <input
          id="title"
          type="text"
          maxLength={80}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
          }}
          placeholder={
            type === "lost"
              ? "e.g. Apple iPhone 15 Pro (Natural Titanium with MagSafe case)"
              : "e.g. Black Leather Bifold Wallet with National ID Card"
          }
          className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors ${
            errors.title
              ? "border-rose-400 focus:border-rose-500"
              : "border-slate-200 dark:border-slate-700 focus:border-[#9ae600] dark:focus:border-[#9ae600]"
          }`}
        />
        {errors.title && <p className="text-xs text-rose-500 mt-1.5">{errors.title}</p>}
      </div>

      {/* 3. Category & Date Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Category <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (errors.category) setErrors((prev) => ({ ...prev, category: null }));
              }}
              className={`w-full appearance-none px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none transition-colors pr-10 cursor-pointer ${
                errors.category
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-200 dark:border-slate-700 focus:border-[#9ae600]"
              }`}
            >
              <option value="" disabled>
                Select category
              </option>
              {selectableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          {errors.category && <p className="text-xs text-rose-500 mt-1.5">{errors.category}</p>}
        </div>

        {/* Date Lost/Found */}
        <div>
          <label
            htmlFor="date"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Date {type === "lost" ? "Lost" : "Found"} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="date"
              type="date"
              max={todayStr}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
              }}
              className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none transition-colors ${
                errors.date
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-200 dark:border-slate-700 focus:border-[#9ae600]"
              }`}
            />
          </div>
          {errors.date && <p className="text-xs text-rose-500 mt-1.5">{errors.date}</p>}
        </div>
      </div>

      {/* 4. Location Field */}
      <div>
        <label
          htmlFor="location"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {type === "lost" ? "Location Lost" : "Location Found"}{" "}
          <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              if (errors.location) setErrors((prev) => ({ ...prev, location: null }));
            }}
            placeholder="e.g. Dhanmondi Lake Park near bridge 3, Dhaka"
            className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors ${
              errors.location
                ? "border-rose-400 focus:border-rose-500"
                : "border-slate-200 dark:border-slate-700 focus:border-[#9ae600]"
            }`}
          />
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>
        {errors.location && <p className="text-xs text-rose-500 mt-1.5">{errors.location}</p>}
      </div>

      {/* 5. Found Type Extra Field: Where is the item now? */}
      {type === "found" && (
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 animate-in fade-in duration-200">
          <label
            htmlFor="itemCurrentLocation"
            className="block text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1"
          >
            Where is the item right now? <span className="font-normal text-slate-500 lowercase">(optional)</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Let the rightful owner know if you have it safely with you or turned it in to security.
          </p>
          <input
            id="itemCurrentLocation"
            type="text"
            value={itemCurrentLocation}
            onChange={(e) => setItemCurrentLocation(e.target.value)}
            placeholder="e.g. Safely with me / Turned in to Banani Metro Station counter"
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-emerald-300/80 dark:border-emerald-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {/* 6. Description Field */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label
            htmlFor="description"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Description <span className="text-rose-500">*</span>
          </label>
          <span
            className={`text-[11px] font-medium ${
              description.length < 20 ? "text-amber-500" : "text-slate-400"
            }`}
          >
            {description.length} chars (min 20)
          </span>
        </div>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
          }}
          placeholder={
            type === "lost"
              ? "Please describe distinguishing marks, contents, brands, colors, unique stickers or serial numbers..."
              : "Describe the condition, color, and features (avoid giving away private details needed to verify ownership)..."
          }
          className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors resize-y ${
            errors.description
              ? "border-rose-400 focus:border-rose-500"
              : "border-slate-200 dark:border-slate-700 focus:border-[#9ae600]"
          }`}
        />
        {errors.description && (
          <p className="text-xs text-rose-500 mt-1.5">{errors.description}</p>
        )}
      </div>

      {/* 7. Photos Uploader */}
      <div>
        <ImageUploader images={images} onChange={setImages} maxImages={4} />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 sm:py-4 px-6 bg-[#9ae600] hover:bg-[#85c900] active:scale-99 text-slate-950 font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-[0_4px_25px_rgba(154,230,0,0.35)] hover:shadow-[0_6px_30px_rgba(154,230,0,0.5)] cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving Report...</span>
            </>
          ) : (
            <>
              <span>{submitLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
