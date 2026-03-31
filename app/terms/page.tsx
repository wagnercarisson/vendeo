import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import BrandLogo from "@/components/dashboard/BrandLogo";

export const metadata = {
    title: "Termos de Uso | Vendeo",
    description: "Diretrizes e transparência para o uso da plataforma Vendeo durante a fase Beta.",
};

export default function TermsPage() {
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
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 mb-6">
                        <Shield className="w-4 h-4 text-orange-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">Beta 1.0</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-vendeo-text mb-4">
                        Termos de <span className="text-orange-500">Uso</span>
                    </h1>
                    <p className="text-lg text-vendeo-muted leading-relaxed">
                        Bem-vindo ao Vendeo. Estes termos regem o uso da nossa plataforma durante este estágio inicial de desenvolvimento e testes.
                    </p>
                    <p className="mt-4 text-sm font-medium text-vendeo-muted/60">Última atualização: {lastUpdate}</p>
                </div>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-xl font-bold text-vendeo-text mb-3">1. Natureza do Serviço</h2>
                        <p className="text-vendeo-muted leading-relaxed">
                            O Vendeo é uma plataforma de inteligência artificial voltada para auxiliar lojistas na criação de campanhas de marketing. Atualmente, o serviço encontra-se em fase <strong>Beta</strong>, o que significa que funcionalidades podem ser alteradas, removidas ou aprimoradas continuamente para melhor atender os nossos usuários.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-vendeo-text mb-3">2. Uso Ético e Responsável</h2>
                        <p className="text-vendeo-muted leading-relaxed">
                            A plataforma utiliza IA para sugerir textos, estratégias e gerações gráficas. O usuário é o único responsável pela veracidade das informações inseridas (preços, ofertas, nomes de produtos) e pelo conteúdo final que decide publicar em suas redes sociais.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-vendeo-text mb-3">3. Propriedade Intelectual</h2>
                        <p className="text-vendeo-muted leading-relaxed">
                            Todo o conteúdo gerado pela plataforma para o lojista (artes, roteiros e textos) é de uso livre para a promoção comercial de sua respectiva loja, desde que respeitadas as diretrizes de direitos autorais de terceiros (como logotipos de fornecedores).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-vendeo-text mb-3">4. Limitações de Responsabilidade</h2>
                        <p className="text-vendeo-muted leading-relaxed">
                            Como o sistema está em fase de testes, o Vendeo não garante disponibilidade ininterrupta ou ausência total de erros. Não nos responsabilizamos por eventuais perdas financeiras decorrentes do uso das sugestões geradas pela IA, que devem ser sempre validadas pelo bom senso do lojista.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-vendeo-text mb-3">5. Suporte e Feedback</h2>
                        <p className="text-vendeo-muted leading-relaxed">
                            Durante o Beta, seu feedback é nossa ferramenta de crescimento mais valiosa. Caso encontre inconsistências ou tenha sugestões de melhoria, entre em contato através do e-mail oficial: <a href="mailto:suporte@vendeo.tech" className="text-orange-500 font-semibold hover:underline">suporte@vendeo.tech</a>.
                        </p>
                    </section>
                </div>

                <div className="mt-20 p-8 rounded-3xl bg-black/5 border border-black/5 text-center">
                    <p className="text-vendeo-muted text-sm font-medium">
                        Ao utilizar o Vendeo, você concorda com estas diretrizes e se junta a nós na construção do futuro do marketing para lojistas.
                    </p>
                    <Link href="/" className="inline-block mt-6 px-8 py-3 bg-vendeo-text text-white rounded-xl font-bold hover:opacity-90 transition">
                        Aceitar e Voltar
                    </Link>
                </div>
            </main>
        </div>
    );
}
