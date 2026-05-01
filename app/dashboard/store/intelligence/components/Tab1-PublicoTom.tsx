"use client";

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
  { label: "🎭 Carnaval", value: "Carnaval" },
  { label: "🐰 Páscoa", value: "Páscoa" },
  { label: "💝 Dia dos Namorados", value: "Dia dos Namorados" },
  { label: "🧸 Dia das Crianças", value: "Dia das Crianças" },
  { label: "🎆 Ano Novo", value: "Ano Novo" },
  { label: "📚 Volta às Aulas", value: "Volta às Aulas" },
];

const TARGET_AUDIENCE_LABELS = {
  families: "Famílias do bairro",
  young_adults: "Jovens entre 18 e 25 anos",
  professionals: "Profissionais liberais de 30 a 50 anos",
  seniors: "Idosos aposentados",
  students: "Estudantes universitários",
  parents: "Pais com crianças pequenas",
  mixed_age: "Público misto de várias idades",
} as const;

const TARGET_AUDIENCE_OPTIONS = [
  { label: "Famílias do bairro", value: "families" },
  { label: "Jovens 18-25 anos", value: "young_adults" },
  { label: "Profissionais 30-50 anos", value: "professionals" },
  { label: "Idosos aposentados", value: "seniors" },
  { label: "Estudantes universitários", value: "students" },
  { label: "Pais com crianças pequenas", value: "parents" },
  { label: "Todas as idades", value: "mixed_age" },
  { label: "Outros (descrever)", value: "custom" },
];

const MAIN_DIFFERENTIATION_LABELS = {
  price: "Oferecemos o melhor preço da região",
  quality: "Trabalhamos com produtos de alta qualidade",
  service: "Nosso atendimento é personalizado e atencioso",
  variety: "Temos a maior variedade de produtos",
  convenience: "Localização conveniente e fácil acesso",
  expertise: "Equipe especializada com conhecimento técnico",
  speed: "Atendimento rápido e eficiente",
  trust: "Tradição e confiança construídas ao longo dos anos",
} as const;

const MAIN_DIFFERENTIATION_OPTIONS = [
  { label: "💰 Melhor preço da região", value: "price" },
  { label: "⭐ Produtos de alta qualidade", value: "quality" },
  { label: "🤝 Atendimento personalizado", value: "service" },
  { label: "🛒 Maior variedade", value: "variety" },
  { label: "📍 Conveniência e localização", value: "convenience" },
  { label: "🎓 Especialização técnica", value: "expertise" },
  { label: "⚡ Rapidez no atendimento", value: "speed" },
  { label: "🏆 Tradição e confiança", value: "trust" },
  { label: "✍️ Outro", value: "custom" },
];

function inferPreset<T extends string>(value: string | undefined, labels: Record<T, string>) {
  const normalizedValue = value?.trim().toLowerCase();

  if (!normalizedValue) {
    return "";
  }

  const match = (Object.entries(labels) as Array<[T, string]>).find(
    ([, label]) => label.toLowerCase() === normalizedValue
  );

  return match?.[0] ?? "custom";
}

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
  const targetAudiencePreset =
    context.target_audience_preset ?? inferPreset(context.target_audience, TARGET_AUDIENCE_LABELS);
  const mainDifferentiationPreset =
    context.main_differentiation_preset ?? inferPreset(context.main_differentiation, MAIN_DIFFERENTIATION_LABELS);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <FieldShell
        label="Tom da marca"
        hint="Como o Vendeo deve soar quando falar em nome da sua loja."
      >
        <ChoiceChips
          ariaLabel="Tom da marca"
          options={BRAND_VOICE_OPTIONS}
          value={context.brand_voice ?? null}
          onChange={(value) => updateField("brand_voice", value)}
        />
      </FieldShell>

      <FieldShell
        label="Público-alvo"
        optional
        hint="Quem mais compra na sua loja? Escolha uma opção pronta ou use Outros para descrever."
        counter={`${context.target_audience?.length ?? 0}/200`}
        error={errors.target_audience}
      >
        <SelectInput
          id="target-audience-preset"
          ariaLabel="Público-alvo"
          value={targetAudiencePreset}
          onChange={(value) => {
            if (!value) {
              updateField("target_audience_preset", undefined);
              updateField("target_audience", "");
              return;
            }

            if (value === "custom") {
              updateField("target_audience_preset", "custom");
              if (targetAudiencePreset !== "custom") {
                updateField("target_audience", "");
              }
              return;
            }

            updateField("target_audience_preset", value);
            updateField(
              "target_audience",
              TARGET_AUDIENCE_LABELS[value as keyof typeof TARGET_AUDIENCE_LABELS]
            );
          }}
          placeholder="Selecione o público principal"
          options={TARGET_AUDIENCE_OPTIONS}
        />
        {targetAudiencePreset === "custom" ? (
          <TextArea
            id="target-audience-custom"
            ariaLabel="Descreva o público-alvo"
            autoFocus
            value={context.target_audience}
            onChange={(value) => updateField("target_audience", value)}
            placeholder="Descreva o público principal da sua loja."
            maxLength={200}
            rows={3}
          />
        ) : null}
      </FieldShell>

      <FieldShell
        label="Picos sazonais"
        optional
        hint="Marque até 5 momentos do ano que mais puxam venda para a loja."
        counter={`${context.seasonal_peaks?.length ?? 0}/5`}
        error={errors.seasonal_peaks ?? errors.seasonal_peaks_custom}
      >
        <MultiSelectChips
          ariaLabel="Picos sazonais"
          options={SEASONAL_PEAK_OPTIONS}
          values={context.seasonal_peaks ?? []}
          onToggle={(value) => toggleArrayValue("seasonal_peaks", value)}
          maxSelections={5}
        />
        <TextInput
          ariaLabel="Outros eventos sazonais"
          value={context.seasonal_peaks_custom}
          onChange={(value) => updateField("seasonal_peaks_custom", value)}
          placeholder="Outros eventos da sua região ou da loja"
          maxLength={100}
        />
      </FieldShell>

      <FieldShell
        label="Diferencial principal"
        optional
        hint="O que mais faz o cliente escolher sua loja? Escolha a resposta que mais representa o negócio."
        counter={`${context.main_differentiation?.length ?? 0}/300`}
        error={errors.main_differentiation}
      >
        <ChoiceChips
          ariaLabel="Diferencial principal"
          options={MAIN_DIFFERENTIATION_OPTIONS}
          value={mainDifferentiationPreset || null}
          onChange={(value) => {
            if (!value) {
              updateField("main_differentiation_preset", undefined);
              updateField("main_differentiation", "");
              return;
            }

            if (value === "custom") {
              updateField("main_differentiation_preset", "custom");
              if (mainDifferentiationPreset !== "custom") {
                updateField("main_differentiation", "");
              }
              return;
            }

            updateField("main_differentiation_preset", value);
            updateField(
              "main_differentiation",
              MAIN_DIFFERENTIATION_LABELS[value as keyof typeof MAIN_DIFFERENTIATION_LABELS]
            );
          }}
        />
        {mainDifferentiationPreset === "custom" ? (
          <TextArea
            value={context.main_differentiation}
            onChange={(value) => updateField("main_differentiation", value)}
            placeholder="Descreva o diferencial único da sua loja."
            maxLength={300}
            rows={3}
          />
        ) : null}
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