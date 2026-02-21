"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get("redirect") || "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const fn =
        mode === "login"
          ? supabase.auth.signInWithPassword
          : supabase.auth.signUp;

      const { error } = await fn({ email, password });

      if (error) {
        setError(error.message);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-vendeo-bg">
      <header className="border-b border-vendeo-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-vendeo-green shadow-soft" />
            <div className="font-semibold text-vendeo-text">Vendeo</div>
          </Link>
          <div className="text-sm text-vendeo-muted">
            Entre para criar campanhas que vendem
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mx-auto max-w-md rounded-2xl border border-vendeo-border bg-white p-6 shadow-soft">
          <div className="text-sm text-vendeo-muted">
            {mode === "login" ? "Acessar painel" : "Criar conta"}
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-vendeo-text">
            {mode === "login" ? "Entrar no Vendeo" : "Começar no Vendeo"}
          </h1>

          <form onSubmit={onSubmit} className="mt-6 grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-vendeo-text">E-mail</span>
              <input
                className="rounded-xl border border-vendeo-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="voce@empresa.com"
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-vendeo-text">Senha</span>
              <input
                className="rounded-xl border border-vendeo-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              disabled={loading}
              className="mt-2 rounded-xl bg-vendeo-green px-4 py-2 text-sm font-semibold text-white hover:bg-vendeo-greenLight disabled:opacity-60"
              type="submit"
            >
              {loading
                ? "Aguarde..."
                : mode === "login"
                ? "Entrar"
                : "Criar conta"}
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="rounded-xl border border-vendeo-border bg-white px-4 py-2 text-sm font-semibold text-vendeo-text hover:bg-slate-50"
            >
              {mode === "login"
                ? "Não tenho conta (criar agora)"
                : "Já tenho conta (entrar)"}
            </button>

            <div className="pt-2 text-center text-xs text-vendeo-muted">
              Ao continuar, você concorda com os termos do Vendeo.
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
