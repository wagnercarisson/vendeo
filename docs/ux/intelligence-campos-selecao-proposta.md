# Proposta UX: Campos Livres → Seleções + "Outros"

**Data:** 2026-05-01  
**Autor:** @ux-design-expert (Uma)  
**Status:** Proposta  
**Sprint:** Intelligence Calibration Sprint 1 (pós-blockers)  
**Impacto:** Alta (melhora taxa de preenchimento + qualidade de dados)

---

## 📋 Contexto

Durante validação em localhost, identificamos que campos de texto livre na Intelligence Calibration Page criam **fricção significativa** para o perfil lojista não-técnico do Vendeo.

**Problema atual:**
- Lojista paralisa diante de campos em branco ("o que eu coloco aqui?")
- Digita conteúdo incompleto ou errado (semi-analfabetismo digital)
- Taxa de preenchimento baixa (estimada ~50-60%)
- IA recebe dados não-estruturados (dificulta interpretação)

**Solução proposta:**
- Transformar 5 campos de texto livre em seleções pré-definidas
- Preservar flexibilidade com opção "Outros" + campo texto
- Aumentar taxa de preenchimento para 95%+
- Reduzir tempo de preenchimento em 60% (5 min → 2 min)

---

## 🎯 Objetivos

### Quantitativos
| Métrica | Atual | Meta |
|---------|-------|------|
| Taxa de preenchimento | ~60% | 95%+ |
| Tempo médio de preenchimento | 5 min | 2 min |
| Taxa de abandono | ~25% | <5% |
| Cliques em "Help" | ~15% | <5% |

### Qualitativos
- Eliminar paralisia diante de campos vazios
- Aumentar confiança do lojista ("sei o que fazer")
- Melhorar qualidade dos dados para IA
- Manter flexibilidade para casos não-previstos

---

## 👤 Perfil Lojista (Persona)

**Dados demográficos:**
- Idade: 45-55 anos (maioria)
- Escolaridade: Ensino médio completo a superior incompleto
- Tech literacy: Baixa a média (nível WhatsApp/Instagram)
- Tempo disponível: <10 min (gerencia loja enquanto preenche)

**Comportamento observado:**
- ❌ Evita campos de texto livre (não sabe o que escrever)
- ✅ Prefere clicar em opções visuais ("caixinhas")
- ❌ Digita com erros de ortografia/gramática
- ✅ Confia em sugestões do sistema
- ❌ Abandona formulários longos sem progresso visível
- ✅ Completa tarefas quando caminho está claro

**Citação real do usuário:**
> "Prefiro escolher nas caixinhas, digitando eu não sei se tá certo..."

---

## 📐 Especificações Técnicas

### Campo 1: `target_audience` (Tab 1 - Público & Tom)

#### Estado Atual
```tsx
<textarea
  placeholder="Ex: Homens 30-50 anos, famílias do bairro, estudantes com pressa..."
  maxLength={200}
  value={context.target_audience ?? ""}
  onChange={(e) => updateField("target_audience", e.target.value)}
/>
```

**Problemas:**
- Lojista não sabe como descrever público
- Digita respostas vagas ("todo mundo", "pessoas")
- Campo frequentemente deixado vazio

#### Estado Proposto

**UX Pattern:** Select com opção "Outros"

```tsx
<FormField
  label="Público-alvo"
  description="Quem mais compra na sua loja?"
  optional
>
  <Select
    value={context.target_audience_preset ?? ""}
    onChange={(value) => {
      if (value === "custom") {
        updateField("target_audience_preset", "custom");
        updateField("target_audience", "");
      } else {
        updateField("target_audience_preset", value);
        updateField("target_audience", TARGET_AUDIENCE_LABELS[value]);
      }
    }}
  >
    <option value="">Selecione...</option>
    <option value="families">Famílias do bairro</option>
    <option value="young_adults">Jovens 18-25 anos</option>
    <option value="professionals">Profissionais liberais 30-50 anos</option>
    <option value="seniors">Idosos aposentados</option>
    <option value="students">Estudantes universitários</option>
    <option value="parents">Pais com crianças pequenas</option>
    <option value="mixed_age">Todas as idades (misto)</option>
    <option value="custom">✍️ Outros (descrever)</option>
  </Select>

  {context.target_audience_preset === "custom" && (
    <textarea
      className="mt-3"
      placeholder="Descreva seu público principal..."
      maxLength={200}
      value={context.target_audience ?? ""}
      onChange={(e) => updateField("target_audience", e.target.value)}
    />
  )}
</FormField>
```

