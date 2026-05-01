"use client";

import { Info } from "lucide-react";
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

const RECOMMENDED_VALUES = {
  headlineMaxWords: 8,
  bodyMaxWords: 50,
  emojiComfortMin: 4,
  emojiComfortMax: 6,
  maxExclamationsPerCopy: 2,
};

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
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Se tiver dúvida em algum campo numérico, use o valor recomendado. Você pode
            ajustar depois se achar melhor.
          </span>
        </div>
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
          <div className="text-xs leading-5 text-zinc-500">
            Quanto mais alto, mais emojis o Vendeo vai usar. Recomendado ({RECOMMENDED_VALUES.emojiComfortMin}
            -{RECOMMENDED_VALUES.emojiComfortMax}) para equilibrar proximidade e profissionalismo.
          </div>
          <div className="mt-3">
            <div className="text-sm font-medium text-zinc-900">Máximo de exclamações por texto</div>
            <div className="mt-1 text-xs leading-5 text-zinc-500">
              Quantas vezes "!" pode aparecer em cada texto. Se tiver dúvida, comece com o recomendado.
            </div>
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
              placeholder={`Recomendado (${RECOMMENDED_VALUES.maxExclamationsPerCopy})`}
            />
            <div className="mt-1 text-xs leading-5 text-zinc-500">
              Recomendado ({RECOMMENDED_VALUES.maxExclamationsPerCopy}) para passar urgência sem exagero.
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
            <div className="mt-1 text-xs leading-5 text-zinc-500">
              Quantas palavras no máximo para o título da campanha. Se tiver dúvida, comece com o recomendado.
            </div>
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
              placeholder={`Recomendado (${RECOMMENDED_VALUES.headlineMaxWords})`}
            />
            <div className="mt-1 text-xs leading-5 text-zinc-500">
              Recomendado ({RECOMMENDED_VALUES.headlineMaxWords}) para um título curto e fácil de ler.
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-medium text-zinc-900">Máximo de palavras no corpo da campanha</div>
            <div className="mt-1 text-xs leading-5 text-zinc-500">
              Quantas palavras no máximo para a descrição. Se tiver dúvida, comece com o recomendado.
            </div>
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
              placeholder={`Recomendado (${RECOMMENDED_VALUES.bodyMaxWords})`}
            />
            <div className="mt-1 text-xs leading-5 text-zinc-500">
              Recomendado ({RECOMMENDED_VALUES.bodyMaxWords}) para manter atenção sem empobrecer a oferta.
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