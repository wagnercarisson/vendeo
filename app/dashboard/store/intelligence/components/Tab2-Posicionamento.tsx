"use client";

import { useEffect, useState } from "react";
import { formatBRL, parseBRL } from "@/lib/formatters/currency";
import type { IntelligenceContext } from "../hooks/useIntelligenceForm";
import {
  ChoiceChips,
  FieldShell,
  MultiSelectChips,
  SelectInput,
  StringListField,
  TextArea,
  TextInput,
} from "./FormPrimitives";

const PRICE_OPTIONS = [
  { label: "Econômico", value: "economic" },
  { label: "Médio", value: "medium" },
  { label: "Premium", value: "premium" },
  { label: "Luxo", value: "luxury" },
];

const PAIN_POINT_OPTIONS = [
  { label: "Falta de tempo", value: "Falta de tempo" },
  { label: "Preço alto", value: "Preço alto" },
  { label: "Poucas opções", value: "Poucas opções" },
  { label: "Atendimento frio", value: "Atendimento frio" },
  { label: "Distância", value: "Distância" },
  { label: "Estacionamento difícil", value: "Estacionamento difícil" },
];

const DIFFERENTIATION_OPTIONS = [
  { label: "Melhor preço da região", value: "price" },
  { label: "Alta qualidade", value: "quality" },
  { label: "Atendimento personalizado", value: "service" },
  { label: "Maior variedade", value: "variety" },
  { label: "Conveniência e localização", value: "convenience" },
  { label: "Especialização técnica", value: "expertise" },
  { label: "Rapidez no atendimento", value: "speed" },
  { label: "Tradição e confiança", value: "trust" },
  { label: "Outro", value: "custom" },
];

const DIFFERENTIATION_LABELS: Record<string, string> = {
  price: "Oferecemos o melhor preço da região",
  quality: "Trabalhamos apenas com produtos de alta qualidade",
  service: "Nosso atendimento é personalizado e atencioso",
  variety: "Temos a maior variedade de produtos",
  convenience: "Localização conveniente e fácil acesso",
  expertise: "Equipe especializada com conhecimento técnico profundo",
  speed: "Atendimento rápido e eficiente",
  trust: "Tradição e confiança construídas ao longo dos anos",
};

const COMPETITOR_TYPE_OPTIONS = [
  { label: "Lojas locais", value: "local" },
  { label: "Redes regionais", value: "regional" },
  { label: "Grandes redes", value: "national" },
  { label: "E-commerces", value: "online" },
];

const NATIONAL_COMPETITORS_BY_SEGMENT: Record<string, string[]> = {
  bebidas: ["Evino", "Mistral", "Grand Cru"],
  farmacia: ["Drogasil", "Pague Menos", "Drogaria Sao Paulo"],
  moda: ["Renner", "C&A", "Riachuelo"],
  beauty: ["O Boticario", "Natura", "Sephora"],
  casa: ["Leroy Merlin", "Camicado", "Casa & Video"],
  generic: ["Mercado Livre", "Amazon", "Shopee"],
};

function mapSegmentToCompetitorBucket(segment: string | null) {
  const normalized = (segment ?? "").toLowerCase();

  if (normalized.includes("bebida") || normalized.includes("adega")) return "bebidas";
  if (normalized.includes("farm")) return "farmacia";
  if (normalized.includes("moda") || normalized.includes("boutique")) return "moda";
  if (normalized.includes("estet") || normalized.includes("salao") || normalized.includes("salão")) return "beauty";
  if (normalized.includes("casa") || normalized.includes("decora")) return "casa";

  return "generic";
}

