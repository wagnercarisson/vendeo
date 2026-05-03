"use client";

import type { IntelligenceContext } from "../hooks/useIntelligenceForm";
import {
  ChoiceChips,
  FieldShell,
  MultiSelectChips,
  SelectInput,
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
  { label: "☀️ Verão", value: "Verão" },
  { label: "❄️ Inverno", value: "Inverno" },
  { label: "💐 Dia das Mães", value: "Dia das Mães" },
  { label: "👔 Dia dos Pais", value: "Dia dos Pais" },
  { label: "🏷️ Black Friday", value: "Black Friday" },
  { label: "🎄 Natal", value: "Natal" },
];

const TARGET_AUDIENCE_OPTIONS = [
  { label: "Famílias do bairro", value: "families" },
  { label: "Jovens 18-25 anos", value: "young_adults" },
  { label: "Profissionais 30-50 anos", value: "professionals" },
  { label: "Idosos aposentados", value: "seniors" },
  { label: "Estudantes universitários", value: "students" },
  { label: "Pais com crianças pequenas", value: "parents" },
  { label: "Público misto (todas as idades)", value: "mixed_age" },
  { label: "Outros (descrever)", value: "custom" },
];

const TARGET_AUDIENCE_LABELS: Record<string, string> = {
  families: "Famílias do bairro",
  young_adults: "Jovens entre 18-25 anos",
  professionals: "Profissionais liberais (30-50 anos)",
  seniors: "Idosos aposentados",
  students: "Estudantes universitários",
  parents: "Pais com crianças pequenas",
  mixed_age: "Público misto (todas as idades)",
};

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
        hint="Quem mais compra na sua loja?"
        counter={context.target_audience_preset === "custom" ? `${context.target_audience?.length ?? 0}/200` : undefined}
        error={errors.target_audience}
      >
        <SelectInput
          value={context.target_audience_preset}
          onChange={(value) => {
            const nextValue = value || null;
            updateField("target_audience_preset", nextValue);

            if (value === "custom") {
              updateField("target_audience", "");
              return;
            }

            updateField("target_audience", value ? TARGET_AUDIENCE_LABELS[value] : "");
          }}
          placeholder="Selecione o público principal"
          options={TARGET_AUDIENCE_OPTIONS}
        />

        {context.target_audience_preset === "custom" ? (
          <TextArea
            value={context.target_audience}
            onChange={(value) => updateField("target_audience", value)}
            placeholder="Descreva seu público principal..."
            rows={3}
            className="mt-3"
          />
        ) : null}
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