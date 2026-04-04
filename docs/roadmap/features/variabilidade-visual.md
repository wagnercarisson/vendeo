# 🎨 Feature — Variabilidade Visual

## 🎯 Objetivo

Garantir que as artes geradas pelo Vendeo sejam visualmente distintas entre diferentes lojas, mantendo consistência dentro da mesma loja.

O sistema deve evitar:

👉 sensação de template genérico
👉 repetição excessiva
👉 baixa percepção de valor

---

## 🧠 Problema identificado

Atualmente, o motor de geração visual pode produzir artes parecidas demais entre usuários diferentes.

Isso gera:

* sensação de automação excessiva
* redução de valor percebido
* risco de duas lojas distintas parecerem usar o mesmo template

---

## 💡 Estratégia

Implementar **variabilidade controlada**.

A arte não deve ser totalmente aleatória.

Ela deve ser:

* consistente por loja
* variável entre lojas
* previsível para o sistema
* segura para legibilidade

---

# 🧩 Princípios da implementação

## 1. Não criar editor livre

Esta feature NÃO é sobre arrastar elementos manualmente.

Não haverá:

* canvas editável
* layers livres
* editor estilo Canva

---

## 2. Variação guiada e parametrizada

A variabilidade deve vir de presets e regras internas.

O sistema escolhe automaticamente, com base em:

* identidade da loja
* estilo base
* layout permitido
* tipo de conteúdo

---

## 3. Mesmo DNA visual dentro da loja

A mesma loja pode manter repetição parcial de estilo.

Objetivo:

* gerar reconhecimento
* criar consistência de marca

---

## 4. Lojas diferentes não devem colidir visualmente

Duas lojas diferentes não devem gerar exatamente a mesma arte-base.

---

# 🧱 Escopo MVP

O MVP desta feature deve implementar variação em 3 níveis:

---

## A. Layout

Variar posições de:

* título
* preço
* CTA
* imagem do produto
* badge de destaque

### Layouts permitidos no MVP

* `hero_left`
* `hero_right`
* `center_focus`
* `top_banner`

📌 Importante:
todos os layouts devem manter boa legibilidade

---

## B. Estilo

Criar estilos base para a composição visual:

* `moderno`
* `promocional`
* `elegante`
* `popular`

Esses estilos podem influenciar:

* contraste
* peso visual
* forma do badge
* hierarquia do texto
* intensidade do destaque

---

## C. Identidade da loja

Usar dados da loja para manter consistência:

* cor predominante
* estilo preferencial
* assinatura visual básica

📌 No MVP, isso pode ser derivado de forma simples, sem sistema complexo de branding.

---

# ⚙️ Modelo de implementação recomendado

## Etapa 1 — Criar contratos visuais

Criar tipos/contratos para representar:

* layout visual
* estilo visual
* posição dos elementos

### Sugestão de local

```bash
lib/graphics/
```

### Sugestão de arquivos

```bash
lib/graphics/types.ts
lib/graphics/layout-presets.ts
lib/graphics/style-presets.ts
```

---

## Etapa 2 — Parametrizar o renderer

Arquivo principal atual:

```bash
lib/graphics/renderer.ts
```

O renderer deve deixar de assumir layout fixo e passar a receber parâmetros como:

* `layoutVariant`
* `styleVariant`
* `accentColor`
* `storeVisualSeed`

---

## Etapa 3 — Definir lógica de seleção por loja

Criar uma lógica determinística para que a loja mantenha consistência.

### Exemplo de abordagem

Gerar uma seed baseada em:

* `store.id`
* `campaign.content_type`
* `campaign.objective`

Com essa seed, o sistema escolhe:

* layout permitido
* estilo permitido
* pequenas variações

📌 Resultado:

* mesma loja tende a cair em padrões semelhantes
* lojas diferentes tendem a divergir

---

## Etapa 4 — Restringir combinações perigosas

Nem toda combinação visual deve ser permitida.

Criar regras para bloquear:

* baixo contraste
* texto sobre área crítica
* excesso de elementos em conflito

---

# 🧠 Regras funcionais

## Regra 1

A mesma loja pode repetir:

* estilo
* distribuição visual
* cor dominante

## Regra 2

Lojas diferentes não devem compartilhar exatamente o mesmo conjunto:

* layout
* estilo
* hierarquia visual

## Regra 3

Campanhas informativas podem usar estilos menos promocionais

## Regra 4

Campanhas promocionais podem usar estilos com mais contraste e badge forte

---

# 🖥️ Impacto nos arquivos do projeto

## 1. Renderer

### Arquivo:

```bash
lib/graphics/renderer.ts
```

### Alteração:

Refatorar para receber configuração visual dinâmica em vez de valores fixos.

---

## 2. Geração da campanha / montagem da arte

### Possíveis locais:

```bash
lib/domain/campaigns/
app/api/generate/campaign/
```

### Alteração:

Definir em que ponto a configuração visual da campanha será calculada e enviada ao renderer.

---

## 3. Dados da loja

### Possíveis locais:

```bash
lib/domain/stores/
app/dashboard/store/
```

### Alteração:

Avaliar se já existe informação suficiente para:

* cor base
* estilo base
* identidade mínima

📌 Se não existir, começar com fallback automático.

---

# 🧪 Regras de validação visual

Cada arte gerada deve:

* continuar legível
* manter destaque do conteúdo principal
* não parecer poluída
* não sacrificar clareza por variedade

---

# 📊 Critérios de sucesso

A feature será considerada bem implementada quando:

* diferentes lojas gerarem artes perceptivelmente distintas
* a mesma loja mantiver coerência visual básica
* não houver aumento relevante de erros visuais
* a percepção de qualidade aumentar

---

# 🚫 Fora do escopo neste momento

* editor manual
* drag and drop
* rotação livre de elementos
* troca livre de fontes pelo usuário
* ajustes finos por pixel

Esses itens podem ser considerados no futuro apenas como:
👉 ajustes visuais guiados

---

# 📋 Tasks de implementação

## Contratos e presets

* [ ] criar `lib/graphics/types.ts`
* [ ] criar `lib/graphics/layout-presets.ts`
* [ ] criar `lib/graphics/style-presets.ts`

## Renderer

* [ ] refatorar `renderer.ts` para aceitar variantes
* [ ] aplicar presets de layout
* [ ] aplicar presets de estilo

## Seleção visual

* [ ] criar função determinística de seleção por loja
* [ ] definir seed visual
* [ ] evitar colisões entre lojas

## Segurança visual

* [ ] bloquear combinações ruins
* [ ] validar contraste mínimo
* [ ] validar área segura para texto

## Testes

* [ ] gerar campanhas de 3 lojas diferentes
* [ ] gerar múltiplas campanhas da mesma loja
* [ ] comparar consistência e diferenciação
* [ ] validar conteúdo promocional e informativo

---

# 🧭 Ordem sugerida de execução

## Passo 1

Criar contratos e presets visuais

## Passo 2

Refatorar renderer para consumir presets

## Passo 3

Criar função de seleção determinística por loja

## Passo 4

Validar visualmente em campanhas reais

---

# 🎯 Resultado esperado

Ao final desta implementação, o Vendeo deve:

👉 parecer menos template
👉 parecer mais agência
👉 manter simplicidade operacional

---

# 🔜 Dependências e próximos passos

Depois desta feature, a próxima prioridade natural é:

👉 `docs/roadmap/features/informativo.md`

porque a percepção visual e a expansão estratégica de conteúdo se reforçam mutuamente.
