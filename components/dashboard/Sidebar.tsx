"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Megaphone,
    CalendarRange,
    Store,
    Plus,
    ChevronsLeft,
    ChevronsRight,
    Sparkles,
} from "lucide-react";
import BrandLogo from "@/components/dashboard/BrandLogo";

type NavItem = {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

/**
 * Tooltip leve e confiável.
 * Importante:
 * - wrapper com overflow-visible
 * - tooltip com z bem alto
 */
function Tooltip({
    children,
    content,
    disabled,
}: {
    children: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
}) {
    return (
        <span className="relative group overflow-visible">
            {children}

            {!disabled && (
                <span
                    className={cx(
                        "pointer-events-none absolute left-full top-1/2 -translate-y-1/2",
                        "ml-3 hidden group-hover:block",
                        "z-[999]"
                    )}
                >
                    <span className="block rounded-xl border border-black/10 bg-white px-3 py-2 text-xs text-black shadow-lg">
                        {content}
                    </span>
                </span>
            )}
        </span>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = React.useState(false);

    React.useEffect(() => {
        try {
            const v = localStorage.getItem("vendeo.sidebar.collapsed");
            if (v === "1") setCollapsed(true);
        } catch { }
    }, []);

    React.useEffect(() => {
        try {
            localStorage.setItem("vendeo.sidebar.collapsed", collapsed ? "1" : "0");
        } catch { }
    }, [collapsed]);

    const navMain: NavItem[] = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Campanhas", href: "/dashboard/campaigns", icon: Megaphone, badge: "Novo" },
        { label: "Plano Semanal", href: "/dashboard/plans", icon: CalendarRange },
        { label: "Loja", href: "/dashboard/store", icon: Store },
    ];

    const widthClass = collapsed ? "w-[76px]" : "w-[280px]";

    // CTA: 1 linha. Tooltip só no modo colapsado.
    const ctaTitle = "Nova campanha";
    const ctaSubtitle = "Gerar post em segundos";

    return (
        <aside
            className={cx(
                "relative h-[100dvh] shrink-0 border-r border-black/10 bg-white",
                "transition-[width] duration-200 ease-out",
                // CRÍTICO: permitir tooltip “sair” da sidebar
                "overflow-visible",
                widthClass
            )}
        >
            {/* Glow sutil */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-emerald-500/10 to-transparent" />

            <div className="relative flex h-full flex-col overflow-visible">
                {/* Header */}
                <div className={cx("flex items-center gap-3 px-4 py-4", collapsed && "justify-center px-0")}>
                    <div className={cx("flex items-center gap-3", collapsed && "justify-center")}>
                        <BrandLogo size="sm" align="left" showTagline={!collapsed} variant="light" />
                    </div>

                    {!collapsed && (
                        <div className="ml-auto flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-1 text-[11px] text-black/70 shadow-sm">
                                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                                Plano Free
                            </span>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className={cx("px-4", collapsed && "px-3")}>
                    {collapsed ? (
                        <Tooltip
                            content={
                                <span className="block">
                                    <span className="block font-semibold">{ctaTitle}</span>
                                    <span className="block text-black/60">{ctaSubtitle}</span>
                                </span>
                            }
                        >
                            <Link
                                href="/dashboard/campaigns/new"
                                className={cx(
                                    "relative flex w-full items-center rounded-xl",
                                    "border border-black/10 bg-gradient-to-b from-white to-black/[0.02]",
                                    "shadow-sm transition",
                                    "active:translate-y-0",
                                    "h-10 justify-center"
                                )}
                            >
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                                    <Plus className="h-4 w-4" />
                                </span>
                            </Link>
                        </Tooltip>
                    ) : (
                        <Link
                            href="/dashboard/campaigns/new"
                            className={cx(
                                "relative flex h-10 w-full items-center gap-2 rounded-xl px-3",
                                "border border-black/10 bg-gradient-to-b from-white to-black/[0.02]",
                                "shadow-sm transition",
                                "active:translate-y-0"
                            )}
                        >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                                <Plus className="h-4 w-4" />
                            </span>

                            <span className="min-w-0 truncate whitespace-nowrap text-sm font-medium text-black">
                                {ctaTitle}
                            </span>

                            <span className="ml-auto shrink-0 whitespace-nowrap rounded-md border border-black/10 bg-white px-2 py-1 text-[11px] text-black/60">
                                Ctrl + N
                            </span>
                        </Link>
                    )}

                    <div className="my-4 h-px bg-black/10" />
                </div>

                {/* Nav */}
                <nav className={cx("flex-1 px-2", collapsed && "px-2")}>
                    <div className={cx("space-y-1", collapsed && "space-y-2")}>
                        {navMain.map((item) => {
                            const active =
                                pathname === item.href ||
                                (item.href !== "/dashboard" && pathname?.startsWith(item.href));

                            const Icon = item.icon;

                            const link = (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cx(
                                        "group relative flex items-center gap-3 rounded-xl px-3 py-2",
                                        "transition",
                                        active
                                            ? "bg-emerald-500/10 text-emerald-800"
                                            : "text-black/70 hover:bg-black/[0.04] hover:text-black",
                                        collapsed && "justify-center px-2"
                                    )}
                                >
                                    {/* Active rail */}
                                    <span
                                        className={cx(
                                            "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-600",
                                            active ? "opacity-100" : "opacity-0 group-hover:opacity-30"
                                        )}
                                    />

                                    <span
                                        className={cx(
                                            "inline-flex h-9 w-9 items-center justify-center rounded-lg",
                                            active
                                                ? "bg-emerald-600 text-white shadow-sm"
                                                : "bg-black/[0.04] text-black/70"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </span>

                                    {!collapsed && (
                                        <>
                                            <span className="text-sm font-medium">{item.label}</span>

                                            {item.badge && (
                                                <span className="ml-auto inline-flex items-center rounded-full border border-black/10 bg-white px-2 py-0.5 text-[11px] text-black/70 shadow-sm">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Link>
                            );

                            return (
                                <Tooltip
                                    key={item.href}
                                    // Menu: tooltip só quando colapsada
                                    disabled={!collapsed}
                                    content={<span className="font-semibold">{item.label}</span>}
                                >
                                    {link}
                                </Tooltip>
                            );
                        })}
                    </div>

                    {!collapsed && (
                        <div className="mt-6 rounded-2xl border border-black/10 bg-gradient-to-b from-white to-black/[0.02] p-3 shadow-sm">
                            <div className="flex items-start gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                                    <Sparkles className="h-4 w-4" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-black">Dica rápida</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-black/60">
                                        Gere campanhas e plano semanal para manter sua loja sempre postando com consistência.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Footer */}
                <div className={cx("px-3 py-3", collapsed && "px-2")}>
                    <button
                        type="button"
                        onClick={() => setCollapsed((v) => !v)}
                        className={cx(
                            "flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2",
                            "text-sm text-black/70 shadow-sm transition",
                            "hover:bg-black/[0.03] hover:text-black"
                        )}
                        aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
                    >
                        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
                        {!collapsed && <span className="text-sm font-medium">Recolher</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}