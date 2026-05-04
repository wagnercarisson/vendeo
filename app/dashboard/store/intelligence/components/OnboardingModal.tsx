"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { Check, X } from "lucide-react";

type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  icon: ReactNode;
  title: string;
  message: string;
  bulletPoints: string[];
};

export function OnboardingModal({
  isOpen,
  onClose,
  icon,
  title,
  message,
  bulletPoints,
}: OnboardingModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="intelligence-onboarding-title"
        aria-describedby="intelligence-onboarding-description"
        className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar tutorial"
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
          {icon}
        </div>

        <h2
          id="intelligence-onboarding-title"
          className="mt-5 text-center text-xl font-semibold tracking-tight text-zinc-900"
        >
          {title}
        </h2>

        <p
          id="intelligence-onboarding-description"
          className="mt-3 text-center text-sm leading-6 text-zinc-600"
        >
          {message}
        </p>

        <ul className="mt-6 grid gap-3 text-sm leading-6 text-zinc-700">
          {bulletPoints.map((point) => (
            <li key={point} className="flex items-start gap-3 rounded-2xl bg-zinc-50 px-4 py-3">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Entendi, vamos começar
        </button>
      </div>
    </div>
  );
}