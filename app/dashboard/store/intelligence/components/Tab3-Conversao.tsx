"use client";

import type { IntelligenceContext } from "../hooks/useIntelligenceForm";
import {
  CTAListField,
  CheckboxRow,
  FieldShell,
  SliderField,
  StringListField,
} from "./FormPrimitives";

export function Tab3Conversao({
  context,
  errors,
  updateField,
  setStringList,
  setSuccessfulPastCtas,
}: {
  context: IntelligenceContext;
  errors: Record<string, string>;
  updateField: (path: string, value: unknown) => void;
  setStringList: (path: string, values: string[]) => void;
  setSuccessfulPastCtas: (items: NonNullable<IntelligenceContext["successful_past_ctas"]>) => void;
}) {
  const triggers = context.conversion_triggers ?? {};

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <FieldShell
        label="Gatilhos de conversão"
        hint="Diga até onde você se sente confortável com urgência, escassez e prova social."
      >
        <SliderField
          value={triggers.urgency_preference ?? 5}
          onChange={(value) => updateField("conversion_triggers.urgency_preference", value)}
          min={0}
          max={10}
          leftLabel="Suave"
          rightLabel="Urgente"
        />
        <SliderField
          value={triggers.scarcity_comfortable ?? 5}
          onChange={(value) => updateField("conversion_triggers.scarcity_comfortable", value)}
          min={0}
          max={10}
          leftLabel="Pouca escassez"
          rightLabel="Escassez forte"
        />
        <CheckboxRow
          checked={Boolean(triggers.social_proof_available)}
          onChange={(checked) => updateField("conversion_triggers.social_proof_available", checked)}
          label="Tenho prova social disponível"
          description="Ex: avaliações, depoimentos, prints de clientes, tradição no bairro."
        />
        <CheckboxRow
          checked={Boolean(triggers.guarantee_offered)}
          onChange={(checked) => updateField("conversion_triggers.guarantee_offered", checked)}
          label="Ofereço algum tipo de garantia"
          description="Ex: troca facilitada, satisfação garantida ou suporte diferenciado."
        />
      </FieldShell>

      <FieldShell
        label="CTAs que já funcionaram"
        optional
        hint="Até 3 chamadas que costumam converter bem."
        error={Object.values(errors).find((_, keyIndex) =>
          Object.keys(errors)[keyIndex]?.startsWith("successful_past_ctas.")
        )}
      >
        <CTAListField
          items={context.successful_past_ctas ?? []}
          onChange={(items) => setSuccessfulPastCtas(items)}
          max={3}
        />
      </FieldShell>

      <div className="xl:col-span-2">
        <FieldShell
          label="Eventos locais e datas quentes"
          optional
          hint="Anote feiras, festas, datas comerciais e momentos do bairro que influenciam vendas."
        >
          <StringListField
            values={context.local_events_calendar ?? []}
            onChange={(values) => setStringList("local_events_calendar", values)}
            placeholder="Ex: Festa da padroeira"
            addLabel="Adicionar evento"
            max={5}
          />
        </FieldShell>
      </div>
    </div>
  );
}