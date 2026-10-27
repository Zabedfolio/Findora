"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldCheck, Upload, Loader2, AlertCircle } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import toast from "@/lib/toast";
import { createClaim } from "@/services/claimService";

export default function ClaimForm({ itemId, report, onSubmitSuccess }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        description: "",
        lostLocationTime: "",
        proofImage: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!user) {
            toast.error("Please sign in to submit a claim.");
            const redirectUrl = pathname
                ? `/login?redirect=${encodeURIComponent(pathname)}`
                : "/login";
            router.push(redirectUrl);
            return;
        }

        if (formData.description.trim().length < 20) {
            setError("Description must be at least 20 characters to help verify ownership.");
            return;
        }

        setLoading(true);

        try {
            const effectiveReportId = itemId || report?._id || report?.id;
            const created = await createClaim({
                reportId: effectiveReportId,
                itemId: effectiveReportId,
                itemTitle: report?.title,
                itemThumbnail: report?.images?.[0] || report?.imageUrl || "",
                category: report?.category,
                location: report?.location,
                description: formData.description.trim(),
                proofText: formData.description.trim(),
                lostLocationTime: formData.lostLocationTime.trim(),
                proofImage: formData.proofImage.trim(),
                claimant: {
                    id: user.id || user._id,
                    userId: user.id || user._id,
                    name: user.name || "Claimant",
                    email: user.email,
                    avatar: user.avatar || user.image || "",
                },
                finder: report?.postedBy
                    ? {
                          id: report.postedBy.userId || report.postedBy.id,
                          userId: report.postedBy.userId || report.postedBy.id,
                          name: report.postedBy.name,
                          email: report.postedBy.email,
                          avatar: report.postedBy.image || "",
                      }
                    : null,
            });

            toast.success("Claim submitted successfully! It now appears in your dashboard under Claims.");

            if (onSubmitSuccess) {
                onSubmitSuccess(created);
            }

            setFormData({ description: "", lostLocationTime: "", proofImage: "" });
        } catch (err) {
            setError(err.message || "Failed to submit claim. Please try again.");
            toast.error(err.message || "Failed to submit claim.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg bg-[#121212] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden">

            {/* Background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-xl flex items-center justify-center text-[#CCFF00]">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">Claim Ownership</h2>
                    <p className="text-xs text-neutral-400">Submit private identifying details of the item.</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Description Field */}
                <div>
                    <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
                        Describe unique marks, contents, colour, serial number, etc. <span className="text-[#CCFF00]">*</span>
                    </label>
                    <textarea
                        name="description"
                        required
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Provide specific identifiers..."
                        className="w-full p-3 bg-[#1A1A1A] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-[#CCFF00] transition-colors resize-none"
                    />
                    <div className="text-right text-[10px] text-neutral-500 mt-1">
                        {formData.description.length}/20 chars min
                    </div>
                </div>

                {/* Optional Extra Question */}
                <div>
                    <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
                        When and where did you lose it? (Optional)
                    </label>
                    <input
                        type="text"
                        name="lostLocationTime"
                        value={formData.lostLocationTime}
                        onChange={handleChange}
                        placeholder="e.g., Near Station, yesterday around 4 PM"
                        className="w-full px-4 py-3 bg-[#1A1A1A] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-[#CCFF00] transition-colors"
                    />
                </div>

                {/* Optional Proof Image */}
                <div>
                    <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
                        Proof image upload URL (Optional)
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                            <Upload className="w-4 h-4" />
                        </span>
                        <input
                            type="url"
                            name="proofImage"
                            value={formData.proofImage}
                            onChange={handleChange}
                            placeholder="https://example.com/proof.jpg"
                            className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-[#CCFF00] transition-colors"
                        />
                    </div>
                </div>

                {/* Privacy Notice */}
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 text-xs">
                    These details are visible <span className="text-white underline">only to the finder and admins</span>.
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 bg-[#CCFF00] hover:bg-[#b3e600] text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.2)] disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Pending...</span>
                        </>
                    ) : (
                        <span>Submit Claim</span>
                    )}
                </button>

            </form>
        </div>
    );
}



