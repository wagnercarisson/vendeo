"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import LogoutButton from "@/components/dashboard/LogoutButton";
import Brand from "@/components/dashboard/BrandLogo";

type Props = {
  children: React.ReactNode;
  user?: { email?: string | null } | null;
  storeId?: string | null;
  storeName?: string | null;
  storeCity?: string | null;
  storeState?: string | null;
};

export function DashboardShell({
  children,
  user,
  storeId,
  storeName,
  storeCity,
  storeState,
}: Props) {
  const pathname = usePathname();
  const [openAccount, setOpenAccount] = useState(false);

  const hasStore = !!storeId;

  const navItemBase =
    "block w-full rounded-xl px-3 py-2 text-sm font-medium transition";

  // Sidebar refinada: hover mais suave + foco/ativo com “pill” branco
  const navItemInactive = `${navItemBase} text-white/85 hover:bg-white/10 hover:text-white`;
  const navItemActive = `${navItemBase} bg-white text-[#0B2E22] shadow-soft`;

  // Bloqueado premium (sem loja)
  const navItemDisabled = `${navItemBase} text-white/60 bg-white/5 hover:bg-white/5 cursor-not-allowed`;

  const badgeLocked =
    "ml-auto inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/80 whitespace-nowrap";

  const menu = useMemo(
    () => [
      { href: "/dashboard", label: "Dashboard", requiresStore: false },
      { href: "/dashboard/store", label: "Loja", requiresStore: false },
      { href: "/dashboard/campaigns", label: "Campanhas", requiresStore: true },
      { href: "/dashboard/plans", label: "Planos semanais", requiresStore: true },
    ],
    []
  );

  const email = user?.email ?? "—";
  const initial = (user?.email?.charAt(0) || "U").toUpperCase();

  const storeSubtitle =
    storeCity && storeState
      ? `${storeCity}, ${storeState}`
      : "Endereço não informado";

  return (
    <div className="h-screen overflow-hidden flex bg-vendeo-bg text-vendeo-text">
      {/* SIDEBAR */}
      <aside className="relative w-64 h-full overflow-hidden bg-[#0F3D2E] text-white flex flex-col">
        {/* iluminação premium do fundo */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute top-24 -right-24 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10" />
        </div>
        {/* Marca */}
        <div className="relative z-10 p-6 border-b border-white/10">
          <Brand size="md" align="center" showTagline variant="dark" />
        </div>

        {/* CTA onboarding (apenas sem loja) */}
        {!hasStore && (
          <div className="relative z-10 p-4 pb-2">
            <Link
              href="/dashboard/store"
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-gradient-to-r from-orange-500/25 via-orange-500/15 to-transparent px-4 py-3 shadow-soft transition hover:from-orange-500/30"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">
                  Cadastre sua loja
                </div>
                <div className="mt-0.5 text-xs text-white/75">
                  Libere campanhas e planos
                </div>
              </div>

              <div className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white transition group-hover:bg-orange-600">
                →
              </div>
            </Link>
          </div>
        )}

        {/* Menu */}
        <nav className="relative z-10 flex-1 p-4 space-y-1">
          {menu.map((item) => {
            const active = pathname === item.href;

            const locked = item.requiresStore && !hasStore;

            // Se bloqueado, direciona para onboarding (melhor UX)
            const href = locked ? "/dashboard/store" : item.href;

            const className = locked
              ? navItemDisabled
              : active
                ? navItemActive
                : navItemInactive;

            const title = locked ? "Cadastre sua loja para liberar este recurso" : undefined;

            return (
              <Link
                key={item.href}
                href={href}
                className={className}
                title={title}
                aria-disabled={locked ? true : undefined}
              >
                <span className="inline-flex w-full items-center gap-2">
                  <span className="truncate">{item.label}</span>

                  {locked && <span className={badgeLocked}>Requer loja</span>}
                </span>
              </Link>
            );
          })}

          {/* helper premium (apenas sem loja) */}
          {!hasStore && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div className="text-xs font-semibold text-white">
                Você está a 1 passo
              </div>
              <div className="mt-1 text-xs text-white/75 leading-snug">
                Cadastre sua loja para liberar campanhas, reels e planos semanais.
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        {/* HEADER (topbar global) */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-6">
          {/* Loja (nome grande à esquerda + endereço abaixo) */}
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-vendeo-text truncate leading-tight">
              {storeName ?? "Minha loja"}
            </h2>

            <div className="mt-1 text-sm text-vendeo-muted truncate">
              {storeSubtitle}
            </div>
          </div>

          {/* Direita: CTA + Conta */}
          <div className="flex items-center gap-3">
            {/* CTA: se não tem loja, guia para onboarding e desabilita visualmente */}
            <Link
              href={hasStore ? "/dashboard/campaigns/new" : "/dashboard/store"}
              title={hasStore ? undefined : "Cadastre sua loja para criar campanhas"}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${hasStore
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-orange-500/40 text-white/80"
                }`}
              aria-disabled={!hasStore ? true : undefined}
            >
              Nova campanha
            </Link>

            {/* Conta (avatar + dropdown) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenAccount((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-vendeo-border bg-white px-2 py-1.5 hover:bg-slate-50"
                aria-label="Conta"
              >
                <div className="h-9 w-9 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center text-sm font-semibold shadow-soft">
                  {initial}
                </div>

                <div className="hidden md:block max-w-[220px] text-left">
                  <div className="text-xs text-vendeo-muted">Conta</div>
                  <div className="text-sm text-vendeo-text truncate">{email}</div>
                </div>
              </button>

              {openAccount && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-vendeo-border bg-white shadow-soft p-2 z-50"
                  onMouseLeave={() => setOpenAccount(false)}
                >
                  <Link
                    href="/profile"
                    className="block rounded-xl px-3 py-2 text-sm text-vendeo-text hover:bg-slate-100"
                    onClick={() => setOpenAccount(false)}
                  >
                    Perfil
                  </Link>

                  <div className="h-px bg-vendeo-border my-1" />

                  <LogoutButton className="w-full text-left rounded-xl px-3 py-2 text-sm text-vendeo-text hover:bg-slate-100" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}