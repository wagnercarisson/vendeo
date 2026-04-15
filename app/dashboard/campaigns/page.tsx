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
import { mapDbCampaignToDomain, mapCampaignToListItem } from "@/lib/domain/campaigns/mapper";
import { buildCampaignContentTypeWrite } from "@/lib/domain/campaigns/mapper";
import { MotionWrapper } from "../_components/MotionWrapper";
import { PostModal, ReelsModal } from "./_components/CampaignModals";
import { formatAudience, formatObjective } from "@/lib/formatters/strategyLabels";
import { CampaignCard } from "./_components/CampaignCard";

import { Store } from "@/lib/domain/stores/types";
import { CampaignListItem, Campaign as CampaignModel } from "@/lib/domain/campaigns/types";

export type CampaignListItemWithStore = CampaignListItem & {
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
  const [campaigns, setCampaigns] = useState<CampaignListItemWithStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const router = useRouter();

  const [selectedPostCampaign, setSelectedPostCampaign] = useState<any | null>(null);
  const [selectedReelsCampaign, setSelectedReelsCampaign] = useState<any | null>(null);

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
        const listItem = mapCampaignToListItem(domain);
        return {
          ...listItem,
          stores: row.stores || null,
        } as CampaignListItemWithStore;
      });

      setCampaigns(mapped);
    } catch (err: any) {
      setError(err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDuplicate = async (c: CampaignListItemWithStore) => {
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
            ...buildCampaignContentTypeWrite(c.content_type, c.legacy_content_type),
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
          {campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              onViewArt={setSelectedPostCampaign}
              onViewVideo={setSelectedReelsCampaign}
              onOpen={(campaign) => router.push(`/dashboard/campaigns/${campaign.id}`)}
              onDuplicate={handleDuplicate}
              duplicatingId={duplicatingId}
            />
          ))}
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