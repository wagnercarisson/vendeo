"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Sparkles, 
  Eye, 
  Edit2, 
  Copy, 
  Loader2, 
  Image as ImageIcon, 
  CheckCircle2, 
  FileText 
} from "lucide-react";
import { getSignedUrlAction } from "@/lib/supabase/storage-actions";
import { formatAudience, formatObjective } from "@/lib/formatters/strategyLabels";
import * as selectors from "@/lib/domain/campaigns/logic";
import { Campaign } from "../page";

interface CampaignCardProps {
  campaign: Campaign;
  onViewArt: (c: Campaign) => void;
  onViewVideo: (c: Campaign) => void;
  onOpen: (c: Campaign) => void;
  onDuplicate: (c: Campaign) => void;
  duplicatingId: string | null;
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

export function CampaignCard({
  campaign,
  onViewArt,
  onViewVideo,
  onOpen,
  onDuplicate,
  duplicatingId,
}: CampaignCardProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadSignedUrl() {
      const isApproved = campaign.status === "approved";
      const rawUrl = isApproved 
        ? (campaign.image_url || campaign.product_image_url)
        : campaign.product_image_url;

      if (rawUrl) {
        const signed = await getSignedUrlAction(rawUrl);
        setSignedUrl(signed);
      } else {
        setSignedUrl(null);
      }
    }
    loadSignedUrl();
  }, [campaign.image_url, campaign.product_image_url, campaign.status]);

  const metadataParts = [];
  if (campaign.price) metadataParts.push(formatBRL(campaign.price));
  if (campaign.audience) metadataParts.push(formatAudience(campaign.audience));
  if (campaign.objective) metadataParts.push(formatObjective(campaign.objective));
  const metadataLine = metadataParts.join(" • ");
  
  const strategyLabel = selectors.getCampaignStrategyLabel(campaign);
  const formattedDate = campaign.created_at
    ? format(new Date(campaign.created_at), "d MMM yyyy", { locale: ptBR })
    : "";

  const displayStatuses = selectors.getCampaignDisplayStatuses(campaign);

  return (
    <div
      className="group relative flex flex-row items-stretch gap-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative w-24 aspect-[4/5] flex-none overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 shadow-sm">
        {signedUrl ? (
          <Image
            src={signedUrl}
            alt={campaign.product_name || "Campanha"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
            sizes="96px"
          />
        ) : selectors.hasAnyVisualAsset(campaign) ? (
          <div className="grid h-full w-full place-items-center bg-zinc-50">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
          </div>
        ) : (
          <div className="grid h-full w-full place-items-center">
            <ImageIcon className="h-6 w-6 text-zinc-300" />
          </div>
        )}
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h3 className="truncate text-base font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
              {campaign.product_name}
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

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-slate-50 pt-4">
          <div className="flex flex-wrap gap-2">
            {displayStatuses.map((ds, idx) => {
              const isApproved = ds.variant === "approved";
              const isPending = ds.variant === "pending";
              
              return (
                <div
                  key={idx}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isApproved 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                      : isPending 
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-zinc-50 text-zinc-500 border-zinc-100"
                  }`}
                >
                  {isApproved ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : isPending ? (
                    <FileText className="h-3 w-3" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  {ds.label}
                </div>
              );
            })}
          </div>

          <div className="flex flex-none items-center gap-2">
            {campaign.post_status === "approved" && (
              <button
                onClick={() => onViewArt(campaign)}
                className="flex h-9 items-center gap-2 rounded-xl bg-zinc-900 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800"
                type="button"
              >
                <Eye className="h-4 w-4 text-emerald-400" />
                VER ARTE
              </button>
            )}

            {campaign.reels_status === "approved" && (
              <button
                onClick={() => onViewVideo(campaign)}
                className="flex h-9 items-center gap-2 rounded-xl bg-zinc-900 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800"
                type="button"
              >
                <Eye className="h-4 w-4 text-indigo-400" />
                VER VÍDEO
              </button>
            )}

            <button
              onClick={() => onOpen(campaign)}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <Edit2 className="h-3.5 w-3.5 text-slate-400" />
              ABRIR
            </button>

            <button
              onClick={() => onDuplicate(campaign)}
              disabled={!!duplicatingId}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              {duplicatingId === campaign.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-slate-400" />
              )}
              DUPLICAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
