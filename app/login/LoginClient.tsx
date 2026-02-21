"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") ?? "/app";

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectTo}`,
          },
        });

        if (error) throw error;

        // Se confirmação de e-mail estiver ativa, session pode vir null
        if (!data.session) {
          setInfo("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
          return;
        }

        router.push(redirectTo);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push(redirectTo);
    } catch (err: any) {
      setError(err?.message ?? "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Vendeo</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setMode("signup")} disabled={loading}>
          Criar conta
        </button>
        <button type="button" onClick={() => setMode("login")} disabled={loading}>
          Já tenho conta
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Processando..." : mode === "signup" ? "Criar conta" : "Entrar"}
        </button>

        {error && <div style={{ color: "red" }}>{error}</div>}
        {info && <div style={{ color: "green" }}>{info}</div>}
      </form>
    </main>
  );
}
