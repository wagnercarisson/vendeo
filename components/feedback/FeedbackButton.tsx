"use client";

import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[90] flex items-center gap-2 rounded-full bg-[#0F3D2E] px-5 py-3 text-sm font-bold text-white shadow-2xl transition hover:bg-[#0B2E22] hover:scale-105 active:scale-95 group"
      >
        <div className="relative">
          <MessageSquare className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
        </div>
        <span className="hidden sm:inline">Ajude a melhorar o Vendeo</span>
      </button>

      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
