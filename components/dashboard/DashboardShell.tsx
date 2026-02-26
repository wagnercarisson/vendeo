"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import LogoutButton from "@/components/dashboard/LogoutButton";
import { BrandLogo } from "@/components/dashboard/BrandLogo";

type Props = {
  children: React.ReactNode;
  user?: { email?: string | null } | null;
  storeName?: string | null;
  storeCity?: string | null;
  storeState?: string | null;
};

export function DashboardShell({
  children,
  user,
  storeName,
  storeCity,
  storeState,
}: Props) {
  const pathname = usePathname();
  const [openAccount, setOpenAccount] = useState(false);

  const navItemBase =
    "block w-full rounded-xl px-3 py-2 text-sm font-medium transition";

  // Sidebar refinada: hover mais suave + foco/ativo com “pill” branco
  const navItemInactive = `${navItemBase} text-white/85 hover:bg-white/10 hover:text-white`;
  const navItemActive = `${navItemBase} bg-white text-[#0B2E22] shadow-soft`;

  const menu = useMemo(
    () => [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/store", label: "Loja" },
      { href: "/dashboard/campaigns", label: "Campanhas" },
      { href: "/dashboard/plans", label: "Planos semanais" },
    ],
    []
  );

  const email = user?.email ?? "—";
  const initial = (user?.email?.charAt(0) || "U").toUpperCase();

  const storeSubtitle =
    storeCity && storeState ? `${storeCity}, ${storeState}` : "Endereço não informado";

  return (
    <div className="min-h-screen flex bg-vendeo-bg text-vendeo-text">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0B2E22] text-white flex flex-col">
        {/* Marca */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Ícone gráfico crescimento */}
            <div className="relative h-9 w-9">
              <Image
                src="/brand/vendeo-icon.svg"
                alt="Vendeo"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Nome Vendeo maior */}
            <div>
              <div className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-orange-400 bg-clip-text text-transparent">
                VENDEO
              </div>
            </div>
          </div>

          {/* Tagline completa */}
          <div className="mt-2 text-xs text-white/70 leading-snug">
            Motor de vendas para lojas físicas
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menu.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? navItemActive : navItemInactive}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* HEADER (topbar global) */}
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-6">
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
            <Link
              href="/dashboard/campaigns/new"
              className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
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

                  <LogoutButton
                    className="w-full text-left rounded-xl px-3 py-2 text-sm text-vendeo-text hover:bg-slate-100"
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}