export function Tab2Posicionamento({
  storeSegment,
  context,
  errors,
  updateField,
  toggleArrayValue,
  setStringList,
}: {
  storeSegment: string | null;
  context: IntelligenceContext;
  errors: Record<string, string>;
  updateField: (path: string, value: unknown) => void;
  toggleArrayValue: (path: string, value: string) => void;
  setStringList: (path: string, values: string[]) => void;
}) {
  const [ticketDisplay, setTicketDisplay] = useState(formatBRL(context.average_ticket_brl));
  const competitorBucket = mapSegmentToCompetitorBucket(storeSegment);
  const nationalCompetitors = NATIONAL_COMPETITORS_BY_SEGMENT[competitorBucket];
  const competitorCount = context.competitors?.length ?? 0;
  const painPointsCount = context.customer_pain_points?.length ?? 0;
  const customPainPoints = (context.customer_pain_points ?? []).filter(
    (item) => !PAIN_POINT_OPTIONS.some((option) => option.value === item)
  );

  function togglePainPoint(value: string) {
    const currentValues = context.customer_pain_points ?? [];

    if (!currentValues.includes(value) && painPointsCount >= 4) {
      return;
    }

    toggleArrayValue("customer_pain_points", value);
  }

  function addCustomPainPoint() {
    const customValue = context.customer_pain_points_custom?.trim();

    if (!customValue) return;
    if (painPointsCount >= 4) return;
    if (context.customer_pain_points?.includes(customValue)) return;

    updateField("customer_pain_points", [...(context.customer_pain_points ?? []), customValue]);
    updateField("customer_pain_points_custom", "");
  }

  function removeCustomPainPoint(value: string) {
    updateField(
      "customer_pain_points",
      (context.customer_pain_points ?? []).filter((item) => item !== value)
    );
  }

  useEffect(() => {
    setTicketDisplay(formatBRL(context.average_ticket_brl));
  }, [context.average_ticket_brl]);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <FieldShell
        label="Posicionamento de preço"
        optional
        hint="Como a loja costuma se posicionar na cabeça do cliente."
      >
        <SelectInput
          value={context.price_positioning}
          onChange={(value) => updateField("price_positioning", value || null)}
          placeholder="Selecione o posicionamento"
          options={PRICE_OPTIONS}
        />
      </FieldShell>

      <FieldShell
        label="Ticket médio (R$)"
        optional
        hint="Ajuda a calibrar linguagem, ofertas e urgência."
        error={errors.average_ticket_brl}
      >
        <input
          type="text"
          inputMode="decimal"
          value={ticketDisplay}
          onChange={(event) => setTicketDisplay(event.target.value)}
          onBlur={() => {
            const parsed = parseBRL(ticketDisplay);
            updateField("average_ticket_brl", parsed);
            setTicketDisplay(formatBRL(parsed));
          }}
          placeholder="Ex: R$ 150,00"
          className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
        />
      </FieldShell>

      <FieldShell
        label="Concorrentes mais lembrados"
        optional
        hint="Selecione o tipo: use lojas locais para concorrentes do bairro e grandes redes quando você disputa cliente com marcas nacionais ou marketplaces."
      >
        <ChoiceChips
          options={COMPETITOR_TYPE_OPTIONS}
          value={context.competitor_type ?? "local"}
          onChange={(value) => updateField("competitor_type", value ?? "local")}
        />

        {context.competitor_type === "national" ? (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-medium text-zinc-600">Selecione até 3 redes de referência</div>
            <MultiSelectChips
              options={nationalCompetitors.map((competitor) => ({
                label: competitor,
                value: competitor,
              }))}
              values={context.competitors ?? []}
              onToggle={(value) => {
                const currentValues = context.competitors ?? [];
                const nextValues = currentValues.includes(value)
                  ? currentValues.filter((item) => item !== value)
                  : currentValues.length >= 3
                    ? currentValues
                    : [...currentValues, value];

                updateField("competitors", nextValues);
              }}
            />
          </div>
        ) : (
          <StringListField
            values={context.competitors ?? []}
            onChange={(values) => setStringList("competitors", values.slice(0, 3))}
            placeholder={
              context.competitor_type === "local"
                ? "Ex: Farmácia do João, Mercadinho Central, Loja da esquina"
                : context.competitor_type === "regional"
                  ? "Ex: Drogaria Araújo, redes regionais da sua cidade"
                  : context.competitor_type === "online"
                    ? "Ex: Amazon, Mercado Livre, Shopee"
                    : "Ex: principais concorrentes da sua região"
            }
            addLabel="Adicionar concorrente"
            max={3}
          />
        )}
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-zinc-500">{competitorCount}/3 concorrentes listados</span>
          {competitorCount >= 3 ? (
            <span className="flex items-center gap-1 font-medium text-amber-600">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Máximo atingido
            </span>
          ) : null}
        </div>
      </FieldShell>

      <FieldShell
        label="USP principal"
        optional
        hint="Seu argumento de venda mais forte em uma frase curta."
        counter={`${context.unique_selling_proposition?.primary_usp?.length ?? 0}/200`}
        error={errors["unique_selling_proposition.primary_usp"]}
      >
        <TextArea
          value={context.unique_selling_proposition?.primary_usp}
          onChange={(value) => updateField("unique_selling_proposition.primary_usp", value)}
          placeholder="Ex: A única adega do bairro com seleção premium gelada até tarde."
          rows={3}
        />
      </FieldShell>

      <div className="xl:col-span-2">
        <FieldShell
          label="Diferencial principal"
          optional
          hint="O que faz o cliente escolher você em vez da concorrência."
          counter={context.main_differentiation_preset === "custom" ? `${context.main_differentiation?.length ?? 0}/300` : undefined}
          error={errors.main_differentiation}
        >
          <ChoiceChips
            options={DIFFERENTIATION_OPTIONS}
            value={context.main_differentiation_preset ?? null}
            onChange={(value) => {
              updateField("main_differentiation_preset", value);

              if (value === "custom") {
                updateField("main_differentiation", "");
                return;
              }

              updateField("main_differentiation", value ? DIFFERENTIATION_LABELS[value] : "");
            }}
          />

          {context.main_differentiation_preset === "custom" ? (
            <TextArea
              value={context.main_differentiation}
              onChange={(value) => updateField("main_differentiation", value)}
              placeholder="Descreva o diferencial único da sua loja..."
              rows={3}
              className="mt-3"
            />
          ) : null}
        </FieldShell>
      </div>

      <div className="xl:col-span-2">
        <FieldShell
          label="Dores do cliente"
          optional
          hint="Quais objeções ou frustrações o seu conteúdo precisa destravar."
        >
          <MultiSelectChips
            options={PAIN_POINT_OPTIONS}
            values={context.customer_pain_points ?? []}
            onToggle={togglePainPoint}
            isOptionDisabled={(_, active) => !active && painPointsCount >= 4}
          />
          {customPainPoints.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {customPainPoints.map((value) => (
                <span
                  key={value}
                  className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => removeCustomPainPoint(value)}
                    className="text-zinc-400 transition hover:text-zinc-700"
                    aria-label={`Excluir ${value}`}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-2 text-xs text-zinc-500">
            {painPointsCount}/4 selecionados
          </div>

          <div className="mt-3 flex items-start gap-2">
            <input
              value={context.customer_pain_points_custom ?? ""}
              onChange={(event) => updateField("customer_pain_points_custom", event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") {
                  return;
                }

                event.preventDefault();
                addCustomPainPoint();
              }}
              placeholder="Outro problema que sua loja resolve"
              maxLength={100}
              className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
            <button
              type="button"
              onClick={addCustomPainPoint}
              disabled={
                !context.customer_pain_points_custom?.trim() ||
                painPointsCount >= 4
              }
              className="shrink-0 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:border disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400"
            >
              Adicionar
            </button>
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {context.customer_pain_points_custom?.trim()
              ? painPointsCount >= 4
                ? "Máximo de 4 dores atingido. Remova uma para adicionar outra."
                : "Pressione Enter ou clique em 'Adicionar' para incluir na lista."
              : "Digite um problema específico do seu segmento acima."}
          </div>
        </FieldShell>
      </div>
    </div>
  );
}