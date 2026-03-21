import type { StrategyData } from "./types";
import { AUDIENCE_OPTIONS, OBJECTIVE_OPTIONS, PRODUCT_POSITIONING_OPTIONS } from "./constants";

type StrategyFormCardProps = {
    value: StrategyData;
    onChange: (next: StrategyData) => void;
    isDisabled?: boolean;
    disableCampaignType?: boolean;
};

export function StrategyFormCard({
    value,
    onChange,
    isDisabled = false,
    disableCampaignType = false,
}: StrategyFormCardProps) {
    function updateField<K extends keyof StrategyData>(
        field: K,
        fieldValue: StrategyData[K]
    ) {
        onChange({
            ...value,
            [field]: fieldValue,
        });
    }

    const sourceLabel =
        value.source === "ai"
            ? "Sugestão do Vendeo"
            : value.source === "manual"
                ? "Personalizado"
                : "Ainda não definido";

    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-900">
                        Estratégia da campanha
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        Confirme ou ajuste a estratégia antes de gerar a campanha completa.
                    </p>
                </div>

                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    {sourceLabel}
                </span>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label
                        htmlFor="audience"
                        className="text-sm font-medium text-zinc-700"
                    >
                        Público
                    </label>
                    <select
                        id="audience"
                        value={value.audience}
                        onChange={(e) => updateField("audience", e.target.value)}
                        disabled={isDisabled || value.source === "ai"}
                        className="w-full h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white disabled:opacity-50 disabled:bg-zinc-50"
                    >
                        <option value="">Selecione o público</option>
                        {AUDIENCE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="objective"
                        className="text-sm font-medium text-zinc-700"
                    >
                        Objetivo
                    </label>
                    <select
                        id="objective"
                        value={value.objective}
                        onChange={(e) => updateField("objective", e.target.value)}
                        disabled={isDisabled || value.source === "ai"}
                        className="w-full h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white disabled:opacity-50 disabled:bg-zinc-50"
                    >
                        <option value="">Selecione o objetivo</option>
                        {OBJECTIVE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="product_positioning"
                        className="text-xs font-semibold text-zinc-900"
                    >
                        Posicionamento do Produto
                    </label>
                    <select
                        id="product_positioning"
                        value={value.product_positioning}
                        onChange={(e) => updateField("product_positioning", e.target.value)}
                        disabled={isDisabled || value.source === "ai"}
                        className="w-full h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white disabled:opacity-50 disabled:bg-zinc-50"
                    >
                        <option value="">Selecione o posicionamento</option>
                        {PRODUCT_POSITIONING_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3 pt-4 border-t border-zinc-200">
                    <p className="text-sm font-medium text-zinc-900">
                        O que você deseja gerar?
                    </p>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 cursor-pointer hover:bg-zinc-50 transition">
                            <input
                                type="checkbox"
                                checked={value.generate_post}
                                onChange={(e) => updateField("generate_post", e.target.checked)}
                                disabled={isDisabled || disableCampaignType || value.source === "ai"}
                                className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600 disabled:opacity-50"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-zinc-900 leading-none mb-1">
                                    Post (Imagem + Copy)
                                </span>
                                <span className="text-xs text-zinc-500">
                                    Arte visual para o Feed com legenda e hashtags.
                                </span>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 cursor-pointer hover:bg-zinc-50 transition">
                            <input
                                type="checkbox"
                                checked={value.generate_reels}
                                onChange={(e) => updateField("generate_reels", e.target.checked)}
                                disabled={isDisabled || disableCampaignType || value.source === "ai"}
                                className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600 disabled:opacity-50"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-zinc-900 leading-none mb-1">
                                    Vídeo Curto (Reels/TikTok)
                                </span>
                                <span className="text-xs text-zinc-500">
                                    Roteiro envolvente com sugestões visuais.
                                </span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </section>
    );
}