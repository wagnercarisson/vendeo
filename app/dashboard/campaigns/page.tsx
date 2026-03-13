"use client";

import React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Sparkles, Video, Plus, Eye, Edit2, Copy, Loader2, Image as ImageIcon } from "lucide-react";
import { MotionWrapper } from "../_components/MotionWrapper";
import { PostModal, ReelsModal } from "./_components/CampaignModals";

import { Store } from "@/lib/domain/stores/types";
import { Campaign as CampaignDomain } from "@/lib/domain/campaigns/types";
import { ShortVideoShotScene as ReelsShot } from "@/lib/domain/short-videos/types";

export type { Store, ReelsShot };

/** Campanha com relação de loja incluída (para listagem). */
export type Campaign = CampaignDomain & {
  stores?: Store | null;
};

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

// Helper for standardized strategy
function getStandardizedStrategy(objective: string | null = ""): string {
  const o = (objective || "").toLowerCase();
  
  if (o.includes("promocao") || o.includes("queima")) {
    return "OFERTA";
  }
  
  if (o.includes("combo")) {
    return "COMBO";
  }
  
  if (o.includes("sazonal")) {
    return "MOMENTO";
  }
  
  if (o.includes("presente") || o.includes("gift")) {
    return "PRESENTE";
  }
  
  // novidade, reposicao, engajamento, visitas -> DESTAQUE
  return "DESTAQUE";
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const router = useRouter();

  const [selectedPostCampaign, setSelectedPostCampaign] = useState<Campaign | null>(null);
  const [selectedReelsCampaign, setSelectedReelsCampaign] = useState<Campaign | null>(null);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error);
      setCampaigns([]);
    } else {
      setCampaigns(data || []);
    }

    setLoading(false);
  }, []);

  const handleDuplicate = async (c: Campaign) => {
    if (duplicatingId) return;
    
    try {
      setDuplicatingId(c.id);
      
      const { data: newCampaign, error: insertError } = await supabase
        .from("campaigns")
        .insert([{
          store_id: c.store_id,
          product_name: `${c.product_name} (Cópia)`,
          price: c.price,
          audience: c.audience,
          objective: c.objective,
          product_positioning: c.product_positioning,
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      
      router.push(`/dashboard/campaigns/${newCampaign.id}`);
    } catch (err) {
      console.error("Erro ao duplicar:", err);
      setError(err);
      setDuplicatingId(null);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const headerLinks = useMemo(() => {
    return (
      <Link href="/dashboard/campaigns/new">
        <button
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          type="button"
        >
          <Plus className="h-4 w-4" />
          Nova campanha
        </button>
      </Link>
    );
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <MotionWrapper delay={0.1} className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Campanhas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Visualize suas campanhas e acesse rapidamente as artes e vídeos gerados.
          </p>
        </div>
        {headerLinks}
      </MotionWrapper>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Erro: {error.message}
        </div>
      )}

      {loading ? (
        <MotionWrapper delay={0.2} className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-slate-50 border border-black/5" />
          ))}
        </MotionWrapper>
      ) : campaigns.length === 0 ? (
        <MotionWrapper delay={0.2} className="rounded-2xl border border-black/10 bg-white p-8 text-center">
          <div className="text-base font-semibold text-slate-900">Nenhuma campanha encontrada</div>
          <p className="mt-1 text-sm text-slate-500">Comece criando sua primeira estratégia de vendas.</p>
          <div className="mt-6 flex justify-center">{headerLinks}</div>
        </MotionWrapper>
      ) : (
        <MotionWrapper delay={0.2} className="grid gap-4">
          {campaigns.map((c) => {
            const hasArt = !!c.image_url;
            const hasVideo = !!(c.reels_generated_at || c.reels_script || c.reels_hook || c.reels_caption);

            // Metadata construction with safe fallbacks
            const metadataParts = [];
            if (c.price) metadataParts.push(formatBRL(c.price));
            if (c.audience) metadataParts.push(c.audience);
            const metadataLine = metadataParts.join(" • ");

            const standardizedStrategy = getStandardizedStrategy(c.objective);
            
            const formattedDate = c.created_at 
              ? format(new Date(c.created_at), "d MMM yyyy", { locale: ptBR })
              : "";

            // Status construction
            const statusParts = [];
            if (hasArt) statusParts.push("Arte pronta");
            if (hasVideo) statusParts.push("Vídeo pronto");
            const statusLine = statusParts.join(" • ");

            return (
              <div
                key={c.id}
                className="group relative flex flex-row items-stretch gap-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Left Column: Thumb (Premium Preview) */}
                <div className="relative flex w-24 aspect-[4/5] flex-none items-center justify-center overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
                  {c.image_url ? (
                    <Image
                      src={c.image_url}
                      alt={c.product_name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-slate-50">
                      <ImageIcon className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Right Column: Content */}
                <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5">
                  {/* Top Section: Name and Date */}
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="truncate text-base font-semibold text-slate-900">
                      {c.product_name}
                    </h3>
                    <time className="flex-none text-xs font-medium text-slate-500 whitespace-nowrap">
                      {formattedDate}
                    </time>
                  </div>

                  {/* Middle Section: Metadata and Strategy */}
                  <div className="mt-1">
                    <div className="text-[13px] text-slate-500 font-medium">
                      {metadataLine}
                    </div>

                    <div className="mt-1.5 inline-block rounded-md border border-slate-200/50 bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                      {standardizedStrategy}
                    </div>
                  </div>

                  {/* Bottom Section: Status and Actions */}
                  <div className="mt-auto pt-2 flex items-end justify-between gap-4">
                    <div className="text-xs font-medium text-slate-500">
                      {statusLine || "Em processamento..."}
                    </div>

                    <div className="flex flex-none items-center gap-2">
                      {hasArt && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedPostCampaign(c);
                          }}
                          className="flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
                          type="button"
                        >
                          <Eye className="h-4 w-4 text-emerald-400" />
                          VER ARTE
                        </button>
                      )}

                      {hasVideo && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedReelsCampaign(c);
                          }}
                          className="flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
                          type="button"
                        >
                          <Eye className="h-4 w-4 text-indigo-400" />
                          VER VÍDEO
                        </button>
                      )}

                      <Link href={`/dashboard/campaigns/${c.id}`}>
                        <button
                          className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50"
                          type="button"
                        >
                          <Edit2 className="h-4 w-4 text-slate-300" />
                          EDITAR
                        </button>
                      </Link>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDuplicate(c);
                        }}
                        disabled={!!duplicatingId}
                        className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                        type="button"
                      >
                        {duplicatingId === c.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-300" />
                        )}
                        DUPLICAR
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </MotionWrapper>
      )}

      {selectedPostCampaign && (
        <PostModal campaign={selectedPostCampaign} onClose={() => setSelectedPostCampaign(null)} />
      )}

      {selectedReelsCampaign && (
        <ReelsModal campaign={selectedReelsCampaign} onClose={() => setSelectedReelsCampaign(null)} />
      )}
    </main>
  );
}