"use client";

import type { IntelligenceContext } from "../hooks/useIntelligenceForm";
import {
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

export function Tab2Posicionamento({
  context,
  errors,
  updateField,
  toggleArrayValue,
  setStringList,
}: {
  context: IntelligenceContext;
  errors: Record<string, string>;
  updateField: (path: string, value: unknown) => void;
  toggleArrayValue: (path: string, value: string) => void;
  setStringList: (path: string, values: string[]) => void;
}) {
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
        <TextInput
          type="number"
          min={0}
          value={context.average_ticket_brl}
          onChange={(value) => updateField("average_ticket_brl", value === "" ? null : Number(value))}
          placeholder="Ex: 150"
        />
      </FieldShell>

      <FieldShell
        label="Concorrentes mais lembrados"
        optional
        hint="Até 3 nomes para o Vendeo entender quem você precisa superar."
      >
        <StringListField
          values={context.competitors ?? []}
          onChange={(values) => setStringList("competitors", values)}
          placeholder="Ex: Adega da esquina"
          addLabel="Adicionar concorrente"
          max={3}
        />
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
          label="Dores do cliente"
          optional
          hint="Quais objeções ou frustrações o seu conteúdo precisa destravar."
        >
          <MultiSelectChips
            options={PAIN_POINT_OPTIONS}
            values={context.customer_pain_points ?? []}
            onToggle={(value) => toggleArrayValue("customer_pain_points", value)}
          />
        </FieldShell>
      </div>
    </div>
  );
}