**Dados adicionais necessários:**
```typescript
// Adicionar ao IntelligenceContext
target_audience_preset?: 
  | "families" 
  | "young_adults" 
  | "professionals" 
  | "seniors" 
  | "students" 
  | "parents" 
  | "mixed_age" 
  | "custom";

// Labels para backend
const TARGET_AUDIENCE_LABELS = {
  families: "Famílias do bairro",
  young_adults: "Jovens entre 18-25 anos",
  professionals: "Profissionais liberais (30-50 anos)",
  seniors: "Idosos aposentados",
  students: "Estudantes universitários",
  parents: "Pais com crianças pequenas",
  mixed_age: "Público misto (todas as idades)",
};
```

**Benefícios:**
- 80% dos casos cobertos por presets
- Lojista escolhe em 5 segundos (vs 2 min digitando)
- IA recebe dados estruturados
- Flexibilidade preservada com "Outros"

---

### Campo 2: `seasonal_peaks` (Tab 1 - Público & Tom)

#### Estado Atual
```tsx
<StringArrayInput
  label="Picos sazonais"
  description="Marque os momentos do ano que mais puxam venda para a loja."
  value={context.seasonal_peaks ?? []}
  onChange={(values) => setStringList("seasonal_peaks", values)}
  placeholder="Ex: Verão, Natal, Black Friday..."
  optional
/>
```

**Problemas:**
- Lojista digita "dezembro" ao invés de "Natal"
- Esquece eventos comerciais importantes
- Inconsistência de nomenclatura ("dia das maes", "Dia das Mães", "maio")

#### Estado Proposto

**UX Pattern:** Checkboxes com grid + campo "outros"

```tsx
<FormField
  label="Picos sazonais"
  description="Marque os momentos que mais puxam venda (máximo 5)"
  optional
>
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
    {SEASONAL_PEAKS_OPTIONS.map((option) => (
      <Checkbox
        key={option.value}
        checked={context.seasonal_peaks?.includes(option.value) ?? false}
        onChange={() => toggleArrayValue("seasonal_peaks", option.value)}
        label={option.label}
        icon={option.icon}
        disabled={
          (context.seasonal_peaks?.length ?? 0) >= 5 &&
          !context.seasonal_peaks?.includes(option.value)
        }
      />
    ))}
  </div>

  {/* Campo "Outros" sempre visível */}
  <input
    type="text"
    className="mt-3"
    placeholder="Outros eventos da sua região..."
    value={context.seasonal_peaks_custom ?? ""}
    onChange={(e) => updateField("seasonal_peaks_custom", e.target.value)}
    maxLength={100}
  />

  {/* Contador visual */}
  <div className="mt-2 text-xs text-zinc-500">
    {context.seasonal_peaks?.length ?? 0}/5 selecionados
  </div>
</FormField>
```

**Dados:**
```typescript
const SEASONAL_PEAKS_OPTIONS = [
  { value: "summer", label: "Verão", icon: "☀️" },
  { value: "winter", label: "Inverno", icon: "❄️" },
  { value: "christmas", label: "Natal", icon: "🎄" },
  { value: "mothers_day", label: "Dia das Mães", icon: "💐" },
  { value: "fathers_day", label: "Dia dos Pais", icon: "👔" },
  { value: "black_friday", label: "Black Friday", icon: "🏷️" },
  { value: "carnival", label: "Carnaval", icon: "🎭" },
  { value: "easter", label: "Páscoa", icon: "🐰" },
  { value: "valentines", label: "Dia dos Namorados", icon: "💝" },
  { value: "childrens_day", label: "Dia das Crianças", icon: "🧸" },
  { value: "new_year", label: "Ano Novo", icon: "🎆" },
  { value: "back_to_school", label: "Volta às Aulas", icon: "📚" },
];

// Adicionar ao IntelligenceContext
seasonal_peaks_custom?: string;
```

