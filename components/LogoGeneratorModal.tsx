"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, RefreshCw, Check, AlertCircle } from "lucide-react";
import Image from "next/image";

interface LogoSuggestion {
  id: string;
  url: string;
  prompt: string;
  revised_prompt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  segment: string;
  tone?: string;
  storeId: string;
  onLogoSaved: (logoUrl: string) => void;
}

export default function LogoGeneratorModal({
  isOpen,
  onClose,
  storeName,
  segment,
  tone,
  storeId,
  onLogoSaved,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<LogoSuggestion[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<LogoSuggestion | null>(null);
  const [progress, setProgress] = useState(0);
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fake progress bar (simulates 15-30s generation time)
  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Cap at 95% until real completion
        return prev + Math.random() * 3; // Increment by 0-3%
      });
    }, 500);

    return () => clearInterval(interval);
  }, [loading]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setProgress(0);

    try {
      const res = await fetch("/api/ai/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          segment,
          tone,
          storeId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Rate limit exceeded
        if (data.error === "rate_limit_exceeded") {
          setError(
            `⏰ Você atingiu o limite de 5 gerações por hora. Aguarde ${data.wait_minutes || 60} minutos.`
          );
          setRemainingGenerations(0);
          return;
        }

        throw new Error(data.message || "Falha ao gerar logos");
      }

      // Success
      setProgress(100);
      setSuggestions(data.suggestions || []);
      setRemainingGenerations(data.remaining_generations ?? null);
    } catch (err: any) {
      setError(err.message || "❌ Erro ao gerar logos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveLogo() {
    if (!selectedLogo) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/store/save-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoUrl: selectedLogo.url,
          storeId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Falha ao salvar logo");
      }

      // Success
      onLogoSaved(data.logo_url);
      handleClose();
    } catch (err: any) {
      setError(err.message || "❌ Erro ao salvar logo. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  function handleSelectLogo(suggestion: LogoSuggestion) {
    setSelectedLogo(suggestion);
    setShowPreview(true);
  }

  function handleClose() {
    setLoading(false);
    setSaving(false);
    setError(null);
    setSuggestions([]);
    setSelectedLogo(null);
    setProgress(0);
    setShowPreview(false);
    onClose();
  }

  function handleCancelPreview() {
    setShowPreview(false);
    setSelectedLogo(null);
  }

  if (!isOpen) return null;

  // Preview Confirmation Modal
  if (showPreview && selectedLogo) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancelPreview}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Preview Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="absolute right-4 top-4">
              <button
                onClick={handleCancelPreview}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-zinc-800">
                🎨 Confirmar logo
              </h2>
              <p className="text-zinc-600 mb-6">
                Este será o logo oficial da sua loja. Tem certeza?
              </p>

              {/* Logo Preview */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-zinc-200 mb-6">
                <Image
                  src={selectedLogo.url}
                  alt="Logo preview"
                  fill
                  className="object-contain p-4 bg-white"
                  unoptimized
                />
              </div>

              {error && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelPreview}
                  disabled={saving}
                  className="flex-1 rounded-xl border-2 border-zinc-300 px-6 py-3 font-semibold text-zinc-700 hover:bg-zinc-50 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveLogo}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // Main Logo Generator Modal
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[90vh] flex flex-col"
        >
          <div className="absolute right-4 top-4 z-10">
            <button
              onClick={handleClose}
              disabled={loading || saving}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-white/10 p-2">
                <Sparkles className="h-6 w-6 text-yellow-300" />
              </div>
              <h2 className="text-2xl font-bold">Gerar Logo com IA</h2>
            </div>
            <p className="text-white/80 text-sm">
              DALL-E 3 vai criar 3 sugestões de logo personalizadas para{" "}
              <strong>{storeName}</strong>
            </p>
            {remainingGenerations !== null && (
              <p className="text-white/60 text-xs mt-2">
                {remainingGenerations > 0
                  ? `✨ ${remainingGenerations} gerações restantes nesta hora`
                  : "⏰ Limite de gerações atingido (5/hora)"}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Initial State - No suggestions yet */}
            {!loading && suggestions.length === 0 && (
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-zinc-800 mb-2">
                  Pronto para criar?
                </h3>
                <p className="text-zinc-600 mb-6">
                  Clique no botão abaixo para gerar 3 sugestões de logo usando inteligência artificial.
                </p>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 font-semibold text-white hover:from-purple-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="h-5 w-5" />
                  Gerar 3 Logos
                </button>
                <p className="text-xs text-zinc-500 mt-4">
                  Custo: $0.12 por geração (3 logos) • Tempo: 15-30 segundos
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-800 mb-2">
                  Gerando seus logos...
                </h3>
                <p className="text-zinc-600 mb-6">
                  A IA está criando 3 opções personalizadas. Isso pode levar 15-30 segundos.
                </p>
                {/* Progress Bar */}
                <div className="max-w-md mx-auto">
                  <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">{Math.round(progress)}%</p>
                </div>
              </div>
            )}

            {/* Suggestions Grid */}
            {!loading && suggestions.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-zinc-800 mb-4">
                  Escolha seu logo favorito:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => handleSelectLogo(suggestion)}
                      className="group relative aspect-square rounded-2xl overflow-hidden border-4 border-zinc-200 hover:border-purple-500 transition-all hover:shadow-xl"
                    >
                      <Image
                        src={suggestion.url}
                        alt={`Logo suggestion ${suggestion.id}`}
                        fill
                        className="object-contain p-4 bg-white group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-white font-semibold text-sm">
                          Usar este logo
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Regenerate Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={remainingGenerations === 0}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-zinc-300 px-6 py-3 font-semibold text-zinc-700 hover:bg-zinc-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Gerar novos logos
                  </button>
                  {remainingGenerations === 0 && (
                    <p className="text-xs text-red-600 mt-2">
                      ⏰ Limite atingido. Aguarde 1 hora para gerar novamente.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !loading && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Erro ao gerar logos</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
