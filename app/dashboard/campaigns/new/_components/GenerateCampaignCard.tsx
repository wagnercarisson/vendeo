"use client";

import type { CampaignGenerationState } from "./types";

type GenerateCampaignCardProps = {
    generationState: CampaignGenerationState;
    canGenerate: boolean;
    onGenerate: () => void;
};

export function GenerateCampaignCard({
    generationState,
    canGenerate,
    onGenerate,
}: GenerateCampaignCardProps) {
    const isGenerating = generationState === "generating";

    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="space-y-3">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-900">
                        Gerar campanha
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        O Vendeo vai criar arte, copy e reels em uma única geração.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onGenerate}
                    disabled={!canGenerate || isGenerating}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
                >
                    {isGenerating ? "Gerando campanha..." : "✨ Gerar campanha"}
                </button>

                {isGenerating ? (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
                        <div className="space-y-1">
                            <p>✓ analisando produto</p>
                            <p>✓ definindo estratégia</p>
                            <p>⏳ criando arte</p>
                            <p>⏳ escrevendo copy</p>
                            <p>⏳ criando reels</p>
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}