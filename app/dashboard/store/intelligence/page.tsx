"use client";

import { Suspense, lazy } from "react";
import Link from "next/link";
import { IntelligenceTabs } from "./components/IntelligenceTabs";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { SaveIndicator } from "./components/SaveIndicator";
import { useIntelligenceForm } from "./hooks/useIntelligenceForm";
import { useOfflineDetection } from "./hooks/useOfflineDetection";

const Tab1PublicoTom = lazy(() =>
  import("./components/Tab1-PublicoTom").then((module) => ({ default: module.Tab1PublicoTom }))
);
const Tab2Posicionamento = lazy(() =>
  import("./components/Tab2-Posicionamento").then((module) => ({ default: module.Tab2Posicionamento }))
);
const Tab3Conversao = lazy(() =>
  import("./components/Tab3-Conversao").then((module) => ({ default: module.Tab3Conversao }))
);
const Tab4Avancado = lazy(() =>
  import("./components/Tab4-Avancado").then((module) => ({ default: module.Tab4Avancado }))
);

const TABS = [
  {
    key: "publico-tom",
    label: "Público & Tom",
    shortLabel: "Público",
    description: "Defina voz, público e produtos que puxam venda.",
  },
  {
    key: "posicionamento",
    label: "Posicionamento",
    shortLabel: "Posição",
    description: "Mostre como a loja compete, precifica e se diferencia.",
  },
  {
    key: "conversao",
    label: "Conversão",
    shortLabel: "Conversão",
    description: "Calibre urgência, prova social e CTAs que funcionam.",
  },
  {
    key: "avancado",
    label: "Avançado",
    shortLabel: "Avançado",
    description: "Ajuste linguagem fina, emojis e tamanho ideal da copy.",
  },
];

export default function IntelligencePage() {
  const isOnline = useOfflineDetection();
  const {
    loading,
    loadError,
    activeTab,
    setActiveTab,
    context,
    updateField,
    toggleArrayValue,
    setStringList,
    setSuccessfulPastCtas,
    scoreSummary,
    validationErrors,
    saving,
    saveError,
    saveMessage,
    retrySave,
  } = useIntelligenceForm();

  const panelFallback = (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="h-40 animate-pulse rounded-3xl bg-zinc-100" />
      <div className="h-40 animate-pulse rounded-3xl bg-zinc-100" />
    </div>
  );

  const PanelComponent = [
    Tab1PublicoTom,
    Tab2Posicionamento,
    Tab3Conversao,
    Tab4Avancado,
  ][activeTab];

  return (
    <main className="h-full overflow-y-auto bg-[#F6F8F6] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1200px] space-y-6">
        <section className="rounded-[2rem] border border-zinc-200 bg-white px-6 py-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Intelligence Calibration
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                Calibre a inteligência do Vendeo para vender mais com a cara da sua loja
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
                Preencha os 15 campos em 4 abas. O Vendeo salva automaticamente quando você troca de etapa e usa esse contexto para ajustar campanhas, urgência e tom de voz.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm text-zinc-600">
              <div className="font-semibold text-zinc-900">Como usar</div>
              <div className="mt-2 leading-6">
                Preencha uma aba por vez. Você pode sair e voltar depois sem perder o progresso salvo.
              </div>
            </div>
          </div>
        </section>

        <ProgressIndicator
          score={scoreSummary.score}
          filledFields={scoreSummary.filledFields}
          totalFields={scoreSummary.totalFields}
          badge={scoreSummary.badge}
        />

        <SaveIndicator
          isOnline={isOnline}
          isSaving={saving}
          error={saveError}
          message={saveMessage}
          onRetry={retrySave}
        />

        {loading ? (
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-56 rounded-full bg-zinc-100" />
              <div className="h-24 rounded-3xl bg-zinc-100" />
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="h-48 rounded-3xl bg-zinc-100" />
                <div className="h-48 rounded-3xl bg-zinc-100" />
              </div>
            </div>
          </div>
        ) : loadError ? (
          <div className="rounded-[2rem] border border-rose-200 bg-white p-8 shadow-sm">
            <div className="text-lg font-semibold text-rose-700">Não foi possível carregar a inteligência da loja</div>
            <div className="mt-2 text-sm text-zinc-600">{loadError}</div>
            <div className="mt-6">
              <Link
                href="/dashboard/store"
                className="inline-flex rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Voltar para a loja
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="space-y-6">
              <IntelligenceTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab}>
                <Suspense fallback={panelFallback}>
                  <PanelComponent
                    context={context}
                    errors={validationErrors}
                    updateField={updateField}
                    toggleArrayValue={toggleArrayValue}
                    setStringList={setStringList}
                    setSuccessfulPastCtas={setSuccessfulPastCtas}
                  />
                </Suspense>
              </IntelligenceTabs>
            </section>

            <aside className="grid content-start gap-6">
              <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-zinc-900">O que melhora na prática</div>
                <ul className="mt-4 grid gap-3 text-sm leading-6 text-zinc-600">
                  <li>• Campanhas com linguagem mais próxima do seu público real.</li>
                  <li>• Uso mais inteligente de urgência, preço e prova social.</li>
                  <li>• CTAs mais alinhados ao jeito que sua loja já vende hoje.</li>
                  <li>• Menos conteúdo genérico e mais contexto comercial útil desde o Dia 1.</li>
                </ul>
              </div>

              <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-zinc-900">Dica Vendeo</div>
                <div className="mt-3 text-sm leading-6 text-zinc-600">
                  Se travar no diferencial da loja, escreva como um cliente explicaria para um amigo: “aqui é rápido, sempre tem gelado e o atendimento resolve”.
                </div>
              </div>

              <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-zinc-900">Próximo passo</div>
                <div className="mt-3 text-sm leading-6 text-zinc-600">
                  Depois de calibrar a inteligência, volte para suas campanhas para sentir a diferença no tom, nas ofertas e nos argumentos de venda.
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/campaigns/new"
                    className="inline-flex rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  >
                    Criar campanha
                  </Link>
                  <Link
                    href="/dashboard/store"
                    className="inline-flex rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                  >
                    Editar loja
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}