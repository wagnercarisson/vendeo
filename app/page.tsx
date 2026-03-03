"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import BrandLogo from "@/components/dashboard/BrandLogo";

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}

function useVendeoScrollReveal() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-vendeo-reveal]")
    );

    // fallback caso não exista IntersectionObserver
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("vendeo-inview"));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("vendeo-inview");
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      data-vendeo-reveal
      className={`vendeo-reveal ${className}`}
      style={{ ["--vendeo-delay" as any]: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <div className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/70">
          {eyebrow}
        </div>
      ) : null}

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
        {title}
      </h2>

      {subtitle ? (
        <p className="mt-3 text-base leading-relaxed text-black/70">{subtitle}</p>
      ) : null}
    </div>
  );
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="vendeo-button-glow group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-vendeo-green px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-vendeo-green/40"
    >
      {children}
      {/* brilho sutil */}
      <span className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <span className="absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-white/20 blur-md" />
      </span>
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20"
    >
      {children}
    </Link>
  );
}

function Card({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="vendeo-card-glow min-h-[110px] rounded-2xl border border-black/10 hover:border-black/20 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-black">{title}</div>
          <div className="mt-2 text-sm text-black/60">{description}</div>
        </div>

        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-800 shadow-sm ring-1 ring-emerald-500/5">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PreviewCard() {
  return (
    <div className="relative">
      {/* glow suave */}
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-emerald-400/10 blur-3xl" />

      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-md">
        <div className="flex items-center justify-between text-sm font-semibold text-black">
          <span>Prévia do painel</span>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-semibold text-black/60">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
              Escolha o produto
            </span>

            <span className="inline-flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-emerald-600/70"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h12" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </span>

            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500/30" />
              Campanha gerada
            </span>
          </div>

          <div className="mt-2 h-[2px] w-full rounded-full bg-emerald-500/15" />
        </div>

        <div className="mt-6 rounded-xl border border-black/10 bg-black/[0.02] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-black/50">Campanha</div>
              <div className="mt-1 text-base font-semibold text-black">
                Oferta da Semana
              </div>
              <div className="mt-1 text-sm text-black/60">
                Texto persuasivo + CTA pronto para postar.
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs font-semibold">
              <span className="rounded-full bg-vendeo-green/10 px-3 py-1 text-vendeo-green">
                Post pronto
              </span>
              <span className="rounded-full bg-orange-500/10 px-3 py-1 text-orange-600">
                Reels sugerido
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-black/10 bg-white p-3 text-sm">
              <div className="font-semibold text-black">Plano da semana</div>
              <div className="text-black/60">7 ideias estratégicas</div>
            </div>

            <div className="rounded-lg border border-black/10 bg-white p-3 text-sm">
              <div className="font-semibold text-black">Nova campanha</div>
              <div className="text-black/60">1 clique para gerar tudo</div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden text-center text-sm font-semibold text-black">
          <span className="relative z-10">Escolheu → Gerou → Postou → Vendeu</span>
          <span
            className="pointer-events-none absolute inset-y-0 left-[-50%] w-[45%] -skew-x-12 bg-gradient-to-r from-transparent via-orange-200/35 to-transparent blur-sm vendeo-shimmer-strong"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

function ScrollToTopFab() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 650); // ajuste fino: 500–800
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      const cta = document.getElementById("hero-cta");
      if (cta) {
        cta.classList.add("vendeo-cta-highlight");

        setTimeout(() => {
          cta.classList.remove("vendeo-cta-highlight");
        }, 1000);
      }
    }, 500); // espera subir
  };

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="Voltar ao topo"
      className={[
        // ✅ lateral, “suspenso”
        "fixed right-6 top-1/2 -translate-y-1/2 z-[60]",
        "h-11 w-11 rounded-2xl",
        "border border-black/10 bg-white/85 backdrop-blur",
        "shadow-md transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-[52%]",
        "focus:outline-none focus:ring-2 focus:ring-vendeo-green/40",
        visible ? "opacity-100" : "pointer-events-none opacity-0 translate-y-2",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        className="mx-auto h-5 w-5 text-black/70"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="M6 11l6-6 6 6" />
      </svg>
    </button>
  );
}

