"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Sparkles, Video, Plus, Eye, Edit2, Copy, Loader2, Image as ImageIcon } from "lucide-react";
import { mapDbCampaignToDomain } from "@/lib/campaigns/mapper";
import { MotionWrapper } from "../_components/MotionWrapper";
import { PostModal, ReelsModal } from "./_components/CampaignModals";
import * as selectors from "@/lib/campaigns/selectors";

import { Store } from "@/lib/domain/stores/types";
import { Campaign as CampaignModel } from "@/lib/campaigns/types";

/** Campanha com relação de loja incluída (para listagem). */
export type Campaign = CampaignModel & {
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


export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const router = useRouter();

  const [selectedPostCampaign, setSelectedPostCampaign] = useState<Campaign | null>(null);
  const [selectedReelsCampaign, setSelectedReelsCampaign] = useState<Campaign | null>(null);

  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("campaigns")
        .select("*") 
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map(row => {
        const domain = mapDbCampaignToDomain(row);
        return {
          ...domain,
          stores: row.stores || null
        } as Campaign;
      });

      setCampaigns(mapped);
    } catch (err: any) {
      setError(err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDuplicate = async (c: Campaign) => {
    if (duplicatingId) return;
    
    try {
      setDuplicatingId(c.id);
      
      const { data: newCampaign, error: insertError } = await supabase
        .from("campaigns")
        .insert([{
          store_id: c.storeId,
          product_name: `${c.productName} (Cópia)`,
          price: c.price,
          audience: c.audience,
          objective: c.objective,
          product_positioning: c.productPositioning,
          status: 'draft',
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

  const headerLinks = useMemo(() => (
    <Link href="/dashboard/campaigns/new">
      <button
        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
        type="button"
      >
        <Plus className="h-4 w-4" />
        Nova campanha
      </button>
    </Link>
  ), []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
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
            <div key={i} className="flex flex-row items-stretch gap-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm h-[138px]">
              <div className="relative w-24 aspect-[4/5] flex-none overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 animate-pulse" />
              <div className="flex flex-1 flex-col justify-between py-0.5">
                <div>
                  <div className="h-5 w-48 bg-slate-100 rounded-md animate-pulse" />
                  <div className="mt-2 h-4 w-32 bg-slate-50 rounded-md animate-pulse" />
                  <div className="mt-2 h-5 w-20 bg-slate-50 rounded-full animate-pulse" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-slate-50 rounded-full animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-9 w-24 bg-slate-50 rounded-lg animate-pulse" />
                    <div className="h-9 w-24 bg-slate-50 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </MotionWrapper>
      ) : campaigns.length === 0 ? (
        <MotionWrapper delay={0.2} className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white/50 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-300 mb-6">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nenhuma campanha encontrada</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            Sua lista está vazia. Comece criando sua primeira estratégia de vendas e deixe nossa IA gerar os conteúdos por você.
          </p>
          <div className="mt-8">{headerLinks}</div>
        </MotionWrapper>
      ) : (
        <MotionWrapper delay={0.2} className="grid gap-4">
          {campaigns.map((c) => {
            const hasArt = selectors.hasGeneratedArt(c);
            const hasVideo = selectors.hasGeneratedVideo(c);
            const metadataParts = [];
            if (c.price) metadataParts.push(formatBRL(c.price));
            if (c.audience) metadataParts.push(c.audience);
            if (c.objective) metadataParts.push(c.objective);
            const metadataLine = metadataParts.join(" • ");
            const strategyLabel = selectors.getCampaignStrategyLabel(c);
            const formattedDate = c.createdAt ? format(new Date(c.createdAt), "d MMM yyyy", { locale: ptBR }) : "";

            const status = hasVideo ? "video" : hasArt ? "art" : "none";
            const statusConfig = {
              video: { label: "Vídeo pronto", classes: "bg-indigo-50 text-indigo-700 border-indigo-100" },
              art: { label: "Arte pronta", classes: "bg-emerald-50 text-emerald-700 border-emerald-100" },
              none: { label: "Sem conteúdo", classes: "bg-zinc-50 text-zinc-500 border-zinc-100" }
            }[status];

            return (
              <div
                key={c.id}
                className="group relative flex flex-row items-stretch gap-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative w-24 aspect-[4/5] flex-none overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 shadow-sm">
                  {selectors.hasAnyVisualAsset(c) ? (
                    <Image
                      src={c.imageUrl || c.productImageUrl || ""}
                      alt={c.productName || "Campanha"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                      sizes="96px"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <ImageIcon className="h-6 w-6 text-zinc-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-lg" />
                </div>

                <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{c.productName}</h3>
                      <time className="flex-none text-xs font-medium text-slate-400 whitespace-nowrap">{formattedDate}</time>
                    </div>

                    <div className="mt-1">
                      <div className="text-[13px] text-slate-500 font-medium">{metadataLine}</div>
                      <div className="mt-1.5 inline-flex items-center rounded-md border border-slate-200/50 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {strategyLabel}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between gap-4 border-t border-slate-50">
                    <div className={`px-2 py-0.5 text-[11px] rounded-full font-semibold border ${statusConfig.classes}`}>
                      {statusConfig.label}
                    </div>

                    <div className="flex flex-none items-center gap-2">
                      {hasArt && (
                        <button
                          onClick={() => setSelectedPostCampaign(c)}
                          className="flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800"
                          type="button"
                        >
                          <Eye className="h-4 w-4 text-emerald-400" />
                          VER ARTE
                        </button>
                      )}

                      {hasVideo && (
                        <button
                          onClick={() => setSelectedReelsCampaign(c)}
                          className="flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800"
                          type="button"
                        >
                          <Eye className="h-4 w-4 text-indigo-400" />
                          VER VÍDEO
                        </button>
                      )}

                      <Link href={`/dashboard/campaigns/${c.id}`}>
                        <button className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50">
                          <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                          ABRIR
                        </button>
                      </Link>

                      <button
                        onClick={() => handleDuplicate(c)}
                        disabled={!!duplicatingId}
                        className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        {duplicatingId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
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