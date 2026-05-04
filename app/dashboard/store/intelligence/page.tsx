"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, Calendar, Target, TrendingUp } from "lucide-react";
import { IntelligenceTabs } from "./components/IntelligenceTabs";
import { OnboardingModal } from "./components/OnboardingModal";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { Tab1PublicoTom } from "./components/Tab1-PublicoTom";
import { Tab2Posicionamento } from "./components/Tab2-Posicionamento";
import { Tab3Conversao } from "./components/Tab3-Conversao";
import { Tab4Avancado } from "./components/Tab4-Avancado";
import {
  type OnboardingTabKey,
  useIntelligenceForm,
} from "./hooks/useIntelligenceForm";

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

const ONBOARDING_TAB_ORDER: OnboardingTabKey[] = [
  "tab_1_publico_tom",
  "tab_2_posicionamento",
  "tab_3_conversao",
  "tab_4_avancado",
];

const ONBOARDING_CONTENT: Record<OnboardingTabKey, {
  title: string;
  message: string;
  bulletPoints: string[];
  icon: JSX.Element;
}> = {
  tab_1_publico_tom: {
    title: "Conheça seu público e defina o tom",
    message: "Campanhas que falam a língua certa do seu cliente convertem muito mais. Essa etapa calibra como o Vendeo deve vender por você.",
    bulletPoints: [
      "Textos mais próximos de quem realmente compra na sua loja.",
      "Tom de voz consistente para sua marca parecer reconhecível.",
      "Menos campanha genérica e mais argumento que encaixa no seu público.",
    ],
    icon: <Target className="h-8 w-8" />,
  },
  tab_2_posicionamento: {
    title: "Posicione sua loja no mercado",
    message: "Quando o Vendeo entende seus diferenciais, preço e concorrência, ele destaca melhor por que o cliente deve comprar de você.",
    bulletPoints: [
      "Diferenciais claros deixam a oferta mais forte.",
      "Preço bem posicionado evita campanha desalinhada com sua realidade.",
      "A IA passa a vender com argumentos competitivos, não genéricos.",
    ],
    icon: <Award className="h-8 w-8" />,
  },
  tab_3_conversao: {
    title: "Otimize suas vendas",
    message: "Aqui você ensina ao Vendeo quais gatilhos e CTAs fazem seu cliente agir, para transformar atenção em compra.",
    bulletPoints: [
      "Urgência e escassez calibradas ao seu jeito de vender.",
      "CTAs reaproveitam aprendizados do que já funcionou na prática.",
      "Mais chance de converter cliques em conversas e vendas reais.",
    ],
    icon: <TrendingUp className="h-8 w-8" />,
  },
  tab_4_avancado: {
    title: "Contexto adicional para campanhas sazonais",
    message: "Os ajustes finos ajudam o Vendeo a aproveitar datas, eventos e preferências de linguagem para sugerir campanhas mais oportunas.",
    bulletPoints: [
      "Sazonalidade mapeada para publicar no momento certo.",
      "Eventos locais viram gancho comercial mais rápido.",
      "Linguagem e tamanho de copy ficam mais alinhados ao seu público.",
    ],
    icon: <Calendar className="h-8 w-8" />,
  },
};

export default function IntelligencePage() {
  const {
    loading,
    loadError,
    activeTab,
    setActiveTab,
    storeSegment,
    context,
    onboardingState,
    onboardingReady,
    updateField,
    toggleArrayValue,
    setStringList,
    setSuccessfulPastCtas,
    markOnboardingTabCompleted,
    scoreSummary,
    validationErrors,
    saveMessage,
    saveStatus,
  } = useIntelligenceForm();
  const [openOnboardingTab, setOpenOnboardingTab] = useState<OnboardingTabKey | null>(null);

  const activeOnboardingTab = useMemo(
    () => ONBOARDING_TAB_ORDER[activeTab] ?? null,
    [activeTab]
  );

  useEffect(() => {
    if (!onboardingReady || !activeOnboardingTab || loading || loadError) {
      return;
    }

    if (!onboardingState[activeOnboardingTab]?.completed) {
      setOpenOnboardingTab(activeOnboardingTab);
      return;
    }

    setOpenOnboardingTab((current) => (current === activeOnboardingTab ? null : current));
  }, [activeOnboardingTab, loadError, loading, onboardingReady, onboardingState]);

  async function handleCloseOnboarding() {
    if (!openOnboardingTab) {
      return;
    }

    const tabKey = openOnboardingTab;
    setOpenOnboardingTab(null);
    await markOnboardingTabCompleted(tabKey);
  }

  const panels = [
    <Tab1PublicoTom
      key="tab-1"
      context={context}
      errors={validationErrors}
      updateField={updateField}
      toggleArrayValue={toggleArrayValue}
      setStringList={setStringList}
    />,
    <Tab2Posicionamento
      key="tab-2"
      storeSegment={storeSegment}
      context={context}
      errors={validationErrors}
      updateField={updateField}
      toggleArrayValue={toggleArrayValue}
      setStringList={setStringList}
    />,
    <Tab3Conversao
      key="tab-3"
      context={context}
      errors={validationErrors}
      updateField={updateField}
      setStringList={setStringList}
      setSuccessfulPastCtas={setSuccessfulPastCtas}
    />,
    <Tab4Avancado
      key="tab-4"
      context={context}
      errors={validationErrors}
      updateField={updateField}
    />,
  ];

  const onboardingContent = openOnboardingTab ? ONBOARDING_CONTENT[openOnboardingTab] : null;

  return (
    <main className="h-full overflow-y-auto bg-[#F6F8F6] px-4 py-6 sm:px-6 lg:px-10">
      <OnboardingModal
        isOpen={!!onboardingContent}
        onClose={handleCloseOnboarding}
        icon={onboardingContent?.icon ?? null}
        title={onboardingContent?.title ?? ""}
        message={onboardingContent?.message ?? ""}
        bulletPoints={onboardingContent?.bulletPoints ?? []}
      />

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
          saveMessage={saveMessage}
          saveStatus={saveStatus}
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
              <IntelligenceTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
              {panels[activeTab]}
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