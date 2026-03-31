import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Send } from "lucide-react";
import BrandLogo from "@/components/dashboard/BrandLogo";

export const metadata = {
    title: "Contato | Vendeo",
    description: "Entre em contato com o suporte do Vendeo para dúvidas, sugestões ou suporte técnico.",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-vendeo-bg text-vendeo-text font-sans text-center md:text-left">
            <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition group">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/5 text-vendeo-text group-hover:bg-black/10 transition">
                            <ArrowLeft className="w-4 h-4" />
                        </span>
                        <span className="text-sm font-semibold text-vendeo-muted group-hover:text-vendeo-text transition">Voltar</span>
                    </Link>
                    <BrandLogo size="sm" variant="dark" showTagline={false} />
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="flex flex-col items-center md:items-start mb-16 px-4 md:px-0">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 mb-6">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Suporte e Parcerias</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-vendeo-text mb-4">
                        Vamos Conversar?
                    </h1>
                    <p className="text-lg text-vendeo-muted max-w-2xl leading-relaxed">
                        Estamos construindo o Vendeo ao lado de lojistas como você. Se você tem dúvidas, encontrou um problema ou quer sugerir uma nova funcionalidade, estamos à disposição.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Canal de E-mail */}
                    <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-soft hover:shadow-md transition-all group">
                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/5 text-vendeo-text mb-6 group-hover:bg-vendeo-text group-hover:text-white transition-colors">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">E-mail de Suporte</h2>
                        <p className="text-vendeo-muted mb-6 leading-relaxed">
                            Para questões técnicas, problemas de acesso ou dúvidas sobre cobrança (versão futura). Respondemos em até 24h.
                        </p>
                        <a 
                            href="mailto:suporte@vendeo.tech" 
                            className="inline-flex items-center gap-2 text-lg font-bold text-vendeo-text hover:text-orange-500 transition-colors underline underline-offset-4 decoration-black/10 hover:decoration-orange-500"
                        >
                            suporte@vendeo.tech
                            <Send className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Feedback Beta */}
                    <div className="p-8 rounded-3xl bg-black/5 border border-black/5 group">
                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-vendeo-text mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-sm">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Feedback Beta</h2>
                        <p className="text-vendeo-muted mb-6 leading-relaxed">
                            Sua opinião molda o futuro da plataforma. O que você gostaria de ver no Vendeo nos próximos meses?
                        </p>
                        <p className="text-sm font-semibold text-vendeo-text/60">
                            Envie suas sugestões pelo e-mail acima ou nos marque no Instagram.
                        </p>
                    </div>
                </div>

                <div className="mt-20 text-center border-t border-black/5 pt-12">
                    <p className="text-vendeo-muted text-sm font-medium mb-6">
                        Com amor, Equipe Vendeo. 🚀
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-vendeo-muted hover:text-vendeo-text transition">
                        Explorar funcionalidades
                    </Link>
                </div>
            </main>
        </div>
    );
}
