"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/store", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          state,
          primary_color: "#16A34A",
          secondary_color: "#2563EB",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Erro ao criar loja.");
        return;
      }

      router.push("/app/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-vendeo-bg">
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mx-auto max-w-xl rounded-2xl border border-vendeo-border bg-white p-6 shadow-soft">
          <div className="inline-flex items-center gap-2 rounded-full border border-vendeo-border bg-white px-3 py-1 text-sm text-vendeo-muted">
            <span className="h-2 w-2 rounded-full bg-vendeo-green" />
            Primeiro acesso
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-vendeo-text">
            Vamos cadastrar sua loja
          </h1>
          <p className="mt-2 text-sm text-vendeo-muted">
            Isso permite que o Vendeo gere campanhas com a identidade e o contexto local da sua
            cidade.
          </p>

          <form onSubmit={onCreate} className="mt-6 grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-vendeo-text">Nome da loja</span>
              <input
                className="rounded-xl border border-vendeo-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Adega do Bairro"
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-sm font-medium text-vendeo-text">Cidade</span>
                <input
                  className="rounded-xl border border-vendeo-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Ibirama"
                  required
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium text-vendeo-text">Estado</span>
                <input
                  className="rounded-xl border border-vendeo-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Ex: SC"
                  required
                />
              </label>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              disabled={loading}
              className="rounded-xl bg-vendeo-green px-4 py-2 text-sm font-semibold text-white hover:bg-vendeo-greenLight disabled:opacity-60"
              type="submit"
            >
              {loading ? "Criando..." : "Criar loja e entrar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
