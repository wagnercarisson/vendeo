"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIconized, setIsIconized] = useState(false);

  useEffect(() => {
    if (!isIconized) {
      const timer = setTimeout(() => {
        setIsIconized(true);
      }, 7000); // 7 segundos até iconizar ou re-iconizar
      return () => clearTimeout(timer);
    }
  }, [isIconized]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsIconized(false)}
        className={`fixed bottom-6 right-6 z-[90] flex items-center gap-2 bg-[#0F3D2E] text-white shadow-2xl transition-all duration-500 ease-in-out hover:bg-[#0B2E22] hover:scale-105 active:scale-95 group ${
          isIconized ? "w-12 h-12 rounded-full justify-center px-0" : "px-5 py-3 rounded-full"
        }`}
      >
        <div className="relative shrink-0">
          <MessageSquare className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
        </div>
        <span className={`text-sm font-bold truncate transition-all duration-500 overflow-hidden ${
          isIconized ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100"
        }`}>
          Ajude a melhorar o Vendeo
        </span>
      </button>

      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
