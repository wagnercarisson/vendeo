"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useEffect, useRef, useState } from "react";
import LogoutButton from "@/components/dashboard/LogoutButton";
import Brand from "@/components/dashboard/BrandLogo";
import {
  LayoutDashboard,
  Store,
  Megaphone,
  CalendarRange,
  Plus,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
} from "lucide-react";

type Props = {
  children: React.ReactNode;
  user?: { email?: string | null } | null;
  storeId?: string | null;
  storeName?: string | null;
  storeCity?: string | null;
  storeState?: string | null;
};

type NavItem = {
  href: string;
  label: string;
  requiresStore: boolean;
  icon: React.ElementType;
  badge?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Tooltip FIXO (position: fixed)
 * - não é cortado por overflow
 * - faz clamp no viewport
 * - se estiver muito perto do topo, abre abaixo do gatilho
 */
function FixedTooltip({
  children,
  content,
  enabled,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  enabled: boolean;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [nearTop, setNearTop] = useState(false);

  function computePosition() {
    const el = ref.current;
    if (!el) return;

    const r = el.getBoundingClientRect();

    const padding = 12;

    // tooltip à direita do trigger (preferência)
    let left = r.right + 12;

    // fallback: se não cabe à direita, tenta à esquerda
    const tooltipWidth = 280; // aproximado
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = Math.max(padding, r.left - 12 - tooltipWidth);
    }

    // top padrão centralizado
    let top = r.top + r.height / 2;

    // perto do topo: abre abaixo (evita topbar)
    const TOP_SAFE = 88;
    if (r.top < TOP_SAFE) {
      top = r.bottom + 14;
      setNearTop(true);
    } else {
      setNearTop(false);
    }

    // clamp vertical
    const maxTop = window.innerHeight - padding;
    top = Math.min(Math.max(top, padding), maxTop);

    setPos({ top, left });
  }

  useEffect(() => {
    if (!open) return;

    computePosition();

    const onScroll = () => computePosition();
    const onResize = () => computePosition();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <span
      ref={ref}
      className="relative"
      onMouseEnter={() => {
        if (!enabled) return;
        setOpen(true);
        requestAnimationFrame(() => computePosition());
      }}
      onMouseLeave={() => setOpen(false)}
    >
      {children}

      {enabled && open && pos && (
        <span
          style={{
            position: "fixed",
            left: pos.left,
            top: pos.top,
            transform: nearTop ? "translateY(0)" : "translateY(-50%)",
            zIndex: 2147483647,
          }}
          className="pointer-events-none"
        >
          <span className="block min-w-[280px] rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs text-black shadow-lg">
            {content}
          </span>
        </span>
      )}
    </span>
  );
}

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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem("vendeo.sidebar.collapsed");
      if (v === "1") setSidebarCollapsed(true);
    } catch { }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("vendeo.sidebar.collapsed", sidebarCollapsed ? "1" : "0");
    } catch { }
  }, [sidebarCollapsed]);

  const hasStore = !!storeId;

  const menu = useMemo<NavItem[]>(
    () => [
      { href: "/dashboard", label: "Dashboard", requiresStore: false, icon: LayoutDashboard },
      { href: "/dashboard/store", label: "Loja", requiresStore: false, icon: Store },
      { href: "/dashboard/campaigns", label: "Campanhas", requiresStore: true, icon: Megaphone, badge: "Novo" },
      { href: "/dashboard/plans", label: "Planos semanais", requiresStore: true, icon: CalendarRange },
    ],
    []
  );

  const email = user?.email ?? "—";
  const initial = (user?.email?.charAt(0) || "U").toUpperCase();

  const storeSubtitle =
    storeCity && storeState ? `${storeCity}, ${storeState}` : "Endereço não informado";

  const sidebarWidth = sidebarCollapsed ? "w-[84px]" : "w-[304px]";

  const ctaHref = hasStore ? "/dashboard/campaigns/new" : "/dashboard/store";
  const ctaSubtitle = hasStore ? "Gerar post em segundos" : "Cadastre sua loja para liberar";

  return (
    <div className="h-screen overflow-hidden flex bg-vendeo-bg text-vendeo-text">
      {/* SIDEBAR */}
      <aside
        className={cx(
          "relative h-full overflow-hidden bg-[#0F3D2E] text-white flex flex-col",
          "border-r border-white/10",
          "transition-[width] duration-200 ease-out",
          sidebarWidth
        )}
      >
        {/* iluminação premium do fundo */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute top-24 -right-24 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10" />
        </div>

        {/* Marca */}
        <div
          className={cx(
            "relative z-10 border-b border-white/10",
            sidebarCollapsed ? "px-2 py-4 flex justify-center" : "p-6"
          )}
        >
          {sidebarCollapsed ? (
            <FixedTooltip
              enabled={true}
              content={
                <div className="flex items-start gap-3">
                  {/* mini header: ícone pequeno + título */}
                  <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/10">
                    <Brand size="sm" align="center" showTagline={false} variant="light" iconOnly />
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-black leading-tight">Vendeo</div>
                    <div className="mt-0.5 text-xs text-black/60 leading-snug">
                      Motor de vendas para lojas físicas
                    </div>
                  </div>
                </div>
              }
            >
              {/* ✅ só o ícone (sem caixa), mas com área de hover confortável */}
              <div
                className={cx(
                  "inline-flex items-center justify-center",
                  "h-12 w-12 rounded-2xl",
                  "transition hover:bg-white/10"
                )}
                aria-label="Vendeo"
              >
                <Brand size="sm" align="center" showTagline={false} variant="dark" iconOnly />
              </div>
            </FixedTooltip>
          ) : (
            <Brand size="md" align="center" showTagline={true} variant="dark" />
          )}
        </div>

        {/* CTA principal (1 linha; subtítulo só no tooltip) */}
        <div className={cx("relative z-10", sidebarCollapsed ? "px-3 pt-4" : "px-4 pt-4")}>
          <FixedTooltip
            enabled={sidebarCollapsed}
            content={
              <span className="block">
                <span className="block text-sm font-semibold">Nova campanha</span>
                <span className="block text-black/60">{ctaSubtitle}</span>
              </span>
            }
          >
            <Link
              href={ctaHref}
              className={cx(
                "group flex items-center rounded-2xl border border-white/10",
                "bg-white/5 shadow-soft transition hover:bg-white/10",
                sidebarCollapsed ? "h-12 justify-center" : "h-12 px-3 gap-3"
              )}
              title={!hasStore ? "Cadastre sua loja para liberar campanhas" : undefined}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white transition group-hover:bg-orange-600">
                <Plus className="h-4 w-4" />
              </span>

              {!sidebarCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="truncate whitespace-nowrap text-sm font-semibold leading-tight text-white">
                      Nova campanha
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/85 whitespace-nowrap">
                      <Sparkles className="h-3.5 w-3.5" />
                      {hasStore ? "Pronto" : "Onboarding"}
                    </span>
                  </div>
                </>
              )}
            </Link>
          </FixedTooltip>

          <div className={cx("my-4 h-px bg-white/10", sidebarCollapsed && "mx-1")} />
        </div>

        {/* Menu */}
        <nav className={cx("relative z-10 flex-1", sidebarCollapsed ? "px-2" : "px-3")}>
          <div className={cx("space-y-1", sidebarCollapsed && "space-y-2")}>
            {menu.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));

              const locked = item.requiresStore && !hasStore;
              const href = locked ? "/dashboard/store" : item.href;

              const Icon = item.icon;

              const base = "group relative flex items-center rounded-2xl transition select-none";
              const padding = sidebarCollapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2";

              const className = cx(
                base,
                padding,
                locked
                  ? "bg-white/5 text-white/60 cursor-pointer hover:bg-white/5"
                  : active
                    ? "bg-white text-[#0B2E22] shadow-soft"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
              );

              const tooltipContent = (
                <span className="block">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  {active ? (
                    <span className="block text-black/60">Você já está aqui</span>
                  ) : locked ? (
                    <span className="block text-black/60">Requer loja</span>
                  ) : (
                    <span className="block text-black/60">Abrir</span>
                  )}
                </span>
              );

              const commonChildren = (
                <>
                  <span
                    className={cx(
                      "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-orange-500",
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                    )}
                  />

                  <span
                    className={cx(
                      "inline-flex h-10 w-10 items-center justify-center rounded-xl transition",
                      active ? "bg-[#0F3D2E] text-white" : "bg-white/10 text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  {!sidebarCollapsed && (
                    <>
                      <span className="truncate text-sm font-semibold">{item.label}</span>

                      {locked && (
                        <span className="ml-auto inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/80 whitespace-nowrap">
                          Requer loja
                        </span>
                      )}

                      {!locked && item.badge && (
                        <span className="ml-auto inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/90 whitespace-nowrap">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </>
              );

              const node = active ? (
                <div key={item.href} className={cx(className, "cursor-default")} aria-current="page">
                  {commonChildren}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={href}
                  className={className}
                  aria-disabled={locked ? true : undefined}
                  title={locked ? "Cadastre sua loja para liberar este recurso" : undefined}
                >
                  {commonChildren}
                </Link>
              );

              return (
                <FixedTooltip key={item.href} enabled={sidebarCollapsed} content={tooltipContent}>
                  {node}
                </FixedTooltip>
              );
            })}
          </div>

          {!hasStore && !sidebarCollapsed && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div className="text-xs font-semibold text-white">Você está a 1 passo</div>
              <div className="mt-1 text-xs text-white/75 leading-snug">
                Cadastre sua loja para liberar campanhas, reels e planos semanais.
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className={cx("relative z-10", sidebarCollapsed ? "px-2 py-3" : "px-3 py-3")}>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            className={cx(
              "flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10",
              "bg-white/5 px-3 py-2 text-sm text-white/85 shadow-soft transition",
              "hover:bg-white/10 hover:text-white"
            )}
            aria-label={sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
            {!sidebarCollapsed && <span className="font-semibold">Recolher</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-6">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-vendeo-text truncate leading-tight">
              {storeName ?? "Minha loja"}
            </h2>
            <div className="mt-1 text-sm text-vendeo-muted truncate">{storeSubtitle}</div>
          </div>

          <div className="flex items-center gap-3">
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

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}