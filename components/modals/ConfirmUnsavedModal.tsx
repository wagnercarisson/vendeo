"use client";

import { AlertTriangle, X } from "lucide-react";
import { MotionWrapper } from "@/app/dashboard/_components/MotionWrapper";

interface ConfirmUnsavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmUnsavedModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmUnsavedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <MotionWrapper
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl"
      >
        <div className="absolute right-4 top-4">
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>

          <h3 className="text-xl font-semibold text-zinc-900">
            Alterações não salvas
          </h3>
          <p className="mt-2 text-sm text-zinc-600">
            Você fez alterações importantes. Se sair agora, todo o progresso não salvo será perdido.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Continuar editando
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Sair sem salvar
            </button>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
}
