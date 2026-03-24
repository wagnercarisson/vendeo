import { Loader2, Sparkles } from "lucide-react";

export function PreviewLoadingState() {
    return (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-20 rounded-full animate-pulse" />
                <div className="relative h-16 w-16 bg-white rounded-2xl shadow-lg border border-emerald-100 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-emerald-500 animate-pulse" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-600 rounded-full p-1.5 shadow-sm">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
            </div>
            
            <h3 className="text-xl font-bold text-zinc-900 mb-2">
                Nossa IA está trabalhando...
            </h3>
            <p className="text-sm text-zinc-600 max-w-sm mb-8 leading-relaxed">
                Analisando o produto, aplicando estratégias de vendas e criando copys persuasivas para a sua campanha!
            </p>

            <div className="w-full max-w-xs space-y-3">
                <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full animate-[progress_2s_ease-in-out_infinite]" style={{ transformOrigin: "left" }} />
                </div>
                <p className="text-xs font-medium text-emerald-700 uppercase tracking-widest animate-pulse">
                    Gerando conteúdo...
                </p>
            </div>
        </div>
    );
}