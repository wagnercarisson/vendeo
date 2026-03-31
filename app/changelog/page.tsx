import { changelogData, formatChangeType } from "@/lib/data/changelog";
import Link from "next/link";
import { ArrowLeft, Rocket } from "lucide-react";
import BrandLogo from "@/components/dashboard/BrandLogo";

export const metadata = {
    title: "Atualizações | Vendeo",
    description: "Acompanhe de perto as novidades, melhorias e a evolução constante do nosso motor de vendas.",
};

export default function ChangelogPage() {
    return (
        <div className="min-h-screen bg-vendeo-bg text-vendeo-text font-sans">
            <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition group">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/5 text-vendeo-text group-hover:bg-black/10 transition">
                            <ArrowLeft className="w-4 h-4" />
                        </span>
                        <span className="text-sm font-semibold text-vendeo-muted group-hover:text-vendeo-text transition">Voltar para Home</span>
                    </Link>
                    <BrandLogo size="sm" variant="dark" showTagline={false} />
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 max-w-3xl">
                <div className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-vendeo-text mb-4">
                        Registro de <span className="text-orange-500">Evolução</span>
                    </h1>
                    <p className="text-lg text-vendeo-muted leading-relaxed">
                        Acompanhe diariamente tudo o que a nossa equipe de engenharia está construindo, corrigindo e aprimorando para transformar o Vendeo na sua plataforma de marketing favorita.
                    </p>
                </div>

                <div className="relative border-l-2 border-slate-200 ml-3 md:ml-6 space-y-16 pb-12">
                    {changelogData.map((release, index) => {
                        const isLatest = index === 0;
                        // Usa T12 para evitar fuso de virar D-1
                        const dateObj = new Date(release.date + "T12:00:00Z"); 
                        const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

                        return (
                            <div key={release.version} className="relative pl-8 md:pl-12">
                                {/* Timeline Node */}
                                <div className={`absolute -left-[11px] top-1.5 h-5 w-5 rounded-full border-4 border-[#fafafa] ${isLatest ? 'bg-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.15)]' : 'bg-slate-300'}`} />
                                
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                    <h2 className="text-2xl font-bold text-vendeo-text tracking-tight flex items-center gap-3">
                                        {release.version}
                                        {isLatest && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
                                                <Rocket className="w-3.5 h-3.5" />
                                                Mais Recente
                                            </span>
                                        )}
                                    </h2>
                                    <time className="text-sm font-medium text-vendeo-muted sm:mt-1">{formattedDate}</time>
                                </div>
                                
                                <h3 className="text-lg font-semibold text-vendeo-text mb-3">{release.title}</h3>
                                {release.description && (
                                    <p className="text-vendeo-muted mb-6">{release.description}</p>
                                )}

                                <div className="space-y-3">
                                    {release.changes.map((change, i) => {
                                        const { label, color } = formatChangeType(change.type);
                                        return (
                                            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-black/5 shadow-soft transition-all hover:shadow-md hover:border-black/10 hover:-translate-y-0.5">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <span className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${color}`}>
                                                        {label}
                                                    </span>
                                                </div>
                                                <div className="text-[14.5px] leading-relaxed text-vendeo-text">
                                                    {change.scope && (
                                                        <span className="font-bold text-vendeo-text mr-2">[{change.scope}]</span>
                                                    )}
                                                    {change.description}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
