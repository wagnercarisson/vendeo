"use client";

import { useEffect, useState } from "react";
import { parseBRLToNumber } from "@/lib/formatters/priceMask";
import type { IntelligenceContext } from "../hooks/useIntelligenceForm";
import {
  CheckboxRow,
  ChoiceChips,
  FieldShell,
  MultiSelectChips,
  SelectInput,
  TextArea,
  TextInput,
} from "./FormPrimitives";

const PRICE_OPTIONS = [
  { label: "Econômico", value: "economic" },
  { label: "Médio", value: "medium" },
  { label: "Premium", value: "premium" },
  { label: "Luxo", value: "luxury" },
];

const COMPETITOR_TYPE_OPTIONS = [
  { label: "Lojas locais", value: "local" },
  { label: "Redes regionais", value: "regional" },
  { label: "Redes nacionais", value: "national" },
  { label: "E-commerce", value: "online" },
];

const NATIONAL_COMPETITOR_OPTIONS = [
  { label: "Drogasil", value: "Drogasil" },
  { label: "Drogaria São Paulo", value: "Drogaria São Paulo" },
  { label: "Pague Menos", value: "Pague Menos" },
  { label: "Renner", value: "Renner" },
  { label: "C&A", value: "C&A" },
  { label: "Riachuelo", value: "Riachuelo" },
  { label: "O Boticário", value: "O Boticário" },
  { label: "Natura", value: "Natura" },
  { label: "Leroy Merlin", value: "Leroy Merlin" },
  { label: "Tok&Stok", value: "Tok&Stok" },
];

const PAIN_POINT_OPTIONS = [
  {
    label: "Preço alto em outros lugares",
    value: "Preço alto em outros lugares",
    description: "O cliente sente que a concorrência cobra caro demais.",
  },
  {
    label: "Produtos de baixa qualidade em outros lugares",
    value: "Produtos de baixa qualidade em outros lugares",
    description: "A concorrência não passa confiança na qualidade.",
  },
  {
    label: "Atendimento ruim em outros lugares",
    value: "Atendimento ruim em outros lugares",
    description: "Falta atenção, cuidado ou resposta rápida.",
  },
  {
    label: "Distância ou acesso ruim",
    value: "Distância ou acesso ruim",
    description: "Outras lojas ficam longe ou dão trabalho para comprar.",
  },
  {
    label: "Falta de tempo para comprar",
    value: "Falta de tempo para comprar",
    description: "O cliente quer resolver tudo com rapidez.",
  },
  {
    label: "Desconfiança de lojas desconhecidas",
    value: "Desconfiança de lojas desconhecidas",
    description: "O cliente precisa sentir segurança antes de comprar.",
  },
  {
    label: "Pouca variedade em outros lugares",
    value: "Pouca variedade em outros lugares",
    description: "A concorrência não oferece opções suficientes.",
  },
  {
    label: "Horário limitado em outras lojas",
    value: "Horário limitado em outras lojas",
    description: "As outras lojas fecham cedo ou não atendem quando precisa.",
  },
];

