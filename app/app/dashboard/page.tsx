import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

function ActionCard({
  title,
  description,
  href,
  badge,
}: {
  title: string;
  description: string;
  href: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-vendeo-border bg-white p-5 shadow-sm hover:shadow-soft transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-vendeo-text">{title}</div>
          <div className="mt-1 text-sm text-vendeo-muted">{description}</div>
        </div>
        {badge ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-vendeo-muted">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-4 text-sm font-semibold text-vendeo-green group-hover:text-vendeo-greenLight">
        Abrir →
      </div>
    </Link>
  );
}

export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-vendeo-bg">
      <header className="border-b border-vendeo-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-vendeo-green shadow-soft" />
            <div className="font-semibold text-vendeo-text">Vendeo</div>
          </div>
          <div className="text-sm text-vendeo-muted">Seu motor de vendas social</div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-vendeo-border bg-white p-6 shadow-sm">
          <div className="text-sm text-vendeo-muted">Bem-vindo</div>
          <h1 className="mt-1 text-2xl font-semibold text-vendeo-text">
            O que vamos postar para vender mais esta semana?
          </h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/campaigns/new"
              className="rounded-xl bg-vendeo-green px-4 py-2 text-sm font-semibold text-white hover:bg-vendeo-greenLight"
            >
              Nova campanha
            </Link>
            <Link
              href="/plans"
              className="rounded-xl border border-vendeo-border bg-white px-4 py-2 text-sm font-semibold text-vendeo-text hover:bg-slate-50"
            >
              Plano da semana
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <ActionCard
            title="Nova campanha"
            description="Crie uma campanha avulsa em minutos."
            href="/campaigns/new"
            badge="rápido"
          />
          <ActionCard
            title="Plano da semana"
            description="Estratégia + 4 itens com campanhas vinculadas."
            href="/plans"
            badge="automático"
          />
          <ActionCard
            title="Campanhas"
            description="Veja e regenere textos e Reels."
            href="/campaigns"
            badge="histórico"
          />
          <ActionCard
            title="Minha loja"
            description="Posicionamento, tom de voz, contatos e cores."
            href="/store"
            badge="branding"
          />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-vendeo-border bg-white p-6">
            <div className="text-sm font-semibold text-vendeo-text">Atividade recente</div>
            <div className="mt-2 text-sm text-vendeo-muted">
              (Depois a gente lista últimas campanhas e planos aqui)
            </div>
          </div>

          <div className="rounded-2xl border border-vendeo-border bg-white p-6">
            <div className="text-sm font-semibold text-vendeo-text">Dica do dia</div>
            <div className="mt-2 text-sm text-vendeo-muted">
              Promessa + urgência + prova simples = post que converte.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
