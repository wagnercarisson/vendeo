"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import {
  Sparkles,
  Plus,
  Eye,
  Edit2,
  Copy,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { mapDbCampaignToDomain } from "@/lib/domain/campaigns/mapper";
import { MotionWrapper } from "../_components/MotionWrapper";
import { PostModal, ReelsModal } from "./_components/CampaignModals";
import { useSignedUrl } from "@/lib/hooks/useSignedUrl";
import * as selectors from "@/lib/domain/campaigns/logic";
import { formatAudience, formatObjective } from "@/lib/formatters/strategyLabels";

import { Store } from "@/lib/domain/stores/types";
import { Campaign as CampaignModel } from "@/lib/domain/campaigns/types";

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

/** Componente para renderizar a thumbnail com URL assinada se necessário */
function CampaignThumbnail({ campaign }: { campaign: Campaign }) {
  const { url } = useSignedUrl(campaign.image_url || campaign.product_image_url);
  
  return (
    <div className="relative w-24 aspect-[4/5] flex-none overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 shadow-sm">
      {selectors.hasAnyVisualAsset(campaign) ? (
        <Image
          src={url || ""}
          alt={campaign.product_name || "Campanha"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
          sizes="96px"
        />
      ) : (
        <div className="grid h-full w-full place-items-center">
          <ImageIcon className="h-6 w-6 text-zinc-300" />
        </div>
      )}
      <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5" />
    </div>
  );
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

      const mapped = (data || []).map((row) => {
        const domain = mapDbCampaignToDomain(row);
        return {
          ...domain,
          stores: row.stores || null,
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
        .insert([
          {
            store_id: c.store_id,
            product_name: `${c.product_name} (Cópia)`,
            price: c.price,
            audience: c.audience,
            objective: c.objective,
            product_positioning: c.product_positioning,
            product_image_url: c.product_image_url,
            status: "draft",
          },
        ])
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

  const headerLinks = useMemo(
    () => (
      <Link href="/dashboard/campaigns/new">
        <button
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          type="button"
        >
          <Plus className="h-4 w-4" />
          Nova campanha
        </button>
      </Link>
    ),
    []
  );

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
            <div
              key={i}
              className="flex flex-row items-stretch gap-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm h-[138px]"
            >
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
        <MotionWrapper
          delay={0.2}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white/50 p-12 text-center"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-300">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nenhuma campanha encontrada</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
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
            if (c.audience) metadataParts.push(formatAudience(c.audience));
            if (c.objective) metadataParts.push(formatObjective(c.objective));
            const metadataLine = metadataParts.join(" • ");
            const strategyLabel = selectors.getCampaignStrategyLabel(c);
            const formattedDate = c.created_at
              ? format(new Date(c.created_at), "d MMM yyyy", { locale: ptBR })
              : "";

            const displayStatuses = selectors.getCampaignDisplayStatuses(c);

            return (
              <div
                key={c.id}
                className="group relative flex flex-row items-stretch gap-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <CampaignThumbnail campaign={c} />

                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="truncate text-base font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
                        {c.product_name}
                      </h3>
                      <time className="flex-none whitespace-nowrap text-xs font-medium text-slate-400">
                        {formattedDate}
                      </time>
                    </div>

                    <div className="mt-1">
                      <div className="text-[13px] font-medium text-slate-500">{metadataLine}</div>
                      <div className="mt-1.5 inline-flex items-center rounded-md border border-slate-200/50 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {strategyLabel}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {displayStatuses.map((ds, idx) => {
                        const Icon = ds.variant === "approved" ? CheckCircle2 : ds.variant === "pending" ? Sparkles : ImageIcon;
                        return (
                          <div
                            key={idx}
                            title={ds.label}
                            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight shadow-sm ${ds.variant === "approved"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : ds.variant === "pending"
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-zinc-200 bg-zinc-50 text-zinc-500"
                              }`}
                          >
                            <Icon className="h-3 w-3" />
                            <span>{ds.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => handleDuplicate(c)}
                        disabled={!!duplicatingId}
                        title="Duplicar Campanha"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/5 bg-white text-zinc-400 transition hover:bg-zinc-50 hover:text-emerald-600 disabled:opacity-50"
                      >
                        {duplicatingId === c.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>

                      <Link href={`/dashboard/campaigns/${c.id}?mode=edit`}>
                        <button className="flex h-9 items-center gap-2 rounded-xl border border-black/5 bg-white px-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-emerald-600">
                          <Edit2 className="h-4 w-4" />
                          <span>Editar</span>
                        </button>
                      </Link>

                      <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1">
                        <button
                          onClick={() => setSelectedPostCampaign(c)}
                          disabled={!hasArt}
                          className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 enabled:bg-white enabled:text-zinc-900 enabled:shadow-sm enabled:hover:bg-zinc-50"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          Arte
                        </button>
                        <button
                          onClick={() => setSelectedReelsCampaign(c)}
                          disabled={!hasVideo}
                          className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 enabled:bg-white enabled:text-zinc-900 enabled:shadow-sm enabled:hover:bg-zinc-50"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Vídeo
                        </button>
                      </div>

                      <Link href={`/dashboard/campaigns/${c.id}`}>
                        <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm transition hover:bg-zinc-800">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </MotionWrapper>
      )}

      {selectedPostCampaign && (
        <PostModal
          campaign={selectedPostCampaign}
          onClose={() => setSelectedPostCampaign(null)}
        />
      )}
      {selectedReelsCampaign && (
        <ReelsModal
          campaign={selectedReelsCampaign}
          onClose={() => setSelectedReelsCampaign(null)}
        />
      )}
    </main>
  );
}