"use client";

import type { IntelligenceContext } from "../hooks/useIntelligenceForm";
import {
  ChoiceChips,
  FieldShell,
  MultiSelectChips,
  StringListField,
  TextArea,
} from "./FormPrimitives";

const BRAND_VOICE_OPTIONS = [
  { label: "Formal", value: "formal" },
  { label: "Informal", value: "informal" },
  { label: "Técnico", value: "technical" },
  { label: "Divertido", value: "playful" },
];

const SEASONAL_PEAK_OPTIONS = [
  { label: "Verão", value: "Verão" },
  { label: "Inverno", value: "Inverno" },
  { label: "Dia das Mães", value: "Dia das Mães" },
  { label: "Dia dos Pais", value: "Dia dos Pais" },
  { label: "Black Friday", value: "Black Friday" },
  { label: "Natal", value: "Natal" },
];

export function Tab1PublicoTom({
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
        label="Tom da marca"
        hint="Como o Vendeo deve soar quando falar em nome da sua loja."
      >
        <ChoiceChips
          options={BRAND_VOICE_OPTIONS}
          value={context.brand_voice ?? null}
          onChange={(value) => updateField("brand_voice", value)}
        />
      </FieldShell>

      <FieldShell
        label="Público-alvo"
        optional
        hint="Ex: Homens 30-50 anos, famílias do bairro, estudantes com pressa..."
        counter={`${context.target_audience?.length ?? 0}/200`}
        error={errors.target_audience}
      >
        <TextArea
          value={context.target_audience}
          onChange={(value) => updateField("target_audience", value)}
          placeholder="Ex: Homens e mulheres de 30 a 50 anos, que valorizam praticidade e bom atendimento."
        />
      </FieldShell>

      <FieldShell
        label="Picos sazonais"
        optional
        hint="Marque os momentos do ano que mais puxam venda para a loja."
      >
        <MultiSelectChips
          options={SEASONAL_PEAK_OPTIONS}
          values={context.seasonal_peaks ?? []}
          onToggle={(value) => toggleArrayValue("seasonal_peaks", value)}
        />
      </FieldShell>

      <FieldShell
        label="Diferencial principal"
        optional
        hint="O que faz o cliente escolher sua loja em vez da concorrência."
        counter={`${context.main_differentiation?.length ?? 0}/300`}
        error={errors.main_differentiation}
      >
        <TextArea
          value={context.main_differentiation}
          onChange={(value) => updateField("main_differentiation", value)}
          placeholder="Ex: Atendimento rápido, produtos sempre gelados e entrega no bairro em minutos."
        />
      </FieldShell>

      <div className="xl:col-span-2">
        <FieldShell
          label="Produtos campeões"
          optional
          hint="Liste até 5 produtos ou categorias que mais trazem resultado."
        >
          <StringListField
            values={context.top_products ?? []}
            onChange={(values) => setStringList("top_products", values)}
            placeholder="Ex: Cerveja long neck gelada"
            addLabel="Adicionar produto"
            max={5}
          />
        </FieldShell>
      </div>
    </div>
  );
}