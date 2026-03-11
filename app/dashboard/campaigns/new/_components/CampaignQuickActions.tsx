"use client";

import { Pencil, Image as ImageIcon, Video } from "lucide-react";

type CampaignQuickActionsProps = {
    onEdit: () => void;
    generateReels: boolean;
};

export function CampaignQuickActions({ onEdit, generateReels }: CampaignQuickActionsProps) {
    return (
        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={onEdit}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-sm hover:text-emerald-700 hover:border-emerald-200"
            >
                <Pencil className="h-4 w-4" />
                Editar texto
            </button>

            <button
                type="button"
                onClick={() => alert("A funcionalidade de 'Gerar nova arte' já envia uma nova requisição à IA de imagem consumindo créditos. Confirme na V2.")}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-sm hover:text-emerald-700 hover:border-emerald-200"
            >
                <ImageIcon className="h-4 w-4" />
                Gerar nova arte
            </button>

            {generateReels && (
                <button
                    type="button"
                    onClick={() => alert("Gerar novo reels consumirá créditos de IA. Confirme na V2.")}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-sm hover:text-emerald-700 hover:border-emerald-200"
                >
                    <Video className="h-4 w-4" />
                    Gerar novo reels
                </button>
            )}
        </div>
    );
}