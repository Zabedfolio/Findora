"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  ShieldAlert, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  RefreshCw
} from "lucide-react";

const initialSampleClaim = {
  _id: "claim_8921a",
  itemTitle: "Black Leather Wallet",
  itemThumbnail: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=150",
  description: "Has an ID card inside with the name Shifath Ahmed and a black leather strap with silver buckle.",
  lostLocationTime: "Lost near Central Park cafeteria yesterday around 3 PM",
  proofImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500",
  createdAt: new Date().toISOString(),
  status: "pending",
};


export function ClaimCard({ claim = {}, onUpdateStatus }) {
  const [loadingAction, setLoadingAction] = useState(null);

  if (!claim || Object.keys(claim).length === 0) {
    return (
      <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-5 shadow-xl text-neutral-500 text-sm text-center">
        No claim data available.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  const handleAction = async (status) => {
    if (!onUpdateStatus) return;
    setLoadingAction(status);
    try {
      await onUpdateStatus(claim._id || claim.id, status);
    } catch (err) {
      console.error("Failed to update claim status:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const thumbnailSrc = claim?.itemThumbnail || claim?.item?.thumbnail;
  const itemTitle = claim?.itemTitle || claim?.item?.title || "Untitled Item";

  const formattedDate = claim?.createdAt 
    ? new Date(claim.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) 
    : "Just now";

  return (
    <div className="bg-[#121212] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 shadow-xl transition-all duration-200 flex flex-col justify-between gap-4 relative overflow-hidden group">
      
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#CCFF00]/5 rounded-full blur-2xl group-hover:bg-[#CCFF00]/10 transition-colors pointer-events-none"></div>

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
                <ShieldAlert className="w-6 h-6" />
              </div>
            )}
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Claim for Item
            </span>
            <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
              {itemTitle}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        <div>{getStatusBadge(claim?.status)}</div>
      </div>

      <div className="border-t border-neutral-800/80 my-1"></div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
            Claimant Message / Unique Marks:
          </span>
          <p className="text-neutral-300 bg-[#1A1A1A] border border-neutral-800 p-3 rounded-xl text-xs sm:text-sm leading-relaxed">
            {claim?.description || "No description provided."}
          </p>
        </div>

        {claim?.lostLocationTime && (
          <div className="text-xs text-neutral-400">
            <strong className="text-neutral-300">Lost Context:</strong> {claim.lostLocationTime}
          </div>
        )}

        {claim?.proofImage && (
          <div>
            <a 
              href={claim.proofImage} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 text-xs text-[#CCFF00] hover:underline bg-[#CCFF00]/5 border border-[#CCFF00]/20 px-3 py-1.5 rounded-lg"
            >
              <span>View Proof Document / Image</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {(!claim?.status || claim?.status?.toLowerCase() === "pending") && onUpdateStatus && (
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={() => handleAction("rejected")}
            className="flex-1 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loadingAction === "rejected" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            <span>Reject</span>
          </button>

          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={() => handleAction("approved")}
            className="flex-1 py-2 px-3 bg-[#CCFF00] hover:bg-[#b3e600] text-black font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.15)] disabled:opacity-50"
          >
            {loadingAction === "approved" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>Approve Claim</span>
          </button>
        </div>
      )}

    </div>
  );
}


export default function ClaimCardDemoPage() {
  const [claim, setClaim] = useState(initialSampleClaim);

  const handleUpdateStatus = async (id, newStatus) => {
    console.log(`Updating claim status for ${id} to ${newStatus}`);

    await new Promise((resolve) => setTimeout(resolve, 800));

    setClaim((prev) => ({ ...prev, status: newStatus }));
  };

  const handleReset = () => {
    setClaim(initialSampleClaim);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between selection:bg-[#CCFF00] selection:text-black p-4 sm:p-8">
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                Findora Claim Verification
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Admin & Finder Claim Management Card
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

          <ClaimCard 
            claim={claim} 
            onUpdateStatus={handleUpdateStatus} 
          />

        </div>
      </main>
    </div>
  );
}











