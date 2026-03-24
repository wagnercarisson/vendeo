export function PreviewEmptyState() {
    return (
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center shadow-sm">
            <div className="max-w-sm space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 text-xl">
                    ✨
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">
                    Preview da campanha
                </h3>
                <p className="text-sm leading-6 text-zinc-500">
                    Sua campanha aparecerá aqui. Preencha os dados do produto e clique em
                    gerar campanha.
                </p>
            </div>
        </div>
    );
}