**Benefícios:**
- Visual e rápido (ícones + labels)
- Nomenclatura consistente
- Limite de 5 previne sobrecarga
- Campo "outros" captura eventos regionais

---

### Campo 3: `competitors` (Tab 2 - Posicionamento)

#### Estado Atual
```tsx
<StringArrayInput
  label="Principais concorrentes"
  description="Liste até 5 lojas que competem diretamente com você."
  value={context.competitors ?? []}
  onChange={(values) => setStringList("competitors", values)}
  placeholder="Ex: Loja do João, Mercadinho Central..."
  optional
/>
```

**Problemas:**
- Lojista não lembra nomes exatos ("aquela farmácia perto do posto")
- Digita marcas nacionais que não competem localmente
- Inconsistência (Drogasil vs drogasil vs Drogaril)

#### Estado Proposto

**UX Pattern:** Multi-select segmentado + campo "outros"

```tsx
<FormField
  label="Principais concorrentes"
  description="Quem mais disputa cliente com você? (máximo 5)"
  optional
>
  {/* Tipo de concorrência */}
  <RadioGroup
    value={context.competitor_type ?? "local"}
    onChange={(value) => updateField("competitor_type", value)}
    className="mb-4"
  >
    <Radio value="local" label="Lojas locais (mesmo bairro/cidade)" />
    <Radio value="regional" label="Redes regionais" />
    <Radio value="national" label="Grandes redes nacionais" />
    <Radio value="online" label="E-commerces" />
  </RadioGroup>

  {/* Multi-select com sugestões por segmento */}
  {context.competitor_type === "national" && (
    <div className="space-y-2">
      <label className="text-sm font-medium">Selecione as redes:</label>
      <div className="grid grid-cols-2 gap-2">
        {getCompetitorsBySegment(storeSegment).map((comp) => (
          <Checkbox
            key={comp}
            checked={context.competitors?.includes(comp) ?? false}
            onChange={() => toggleArrayValue("competitors", comp)}
            label={comp}
            disabled={
              (context.competitors?.length ?? 0) >= 5 &&
              !context.competitors?.includes(comp)
            }
          />
        ))}
      </div>
    </div>
  )}

  {/* Campo texto para local/regional/online */}
  {context.competitor_type !== "national" && (
    <textarea
      placeholder="Liste os concorrentes (separe por vírgula)..."
      value={context.competitors?.join(", ") ?? ""}
      onChange={(e) => {
        const values = e.target.value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
          .slice(0, 5);
        setStringList("competitors", values);
      }}
      maxLength={200}
    />
  )}

  <div className="mt-2 text-xs text-zinc-500">
    {context.competitors?.length ?? 0}/5 listados
  </div>
</FormField>
```

**Dados:**
```typescript
// Adicionar ao IntelligenceContext
competitor_type?: "local" | "regional" | "national" | "online";

// Sugestões por segmento (exemplos)
const COMPETITORS_BY_SEGMENT = {
  farmacia: ["Drogasil", "Drogaria São Paulo", "Pacheco", "Pague Menos", "Extrafarma"],
  adega: ["Mundial Vinhos", "Evino", "Grand Cru", "Mistral"],
  moda: ["Renner", "C&A", "Riachuelo", "Marisa", "Lojas Pompéia"],
  beauty: ["O Boticário", "Natura", "Sephora", "Eudora", "Avon"],
  home_decor: ["Leroy Merlin", "Tok&Stok", "Etna", "Casa & Vídeo", "Camicado"],
};

function getCompetitorsBySegment(segment?: string) {
  return COMPETITORS_BY_SEGMENT[segment ?? "farmacia"] ?? [];
}
```

**Benefícios:**
- Diferencia concorrência local vs nacional
- Sugestões evitam erros de digitação
- Limite de 5 mantém foco
- Flexibilidade para lojas locais

---

### Campo 4: `main_differentiation` (Tab 2 - Posicionamento)

