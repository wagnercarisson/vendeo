"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Minus, Send, CheckCircle2, Loader2, X } from "lucide-react";

interface Props {
  contentType: 'campaign' | 'reels' | 'weekly_plan' | 'weekly_strategy';
  campaignId?: string;
  weeklyPlanId?: string;
  contextLabel?: string;
}

type Vote = 'yes' | 'maybe' | 'no';

export default function SalesFeedbackInline({
  contentType,
  campaignId,
  weeklyPlanId,
  contextLabel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [vote, setVote] = useState<Vote | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [reason, setReason] = useState("");
  const [showPostQuestion, setShowPostQuestion] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function handleSubmitFeedback(v: Vote, comment?: string, wp?: string) {
    if (loading) return; // evitar múltiplos envios
    setLoading(true);
    try {
      await fetch("/api/generation-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          campaignId,
          weeklyPlanId,
          vote: v,
          reason: comment,
          wouldPost: wp,
          pagePath: window.location.pathname,
          userAgent: navigator.userAgent,
        }),
      });

      if (wp || v === 'yes' && !showPostQuestion) {
        if (v === 'yes' && !showPostQuestion) {
            setShowPostQuestion(true);
        } else if (wp) {
            setCompleted(true);
        }
      } else if (!showPostQuestion) {
          setShowPostQuestion(true);
      }
    } catch (err) {
      console.error("Erro ao enviar feedback:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleVote(v: Vote) {
    if (loading) return;
    setVote(v);
    if (v === 'yes') {
      handleSubmitFeedback(v);
    } else {
      setShowInput(true);
    }
  }

  function handleReasonSubmit() {
    if (loading) return;
    setShowInput(false);
    handleSubmitFeedback(vote!, reason);
  }

  function handlePostAnswer(ans: string) {
    if (loading) return;
    handleSubmitFeedback(vote!, reason, ans);
  }

  function handleSkip() {
    setCompleted(true);
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 border border-emerald-100"
      >
        <CheckCircle2 className="h-4 w-4" />
        Obrigado! Seu feedback ajuda a melhorar o Vendeo.
      </motion.div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
      <div className="px-5 py-4">
        <AnimatePresence mode="wait">
          {!vote ? (
            <motion.div
              key="step-vote"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="text-sm font-semibold text-zinc-900">
                Isso ajudaria sua loja a vender mais?
                {contextLabel && <span className="block text-xs font-normal text-zinc-500 mt-0.5">{contextLabel}</span>}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote('yes')}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 disabled:opacity-50"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Sim
                </button>
                <button
                  onClick={() => handleVote('maybe')}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 active:scale-95 disabled:opacity-50"
                >
                  <Minus className="h-3.5 w-3.5" />
                  Talvez
                </button>
                <button
                  onClick={() => handleVote('no')}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 active:scale-95 disabled:opacity-50"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                  Não
                </button>
              </div>
            </motion.div>
          ) : showInput ? (
            <motion.div
              key="step-reason"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <div className="text-sm font-semibold text-zinc-900">
                {vote === 'maybe' ? "O que tornaria isso melhor?" : "O que não ficou bom?"}
              </div>
              <div className="flex gap-2">
                <textarea
                  autoFocus
                  disabled={loading}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Seu comentário opcional..."
                  className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-none h-18 disabled:opacity-50"
                />
                <button
                  onClick={handleReasonSubmit}
                  disabled={loading}
                  className="self-end rounded-xl bg-zinc-900 p-2.5 text-white transition hover:bg-zinc-800 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>
          ) : showPostQuestion ? (
            <motion.div
              key="step-post"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="text-sm font-semibold text-zinc-900">
                Você realmente postaria isso?
                <span className="block text-[10px] font-normal text-zinc-400 mt-0.5 uppercase tracking-wider">Opcional</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePostAnswer('Sim')}
                  disabled={loading}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 transition active:scale-95"
                >
                  Sim
                </button>
                <button
                  onClick={() => handlePostAnswer('Talvez com ajustes')}
                  disabled={loading}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 transition active:scale-95"
                >
                  Talvez com ajustes
                </button>
                <button
                  onClick={() => handlePostAnswer('Não')}
                  disabled={loading}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 transition active:scale-95"
                >
                  Não
                </button>
                <div className="h-4 w-px bg-zinc-200 mx-1" />
                <button
                  onClick={handleSkip}
                  disabled={loading}
                  className="rounded-xl p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition disabled:opacity-50"
                  title="Pular"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ) : (
              <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
              </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
