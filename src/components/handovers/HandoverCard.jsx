"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Handshake, 
  Loader2, 
  User, 
  ShieldCheck,
  RefreshCw
} from "lucide-react";


const initialSampleHandover = {
  _id: "handover_9982x",
  itemTitle: "MacBook Pro 16-inch",
  itemThumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150",
  ownerName: "Shifath Ahmed",
  locationNote: "Starbucks Coffee Lounge, 2nd Floor Counter, GEC Circle",
  meetingDate: "Tomorrow at 4:30 PM",
  status: "pending", // Can be "pending", "confirmed", or "completed"
};


export function HandoverCard({ handover = {}, onConfirmMeeting, onCompleteHandover }) {
  const [loadingAction, setLoadingAction] = useState(null);

  if (!handover || Object.keys(handover).length === 0) {
    return (
      <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-5 shadow-xl text-neutral-500 text-sm text-center">
        No handover details available.
      </div>
    );
  }

  // Status badge helper
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "reunited":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Reunited / Completed
          </span>
        );
      case "confirmed":
      case "meeting_confirmed":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-1 rounded-full border border-[#CCFF00]/20">
            <Handshake className="w-3.5 h-3.5" /> Meeting Confirmed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending Confirmation
          </span>
        );
    }
  };

  const handleConfirm = async () => {
    if (!onConfirmMeeting) return;
    setLoadingAction("confirm");
    try {
      await onConfirmMeeting(handover._id || handover.id);
    } catch (err) {
      console.error("Failed to confirm meeting:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleComplete = async () => {
    if (!onCompleteHandover) return;
    setLoadingAction("complete");
    try {
      await onCompleteHandover(handover._id || handover.id);
    } catch (err) {
      console.error("Failed to complete handover:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const thumbnailSrc = handover?.itemThumbnail || handover?.item?.thumbnail;
  const itemTitle = handover?.itemTitle || handover?.item?.title || "Untitled Item";
  const currentStatus = handover?.status?.toLowerCase() || "pending";

  return (
    <div className="bg-[#121212] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 shadow-xl transition-all duration-200 flex flex-col justify-between gap-4 relative overflow-hidden group">
      
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#CCFF00]/5 rounded-full blur-2xl group-hover:bg-[#CCFF00]/10 transition-colors pointer-events-none"></div>

      {/* Top Section: Item Thumbnail, Title & Status */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700 shrink-0">
            {thumbnailSrc ? (
              <Image 
                src={thumbnailSrc} 
                alt={itemTitle} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
            )}
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Handover Ticket
            </span>
            <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
              {itemTitle}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
              <User className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Owner: <strong className="text-white">{handover?.ownerName || "Verified Owner"}</strong></span>
            </div>
          </div>
        </div>

        <div>{getStatusBadge(handover?.status)}</div>
      </div>

      <div className="border-t border-neutral-800/80 my-1"></div>

      {/* Middle Section: Meeting Location & Schedule Details */}
      <div className="space-y-2.5 text-sm">
        
        {/* Location / Map Pin */}
        <div className="flex items-start gap-2.5 bg-[#1A1A1A] border border-neutral-800 p-3 rounded-xl">
          <MapPin className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider block">
              Meeting Location / Map Note
            </span>
            <p className="text-neutral-200 text-xs sm:text-sm mt-0.5">
              {handover?.locationNote || handover?.meetingLocation || "Central Station Security Desk, Main Entrance"}
            </p>
          </div>
        </div>

        {/* Meeting Time / Date */}
        <div className="flex items-center gap-4 text-xs text-neutral-400 px-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span>{handover?.meetingDate || "Tomorrow, 3:00 PM"}</span>
          </div>
        </div>

      </div>

      {/* Bottom Section: State Action Buttons */}
      {currentStatus !== "completed" && currentStatus !== "reunited" && (
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
          
          {/* Confirm Meeting Button (Shown when pending) */}
          {currentStatus === "pending" && onConfirmMeeting && (
            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={handleConfirm}
              className="flex-1 py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loadingAction === "confirm" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Handshake className="w-3.5 h-3.5 text-[#CCFF00]" />
              )}
              <span>Confirm Meeting</span>
            </button>
          )}

          {/* Mark as Completed / Reunited Button */}
          {onCompleteHandover && (
            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={handleComplete}
              className="flex-1 py-2.5 px-3 bg-[#CCFF00] hover:bg-[#b3e600] text-black font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.15)] disabled:opacity-50"
            >
              {loadingAction === "complete" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Mark as Completed / Reunited</span>
            </button>
          )}

        </div>
      )}

    </div>
  );
}

// ==========================================
// 3. MAIN DEMO PAGE CONTAINER
// ==========================================
export default function HandoverDemoPage() {
  const [handover, setHandover] = useState(initialSampleHandover);

  const handleConfirmMeeting = async (id) => {
    console.log(`Confirming meeting for handover ${id}`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setHandover((prev) => ({ ...prev, status: "confirmed" }));
  };

  const handleCompleteHandover = async (id) => {
    console.log(`Completing handover ${id}`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setHandover((prev) => ({ ...prev, status: "completed" }));
  };

  const handleReset = () => {
    setHandover(initialSampleHandover);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between selection:bg-[#CCFF00] selection:text-black p-4 sm:p-8">
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          
          {/* Header & Controls */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                Findora Handover Portal
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Meeting & Item Return Verification
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleReset}
              className="p-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl text-neutral-400 hover:text-white transition-colors"
              title="Reset Demo State"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Render Component */}
          <HandoverCard 
            handover={handover} 
            onConfirmMeeting={handleConfirmMeeting}
            onCompleteHandover={handleCompleteHandover}
          />

        </div>
      </main>

      
    </div>
  );
}