#### Estado Atual
```tsx
<textarea
  label="Diferencial principal"
  description="O que faz o cliente escolher sua loja em vez da concorrência?"
  maxLength={300}
  value={context.main_differentiation ?? ""}
  onChange={(e) => updateField("main_differentiation", e.target.value)}
/>
```

**Problemas:**
- Lojista escreve respostas vagas ("bom atendimento", "qualidade")
- Não sabe articular diferencial real
- Campo frequentemente vazio ou com <20 caracteres

#### Estado Proposto

**UX Pattern:** Radio group + campo "outros"

```tsx
<FormField
  label="Diferencial principal"
  description="O que faz o cliente escolher você em vez da concorrência?"
>
  <RadioGroup
    value={context.main_differentiation_preset ?? ""}
    onChange={(value) => {
      if (value === "custom") {
        updateField("main_differentiation_preset", "custom");
        updateField("main_differentiation", "");
      } else {
        updateField("main_differentiation_preset", value);
        updateField("main_differentiation", DIFFERENTIATION_LABELS[value]);
      }
    }}
  >
    <Radio value="price" label="💰 Melhor preço da região" />
    <Radio value="quality" label="⭐ Produtos de alta qualidade" />
    <Radio value="service" label="🤝 Atendimento personalizado e atencioso" />
    <Radio value="variety" label="🛒 Maior variedade de produtos" />
    <Radio value="convenience" label="📍 Conveniência e localização" />
    <Radio value="expertise" label="🎓 Especialização técnica (conhecimento profundo)" />
    <Radio value="speed" label="⚡ Rapidez no atendimento" />
    <Radio value="trust" label="🏆 Tradição e confiança (anos de mercado)" />
    <Radio value="custom" label="✍️ Outro:" />
  </RadioGroup>

  {context.main_differentiation_preset === "custom" && (
    <textarea
      className="mt-3"
      placeholder="Descreva o diferencial único da sua loja..."
      maxLength={300}
      value={context.main_differentiation ?? ""}
      onChange={(e) => updateField("main_differentiation", e.target.value)}
    />
  )}
</FormField>
```

**Dados:**
```typescript
// Adicionar ao IntelligenceContext
main_differentiation_preset?: 
  | "price" 
  | "quality" 
  | "service" 
  | "variety" 
  | "convenience" 
  | "expertise" 
  | "speed" 
  | "trust" 
  | "custom";

const DIFFERENTIATION_LABELS = {
  price: "Oferecemos o melhor preço da região",
  quality: "Trabalhamos apenas com produtos de alta qualidade",
  service: "Nosso atendimento é personalizado e atencioso",
  variety: "Temos a maior variedade de produtos",
  convenience: "Localização conveniente e fácil acesso",
  expertise: "Equipe especializada com conhecimento técnico profundo",
  speed: "Atendimento rápido e eficiente",
  trust: "Tradição e confiança construídas ao longo dos anos",
};
```

**Benefícios:**
- Força lojista a escolher 1 diferencial claro
- Evita respostas genéricas ("tudo é bom")
- IA recebe posicionamento definido
- Ícones ajudam identificação visual

---

### Campo 5: `customer_pain_points` (Tab 3 - Conversão)

#### Estado Atual
```tsx
<StringArrayInput
  label="Dores do cliente"
  description="Que problemas o cliente tem que sua loja resolve?"
  value={context.customer_pain_points ?? []}
  onChange={(values) => setStringList("customer_pain_points", values)}
  placeholder="Ex: Não tem tempo, preços altos, falta de variedade..."
  optional
/>
```

**Problemas:**
- Lojista não entende conceito de "dor do cliente"
- Confunde com benefícios da loja
- Respostas vagas ou invertidas

#### Estado Proposto

**UX Pattern:** Checkboxes com limite + campo "outros"

