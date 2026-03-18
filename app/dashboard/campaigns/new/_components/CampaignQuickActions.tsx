"use client";

import { Pencil, Image as ImageIcon, Video } from "lucide-react";

type CampaignQuickActionsProps = {
    onEdit: () => void;
    onRegenerateArt: () => void;
    onRegenerateReels?: () => void;
    generateReels: boolean;
    isBusy?: boolean;
};

export function CampaignQuickActions({
    onEdit,
    onRegenerateArt,
    onRegenerateReels,
    generateReels,
    isBusy = false,
}: CampaignQuickActionsProps) {
    return (
        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={onEdit}
                disabled={isBusy}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-sm hover:text-emerald-700 hover:border-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <Pencil className="h-4 w-4" />
                Editar texto
            </button>

            <button
                type="button"
                onClick={onRegenerateArt}
                disabled={isBusy}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-sm hover:text-emerald-700 hover:border-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <ImageIcon className="h-4 w-4" />
                {isBusy ? "Gerando arte..." : "Gerar nova arte"}
            </button>

            {generateReels && onRegenerateReels && (
                <button
                    type="button"
                    onClick={onRegenerateReels}
                    disabled={isBusy}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-sm hover:text-emerald-700 hover:border-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Video className="h-4 w-4" />
                    {isBusy ? "Gerando reels..." : "Gerar novo reels"}
                </button>
            )}
        </div>
    );
}