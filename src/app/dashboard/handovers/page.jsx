
"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import HandoverCard from "@/components/handovers/HandoverCard";
import HandoverProposalForm from "@/components/handovers/HandoverProposalForm";

export default function HandoversPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handoverData, setHandoverData] = useState({
    _id: "handover_9982x",
    itemTitle: "MacBook Pro 16-inch",
    itemThumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150",
    ownerName: "Shifath Ahmed",
    locationNote: "",
    meetingDate: "",
    status: "pending",
  });

  const handleProposalSubmit = (proposal) => {
    setHandoverData((prev) => ({
      ...prev,
      ...proposal,
    }));
  };

  const handleConfirmMeeting = async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    setHandoverData((prev) => ({ ...prev, status: "confirmed" }));
  };

  const handleCompleteHandover = async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    setHandoverData((prev) => ({ ...prev, status: "completed" }));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between selection:bg-[#CCFF00] selection:text-black p-6 sm:p-10">
      <main className="flex-1 flex flex-col items-center justify-center">
        {/* Expanded container width from max-w-md to max-w-xl for proper card weight */}
        <div className="w-full max-w-xl space-y-6">
          
          {/* Page Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                Findora Handovers
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Manage item returns and meeting schedules securely
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="py-2.5 px-4 bg-[#CCFF00] hover:bg-[#b3e600] text-black font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.15)] transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Propose Meeting</span>
            </button>
          </div>

          {/* Display Handover Card with optimal layout weight */}
          <HandoverCard 
            handover={handoverData} 
            onConfirmMeeting={handleConfirmMeeting}
            onCompleteHandover={handleCompleteHandover}
          />

        </div>
      </main>

      {/* Modal Form Container */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg">
            <HandoverProposalForm 
              onClose={() => setIsModalOpen(false)} 
              onSubmitProposal={handleProposalSubmit}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full text-center text-xs text-neutral-600 py-4">
        Findora Suite © 2026
      </footer>
    </div>
  );
}