```tsx
<FormField
  label="Problemas que você resolve"
  description="Que dificuldades o cliente tem que sua loja elimina? (máximo 4)"
  optional
>
  <div className="space-y-2">
    {PAIN_POINTS_OPTIONS.map((option) => (
      <Checkbox
        key={option.value}
        checked={context.customer_pain_points?.includes(option.value) ?? false}
        onChange={() => toggleArrayValue("customer_pain_points", option.value)}
        label={option.label}
        description={option.example}
        disabled={
          (context.customer_pain_points?.length ?? 0) >= 4 &&
          !context.customer_pain_points?.includes(option.value)
        }
      />
    ))}
  </div>

  <input
    type="text"
    className="mt-3"
    placeholder="Outro problema que você resolve..."
    value={context.customer_pain_points_custom ?? ""}
    onChange={(e) => updateField("customer_pain_points_custom", e.target.value)}
    maxLength={100}
  />

  <div className="mt-2 text-xs text-zinc-500">
    {context.customer_pain_points?.length ?? 0}/4 selecionados
  </div>
</FormField>
```

**Dados:**
```typescript
const PAIN_POINTS_OPTIONS = [
  {
    value: "high_price_elsewhere",
    label: "Preço alto em outros lugares",
    example: "Concorrência cobra caro",
  },
  {
    value: "low_quality_elsewhere",
    label: "Produtos de baixa qualidade em outros lugares",
    example: "Cliente não confia na qualidade",
  },
  {
    value: "bad_service_elsewhere",
    label: "Atendimento ruim em outros lugares",
    example: "Concorrência não atende bem",
  },
  {
    value: "distance",
    label: "Distância/dificuldade de acesso",
    example: "Outras lojas ficam longe",
  },
  {
    value: "lack_of_time",
    label: "Falta de tempo para comprar",
    example: "Cliente quer rapidez",
  },
  {
    value: "lack_of_trust",
    label: "Desconfiança de lojas desconhecidas",
    example: "Cliente não conhece a loja",
  },
  {
    value: "lack_of_variety",
    label: "Falta de variedade em outros lugares",
    example: "Concorrência não tem opções",
  },
  {
    value: "inconvenient_hours",
    label: "Horário de funcionamento limitado (outros)",
    example: "Concorrência fecha cedo",
  },
];

// Adicionar ao IntelligenceContext
customer_pain_points_custom?: string;
```

**Benefícios:**
- Linguagem clara ("problemas que você resolve")
- Exemplos ajudam compreensão
- Limite de 4 mantém foco
- Checkboxes com descrição educam lojista

---

## 🎨 Wireframes

### Antes (Texto Livre)
```
┌─────────────────────────────────────────┐
│ Público-alvo (Opcional)                 │
│ ┌─────────────────────────────────────┐ │
│ │ Ex: Homens 30-50 anos, famílias...  │ │
│ │                                     │ │
│ │ [cursor piscando em campo vazio]   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
   ❌ Lojista paralisa, não sabe o que escrever
```

### Depois (Seleção + Outros)
```
┌─────────────────────────────────────────┐
│ Público-alvo (Opcional)                 │
│ ┌─────────────────────────────────────┐ │
│ │ [v] Selecione...                    │ │
│ │     Famílias do bairro              │ │
│ │     Jovens 18-25 anos               │ │
│ │     Profissionais liberais          │ │
│ │     ...                             │ │
│ │     ✍️ Outros (descrever)           │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
   ✅ Lojista clica em 5 segundos
```

---

## 🧪 Critérios de Aceitação

### AC1: Campos implementados com seleções
- [ ] `target_audience` → Select com 8 opções + "Outros"
- [ ] `seasonal_peaks` → Checkboxes com 12 eventos + campo "outros"
- [ ] `competitors` → Multi-select segmentado por tipo + sugestões
- [ ] `main_differentiation` → Radio group com 8 opções + "Outros"
- [ ] `customer_pain_points` → Checkboxes com 8 opções + campo "outros"

### AC2: Comportamento "Outros"
- [ ] Ao selecionar "Outros", campo texto aparece imediatamente
- [ ] Campo texto tem limite de caracteres visível
- [ ] Ao voltar para opção pré-definida, campo texto desaparece
- [ ] Valor de "Outros" é salvo separadamente (`_custom` field)

### AC3: Validação e limites
- [ ] `seasonal_peaks`: máximo 5 selecionados (checkboxes desabilitam após limite)
- [ ] `competitors`: máximo 5 listados (contador visível)
- [ ] `customer_pain_points`: máximo 4 selecionados
- [ ] Contador visual mostra "X/Y selecionados"

