"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BrandLogo from "@/components/dashboard/BrandLogo";

export default function ResetPasswordPage() {
    const router = useRouter();

    const [checking, setChecking] = useState(true);
    const [hasRecoverySession, setHasRecoverySession] = useState(false);

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSubmit = useMemo(() => {
        if (loading) return false;
        if (!password || !confirm) return false;
        if (password.length < 8) return false;
        if (password !== confirm) return false;
        return true;
    }, [password, confirm, loading]);

    useEffect(() => {
        let mounted = true;

        async function init() {
            setChecking(true);
            setError(null);

            try {
                // Se o usuário chegou aqui pelo link do e-mail do Supabase,
                // normalmente já existe uma sessão de recovery válida.
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (!mounted) return;

                const session = data?.session ?? null;
                setHasRecoverySession(!!session);
            } catch (err: any) {
                if (!mounted) return;
                setHasRecoverySession(false);
                setError(err?.message ?? "Não foi possível validar o link.");
            } finally {
                if (!mounted) return;
                setChecking(false);
            }
        }

        init();

        return () => {
            mounted = false;
        };
    }, []);

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            setDone(true);

            // opcional (recomendado): encerrar sessão de recovery e voltar pro login
            await supabase.auth.signOut();
        } catch (err: any) {
            setError(err?.message ?? "Erro inesperado ao redefinir senha.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen text-zinc-900">
            {/* fundo premium (igual login) */}
            <div className="absolute inset-0 -z-10 bg-zinc-50">
                <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_20%,rgba(22,163,74,0.12),transparent_60%),radial-gradient(50%_45%_at_70%_25%,rgba(249,115,22,0.10),transparent_55%)]" />
                <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(24,24,27,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-10">
                <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2">
                    {/* ESQUERDA */}
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-3">
                            <BrandLogo variant="light" align="left" size="md" />
                        </div>

                        <div className="mt-8 text-3xl font-semibold leading-tight tracking-tight">
                            Redefina sua senha com segurança.
                        </div>

                        <div className="mt-3 max-w-md text-zinc-600">
                            Escolha uma nova senha e volte para o seu painel em poucos segundos.
                        </div>

                        <div className="mt-6 max-w-md rounded-2xl border border-zinc-200/70 bg-white/60 p-4 text-sm text-zinc-700 shadow-sm backdrop-blur">
                            Dica: use pelo menos <span className="font-semibold">8 caracteres</span> e evite
                            senhas repetidas.
                        </div>
                    </div>

                    {/* DIREITA */}
                    <div className="flex items-center justify-center">
                        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                            <div className="mb-5">
                                <div className="text-sm text-zinc-600">Recuperação de conta</div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Definir nova senha
                                </h1>
                                <div className="mt-2 text-sm text-zinc-600">
                                    {checking
                                        ? "Validando link…"
                                        : done
                                            ? "Senha atualizada com sucesso."
                                            : hasRecoverySession
                                                ? "Digite e confirme sua nova senha."
                                                : "Esse link não é válido ou expirou."}
                                </div>
                            </div>

                            {error && (
                                <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {checking ? (
                                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-700">
                                    Carregando…
                                </div>
                            ) : done ? (
                                <div className="grid gap-3">
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
                                        Pronto! Agora você já pode entrar com sua nova senha.
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => router.push("/login?mode=login")}
                                        className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 font-medium text-white transition hover:bg-emerald-700"
                                    >
                                        Ir para o login
                                    </button>
                                </div>
                            ) : hasRecoverySession ? (
                                <form onSubmit={handleUpdatePassword} className="grid gap-3">
                                    <div className="grid gap-1">
                                        <label className="text-sm font-medium">Nova senha</label>
                                        <input
                                            className="h-11 rounded-xl border border-zinc-200 px-3 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            minLength={8}
                                            required
                                            autoComplete="new-password"
                                        />
                                        <div className="text-xs text-zinc-500">Mínimo de 8 caracteres.</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <label className="text-sm font-medium">Confirmar senha</label>
                                        <input
                                            className="h-11 rounded-xl border border-zinc-200 px-3 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirm}
                                            onChange={(e) => setConfirm(e.target.value)}
                                            minLength={8}
                                            required
                                            autoComplete="new-password"
                                        />
                                        {confirm && password !== confirm && (
                                            <div className="text-xs text-red-600">As senhas não conferem.</div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!canSubmit}
                                        className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                                    >
                                        {loading ? "Salvando..." : "Atualizar senha"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => router.push("/login?mode=login")}
                                        className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
                                        disabled={loading}
                                    >
                                        Voltar para o login
                                    </button>
                                </form>
                            ) : (
                                <div className="grid gap-3">
                                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-700">
                                        Solicite um novo link de recuperação na tela de login.
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => router.push("/login?mode=login")}
                                        className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 font-medium text-white transition hover:bg-emerald-700"
                                    >
                                        Voltar para o login
                                    </button>
                                </div>
                            )}

                            <div className="mt-4 text-center text-xs text-zinc-500">
                                Se tiver qualquer problema, solicite um novo link de recuperação.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}