"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/dashboard/LogoutButton";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menu = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/store", label: "Lojas" },
    { href: "/dashboard/campaigns", label: "Campanhas" },
    { href: "/dashboard/plans", label: "Planos semanais" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        {/* Marca */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">Vendeo</h1>
          <p className="text-xs text-gray-500">Motor de vendas</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menu.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Conta */}
        <div className="p-4 border-t space-y-2 text-sm">
          <Link
            href="/profile"
            className="block rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
          >
            Perfil
          </Link>

          <div className="rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center px-6">
          <h2 className="font-semibold text-gray-800">
            Painel Vendeo
          </h2>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}