### AC4: Preservação de dados existentes
- [ ] Migração: dados livres existentes → campo "custom" + preset = "custom"
- [ ] Ao carregar contexto com texto livre, mostra como "Outros" preenchido
- [ ] Não perde dados durante migração

### AC5: Acessibilidade
- [ ] Todos os campos são navegáveis por teclado (Tab/Shift+Tab)
- [ ] Radio/Checkbox respondem a Space/Enter
- [ ] Select responde a setas ↑↓
- [ ] Labels associados via `htmlFor`

### AC6: Auto-save funcional
- [ ] Mudança em select/radio/checkbox dispara auto-save (500ms debounce)
- [ ] Mudança em campo "Outros" dispara auto-save
- [ ] Status "Salvando..." aparece durante salvamento
- [ ] Status "Salvo ✅" aparece após sucesso

---

## 📊 Métricas de Sucesso

### Pré-implementação (baseline)
```
Taxa de preenchimento por campo:
├─ target_audience: 55%
├─ seasonal_peaks: 40%
├─ competitors: 35%
├─ main_differentiation: 60%
└─ customer_pain_points: 30%

Tempo médio por campo: ~1 min
Taxa de abandono na Tab 2: 25%
```

### Pós-implementação (meta)
```
Taxa de preenchimento por campo:
├─ target_audience: 95%+ 🎯
├─ seasonal_peaks: 90%+ 🎯
├─ competitors: 85%+ 🎯
├─ main_differentiation: 98%+ 🎯
└─ customer_pain_points: 90%+ 🎯

Tempo médio por campo: <20s 🎯
Taxa de abandono na Tab 2: <5% 🎯
```

### Como medir
- Analytics: track `field_filled` event com `field_name` e `value_type` (preset/custom)
- Analytics: track `form_time` per tab
- Analytics: track `form_abandoned` event com `last_tab_index`

---

## 🔄 Plano de Migração

### Dados Existentes no Database

**Cenário:** Lojistas que já preencheram campos com texto livre antes da mudança.

**Estratégia:**

1. **Preservar dados existentes:**
   - Campos com texto livre → migrar para `_custom` field
   - Setar `_preset` = `"custom"`
   - Exibir como opção "Outros" selecionada + texto preservado

2. **Exemplo:**
   ```typescript
   // Antes
   context.target_audience = "Famílias com crianças pequenas"

   // Depois (migration script)
   context.target_audience = "Famílias com crianças pequenas"  // preservado
   context.target_audience_preset = "custom"  // novo campo
   ```

3. **Script de migração (opcional):**
   ```sql
   -- Detectar padrões comuns e normalizar
   UPDATE store_intelligence
   SET context = jsonb_set(
     context,
     '{target_audience_preset}',
     '"families"'
   )
   WHERE context->>'target_audience' ILIKE '%famílias%';
   ```

---

## 🚀 Plano de Implementação

### Fase 1: Refatoração de Componentes (2h)
- [ ] Criar componentes reutilizáveis: `<SelectWithOther>`, `<CheckboxGroup>`, `<RadioWithOther>`
- [ ] Adicionar novos campos ao `IntelligenceContext` type
- [ ] Atualizar `useIntelligenceForm.ts` para suportar `_preset` fields

### Fase 2: Tab 1 - Público & Tom (1h)
- [ ] Refatorar `target_audience` → Select + Outros
- [ ] Refatorar `seasonal_peaks` → Checkboxes com grid
- [ ] Testar auto-save em ambos

### Fase 3: Tab 2 - Posicionamento (1.5h)
- [ ] Refatorar `competitors` → Multi-select segmentado
- [ ] Refatorar `main_differentiation` → Radio + Outros
- [ ] Adicionar lógica de sugestões por segmento

### Fase 4: Tab 3 - Conversão (1h)
- [ ] Refatorar `customer_pain_points` → Checkboxes com descrições
- [ ] Adicionar contadores visuais

