"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

import BrandLogo from "@/components/dashboard/BrandLogo";

type View = "auth" | "forgot";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const modeParam = searchParams.get("mode");
  const initialMode: "signup" | "login" =
    modeParam === "login" ? "login" : "signup";

  // aceita next (novo) e redirect (legado). fallback agora é /dashboard
  const rawNext =
    searchParams.get("next") ?? searchParams.get("redirect") ?? "/dashboard";

  const redirectTo = rawNext.startsWith("%2F")
    ? decodeURIComponent(rawNext)
    : rawNext;

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [view, setView] = useState<View>("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setView("auth");
    setResetSent(false);
  }, [initialMode]);

  const title = useMemo(() => {
    if (view === "forgot") return "Recuperar acesso";
    if (mode === "signup") return "Começar no Vendeo";
    return "Bem-vindo de volta";
  }, [mode, view]);

  const subtitle = useMemo(() => {
    if (view === "forgot") return "Esqueci minha senha";
    if (mode === "signup") return "Criar conta";
    return "Entrar";
  }, [mode, view]);

  function friendlyError(msg?: string) {
    const m = (msg ?? "").toLowerCase();

    if (m.includes("invalid login") || m.includes("invalid")) {
      return "E-mail ou senha inválidos.";
    }
    if (m.includes("password") && m.includes("least")) {
      return "Sua senha precisa ser um pouco mais forte (mínimo exigido pelo Supabase).";
    }
    if (m.includes("email") && m.includes("already")) {
      return "Esse e-mail já está em uso. Tente entrar em vez de criar conta.";
    }
    if (m.includes("network") || m.includes("fetch")) {
      return "Sem conexão no momento. Verifique sua internet e tente novamente.";
    }
    return msg ?? "Erro inesperado.";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || oauthLoading) return;

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

        // mantém seu comportamento: criar conta e já entrar
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        router.push(redirectTo);
        router.refresh();
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;

      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(friendlyError(err?.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (loading || oauthLoading) return;

    setOauthLoading(true);
    setError(null);

    try {
      const origin = window.location.origin;

      // Importante: redirectTo precisa ser uma URL absoluta
      const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(
        redirectTo
      )}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) throw error;
      // Em OAuth normalmente você será redirecionado pelo Supabase, então não precisa router.push aqui.
    } catch (err: any) {
      setError(friendlyError(err?.message));
      setOauthLoading(false);
    }
  }

  async function handleSendReset(e: React.FormEvent) {
    e.preventDefault();
    if (loading || oauthLoading) return;

    setLoading(true);
    setError(null);
    setResetSent(false);

    try {
      const origin = window.location.origin;

      // URL para onde o usuário volta após clicar no e-mail de reset
      // Ajuste se você tiver uma página específica de "update password".
      const redirectUrl = `${origin}/auth/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setResetSent(true);
    } catch (err: any) {
      setError(friendlyError(err?.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen text-zinc-900">
      {/* fundo premium (bem sutil) */}
      <div className="absolute inset-0 -z-10 bg-zinc-50">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_20%,rgba(22,163,74,0.12),transparent_60%),radial-gradient(50%_45%_at_70%_25%,rgba(249,115,22,0.10),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(24,24,27,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-10">
        <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2">
          {/* ESQUERDA: marca/hero */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <BrandLogo variant="light" align="left" size="md" />
            </div>

            <div className="mt-8 text-3xl font-semibold leading-tight tracking-tight">
              Conteúdo pronto para lojas físicas venderem mais.
            </div>

            <div className="mt-3 max-w-md text-zinc-600">
              Gere posts, roteiros de reels e um plano semanal com foco em conversão
              local — do jeito certo para o seu bairro.
            </div>

            <div className="mt-6 grid max-w-md gap-3 rounded-2xl border border-zinc-200/70 bg-white/60 p-4 shadow-sm backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-600" />
                <div className="text-sm text-zinc-700">
                  Inteligência de marketing local (datas, urgência, público e preço).
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
                <div className="text-sm text-zinc-700">
                  Rápido e simples: escolheu o produto → gerou → postou.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-zinc-900" />
                <div className="text-sm text-zinc-700">
                  Sem agência. Sem designer. Sem perder tempo.
                </div>
              </div>
            </div>
          </div>

          {/* DIREITA: card */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <div className="text-sm text-zinc-600">{subtitle}</div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

                <div className="mt-2 text-sm text-zinc-600">
                  {view === "forgot"
                    ? "Informe seu e-mail. Vamos enviar um link para redefinir sua senha."
                    : mode === "signup"
                      ? "Teste em poucos minutos — sem cartão e sem compromisso."
                      : "Acesse seu painel e continue criando campanhas."}
                </div>
              </div>

              {/* OAuth Google */}
              {view === "auth" && (
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={loading || oauthLoading}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:opacity-60"
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white">
                      <span className="text-base">G</span>
                    </span>

                    {oauthLoading ? "Conectando com Google..." : "Entrar com Google"}
                  </button>

                  <div className="mt-2 text-[12px] leading-snug text-zinc-500">
                    Dica: use a mesma conta Google do e-mail cadastrado para acessar sua loja.
                  </div>

                  {oauthLoading && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Abrindo o Google… você vai voltar automaticamente.
                    </div>
                  )}
                </div>
              )}

              {view === "auth" && (
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-zinc-200" />
                  <div className="text-xs text-zinc-500">ou</div>
                  <div className="h-px flex-1 bg-zinc-200" />
                </div>
              )}

              {/* FORM */}
              {view === "auth" ? (
                <form onSubmit={handleSubmit} className="grid gap-3">
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">E-mail</label>
                    <input
                      className="h-11 rounded-xl border border-zinc-200 px-3 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                      type="email"
                      placeholder="voce@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="grid gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Senha</label>

                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => {
                            setView("forgot");
                            setError(null);
                            setResetSent(false);
                          }}
                          className="text-xs font-medium text-emerald-700 hover:underline disabled:opacity-60"
                          disabled={loading || oauthLoading}
                        >
                          Esqueci minha senha
                        </button>
                      )}
                    </div>

                    <input
                      className="h-11 rounded-xl border border-zinc-200 px-3 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={
                        mode === "signup" ? "new-password" : "current-password"
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || oauthLoading}
                    className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {loading
                      ? "Processando..."
                      : mode === "signup"
                        ? "Criar conta"
                        : "Entrar"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSendReset} className="grid gap-3">
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">E-mail</label>
                    <input
                      className="h-11 rounded-xl border border-zinc-200 px-3 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                      type="email"
                      placeholder="voce@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || oauthLoading}
                    className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {loading ? "Enviando..." : "Enviar link de recuperação"}
                  </button>

                  {resetSent && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                      Se esse e-mail existir, enviamos um link para redefinir sua senha.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setView("auth");
                      setError(null);
                      setResetSent(false);
                    }}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
                    disabled={loading || oauthLoading}
                  >
                    Voltar
                  </button>
                </form>
              )}

              {error && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* FOOTER */}
              {view === "auth" && (
                <div className="mt-4 grid gap-3">
                  {mode === "signup" ? (
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
                      disabled={loading || oauthLoading}
                    >
                      Já tenho conta
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
                      disabled={loading || oauthLoading}
                    >
                      Criar conta
                    </button>
                  )}

                  <div className="text-center text-xs text-zinc-500">
                    Ao continuar, você concorda com os termos do Vendeo.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}