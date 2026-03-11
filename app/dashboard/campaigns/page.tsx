"use client";

import React from "react";
import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ArrowRight, AlertTriangle, Sparkles, Video, Wand2, Plus, Eye } from "lucide-react";
import { MotionWrapper } from "../_components/MotionWrapper";
import { CampaignArtViewer } from "./_components/CampaignArtViewer";
import { PostModal, ReelsModal } from "./_components/CampaignModals";

type Store = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;

  brand_positioning: string | null;
  main_segment: string | null;
  tone_of_voice: string | null;

  address: string | null;
  neighborhood: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;

  primary_color: string | null;
  secondary_color: string | null;
};

type ReelsShot = {
  scene: number;
  camera: string;
  action: string;
  dialogue: string;
};

type Campaign = {
  id: string;
  product_name: string;
  price: number;
  audience: string;
  objective: string;
  image_url: string | null;
  layout: "solid" | "floating" | "split" | null;

  product_positioning: string | null;

  ai_caption: string | null;
  ai_text: string | null;
  ai_cta: string | null;
  ai_hashtags: string | null;

  reels_hook: string | null;
  reels_script: string | null;
  reels_shotlist: ReelsShot[] | null;
  reels_on_screen_text: string[] | null;
  reels_audio_suggestion: string | null;
  reels_duration_seconds: number | null;
  reels_caption: string | null;
  reels_cta: string | null;
  reels_hashtags: string | null;
  reels_generated_at: string | null;

  stores?: Store | null;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function labelPositioning(v: string | null | undefined) {
  if (!v) return "Padrão da loja";
  const map: Record<string, string> = {
    popular: "Popular",
    medio: "Médio",
    premium: "Premium",
    jovem: "Jovem / Festa",
    familia: "Família",
  };
  return map[v] ?? v;
}

function safeToString(v: any) {
  if (v === null || v === undefined) return "";
  return String(v);
}

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function buildContactLine(store?: Store | null) {
  const wpp = store?.whatsapp ? onlyDigits(store.whatsapp) : "";
  const ig = store?.instagram ? store.instagram : "";
  if (wpp && ig) return `WhatsApp: ${wpp} · IG: ${ig}`;
  if (wpp) return `WhatsApp: ${wpp}`;
  if (ig) return `IG: ${ig}`;
  return "—";
}

function isLikelyUnconfiguredRemote(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname === "ibassets.com.br") return true;
    return false;
  } catch {
    return false;
  }
}

