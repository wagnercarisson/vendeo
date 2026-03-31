import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import BrandLogo from "@/components/dashboard/BrandLogo";

export const metadata = {
    title: "Privacidade | Vendeo",
    description: "Transparência sobre como tratamos seus dados durante a fase Beta do Vendeo.",
};

export default function PrivacyPage() {
    const lastUpdate = "31 de março de 2026";

    return (
        <div className="min-h-screen bg-vendeo-bg text-vendeo-text font-sans">
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

            <main className="container mx-auto px-4 py-16 max-w-3xl">
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 mb-6">
                        <Lock className="w-4 h-4 text-emerald-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Privacidade Beta</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-vendeo-text mb-4">
                        Política de <span className="text-emerald-500">Privacidade</span>
                    </h1>
                    <p className="text-lg text-vendeo-muted leading-relaxed">
                        Sua confiança é a base do Vendeo. Saiba como protegemos e utilizamos as informações da sua loja para gerar os melhores resultados de marketing.
                    </p>
                    <p className="mt-4 text-sm font-medium text-vendeo-muted/60">Última atualização: {lastUpdate}</p>
                </div>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-xl font-bold text-vendeo-text mb-3">1. Coleta de Informações</h2>
                        <p className="text-vendeo-muted leading-relaxed">
                            Para que a nossa IA funcione bem, coletamos apenas o essencial: nome da sua loja, cidade, público-alvo e as informações dos produtos que você deseja promover (preços, ofertas e nomes). Esses dados são usados exclusivamente para personalizar suas campanhas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-vendeo-text mb-3">2. Uso Ético da IA</h2>
                        <p className="text-vendeo-muted leading-relaxed">
                            Processamos seus dados através de modelos de inteligência artificial para criar sugestões de marketing. Não vendemos seus dados para terceiros nem usamos suas estratégias comerciais para beneficiar outros concorrentes de forma direta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-vendeo-text mb-3">3. Segurança e Armazenamento</h2>
                        <p className="text-vendeo-muted leading-relaxed">
                            Utilizamos infraestrutura de ponta (Supabase/Vercel) para garantir que suas informações estejam seguras e protegidas por criptografia. Como estamos em Beta, mantemos logs de atividade para identificar e corrigir falhas técnicas rapidamente.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-vendeo-text mb-3">4. Cookies e Navegação</h2>
                        <p className="text-vendeo-muted leading-relaxed">
                            Usamos cookies apenas para manter você conectado à sua conta e para entender como a plataforma está sendo usada, visando melhorias constantes na interface e na experiência do lojista.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-vendeo-text mb-3">5. Seus Direitos</h2>
                        <p className="text-vendeo-muted leading-relaxed">
                            Você tem total controle sobre seus dados. A qualquer momento, pode solicitar a exclusão de sua conta e de todas as informações associadas a ela enviando um e-mail para: <a href="mailto:suporte@vendeo.tech" className="text-emerald-600 font-semibold hover:underline">suporte@vendeo.tech</a>.
                        </p>
                    </section>
                </div>

                <div className="mt-20 p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                    <p className="text-vendeo-muted text-sm font-medium italic">
                        "Privacidade não é apenas um direito, é o compromisso que assumimos com o sucesso da sua loja."
                    </p>
                    <Link href="/" className="inline-block mt-6 px-8 py-3 bg-vendeo-text text-white rounded-xl font-bold hover:opacity-90 transition">
                        Entendido
                    </Link>
                </div>
            </main>
        </div>
    );
}
