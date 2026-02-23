"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawRedirect = searchParams.get("redirect") ?? "/app";
  const redirectTo = rawRedirect.startsWith("%2F")
    ? decodeURIComponent(rawRedirect)
    : rawRedirect;

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectTo}`,
          },
        });
        if (signUpError) throw signUpError;

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        router.push(redirectTo);
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;

      router.push(redirectTo);
    } catch (err: any) {
      setError(err?.message ?? "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-10">
        <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2">
          {/* lado esquerdo (marca) */}
          <div className="hidden flex-col justify-center md:flex">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600" />
              <div>
                <div className="text-lg font-semibold">Vendeo</div>
                <div className="text-sm text-zinc-600">
                  Postou, vendeo!
                </div>
              </div>
            </div>

            <div className="mt-8 text-3xl font-semibold leading-tight">
              Conteúdo pronto para lojas físicas venderem mais.
            </div>
            <div className="mt-3 text-zinc-600">
              Gere posts, roteiros de reels e um plano semanal com foco em conversão local.
            </div>
          </div>

          {/* card login */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <div className="text-sm text-zinc-600">
                  {mode === "signup" ? "Criar conta" : "Entrar"}
                </div>
                <h1 className="text-2xl font-semibold">
                  {mode === "signup" ? "Começar no Vendeo" : "Bem-vindo de volta"}
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-3">
                <div className="grid gap-1">
                  <label className="text-sm font-medium">E-mail</label>
                  <input
                    className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                    type="email"
                    placeholder="voce@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-sm font-medium">Senha</label>
                  <input
                    className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-11 rounded-xl bg-emerald-600 font-medium text-white disabled:opacity-60"
                >
                  {loading ? "Processando..." : mode === "signup" ? "Criar conta" : "Entrar"}
                </button>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </form>

              <div className="mt-4">
                {mode === "signup" ? (
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                    disabled={loading}
                  >
                    Já tenho conta (entrar)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                    disabled={loading}
                  >
                    Criar conta
                  </button>
                )}

                <div className="mt-3 text-center text-xs text-zinc-500">
                  Ao continuar, você concorda com os termos do Vendeo.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}