function formatBRL(value: number) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  } catch {
    return `R$ ${value}`;
  }
}

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  const styles =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-black/10 bg-zinc-50 text-zinc-700";

  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", styles)}>
      {children}
    </span>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const [generatingTextId, setGeneratingTextId] = useState<string | null>(null);
  const [generatingReelsId, setGeneratingReelsId] = useState<string | null>(null);

  const [selectedPostCampaign, setSelectedPostCampaign] = useState<Campaign | null>(null);
  const [selectedReelsCampaign, setSelectedReelsCampaign] = useState<Campaign | null>(null);

  type ConfirmState = {
    open: boolean;
    icon?: "ai" | "reels" | "danger";
    title: string;
    description?: string;
    confirmLabel?: string;
    destructive?: boolean;
    onConfirm?: () => void;
  };

  function ConfirmDialog({
    state,
    onClose,
    onConfirm,
  }: {
    state: ConfirmState;
    onClose: () => void;
    onConfirm: () => void;
  }) {
    useEffect(() => {
      if (!state.open) return;

      function onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") onClose();
      }

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [state.open, onClose]);

    if (!state.open) return null;

    const Icon =
      state.icon === "ai" ? Sparkles : state.icon === "reels" ? Video : AlertTriangle;

    const iconWrap =
      state.icon === "ai"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60"
        : state.icon === "reels"
          ? "bg-indigo-50 text-indigo-700 ring-indigo-200/60"
          : "bg-red-50 text-red-700 ring-red-200/60";

    return (
      <div
        className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4 backdrop-blur-[2px]"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 grid h-10 w-10 place-items-center rounded-2xl ring-1 ${iconWrap}`}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="text-base font-semibold text-zinc-900">{state.title}</div>
                {state.description ? (
                  <div className="mt-2 text-sm text-zinc-600">{state.description}</div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-black/5 bg-zinc-50/70 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className={
                state.destructive
                  ? "rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200"
                  : "rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
              }
            >
              {state.confirmLabel ?? "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: "",
  });

  const openConfirm = useCallback((opts: Omit<ConfirmState, "open">) => {
    setConfirmState({ open: true, ...opts });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState({ open: false, title: "" });
  }, []);

  const handleConfirm = useCallback(() => {
    const fn = confirmState.onConfirm;
    closeConfirm();
    fn?.();
  }, [confirmState.onConfirm, closeConfirm]);

  useEffect(() => {
    loadCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCampaigns() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("campaigns")
      .select(
        `
        id, product_name, price, audience, objective, image_url, layout,
        product_positioning,
        ai_caption, ai_text, ai_cta, ai_hashtags,

        reels_hook, reels_script, reels_shotlist, reels_on_screen_text,
        reels_audio_suggestion, reels_duration_seconds,
        reels_caption, reels_cta, reels_hashtags, reels_generated_at,

        stores (
          id, name, city, state,
          brand_positioning, main_segment, tone_of_voice,
          address, neighborhood, phone, whatsapp, instagram,
          primary_color, secondary_color
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      setError(error);
      setCampaigns([]);
    } else {
      setCampaigns((data as any) ?? []);
    }

    setLoading(false);
  }

  async function generateAndSaveText(campaign: Campaign, force = false) {
    if (generatingTextId === campaign.id) return;

    if (!force && (campaign.ai_caption ?? "").trim().length > 0) {
      const ok = confirm("Já existe texto gerado. Gerar novamente?");
      if (!ok) return;
    }

    setGeneratingTextId(campaign.id);

    try {
      const res = await fetch("/api/generate/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaign.id,
          force,

          product_name: campaign.product_name,
          price: campaign.price,
          audience: campaign.audience,
          objective: campaign.objective,

          product_positioning: campaign.product_positioning,

          store_name: campaign.stores?.name,
          city: campaign.stores?.city,
          state: campaign.stores?.state,
          brand_positioning: campaign.stores?.brand_positioning,
          main_segment: campaign.stores?.main_segment,
          tone_of_voice: campaign.stores?.tone_of_voice,

          whatsapp: campaign.stores?.whatsapp,
          phone: campaign.stores?.phone,
          instagram: campaign.stores?.instagram,

          primary_color: campaign.stores?.primary_color,
          secondary_color: campaign.stores?.secondary_color,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.details ?? err?.error ?? `Erro na API: ${res.status}`);
      }

      await res.json().catch(() => null);
      await loadCampaigns();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao gerar/salvar texto");
      console.error(e);
    } finally {
      setGeneratingTextId(null);
    }
  }

  async function generateAndSaveReels(campaign: Campaign, force = false) {
    if (generatingReelsId === campaign.id) return;

    const hasReels = !!campaign.reels_generated_at;
    if (!force && hasReels) {
      const ok = confirm("Já existe roteiro de Reels. Gerar novamente?");
      if (!ok) return;
    }

    setGeneratingReelsId(campaign.id);

    try {
      const res = await fetch("/api/generate/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaign.id,
          force,

          product_positioning: campaign.product_positioning,

          store_name: campaign.stores?.name,
          city: campaign.stores?.city,
          state: campaign.stores?.state,
          brand_positioning: campaign.stores?.brand_positioning,
          main_segment: campaign.stores?.main_segment,
          tone_of_voice: campaign.stores?.tone_of_voice,
          whatsapp: campaign.stores?.whatsapp,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.details ?? err?.error ?? `Erro na API: ${res.status}`);
      }

      await res.json().catch(() => null);
      await loadCampaigns();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao gerar/salvar Reels");
      console.error(e);
    } finally {
      setGeneratingReelsId(null);
    }
  }

  function stopLink(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  const headerLinks = useMemo(() => {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/dashboard/campaigns/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-premium transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Nova campanha
        </Link>
      </div>
    );
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-6">
      <MotionWrapper delay={0.1} className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Campanhas</h1>
          <p className="mt-1 text-sm text-slate-600">
            Clique em uma campanha para abrir o preview premium e copiar tudo.
          </p>
        </div>
        {headerLinks}
      </MotionWrapper>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Erro: {error.message}
        </div>
      )}

      {loading && (
        <MotionWrapper delay={0.2} className="grid gap-4">
          {[1, 2, 3].map((i) => (
             <div key={i} className="flex min-w-0 flex-col items-stretch overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              <div className="flex-1 p-4 flex gap-4">
                <div className="h-20 w-20 flex-none animate-pulse rounded-2xl bg-slate-100"></div>
                <div className="min-w-0 flex-1 space-y-3 py-1">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200"></div>
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100"></div>
                  <div className="h-3 w-3/4 animate-pulse rounded bg-slate-50"></div>
                </div>
              </div>
              <div className="border-t border-black/5 px-4 py-3 bg-slate-50/60 flex justify-end gap-2">
                 <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-200"></div>
                 <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-200"></div>
              </div>
            </div>
          ))}
        </MotionWrapper>
      )}

      {!loading && campaigns.length === 0 && (
        <MotionWrapper delay={0.2} className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">Nenhuma campanha ainda.</div>
          <div className="mt-1 text-sm text-slate-600">Crie sua primeira campanha para começar.</div>
          <div className="mt-4">{headerLinks}</div>
        </MotionWrapper>
      )}

      <MotionWrapper delay={0.2} className="grid gap-4">
        {campaigns.map((c) => {
          const hasAi = (c.ai_caption ?? "").trim().length > 0;
          const hasReels = !!c.reels_generated_at;

          const positioningLabel = labelPositioning(c.product_positioning);
          const storeDefault = labelPositioning(c.stores?.brand_positioning ?? null);
          const contactLine = buildContactLine(c.stores);

          const storeName = c.stores?.name ?? "—";
          const location = [c.stores?.city, c.stores?.state].filter(Boolean).join(", ");

          let parsedAiText = null;
          if (c.ai_text) {
              try { parsedAiText = JSON.parse(c.ai_text); } catch {}
          }

          return (
            <div
              key={c.id}
              className="group block rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md flex flex-col"
            >
                {/* BODY */}
                <div className="p-4 flex-1">
                  <div className="flex min-w-0 items-start gap-4">
                    {/* Thumb */}
                    <div className="relative h-[100px] w-[80px] sm:h-[120px] sm:w-[96px] flex-none overflow-hidden rounded-2xl border border-black/5 bg-zinc-50">
                      {c.image_url ? (
                        isLikelyUnconfiguredRemote(c.image_url) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.image_url}
                            alt={c.product_name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        ) : (
                          <Image
                            src={c.image_url}
                            alt={c.product_name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        )
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[11px] font-semibold text-zinc-500">
                          sem foto
                        </div>
                      )}
                    </div>

                    {/* Main */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-base font-semibold text-zinc-900">
                          {c.product_name}
                        </div>

                        {hasAi ? (
                          <Pill tone="success">
                            <Sparkles className="h-3.5 w-3.5" />
                            IA pronta
                          </Pill>
                        ) : (
                          <Pill tone="warning">
                            <Sparkles className="h-3.5 w-3.5" />
                            IA pendente
                          </Pill>
                        )}

                        {hasReels ? (
                          <Pill tone="success">
                            <Video className="h-3.5 w-3.5" />
                            Reels pronto
                          </Pill>
                        ) : (
                          <Pill tone="neutral">
                            <Video className="h-3.5 w-3.5" />
                            Reels —
                          </Pill>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600">
                        <span className="font-semibold text-zinc-800">{formatBRL(c.price)}</span>
                        <span>•</span>
                        <span>{safeToString(c.audience) || "Público —"}</span>
                        <span>•</span>
                        <span className="truncate">{safeToString(c.objective) || "Objetivo —"}</span>
                      </div>

                      <div className="mt-2 text-xs text-zinc-500">
                        <span className="font-semibold text-zinc-700">{storeName}</span>
                        {location ? <span> · {location}</span> : null}
                        <span className="mx-2">•</span>
                        <span className="text-zinc-600">
                          Perfil:{" "}
                          <span className="font-semibold text-zinc-700">
                            {positioningLabel}
                          </span>
                          {!c.product_positioning ? ` (padrão loja: ${storeDefault})` : ""}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-zinc-600">{contactLine}</span>
                      </div>

                      {hasAi && (c.ai_caption || c.ai_text) ? (
                        <div className="mt-3 line-clamp-2 text-sm text-zinc-700">
                          {c.ai_caption || c.ai_text}
                        </div>
                      ) : (
                        <div className="mt-3 text-sm text-zinc-500">
                          Gere o texto com IA para ver a legenda aqui.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* FOOTER FIXO (ações sempre no mesmo lugar) */}
                <div className="border-t border-black/5 px-4 py-3 bg-zinc-50/60">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {/* TEXTO IA */}
                    {!hasAi ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          generateAndSaveText(c, false);
                        }}
                        disabled={generatingTextId === c.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                        type="button"
                      >
                        <Wand2 className="h-4 w-4" />
                        {generatingTextId === c.id ? "Gerando..." : "Gerar post com IA"}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedPostCampaign(c);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-zinc-800"
                          type="button"
                        >
                          <Eye className="h-4 w-4 text-emerald-400" />
                          Ver Post
                        </button>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            openConfirm({
                              icon: "ai",
                              title: "Regenerar conteúdo de IA?",
                              description:
                                "Isso vai substituir o texto e arte atuais (headline/legenda/CTA/hashtags).",
                              confirmLabel: "Regenerar IA",
                              destructive: true,
                              onConfirm: () => generateAndSaveText(c, true),
                            });
                          }}
                          disabled={generatingTextId === c.id}
                          className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                          type="button"
                        >
                          <Wand2 className="h-4 w-4" />
                          {generatingTextId === c.id ? "Gerando..." : "Regenerar IA"}
                        </button>
                      </>
                    )}

                    {/* REELS */}
                    {!hasReels ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          generateAndSaveReels(c, false);
                        }}
                        disabled={generatingReelsId === c.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                        type="button"
                      >
                        <Video className="h-4 w-4" />
                        {generatingReelsId === c.id ? "Gerando..." : "Gerar Vídeo Curto"}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedReelsCampaign(c);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-zinc-800"
                          type="button"
                        >
                          <Eye className="h-4 w-4 text-indigo-400" />
                          Ver Vídeo
                        </button>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            openConfirm({
                              icon: "reels",
                              title: "Regenerar roteiro de Reels?",
                              description:
                                "Isso vai substituir o roteiro atual (hook, script, shotlist e sugestões).",
                              confirmLabel: "Regenerar Reels",
                              destructive: true,
                              onConfirm: () => generateAndSaveReels(c, true),
                            });
                          }}
                          disabled={generatingReelsId === c.id}
                          className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                          type="button"
                        >
                          <Video className="h-4 w-4" />
                          {generatingReelsId === c.id ? "Gerando..." : "Regenerar Reels"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
            </div>
          );
        })}
      </MotionWrapper>

      <ConfirmDialog state={confirmState} onClose={closeConfirm} onConfirm={handleConfirm} />
      
      {selectedPostCampaign && (
          <PostModal campaign={selectedPostCampaign} onClose={() => setSelectedPostCampaign(null)} />
      )}

      {selectedReelsCampaign && (
          <ReelsModal campaign={selectedReelsCampaign} onClose={() => setSelectedReelsCampaign(null)} />
      )}

    </main>
  );
}