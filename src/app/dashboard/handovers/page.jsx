"use client";

import React, { useState } from "react";
import HandoverCard from "@/components/handovers/HandoverCard";
import HandoverProposalForm from "@/components/handovers/HandoverProposalForm";
import ReviewForm from "@/components/reviews/ReviewForm";

export default function HandoversPage() {
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [handoverData, setHandoverData] = useState({
    _id: "handover_9982x",
    itemTitle: "MacBook Pro 16-inch",
    itemThumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150",
    ownerName: "Shifath Ahmed",
    locationNote: "Starbucks Lounge, 2nd Floor",
    meetingDate: "Tomorrow at 4:30 PM",
    status: "confirmed",
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
    // Automatically trigger the Review Modal after completion
    setIsReviewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between selection:bg-[#CCFF00] selection:text-black p-6 sm:p-10">
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Findora Handovers</h1>
              <p className="text-xs text-neutral-400 mt-1">Manage item returns and meeting schedules</p>
            </div>
          </div>

          <HandoverCard
            handover={handoverData}
            onConfirmMeeting={handleConfirmMeeting}
            onCompleteHandover={handleCompleteHandover}
          />
        </div>
      </main>

      {/* Handover Proposal Modal */}
      {isProposalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg">
            <HandoverProposalForm
              onClose={() => setIsProposalModalOpen(false)}
              onSubmitProposal={handleProposalSubmit}
            />
          </div>
        </div>
      )}

      {/* Review Modal Triggered After Completion */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg">
            <ReviewForm
              handover={handoverData}
              onClose={() => setIsReviewModalOpen(false)}
              onSubmitSuccess={(reviewData) => {
                console.log("Review created successfully:", reviewData);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}





