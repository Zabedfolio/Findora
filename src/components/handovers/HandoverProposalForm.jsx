
"use client";

import React, { useState } from "react";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Send, 
  Loader2, 
  ShieldCheck, 
  Building2, 
  ShoppingBag, 
  Train, 
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";

export default function HandoverProposalForm({ claimId, onClose, onSubmitProposal }) {
  const [formData, setFormData] = useState({
    meetingSpot: "",
    date: "",
    time: "",
    note: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Quick suggestion spots
  const suggestionSpots = [
    { label: "Local Police Station", icon: Building2 },
    { label: "Shopping Mall Information Desk", icon: ShoppingBag },
    { label: "Metro / Transit Station", icon: Train },
  ];

  const handleSpotSelect = (spotLabel) => {
    setFormData((prev) => ({ ...prev, meetingSpot: spotLabel }));
    if (error) setError("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.meetingSpot || !formData.date || !formData.time) {
      setError("Please fill in the meeting spot, date, and time.");
      return;
    }

    setLoading(true);

    try {
      if (onSubmitProposal) {
        await onSubmitProposal({
          claimId,
          locationNote: formData.meetingSpot,
          meetingDate: `${formData.date} at ${formData.time}`,
          status: "confirmed",
          ...formData,
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
        console.log("Handover proposal submitted:", { claimId, ...formData });
      }

      setSuccess(true);
      
      // Automatically close modal after brief success feedback
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to submit handover proposal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-[#121212] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Internal Close Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 transition-colors z-10"
          title="Close Form"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pr-8">
        <div className="w-10 h-10 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-xl flex items-center justify-center text-[#CCFF00] shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Propose Handover Meeting</h2>
          <p className="text-xs text-neutral-400">Suggest a safe public location and time to return the item.</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Handover proposal successfully sent!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Meeting Spot Input */}
        <div>
          <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
            Safe Public Meeting Spot <span className="text-[#CCFF00]">*</span>
          </label>
          <div className="relative mb-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <MapPin className="w-4 h-4 text-[#CCFF00]" />
            </span>
            <input
              type="text"
              name="meetingSpot"
              required
              value={formData.meetingSpot}
              onChange={handleChange}
              placeholder="e.g., Central Police Station Lobby"
              className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-[#CCFF00] transition-colors"
            />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider self-center mr-1">Suggestions:</span>
            {suggestionSpots.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSpotSelect(item.label)}
                  className="inline-flex items-center gap-1 text-[11px] bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <IconComponent className="w-3 h-3 text-[#CCFF00]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Meeting Date */}
          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
              Proposed Date <span className="text-[#CCFF00]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-[#CCFF00] transition-colors scheme-dark"
              />
            </div>
          </div>

          {/* Meeting Time */}
          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
              Proposed Time <span className="text-[#CCFF00]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Clock className="w-4 h-4" />
              </span>
              <input
                type="time"
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-[#CCFF00] transition-colors scheme-dark"
              />
            </div>
          </div>

        </div>

        {/* Optional Note */}
        <div>
          <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
            Additional Instructions / Note (Optional)
          </label>
          <textarea
            name="note"
            rows={3}
            value={formData.note}
            onChange={handleChange}
            placeholder="e.g., Please meet near the main reception desk and call upon arrival."
            className="w-full p-3 bg-[#1A1A1A] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-[#CCFF00] transition-colors resize-none"
          />
        </div>

        {/* Safety Notice */}
        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 text-xs">
          <span className="font-medium text-neutral-300">Safety Tip:</span> Always choose well-lit, public spaces like police stations or transit hubs for exchanges.
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
              <span>Proposing Meeting...</span>
            </>
          ) : (
            <>
              <span>Send Handover Proposal</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>

      </form>
    </div>
  );
}






