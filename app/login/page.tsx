import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-vendeo-bg">
          <header className="border-b border-vendeo-border bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-vendeo-green shadow-soft" />
                <div className="font-semibold text-vendeo-text">Vendeo</div>
              </div>
              <div className="text-sm text-vendeo-muted">Carregando…</div>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-12">
            <div className="mx-auto max-w-md rounded-2xl border border-vendeo-border bg-white p-6 shadow-soft">
              <div className="h-6 w-40 rounded bg-slate-100" />
              <div className="mt-3 h-8 w-56 rounded bg-slate-100" />
              <div className="mt-6 grid gap-3">
                <div className="h-16 rounded bg-slate-50" />
                <div className="h-16 rounded bg-slate-50" />
                <div className="h-10 rounded bg-slate-100" />
                <div className="h-10 rounded bg-slate-50" />
              </div>
            </div>
          </main>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
