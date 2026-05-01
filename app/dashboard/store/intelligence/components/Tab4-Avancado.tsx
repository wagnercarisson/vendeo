"use client";

import type { IntelligenceContext } from "../hooks/useIntelligenceForm";
import {
  CheckboxRow,
  FieldShell,
  SelectInput,
  SliderField,
  TextInput,
} from "./FormPrimitives";

const FORMALITY_OPTIONS = [
  { label: "Muito formal", value: "very_formal" },
  { label: "Formal", value: "formal" },
  { label: "Neutro", value: "neutral" },
  { label: "Casual", value: "casual" },
  { label: "Muito casual", value: "very_casual" },
];

export function Tab4Avancado({
  context,
  errors,
  updateField,
}: {
  context: IntelligenceContext;
  errors: Record<string, string>;
  updateField: (path: string, value: unknown) => void;
}) {
  const language = context.language_specifics ?? {};
  const copyLength = context.copy_length_preferences ?? {};

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <FieldShell
        label="Linguagem específica"
        optional
        hint="Refine o sotaque comercial do Vendeo para sua realidade."
        error={errors["language_specifics.max_exclamations_per_copy"]}
      >
        <CheckboxRow
          checked={Boolean(language.uses_regional_slang)}
          onChange={(checked) => updateField("language_specifics.uses_regional_slang", checked)}
          label="Quero usar gírias ou expressões regionais"
          description="Bom para negócios de bairro que vendem proximidade e familiaridade."
        />
        <SelectInput
          value={language.formality_level}
          onChange={(value) => updateField("language_specifics.formality_level", value || undefined)}
          placeholder="Selecione o nível de formalidade"
          options={FORMALITY_OPTIONS}
        />
        <SliderField
          value={language.emoji_comfort ?? 4}
          onChange={(value) => updateField("language_specifics.emoji_comfort", value)}
          min={0}
          max={10}
          leftLabel="Sem emoji"
          rightLabel="Emoji liberado"
        />
        <TextInput
          type="number"
          min={0}
          max={5}
          value={language.max_exclamations_per_copy}
          onChange={(value) =>
            updateField(
              "language_specifics.max_exclamations_per_copy",
              value === "" ? undefined : Number(value)
            )
          }
          placeholder="Ex: 2"
        />
      </FieldShell>

      <FieldShell
        label="Tamanho preferido da copy"
        optional
        hint="Ajuda o Vendeo a calibrar headline, corpo e objetividade da campanha."
        error={
          errors["copy_length_preferences.headline_max_words"] ||
          errors["copy_length_preferences.body_max_words"]
        }
      >
        <TextInput
          type="number"
          min={0}
          value={copyLength.headline_max_words}
          onChange={(value) =>
            updateField(
              "copy_length_preferences.headline_max_words",
              value === "" ? undefined : Number(value)
            )
          }
          placeholder="Ex: 10"
        />
        <TextInput
          type="number"
          min={0}
          value={copyLength.body_max_words}
          onChange={(value) =>
            updateField(
              "copy_length_preferences.body_max_words",
              value === "" ? undefined : Number(value)
            )
          }
          placeholder="Ex: 50"
        />
        <CheckboxRow
          checked={Boolean(copyLength.prefers_brevity)}
          onChange={(checked) => updateField("copy_length_preferences.prefers_brevity", checked)}
          label="Prefiro textos curtos e diretos"
          description="O Vendeo vai priorizar frases mais enxutas quando possível."
        />
      </FieldShell>
    </div>
  );
}