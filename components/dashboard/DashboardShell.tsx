"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/dashboard/LogoutButton";

type Props = {
  children: React.ReactNode;
  user?: { email?: string | null } | null;
};

export function DashboardShell({ children, user }: Props) {
  const pathname = usePathname();

  const navItemBase =
    "block w-full rounded-xl px-3 py-2 text-sm font-medium transition";
  const navItemInactive = `${navItemBase} text-vendeo-text hover:bg-slate-100`;
  const navItemActive = `${navItemBase} bg-vendeo-green text-white shadow-soft`;

  const menu = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/store", label: "Lojas" },
    { href: "/dashboard/campaigns", label: "Campanhas" },
    { href: "/dashboard/plans", label: "Planos semanais" },
  ];

  const titleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/store": "Lojas",
    "/dashboard/campaigns": "Campanhas",
    "/dashboard/plans": "Planos semanais",
  };

  const pageTitle = titleMap[pathname] ?? "Painel";

  return (
    <div className="min-h-screen flex bg-vendeo-bg text-vendeo-text">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-vendeo-border flex flex-col">
        {/* Marca */}
        <div className="p-6 border-b border-vendeo-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-vendeo-green shadow-soft" />
            <div className="leading-tight">
              <div className="text-lg font-semibold text-vendeo-text">Vendeo</div>
              <div className="text-sm text-vendeo-muted">Motor de vendas</div>
            </div>
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

        {/* Conta */}
        <div className="p-4 border-t border-vendeo-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-vendeo-green text-white flex items-center justify-center text-sm font-semibold shadow-soft">
              {(user?.email?.charAt(0) || "U").toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs text-vendeo-muted">Conta</div>
              <div className="text-sm text-vendeo-text truncate">
                {user?.email ?? "—"}
              </div>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <Link href="/profile" className={navItemInactive}>
              Perfil
            </Link>

            {/* Logout como button, mas com o MESMO estilo do Link */}
            <LogoutButton className={navItemInactive} />
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-vendeo-border flex items-center justify-between px-6">
          <div>
            <div className="text-xs text-vendeo-muted">Painel Vendeo</div>
            <h2 className="font-semibold text-vendeo-text">{pageTitle}</h2>
          </div>

          {/* CTA contextual */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/campaigns/new"
              className="rounded-xl bg-vendeo-green px-4 py-2 text-sm font-semibold text-white hover:bg-vendeo-greenLight shadow-soft"
            >
              Nova campanha
            </Link>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}