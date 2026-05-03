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
    <div className="space-y-4">
      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <strong>Dica:</strong> Se tiver dúvida em algum campo numérico, use o valor recomendado. Você pode ajustar depois se achar melhor.
      </div>

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
          <div className="mt-3">
            <div className="text-sm font-medium text-zinc-900">Nível de formalidade</div>
            <SelectInput
              value={language.formality_level}
              onChange={(value) => updateField("language_specifics.formality_level", value || undefined)}
              placeholder="Selecione o nível de formalidade"
              options={FORMALITY_OPTIONS}
            />
          </div>
          <div className="mt-3">
            <div className="text-sm font-medium text-zinc-900">Conforto com emojis</div>
            <SliderField
              value={language.emoji_comfort ?? 4}
              onChange={(value) => updateField("language_specifics.emoji_comfort", value)}
              min={0}
              max={10}
              leftLabel="Sem emoji"
              rightLabel="Emoji liberado"
            />
            <div className="mt-2 text-xs text-zinc-500">
              Quanto mais alto, mais emojis o Vendeo vai usar. <strong>Recomendado: 4 a 6</strong> para equilibrar proximidade e profissionalismo.
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-medium text-zinc-900">Máximo de exclamações por texto</div>
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
              placeholder="Recomendado: 2"
            />
            <div className="mt-1 text-xs text-zinc-500">
              Quantas vezes "!" pode aparecer? <strong>Recomendado: 1 a 2</strong> para passar urgência sem exagero.
            </div>
          </div>
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
          <div className="mt-3">
            <div className="text-sm font-medium text-zinc-900">Máximo de palavras no título</div>
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
              placeholder="Recomendado: 8 palavras"
            />
            <div className="mt-1 text-xs text-zinc-500">
              Títulos entre 6 e 10 palavras costumam segurar melhor a atenção do cliente.
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-medium text-zinc-900">Máximo de palavras no corpo da campanha</div>
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
              placeholder="Recomendado: 50 palavras"
            />
            <div className="mt-1 text-xs text-zinc-500">
              Textos entre 40 e 60 palavras mantêm contexto suficiente sem cansar a leitura.
            </div>
          </div>
          <CheckboxRow
            checked={Boolean(copyLength.prefers_brevity)}
            onChange={(checked) => updateField("copy_length_preferences.prefers_brevity", checked)}
            label="Prefiro textos curtos e diretos"
            description="Ativa um modo geral de objetividade: o Vendeo vai priorizar frases enxutas e diretas, independente dos limites de palavras definidos acima."
          />
        </FieldShell>
      </div>
    </div>
  );
}