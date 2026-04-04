"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useEffect, useRef, useState } from "react";
import LogoutButton from "@/components/dashboard/LogoutButton";
import Brand from "@/components/dashboard/BrandLogo";
import { changelogData } from "@/lib/data/changelog";
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
import FeedbackButton from "@/components/feedback/FeedbackButton";
import { useNavigationGuard } from "@/lib/context/NavigationGuardContext";
import { ConfirmUnsavedModal } from "@/components/modals/ConfirmUnsavedModal";

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

import { createPortal } from "react-dom";
 
 /**
  * Tooltip FIXO (position: fixed)
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
   const [mounted, setMounted] = useState(false);
 
   useEffect(() => {
     setMounted(true);
   }, []);
 
   function computePosition() {
     const el = ref.current;
     if (!el) return;
 
     const r = el.getBoundingClientRect();
     const padding = 12;
     let left = r.right + 12;
     const tooltipWidth = 280;
     if (left + tooltipWidth > window.innerWidth - padding) {
       left = Math.max(padding, r.left - 12 - tooltipWidth);
     }
 
     let top = r.top + r.height / 2;
     const TOP_SAFE = 88;
     if (r.top < TOP_SAFE) {
       top = r.bottom + 14;
       setNearTop(true);
     } else {
       setNearTop(false);
     }
 
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
 
       {enabled && open && pos && mounted && createPortal(
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
         </span>,
         document.body
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
  
  const { requestNavigation, showModal, cancelNavigation, confirmNavigation } = useNavigationGuard();

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

  return (
    <div className="h-screen overflow-hidden flex bg-vendeo-bg text-vendeo-text">
      {/* SIDEBAR */}
      <aside className={cx("relative h-full overflow-hidden bg-[#0F3D2E] text-white flex flex-col border-r border-white/10 transition-[width] duration-200 ease-out hidden lg:flex", sidebarWidth)}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10" />
        </div>

        <div className={cx("relative z-10 border-b border-white/10", sidebarCollapsed ? "px-2 py-4 flex justify-center" : "p-6")}>
          {sidebarCollapsed ? (
            <FixedTooltip enabled={true} content={<div className="text-sm font-semibold text-black">Vendeo</div>}>
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl transition hover:bg-white/10">
                <Brand size="sm" align="center" showTagline={false} variant="dark" iconOnly />
              </div>
            </FixedTooltip>
          ) : (
            <Brand size="md" align="center" showTagline={true} variant="dark" />
          )}
        </div>

        <div className={cx("relative z-10", sidebarCollapsed ? "px-3 pt-4" : "px-4 pt-4")}>
          <Link
            href={ctaHref}
            onClick={(e) => { e.preventDefault(); requestNavigation(ctaHref); }}
            className={cx("group flex items-center rounded-2xl border border-white/10 bg-white/5 shadow-soft transition hover:bg-white/10", sidebarCollapsed ? "h-12 justify-center" : "h-12 px-3 gap-3")}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
              <Plus className="h-4 w-4" />
            </span>
            {!sidebarCollapsed && <span className="truncate text-sm font-semibold text-white">Nova campanha</span>}
          </Link>
          <div className={cx("my-4 h-px bg-white/10", sidebarCollapsed && "mx-1")} />
        </div>

        <nav className={cx("relative z-10 flex-1", sidebarCollapsed ? "px-2" : "px-3")}>
          <div className="space-y-1">
            {menu.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              const locked = item.requiresStore && !hasStore;
              const href = locked ? "/dashboard/store" : item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={(e) => { e.preventDefault(); requestNavigation(href); }}
                  className={cx("group relative flex items-center rounded-2xl transition select-none px-3 py-2 gap-3", active ? "bg-white text-[#0B2E22] shadow-soft" : "text-white/85 hover:bg-white/10 hover:text-white")}
                >
                  <span className={cx("inline-flex h-10 w-10 items-center justify-center rounded-xl transition", active ? "bg-[#0F3D2E] text-white" : "bg-white/10 text-white")}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {!sidebarCollapsed && <span className="truncate text-sm font-semibold">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={cx("relative z-10 px-3 py-3")}>
          <button type="button" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:bg-white/10">
            {sidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!sidebarCollapsed && <span className="font-semibold">Recolher</span>}
          </button>
          <div className="mt-3 flex justify-center w-full">
            <Link 
              href="/changelog" 
              onClick={(e) => { e.preventDefault(); requestNavigation("/changelog"); }}
              className="text-[11px] text-white/40 hover:text-white/80 transition-colors uppercase tracking-wider font-semibold"
            >
              {sidebarCollapsed ? "v1.0" : "Novidades - v1.0"}
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-6">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-vendeo-text truncate">{storeName ?? "Minha loja"}</h2>
            <div className="mt-1 text-sm text-vendeo-muted truncate">{storeSubtitle}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setOpenAccount(!openAccount)} className="flex items-center gap-2 rounded-xl border border-vendeo-border bg-white px-2 py-1.5 hover:bg-slate-50">
                <div className="h-9 w-9 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center text-sm font-semibold">{initial}</div>
                <div className="hidden md:block max-w-[220px] text-left">
                  <div className="text-xs text-vendeo-muted">Conta</div>
                  <div className="text-sm text-vendeo-text truncate">{email}</div>
                </div>
              </button>
              {openAccount && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-vendeo-border bg-white shadow-soft p-2 z-50">
                   <LogoutButton className="w-full text-left rounded-xl px-3 py-2 text-sm hover:bg-slate-100" />
                </div>
              )}
            </div>
          </div>
        </header>

        <main id="dashboard-main-content" className="flex-1 overflow-y-auto p-6">{children}</main>
        {user && <FeedbackButton />}
      </div>

      <ConfirmUnsavedModal
        isOpen={showModal}
        onClose={cancelNavigation}
        onConfirm={confirmNavigation}
      />
    </div>
  );
}