function formatBRLDisplay(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function Tab2Posicionamento({
  context,
  errors,
  updateField,
  toggleArrayValue,
}: {
  context: IntelligenceContext;
  errors: Record<string, string>;
  updateField: (path: string, value: unknown) => void;
  toggleArrayValue: (path: string, value: string) => void;
}) {
  const competitorType = context.competitor_type ?? "local";
  const painPoints = context.customer_pain_points ?? [];
  const customPainPoints = painPoints.filter(
    (value) => !PAIN_POINT_OPTIONS.some((option) => option.value === value)
  );
  const [isEditingTicket, setIsEditingTicket] = useState(false);
  const [ticketDisplay, setTicketDisplay] = useState(
    context.average_ticket_brl == null ? "" : formatBRLDisplay(context.average_ticket_brl)
  );

  useEffect(() => {
    if (isEditingTicket) {
      return;
    }

    setTicketDisplay(
      context.average_ticket_brl == null ? "" : formatBRLDisplay(context.average_ticket_brl)
    );
  }, [context.average_ticket_brl, isEditingTicket]);

  function handleTicketChange(rawValue: string) {
    const sanitized = rawValue
      .replace(/[^\d,]/g, "")
      .replace(/,(?=.*?,)/g, "");

    const [integerPart = "", decimalPart] = sanitized.split(",");
    const nextDisplay =
      decimalPart === undefined
        ? integerPart
        : `${integerPart},${decimalPart.slice(0, 2)}`;

    setTicketDisplay(nextDisplay);

    if (nextDisplay === "" || nextDisplay === ",") {
      return;
    }
  }

  function handleTicketBlur() {
    setIsEditingTicket(false);

    if (ticketDisplay.trim() === "") {
      setTicketDisplay("");
      updateField("average_ticket_brl", null);
      return;
    }

    const parsed = parseBRLToNumber(ticketDisplay);
    updateField("average_ticket_brl", parsed);
    setTicketDisplay(formatBRLDisplay(parsed));
  }

  function addCustomPainPoint() {
    const customValue = (context.customer_pain_points_custom ?? "").trim();

    if (!customValue || painPoints.length >= 4 || painPoints.includes(customValue)) {
      return;
    }

    updateField("customer_pain_points", [...painPoints, customValue]);
    updateField("customer_pain_points_custom", "");
  }

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
        <div className="mt-2 flex items-center rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
          <span className="mr-2 text-zinc-500">R$</span>
          <input
            type="text"
            inputMode="decimal"
            value={ticketDisplay}
            onFocus={() => setIsEditingTicket(true)}
            onChange={(event) => handleTicketChange(event.target.value)}
            onBlur={handleTicketBlur}
            placeholder="150,00"
            className="w-full border-0 bg-transparent outline-none placeholder:text-zinc-400"
          />
        </div>
      </FieldShell>

      <FieldShell
        label="Concorrentes mais lembrados"
        optional
        hint="Defina o tipo de concorrência e liste até 5 nomes para o Vendeo entender quem você precisa superar."
        counter={`${context.competitors?.length ?? 0}/5`}
        error={errors.competitors}
      >
        <ChoiceChips
          options={COMPETITOR_TYPE_OPTIONS}
          value={competitorType}
          onChange={(value) => updateField("competitor_type", value ?? "local")}
        />

        {competitorType === "national" ? (
          <MultiSelectChips
            options={NATIONAL_COMPETITOR_OPTIONS}
            values={context.competitors ?? []}
            onToggle={(value) => toggleArrayValue("competitors", value)}
            maxSelections={5}
          />
        ) : (
          <TextArea
            value={context.competitors?.join(", ")}
            onChange={(value) => {
              const nextValues = value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
                .slice(0, 5);

              updateField("competitors", nextValues);
            }}
            placeholder="Ex: Loja da esquina, Mercado do bairro, concorrente online"
            rows={3}
            maxLength={200}
          />
        )}
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
          label="Problemas que você resolve"
          optional
          hint="Marque até 4 dificuldades que sua loja ajuda o cliente a resolver."
          counter={`${painPoints.length}/4`}
          error={errors.customer_pain_points ?? errors.customer_pain_points_custom}
        >
          {PAIN_POINT_OPTIONS.map((option) => {
            const checked = painPoints.includes(option.value);
            const disabled = !checked && painPoints.length >= 4;

            return (
              <CheckboxRow
                key={option.value}
                checked={checked}
                disabled={disabled}
                onChange={() => toggleArrayValue("customer_pain_points", option.value)}
                label={option.label}
                description={option.description}
              />
            );
          })}

          {customPainPoints.map((value) => (
            <CheckboxRow
              key={value}
              checked
              disabled={false}
              onChange={() => toggleArrayValue("customer_pain_points", value)}
              label={value}
              description="Adicionado por você para representar uma dor específica do seu cliente."
            />
          ))}

          <div className="mt-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <TextInput
                  value={context.customer_pain_points_custom}
                  onChange={(value) => updateField("customer_pain_points_custom", value)}
                  placeholder="Ex: Não tem atendimento especializado"
                  maxLength={100}
                />
              </div>
              <button
                type="button"
                onClick={addCustomPainPoint}
                disabled={painPoints.length >= 4}
                className="mt-2 shrink-0 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              Descreva um problema específico do seu segmento e clique em adicionar.
            </div>
          </div>
        </FieldShell>
      </div>
    </div>
  );
}