export default function HomePage() {
  useVendeoScrollReveal();

  const hrefLogin = "/login?mode=login";
  const hrefSignup = "/login?mode=signup";

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTopFab />
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-emerald-950 text-white">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <BrandLogo />
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-white/80 md:flex">
              <Link href="#como-funciona" className="hover:text-white">
                Como funciona
              </Link>
              <Link href="#para-quem-e" className="hover:text-white">
                Para quem é
              </Link>
              <Link href="#exemplos" className="hover:text-white">
                Exemplos
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href={hrefLogin}
                className="text-sm font-semibold text-white/80 hover:text-white"
              >
                Entrar
              </Link>

              <Link
                href={hrefSignup}
                className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-white/90"
              >
                Criar campanha grátis
              </Link>
            </div>
          </div>
        </Container>
      </header>

      <main>
        {/* HERO (mantido; só coloquei reveal nos “pedaços” para ficar premium) */}
        <section className="relative overflow-hidden pt-16 pb-16">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-orange-50" />
          <div className="absolute -top-24 right-[-120px] -z-10 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute -bottom-24 left-[-120px] -z-10 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />

          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <Reveal>
                  <div className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/70">
                    Conteúdo que vende na loja física
                  </div>
                </Reveal>

                <Reveal delay={80}>
                  <h1 className="mt-5 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
                    Transforme produtos da sua loja em posts que realmente geram
                    clientes.
                  </h1>
                </Reveal>

                <Reveal delay={160}>
                  <p className="mt-5 text-lg leading-relaxed text-black/70">
                    Sem agência. Sem designer. Sem perder tempo.
                    <br />
                    Escolha o produto → o Vendeo cria tudo pronto para postar.
                  </p>
                </Reveal>

                <Reveal delay={240}>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                    <div id="hero-cta">
                      <PrimaryButton href={hrefSignup}>
                        Criar minha primeira campanha
                      </PrimaryButton>
                    </div>
                    <SecondaryButton href="#como-funciona">
                      Ver como funciona
                    </SecondaryButton>
                  </div>

                  <p className="mt-4 text-sm text-black/60">
                    Teste grátis! Sem cartão. Comece em menos de 2 minutos.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-black/70">
                    <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                      ✔ Arte pronta
                    </span>
                    <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                      ✔ Legenda + CTA
                    </span>
                    <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                      ✔ Reels sugerido
                    </span>
                  </div>

                  <div className="mt-10 hidden items-center gap-2 text-sm font-semibold text-black/50 sm:inline-flex">
                    <span className="inline-block h-8 w-8 rounded-full border border-black/10 bg-white text-center leading-8">
                      ↓
                    </span>
                    Role para ver como funciona
                  </div>
                </Reveal>
              </div>

              <div id="exemplos">
                <Reveal delay={120}>
                  <PreviewCard />
                </Reveal>
              </div>
            </div>
          </Container>
        </section>

        {/* DOR (impacto + CTA + glow) */}
        <section className="vendeo-section-glow bg-black/[0.02] py-14 sm:py-16">
          <Container>
            <Reveal>
              <SectionTitle
                eyebrow="O problema"
                title="Sua loja tem produto. Mas quem não aparece no feed… não gira estoque."
                subtitle="Enquanto você atende no balcão, seu concorrente aparece no Instagram. O cliente compra de quem lembra. E lembra de quem aparece."
              />
            </Reveal>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Reveal delay={60}>
                <Card
                  title="Concorrente aparece"
                  description="Seu produto é bom. Mas o dele está na tela do cliente."
                />
              </Reveal>
              <Reveal delay={120}>
                <Card
                  title="Cliente esquece"
                  description="Sem constância, sua loja some da memória."
                />
              </Reveal>
              <Reveal delay={180}>
                <Card
                  title="Oferta passa"
                  description="Promoção boa sem divulgação vira estoque parado."
                />
              </Reveal>
            </div>

            <Reveal delay={160}>
              <div className="mt-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                <p className="vendeo-cutline text-black">
                  O problema não é seu produto.
                  <span className="vendeo-break vendeo-highlight">
                    É marketing constante.
                  </span>
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-8">
                <PrimaryButton href={hrefSignup}>
                  Quero fazer minha loja aparecer
                </PrimaryButton>
                <p className="mt-3 text-sm font-medium text-black/60">
                  Teste grátis. Sem cartão. Em menos de 2 minutos.
                </p>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* COMO FUNCIONA */}
        <section
          id="como-funciona"
          className="py-14 sm:py-16 bg-gradient-to-b from-white to-emerald-50/30"
        >
          <Container>
            <Reveal>
              <SectionTitle
                eyebrow="Como funciona"
                title="Simples. Estratégico. Lucrativo."
                subtitle="O Vendeo transforma produtos de lojas físicas em posts que vendem. Sem agência. Sem designer. Sem enrolação."
              />
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { n: "1", t: "Cadastre sua loja", d: "Defina cidade, estilo e público." },
                { n: "2", t: "Adicione o produto", d: "Nome, preço e oferta do dia." },
                { n: "3", t: "Escolha o objetivo", d: "Vender, divulgar ou lançar." },
                { n: "4", t: "Clique em gerar", d: "Post + legenda + CTA na hora." },
              ].map((s, idx) => (
                <Reveal key={s.n} delay={60 * idx}>
                  <div className="vendeo-card-glow rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-vendeo-green/10 text-sm font-bold text-vendeo-green">
                        {s.n}
                      </div>
                      <div className="text-sm font-semibold text-black">{s.t}</div>
                    </div>
                    <div className="mt-3 text-sm leading-relaxed text-black/60">{s.d}</div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <div className="mt-10 rounded-2xl border border-black/10 bg-black/[0.02] p-6">
                <div className="text-sm font-semibold text-black">Você recebe:</div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    "Arte pronta",
                    "Copy persuasiva",
                    "Legenda estratégica",
                    "Hashtags",
                    "CTA forte",
                    "Roteiro completo de Reels",
                  ].map((t) => (
                    <div
                      key={t}
                      className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/80"
                    >
                      {t}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <PrimaryButton href={hrefSignup}>Criar meu primeiro post agora</PrimaryButton>
                  <p className="text-sm font-medium text-black/60">
                    Teste grátis. Sem cartão. Em menos de 2 minutos.
                  </p>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* O PROBLEMA REAL */}
        <section className="vendeo-section-glow bg-black/[0.02] py-14 sm:py-16">
          <Container>
            <Reveal>
              <SectionTitle
                eyebrow="Por que a maioria não vende"
                title="Postar qualquer coisa é fácil. Postar com estratégia é raro."
                subtitle="Imagem bonita não vende sozinha. Desconto mal comunicado não converte. Post sem intenção não gera movimento."
              />
            </Reveal>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { t: "Você até posta…", d: "Mas não cria motivo real para compra." },
                { t: "O cliente até vê…", d: "Mas não entende o valor e passa adiante." },
                { t: "A oferta é boa…", d: "Mas não chama atenção do jeito certo." },
                { t: "Resultado…", d: "Esforço alto, retorno baixo." },
              ].map((i, idx) => (
                <Reveal key={i.t} delay={60 * idx}>
                  <Card title={i.t} description={i.d} />
                </Reveal>
              ))}
            </div>

            <Reveal delay={140}>
              <div className="mt-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                <p className="vendeo-cutline text-black">
                  Você não precisa de mais conteúdo.
                  <span className="vendeo-break vendeo-highlight">Você precisa de direção.</span>
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-8">
                <PrimaryButton href={hrefSignup}>Quero postar com estratégia</PrimaryButton>
                <p className="mt-3 text-sm font-medium text-black/60">
                  Teste grátis. Sem cartão. Em menos de 2 minutos.
                </p>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* DIFERENCIAL */}
        <section className="vendeo-section-glow bg-black/[0.02] py-14 sm:py-16">
          <Container>
            <Reveal>
              <SectionTitle
                eyebrow="Diferencial"
                title="O Vendeo pensa como varejista."
                subtitle="Ele considera cidade, sazonalidade, datas comerciais, urgência, preço e público do bairro — para criar conteúdo que vende."
              />
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  t: "Datas comerciais",
                  d: "Ideias prontas nas datas que vendem.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 7V3M16 7V3M4 11h16" />
                      <rect x="4" y="7" width="16" height="14" rx="2" />
                    </svg>
                  ),
                },
                {
                  t: "Sazonalidade",
                  d: "Conteúdo certo na época certa.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                  ),
                },
                {
                  t: "Público local",
                  d: "Mensagem alinhada ao seu bairro.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
                      <path d="M12 10a2 2 0 1 0 0.001 0z" />
                    </svg>
                  ),
                },
                {
                  t: "Urgência",
                  d: "Copy com escassez sem exagero.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v5l3 2" />
                      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                  ),
                },
                {
                  t: "Posicionamento",
                  d: "Sua loja com cara de marca.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 7h16M4 12h16M4 17h10" />
                    </svg>
                  ),
                },
                {
                  t: "Preço",
                  d: "Valor destacado do jeito certo.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1v22" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  ),
                },
              ].map((i, idx) => (
                <Reveal key={i.t} delay={60 * idx}>
                  <Card title={i.t} description={i.d} icon={i.icon} />
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <div className="mt-10 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="text-base font-semibold text-black">
                  Não é um gerador de imagem.
                </div>
                <div className="mt-1 text-base font-semibold text-black">
                  <span className="vendeo-highlight">É um motor de vendas social para lojas.</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-8">
                <PrimaryButton href={hrefSignup}>Quero conteúdo que realmente vende</PrimaryButton>
                <p className="mt-3 text-sm font-medium text-black/60">
                  Teste grátis. Sem cartão. Em menos de 2 minutos.
                </p>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* PARA QUEM É */}
        <section
          id="para-quem-e"
          className="py-14 sm:py-16 bg-gradient-to-b from-white to-emerald-50/20"
        >
          <Container>
            <Reveal>
              <SectionTitle
                eyebrow="Para quem é"
                title="Você não é criador de conteúdo. Você é lojista."
                subtitle="Se você depende do cliente entrar na loja ou chamar no WhatsApp, o Vendeo foi feito para você."
              />
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  t: "Adegas",
                  d: "Promoções e combos que giram estoque.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 2h8" />
                      <path d="M10 2v6l-4 7a5 5 0 0 0 4 7h4a5 5 0 0 0 4-7l-4-7V2" />
                      <path d="M9 12h6" />
                    </svg>
                  ),
                },
                {
                  t: "Mercados",
                  d: "Ofertas do dia e produtos de alto giro.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 6h15l-2 9H8L6 6z" />
                      <path d="M8 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                      <path d="M18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                      <path d="M6 6 5 3H2" />
                    </svg>
                  ),
                },
                {
                  t: "Farmácias",
                  d: "Campanhas de cuidado e conveniência.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 21V3" />
                      <path d="M7 8h10" />
                      <path d="M7 16h10" />
                      <path d="M4 12h16" />
                    </svg>
                  ),
                },
                {
                  t: "Pet shops",
                  d: "Banho, tosa e ração precisam virar recorrência.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 14c-1.5 0-3 1.3-3 3s1.2 3 3 3c1 0 1.7-.3 2.3-.9" />
                      <path d="M17 14c1.5 0 3 1.3 3 3s-1.2 3-3 3c-1 0-1.7-.3-2.3-.9" />
                      <path d="M9 12c0-2 1.5-4 3-4s3 2 3 4-1.5 4-3 4-3-2-3-4z" />
                      <path d="M9 6a1 1 0 1 0 0.001 0z" />
                      <path d="M15 6a1 1 0 1 0 0.001 0z" />
                    </svg>
                  ),
                },
                {
                  t: "Boutiques",
                  d: "Novidades, looks e desejo imediato.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 7l6-4 6 4" />
                      <path d="M6 7l-2 4 4 2v8h8v-8l4-2-2-4" />
                      <path d="M10 13h4" />
                    </svg>
                  ),
                },
                {
                  t: "Lojas populares",
                  d: "Preço forte com chamada de loja.",
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 7l1-3h16l1 3" />
                      <path d="M4 7v14h16V7" />
                      <path d="M8 11h8" />
                      <path d="M9 15h6" />
                    </svg>
                  ),
                },
              ].map((i, idx) => (
                <Reveal key={i.t} delay={60 * idx}>
                  <Card title={i.t} description={i.d} icon={i.icon} />
                </Reveal>
              ))}
            </div>

            <Reveal delay={140}>
              <div className="mt-10 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                <p className="vendeo-cutline text-black">
                  Se você vende{" "}
                  <span className="vendeo-highlight">produto ou serviço</span>,{" "}
                  precisa aparecer com estratégia.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-8">
                <PrimaryButton href={hrefSignup}>Testar na minha loja agora</PrimaryButton>
                <p className="mt-3 text-sm font-medium text-black/60">
                  Teste grátis. Sem cartão. Em menos de 2 minutos.
                </p>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* PLANO SEMANAL */}
        <section className="vendeo-section-glow bg-black/[0.02] py-14 sm:py-16">
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <Reveal>
                  <SectionTitle
                    eyebrow="Plano semanal"
                    title="Sua loja vende todo dia. Sua estratégia também deveria."
                    subtitle="Gere um plano semanal estratégico com sugestões de dias e horários — para manter constância sem esforço."
                  />
                </Reveal>

                <div className="mt-8 grid gap-4">
                  {[
                    {
                      t: "Estratégia de segunda a segunda",
                      d: "Conteúdo pensado para a rotina real do lojista — inclusive finais de semana.",
                    },
                    {
                      t: "Campanhas conectadas",
                      d: "Uma semana com lógica de vendas, não posts soltos.",
                    },
                    {
                      t: "Clareza do que postar",
                      d: "Ideias prontas e alinhadas ao seu tipo de loja.",
                    },
                  ].map((i, idx) => (
                    <Reveal key={i.t} delay={60 * idx}>
                      <Card title={i.t} description={i.d} />
                    </Reveal>
                  ))}
                </div>

                <Reveal delay={160}>
                  <div className="mt-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                    <p className="vendeo-cutline text-black">
                      Quem posta só quando lembra…
                      <span className="vendeo-break vendeo-highlight">
                        vende só quando é lembrado.
                      </span>
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={220}>
                  <div className="mt-8">
                    <PrimaryButton href={hrefSignup}>Criar meu plano gratuito agora</PrimaryButton>
                    <p className="mt-3 text-sm font-medium text-black/60">
                      Sem cartão. Sem risco. Em menos de 2 minutos.
                    </p>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={120}>
                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-black">
                      Exemplo: Plano da semana
                    </div>
                    <div className="text-xs text-black/50">Gerado automaticamente</div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {[
                      "Segunda — Post (oferta rápida)",
                      "Terça — Reels (produto destaque)",
                      "Quarta — Post (benefício do produto)",
                      "Quinta — Reels (prova / rotina)",
                      "Sexta — Post (urgência / estoque)",
                      "Sábado — Post (combo / oportunidade)",
                      "Domingo — Post (lembrete / última chance)",
                    ].map((t) => (
                      <div
                        key={t}
                        className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm font-medium text-black/80"
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* CTA FINAL */}
        <section className="py-14 sm:py-16 bg-gradient-to-b from-white to-emerald-50/40">
          <Container>
            <Reveal>
              <div className="vendeo-cta-animated rounded-3xl border border-black/10 bg-white p-8 shadow-sm sm:p-10">
                <h3 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                  Sua loja já vende no balcão.
                  <br />
                  Agora deixe o Vendeo ajudar você a vender muito mais.
                </h3>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <PrimaryButton href={hrefSignup}>Criar campanha grátis</PrimaryButton>
                  <p className="text-sm font-medium text-black/60">
                    Não deixe para amanhã.{" "}
                    <span className="font-semibold text-black">
                      Comece hoje e venda muito mais.
                    </span>
                  </p>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-emerald-950 py-10 text-white">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold">© {new Date().getFullYear()} Vendeo</div>

            <div className="flex gap-6 text-sm text-white/80">
              <Link href="/terms" className="hover:text-white">
                Termos
              </Link>
              <Link href="/privacy" className="hover:text-white">
                Privacidade
              </Link>
              <Link href="/contact" className="hover:text-white">
                Contato
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}