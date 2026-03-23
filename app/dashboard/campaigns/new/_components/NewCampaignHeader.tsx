export function NewCampaignHeader() {
    return (
        <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
                IA de campanha
            </div>

            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                    Nova campanha
                </h1>
                <p className="text-sm leading-6 text-zinc-600">
                    Crie uma campanha para um produto. O Vendeo gera arte, texto e reels
                    para sua loja.
                </p>
            </div>
        </div>
    );
}