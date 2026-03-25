"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Heart, Star, Send, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  "Criando campanha",
  "Gerando vídeo curto",
  "Criando plano semanal",
  "Explorando o dashboard",
  "Outro",
];

const WOULD_HELP_OPTIONS = [
  "Sim, muito",
  "Sim, um pouco",
  "Não tenho certeza",
  "Não ajudaria",
];

const WOULD_POST_OPTIONS = [
  "Sim",
  "Talvez com ajustes",
  "Não",
];

export default function FeedbackModal({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [attempt, setAttempt] = useState("");
  const [resultText, setResultText] = useState("");
  const [wouldHelpSales, setWouldHelpSales] = useState("");
  const [improvement, setImprovement] = useState("");
  const [wouldPost, setWouldPost] = useState("");
  const [reasonNotPost, setReasonNotPost] = useState("");
  const [score, setScore] = useState(10);
  const [allowContact, setAllowContact] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step,
          attempt,
          result: resultText,
          wouldHelpSales,
          improvement,
          wouldPost,
          reasonNotPost,
          score,
          allowContact,
          pagePath: window.location.pathname,
          userAgent: navigator.userAgent,
          campaignId: (() => {
            const parts = window.location.pathname.split("/");
            const idCandidate = parts[parts.length - 1];
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return (window.location.pathname.startsWith("/dashboard/campaigns/") && uuidRegex.test(idCandidate))
              ? idCandidate
              : null;
          })(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || "Falha ao enviar feedback");
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err: any) {
      alert("Erro ao enviar feedback. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSuccess(false);
    setStep("");
    setAttempt("");
    setResultText("");
    setWouldHelpSales("");
    setImprovement("");
    setWouldPost("");
    setReasonNotPost("");
    setScore(10);
    setAllowContact(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <div className="absolute right-4 top-4">
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-[#0F3D2E] p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="rounded-xl bg-white/10 p-2">
                    <Heart className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold">Ajude a melhorar o Vendeo</h2>
                </div>
                <p className="text-emerald-100/80 text-sm">
                  Seu feedback é fundamental nesta fase beta. Queremos criar o melhor parceiro de vendas para sua loja.
                </p>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700">1) Em qual etapa você está agora?</label>
                    <select
                      required
                      value={step}
                      onChange={(e) => setStep(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    >
                      <option value="">Selecione...</option>
                      {STEPS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700">4) O resultado ajudaria sua loja a vender?</label>
                    <select
                      required
                      value={wouldHelpSales}
                      onChange={(e) => setWouldHelpSales(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    >
                      <option value="">Selecione...</option>
                      {WOULD_HELP_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">2) O que você tentou fazer?</label>
                  <textarea
                    required
                    value={attempt}
                    onChange={(e) => setAttempt(e.target.value)}
                    placeholder="Ex: Tentei gerar um reels para promoção de vinhos..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none min-h-[80px] resize-none"
                    maxLength={2000}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">3) O que aconteceu?</label>
                  <textarea
                    required
                    value={resultText}
                    onChange={(e) => setResultText(e.target.value)}
                    placeholder="Descreva o que viu na tela ou o resultado da IA..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none min-h-[80px] resize-none"
                    maxLength={2000}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">
                    5) O que tornaria esse resultado melhor? {score < 7 && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    required={score < 7}
                    value={improvement}
                    onChange={(e) => setImprovement(e.target.value)}
                    placeholder={score < 7 ? "Por favor, nos conte o que falhou ou o que podemos ajustar..." : "Ideias, sugestões ou o que faltou..."}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none min-h-[80px] resize-none"
                    maxLength={2000}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700">6) Esse conteúdo você realmente postaria?</label>
                    <select
                      value={wouldPost}
                      onChange={(e) => setWouldPost(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    >
                      <option value="">Selecione...</option>
                      {WOULD_POST_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700">8) De 0 a 10, quanto ajudaria a vender?</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                        className="flex-1 accent-emerald-600 h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer"
                      />
                      <span className="w-8 text-center font-bold text-emerald-700 text-lg">{score}</span>
                    </div>
                  </div>
                </div>

                {(wouldPost === "Não" || wouldPost === "Talvez com ajustes") && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700">7) Se não postaria, por quê?</label>
                    <textarea
                      value={reasonNotPost}
                      onChange={(e) => setReasonNotPost(e.target.value)}
                      placeholder="Não combina com minha loja, erro de português, etc..."
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none min-h-[80px] resize-none"
                      maxLength={2000}
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <input
                    type="checkbox"
                    id="allowContact"
                    checked={allowContact}
                    onChange={(e) => setAllowContact(e.target.checked)}
                    className="h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="allowContact" className="text-sm text-emerald-800 font-medium cursor-pointer">
                    9) Posso entrar em contato para entender melhor?
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-zinc-100 p-6 flex items-center justify-end gap-3 bg-zinc-50/50">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D2E] px-8 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#0B2E22] hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-zinc-900">Obrigado!</h2>
              <p className="mt-2 text-zinc-600">
                Seu feedback ajuda a melhorar o Vendeo para todos.
              </p>
              <button
                onClick={handleClose}
                className="mt-8 rounded-xl bg-[#0F3D2E] px-8 py-2.5 text-sm font-bold text-white"
              >
                Fechar
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