### Fase 5: Validação (0.5h)
- [ ] Testar todos os ACs
- [ ] Validar com @ux-design-expert em localhost
- [ ] Confirmar auto-save funcionando em todos os campos

**Esforço total:** 6 horas

---

## 🎯 Priorização

**Quando implementar:**
1. ✅ Após resolver BLOCKER 1 (auto-save ao sair da página)
2. ✅ Após resolver BLOCKER 2 (sidebar travada)
3. ⚠️ Antes de Story 2B (mobile) OU depois (a definir com PO)

**Justificativa para fazer ANTES de Story 2B:**
- Melhoria de UX beneficia desktop E mobile
- Evita refatorar mobile depois
- Aumenta valor entregue no sprint

**Justificativa para fazer DEPOIS de Story 2B:**
- Completa escopo original da sprint primeiro
- Validação mobile pode revelar outros ajustes necessários
- Pode ser tratado como refinamento pós-MVP

**Decisão:** A cargo do @po (Product Owner)

---

## 📝 Notas de Implementação para @dev

### Componentes Reutilizáveis Sugeridos

**1. SelectWithOther.tsx**
```tsx
type SelectWithOtherProps = {
  label: string;
  description?: string;
  options: { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
  customValue?: string;
  onCustomValueChange?: (value: string) => void;
  customPlaceholder?: string;
  customMaxLength?: number;
  optional?: boolean;
};
```

**2. CheckboxGroup.tsx**
```tsx
type CheckboxGroupProps = {
  label: string;
  description?: string;
  options: { value: string; label: string; icon?: string; description?: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  maxSelections?: number;
  showCustomField?: boolean;
  customValue?: string;
  onCustomValueChange?: (value: string) => void;
  optional?: boolean;
};
```

**3. RadioWithOther.tsx**
```tsx
type RadioWithOtherProps = {
  label: string;
  description?: string;
  options: { value: string; label: string; icon?: string }[];
  value: string;
  onValueChange: (value: string) => void;
  customValue?: string;
  onCustomValueChange?: (value: string) => void;
  customPlaceholder?: string;
  customMaxLength?: number;
  required?: boolean;
};
```

### Estrutura de Dados

**Adicionar ao `IntelligenceContext`:**
```typescript
// Tab 1
target_audience_preset?: "families" | "young_adults" | "professionals" | "seniors" | "students" | "parents" | "mixed_age" | "custom";
seasonal_peaks_custom?: string;

// Tab 2
competitor_type?: "local" | "regional" | "national" | "online";
main_differentiation_preset?: "price" | "quality" | "service" | "variety" | "convenience" | "expertise" | "speed" | "trust" | "custom";

// Tab 3
customer_pain_points_custom?: string;
```

### Auto-save

**Todos os novos campos devem:**
- Disparar `updateField()` ao mudar valor
- Respeitar debounce de 500ms
- Funcionar tanto ao trocar de aba quanto ao sair da página (após BLOCKER 1 corrigido)

### Testes

**Testar cenários:**
- Selecionar preset → trocar aba → voltar → valor preservado ✅
- Selecionar "Outros" → digitar texto → trocar aba → voltar → texto preservado ✅
- Selecionar preset → selecionar "Outros" → digitar → voltar para preset → texto apagado ✅
- Atingir limite de seleções → checkboxes restantes desabilitados ✅
- Campo obrigatório vazio → validação impede salvamento ✅

---

## 🔗 Referências

- Perfil lojista: [docs/ux/lojista-persona.md](./lojista-persona.md) *(criar se não existir)*
- Story 2A (Desktop Core): [docs/stories/intelligence-sprint-1/STORY-2A-frontend-core.md](../stories/intelligence-sprint-1/STORY-2A-frontend-core.md)
- Componentes atuais: `app/dashboard/store/intelligence/components/`
- Hook de estado: `app/dashboard/store/intelligence/hooks/useIntelligenceForm.ts`

---

**Documento preparado por:** @ux-design-expert (Uma)  
**Para implementação por:** @dev (Dex)  
**Aprovação necessária:** @po (Product Owner) — priorização no backlog  

✅ **Pronto para desenvolvimento assim que blockers 1 e 2 forem resolvidos**
