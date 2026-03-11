import type { StrategyData } from "./types";
import { AUDIENCE_OPTIONS, OBJECTIVE_OPTIONS, PRODUCT_POSITIONING_OPTIONS } from "./constants";

type StrategySuggestionCardProps = {
    suggestion: StrategyData | null;
    onUseSuggestion: () => void;
    onCustomize: () => void;
};

export function StrategySuggestionCard({
    suggestion,
    onUseSuggestion,
    onCustomize,
}: StrategySuggestionCardProps) {
    if (!suggestion) return null;

    const getLabel = (value: string, options: readonly { value: string; label: string }[]) => {
        return options.find((opt) => opt.value === value)?.label || value;
    };

    return (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="text-sm font-semibold text-emerald-900">
                    💡 Sugestão do Vendeo
                </h2>
                <p className="mt-1 text-sm text-emerald-800/80">
                    Com base no produto e no perfil da loja, recomendamos a estratégia
                    abaixo.
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-emerald-200 bg-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Público
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                        {getLabel(suggestion.audience, AUDIENCE_OPTIONS)}
                    </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Objetivo
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                        {getLabel(suggestion.objective, OBJECTIVE_OPTIONS)}
                    </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Posicionamento
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                        {getLabel(suggestion.productPositioning, PRODUCT_POSITIONING_OPTIONS)}
                    </p>
                </div>
            </div>

            {suggestion.reasoning ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Por que sugerimos isso
                    </p>
                    <p className="mt-1 text-sm leading-6 text-zinc-700">
                        {suggestion.reasoning}
                    </p>
                </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={onUseSuggestion}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
                >
                    Usar sugestão
                </button>

                <button
                    type="button"
                    onClick={onCustomize}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-md"
                >
                    Ajustar manualmente
                </button>
            </div>
        </section>
    );
}