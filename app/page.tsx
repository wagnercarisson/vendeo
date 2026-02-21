import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-vendeo-bg">
      {/* Topbar */}
      <header className="sticky top-0 z-10 border-b border-vendeo-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-vendeo-green shadow-soft" />
            <div className="leading-tight">
              <div className="text-lg font-semibold text-vendeo-text">Vendeo</div>
              <div className="text-sm text-vendeo-muted">
                Motor de vendas social para lojas físicas
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-vendeo-text hover:bg-slate-100"
            >
              Entrar
            </Link>
            <Link
              href="/app"
              className="rounded-xl bg-vendeo-green px-4 py-2 text-sm font-semibold text-white hover:bg-vendeo-greenLight"
            >
              Acessar painel
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-vendeo-border bg-white px-3 py-1 text-sm text-vendeo-muted shadow-sm">
              <span className="h-2 w-2 rounded-full bg-vendeo-green" />
              Conteúdo que vende na loja física
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-vendeo-text">
              Transforme produtos em{" "}
              <span className="text-vendeo-green">posts que vendem</span> em minutos.
            </h1>

            <p className="mt-4 text-lg text-vendeo-muted">
              Sem agência. Sem designer. Sem tempo perdido. Escolha o produto → o Vendeo
              cria arte, texto, legenda, hashtags e Reels prontos para postar.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/app"
                className="rounded-xl bg-vendeo-green px-5 py-3 text-sm font-semibold text-white hover:bg-vendeo-greenLight shadow-soft"
              >
                Criar minha primeira campanha
              </Link>
              <Link
                href="/plans"
                className="rounded-xl border border-vendeo-border bg-white px-5 py-3 text-sm font-semibold text-vendeo-text hover:bg-slate-50"
              >
                Ver plano da semana
              </Link>
            </div>

            <div className="mt-8 grid gap-3 text-sm text-vendeo-muted sm:grid-cols-2">
              <div className="rounded-2xl border border-vendeo-border bg-white p-4">
                <div className="font-medium text-vendeo-text">Estratégia local</div>
                <div>Datas, sazonalidade, urgência e público do bairro.</div>
              </div>
              <div className="rounded-2xl border border-vendeo-border bg-white p-4">
                <div className="font-medium text-vendeo-text">Foco em conversão</div>
                <div>Copy persuasiva + CTA para trazer cliente na loja.</div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-vendeo-border bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-vendeo-text">Prévia do painel</div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-vendeo-muted">
                Dashboard
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-vendeo-border p-4">
                <div className="text-sm font-semibold text-vendeo-text">
                  Campanha: Oferta da Semana
                </div>
                <div className="mt-1 text-sm text-vendeo-muted">
                  Arte + legenda + CTA + hashtags + roteiro de Reels
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs text-vendeo-green">
                    Post pronto
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-vendeo-blue">
                    Reels sugerido
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-vendeo-border p-4">
                  <div className="text-xs text-vendeo-muted">Ação rápida</div>
                  <div className="mt-1 font-semibold text-vendeo-text">Plano da semana</div>
                  <div className="mt-2 text-sm text-vendeo-muted">
                    Estratégia + 4 dias com campanhas vinculadas.
                  </div>
                </div>
                <div className="rounded-2xl border border-vendeo-border p-4">
                  <div className="text-xs text-vendeo-muted">Ação rápida</div>
                  <div className="mt-1 font-semibold text-vendeo-text">Nova campanha</div>
                  <div className="mt-2 text-sm text-vendeo-muted">
                    Produto → gera tudo com IA.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-vendeo-muted">
              “Escolhi → gerou → aprovei → postei → vendeu”
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-vendeo-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-vendeo-muted sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Vendeo</div>
          <div className="flex gap-4">
            <span>Feito para lojas físicas</span>
            <span>•</span>
            <span>Conteúdo que vende</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
