
# Prompt: @dev — Implementar Story 2.1 (Schemas de Validação Zod)

Copie tudo abaixo desta linha e envie para o @dev.

---

Você é @dev (Dex), desenvolvedor sênior do AIOX. Implemente a Story 2.1 conforme especificado abaixo.

Execute o bloco [THINK] antes de qualquer ação de código.

---

[CONTEXT — Estado real do repositório]

Projeto: Vendeo (Next.js 16 + TypeScript + Supabase + Zod)
Story: 2.1 — Schemas de Validação (Zod)
Story file: docs/stories/2.1.story.md (Status: Ready)
Branch: criar feat/story-2.1-schemas antes de iniciar

ARQUIVO 1 — lib/domain/campaigns/schemas.ts (EXISTE — apenas adicionar ao final)

Exports presentes (NÃO MODIFICAR, NÃO RENOMEAR):
- CampaignReadableContentTypeSchema
- CampaignRequestSchema
- CampaignAISchema          ← usado em mapper.ts e service.ts
- CampaignReelsSchema       ← usado em mapper.ts
- DbCampaignSchema          ← usado em mapper.ts
- CampaignRequest (tipo)
- DbCampaignRaw (tipo)

Exports ausentes (ADICIONAR nesta story):
- AICampaignContentSchema   ← alias de CampaignAISchema (seguro, sem rename)
- CampaignDomainSchema      ← shape limpo pós-mapper, espelha Campaign de types.ts

ARQUIVO 2 — lib/domain/campaigns/schemas.test.ts (NÃO EXISTE — criar)

ARQUIVO 3 — lib/domain/campaigns/types.ts (NÃO MODIFICAR — apenas referência)
Contém a interface Campaign que CampaignDomainSchema deve espelhar.

ARQUIVO 4 — lib/domain/campaigns/mapper.ts (NÃO MODIFICAR — apenas referência)
Importa: CampaignAISchema, CampaignReelsSchema, DbCampaignSchema
A função mapDbCampaignToDomain(data: unknown): Campaign usa DbCampaignSchema.parse()

ARQUIVO 5 — package.json (NÃO TEM test runner instalado)
Dependências atuais: next, react, zod, @supabase/supabase-js, openai
DevDependencies: typescript, tailwindcss, autoprefixer, husky
NÃO há jest, NÃO há vitest — @dev deve instalar vitest antes de criar schemas.test.ts

[/CONTEXT]

---

[THINK]

Execute estes passos antes de escrever qualquer código:

Passo 1 — Pré-condição: test runner
O projeto não tem vitest nem jest. Antes de criar schemas.test.ts, instale:
  npm install -D vitest @vitest/coverage-v8
Configure o script de test no package.json:
  "test": "vitest run"
  "test:watch": "vitest"
  "test:coverage": "vitest run --coverage"
Adicione vitest.config.ts na raiz do projeto com resolve.alias para "@/*".

Passo 2 — AICampaignContentSchema
CampaignAISchema já existe e é o schema que valida a resposta da IA em service.ts.
AICampaignContentSchema deve ser:
  export const AICampaignContentSchema = CampaignAISchema;
  export type AICampaignContent = z.infer<typeof AICampaignContentSchema>;
Isso é um alias — zero risco de breaking change.

Passo 3 — CampaignDomainSchema
Deve espelhar a interface Campaign de types.ts.
O mapper (mapDbCampaignToDomain) produz um objeto Campaign.
CampaignDomainSchema valida este output.
Atenção ao content_type: usar z.enum(["product", "service", "message"]).nullable()
NÃO usar CampaignReadableContentTypeSchema (que inclui "info" como legado).

Passo 4 — schemas.test.ts
Cobrir:
  - DbCampaignSchema: happy path (fixture de registro real), error case (campo obrigatório ausente)
  - AICampaignContentSchema: happy path (fixture de resposta IA), error case (tipo errado)
  - CampaignDomainSchema: happy path (fixture de Campaign), error case (content_type inválido)

Passo 5 — Zero breaking changes
Antes de finalizar, verificar:
  - mapper.ts ainda importa CampaignAISchema, CampaignReelsSchema, DbCampaignSchema? SIM (não foram renomeados)
  - service.ts ainda importa CampaignAISchema? SIM
  - npm run typecheck passa? Deve passar
  - npm run test passa? Deve passar

[/THINK]

---

[TASK 1 — Instalar test runner]

Execute no terminal (raiz do projeto):

  npm install -D vitest @vitest/coverage-v8

Crie vitest.config.ts na raiz:

  import { defineConfig } from "vitest/config";
  import path from "path";

  export default defineConfig({
    test: {
      environment: "node",
      globals: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  });

Adicione ao package.json na chave "scripts":
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"

[/TASK 1]

---

[TASK 2 — Adicionar exports ausentes em schemas.ts]

REGRA: Apenas append ao final do arquivo. Não tocar em nada acima da última linha atual.

Adicionar no final de lib/domain/campaigns/schemas.ts:

  // ─────────────────────────────────────────────────────────────
  // AICampaignContentSchema — alias canônico para validação da
  // resposta OpenAI. Alias seguro de CampaignAISchema.
  // ─────────────────────────────────────────────────────────────
  export const AICampaignContentSchema = CampaignAISchema;
  export type AICampaignContent = z.infer<typeof AICampaignContentSchema>;

  // ─────────────────────────────────────────────────────────────
  // CampaignDomainSchema — valida o objeto Campaign limpo
  // produzido por mapDbCampaignToDomain em mapper.ts.
  // Espelha a interface Campaign de lib/domain/campaigns/types.ts.
  // ─────────────────────────────────────────────────────────────
  const CampaignCanonicalContentTypeSchema = z
    .enum(["product", "service", "message"])
    .nullable();

  export const CampaignDomainSchema = z.object({
    id: z.string(),
    store_id: z.string(),
    product_name: z.string().nullable(),
    price: z.number().nullable(),
    price_label: z.string().nullable(),
    audience: z.string().nullable(),
    objective: z.string().nullable(),
    product_positioning: z.string().nullable(),
    status: z.string().nullable(),
    campaign_type: z.enum(["post", "reels", "both"]).nullable(),
    content_type: CampaignCanonicalContentTypeSchema,
    legacy_content_type: z.string().nullable(),
    domain_input: z.record(z.unknown()),
    domain_input_version: z.number(),
    post_status: z.enum(["none", "draft", "ready", "approved"]).nullable(),
    reels_status: z.enum(["none", "draft", "ready", "approved"]).nullable(),
    origin: z.enum(["manual", "plan"]),
    weekly_plan_item_id: z.string().nullable(),
    image_url: z.string().nullable(),
    product_image_url: z.string().nullable(),
    headline: z.string().nullable(),
    body_text: z.string().nullable(),
    cta: z.string().nullable(),
    ai_caption: z.string().nullable(),
    ai_text: z.string().nullable(),
    ai_cta: z.string().nullable(),
    ai_hashtags: z.string().nullable(),
    ai_generated_at: z.string().nullable(),
    reels_hook: z.string().nullable(),
    reels_script: z.string().nullable(),
    reels_shotlist: z.array(z.unknown()).nullable(),
    reels_on_screen_text: z.array(z.string()).nullable(),
    reels_audio_suggestion: z.string().nullable(),
    reels_duration_seconds: z.number().nullable(),
    reels_caption: z.string().nullable(),
    reels_cta: z.string().nullable(),
    reels_hashtags: z.string().nullable(),
    reels_generated_at: z.string().nullable(),
    created_at: z.string(),
  });

  export type CampaignDomain = z.infer<typeof CampaignDomainSchema>;

[/TASK 2]

---

[TASK 3 — Criar schemas.test.ts]

Criar lib/domain/campaigns/schemas.test.ts com o conteúdo abaixo.
Use fixtures baseadas em dados reais do banco — ajuste campos opcionais conforme necessário.

  import { describe, it, expect } from "vitest";
  import {
    DbCampaignSchema,
    AICampaignContentSchema,
    CampaignDomainSchema,
  } from "./schemas";

  // ─────────────────────────────────────────────────────────────
  // Fixtures — representam dados reais do banco e da IA
  // ─────────────────────────────────────────────────────────────

  const validDbCampaignFixture = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    store_id: "abc12345-0000-0000-0000-000000000001",
    product_name: "Tênis Air Max",
    price: 299.9,
    price_label: "R$ 299,90",
    audience: "jovens_festa",
    objective: "promocao",
    product_positioning: "medio",
    status: "ready",
    campaign_type: "post",
    content_type: "product",
    legacy_content_type: null,
    domain_input: null,
    domain_input_version: null,
    post_status: "ready",
    reels_status: "none",
    origin: "manual",
    weekly_plan_item_id: null,
    image_url: null,
    product_image_url: null,
    headline: "Tênis na promoção!",
    body_text: null,
    cta: "Vem pegar o seu",
    ai_caption: "Não perca essa oferta!",
    ai_text: "Tênis Air Max com desconto especial.",
    ai_cta: "Chama no WhatsApp!",
    ai_hashtags: "#tenis #promo",
    ai_generated_at: "2026-04-20T10:00:00.000Z",
    reels_hook: null,
    reels_script: null,
    reels_shotlist: null,
    reels_on_screen_text: null,
    reels_audio_suggestion: null,
    reels_duration_seconds: null,
    reels_caption: null,
    reels_cta: null,
    reels_hashtags: null,
    reels_generated_at: null,
    created_at: "2026-04-18T08:00:00.000Z",
  };

  const validAIResponseFixture = {
    headline: "Tênis na promoção!",
    caption: "Não perca essa oferta incrível.",
    text: "Tênis Air Max com desconto especial apenas hoje.",
    cta: "Chama no WhatsApp e garanta o seu!",
    hashtags: "#tenis #promo #oferta",
    price_label: "R$ 299,90",
  };

  const validCampaignDomainFixture = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    store_id: "abc12345-0000-0000-0000-000000000001",
    product_name: "Tênis Air Max",
    price: 299.9,
    price_label: "R$ 299,90",
    audience: "jovens_festa",
    objective: "promocao",
    product_positioning: "medio",
    status: "ready",
    campaign_type: "post",
    content_type: "product",
    legacy_content_type: null,
    domain_input: {},
    domain_input_version: 1,
    post_status: "ready",
    reels_status: "none",
    origin: "manual",
    weekly_plan_item_id: null,
    image_url: null,
    product_image_url: null,
    headline: "Tênis na promoção!",
    body_text: null,
    cta: "Vem pegar o seu",
    ai_caption: "Não perca essa oferta!",
    ai_text: "Tênis Air Max com desconto especial.",
    ai_cta: "Chama no WhatsApp!",
    ai_hashtags: "#tenis #promo",
    ai_generated_at: "2026-04-20T10:00:00.000Z",
    reels_hook: null,
    reels_script: null,
    reels_shotlist: null,
    reels_on_screen_text: null,
    reels_audio_suggestion: null,
    reels_duration_seconds: null,
    reels_caption: null,
    reels_cta: null,
    reels_hashtags: null,
    reels_generated_at: null,
    created_at: "2026-04-18T08:00:00.000Z",
  };

  // ─────────────────────────────────────────────────────────────
  // DbCampaignSchema
  // ─────────────────────────────────────────────────────────────

  describe("DbCampaignSchema", () => {
    it("happy path: valida registro real do banco", () => {
      const result = DbCampaignSchema.safeParse(validDbCampaignFixture);
      expect(result.success).toBe(true);
    });

    it("happy path: aceita campos opcionais ausentes", () => {
      const minimal = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        store_id: "abc12345-0000-0000-0000-000000000001",
        product_name: null,
        price: null,
        price_label: null,
        audience: null,
        objective: null,
        product_positioning: null,
        status: null,
        campaign_type: null,
        content_type: null,
        post_status: null,
        reels_status: null,
        origin: "manual",
        weekly_plan_item_id: null,
        image_url: null,
        product_image_url: null,
        headline: null,
        body_text: null,
        cta: null,
        ai_caption: null,
        ai_text: null,
        ai_cta: null,
        ai_hashtags: null,
        ai_generated_at: null,
        reels_hook: null,
        reels_script: null,
        reels_shotlist: null,
        reels_on_screen_text: null,
        reels_audio_suggestion: null,
        reels_duration_seconds: null,
        reels_caption: null,
        reels_cta: null,
        reels_hashtags: null,
        reels_generated_at: null,
      };
      const result = DbCampaignSchema.safeParse(minimal);
      expect(result.success).toBe(true);
    });

    it("error case: id ausente", () => {
      const { id: _, ...withoutId } = validDbCampaignFixture;
      const result = DbCampaignSchema.safeParse(withoutId);
      expect(result.success).toBe(false);
    });

    it("error case: campaign_type com valor fora do enum", () => {
      const invalid = { ...validDbCampaignFixture, campaign_type: "story" };
      const result = DbCampaignSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // AICampaignContentSchema
  // ─────────────────────────────────────────────────────────────

  describe("AICampaignContentSchema", () => {
    it("happy path: valida resposta real de /api/generate/campaign", () => {
      const result = AICampaignContentSchema.safeParse(validAIResponseFixture);
      expect(result.success).toBe(true);
    });

    it("happy path: campos opcionais ausentes são aceitos", () => {
      const result = AICampaignContentSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("error case: campo com tipo errado (headline como número)", () => {
      const invalid = { ...validAIResponseFixture, headline: 42 };
      const result = AICampaignContentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // CampaignDomainSchema
  // ─────────────────────────────────────────────────────────────

  describe("CampaignDomainSchema", () => {
    it("happy path: valida Campaign limpo pós-mapper", () => {
      const result = CampaignDomainSchema.safeParse(validCampaignDomainFixture);
      expect(result.success).toBe(true);
    });

    it("happy path: content_type null é aceito", () => {
      const result = CampaignDomainSchema.safeParse({
        ...validCampaignDomainFixture,
        content_type: null,
      });
      expect(result.success).toBe(true);
    });

    it("error case: content_type 'info' não é aceito no domínio canônico", () => {
      const invalid = { ...validCampaignDomainFixture, content_type: "info" };
      const result = CampaignDomainSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("error case: origin com valor fora do enum", () => {
      const invalid = { ...validCampaignDomainFixture, origin: "scheduled" };
      const result = CampaignDomainSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("error case: domain_input ausente (domínio requer objeto, não null)", () => {
      const invalid = { ...validCampaignDomainFixture, domain_input: null };
      const result = CampaignDomainSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

[/TASK 3]

---

[TASK 4 — Verificação final]

Execute na ordem:

  1. npm run typecheck
     Esperado: zero erros

  2. npm run test
     Esperado: todos os testes em schemas.test.ts passando

  3. Verificar manualmente que mapper.ts continua funcional:
     grep -n "CampaignAISchema\|CampaignReelsSchema\|DbCampaignSchema" lib/domain/campaigns/mapper.ts
     Esperado: os 3 imports presentes e inalterados

[/TASK 4]

---

[TASK 5 — Atualizar Story File]

Ao concluir, atualizar docs/stories/2.1.story.md:
- Status: InProgress → (ao finalizar) InReview
- Marcar checkboxes na Definition of Done como [x]
- Atualizar File List com os arquivos modificados/criados
- Adicionar entrada no Change Log

[/TASK 5]

---

[CONSTRAINTS — Regras absolutas]

- NÃO renomear CampaignAISchema, CampaignReelsSchema ou DbCampaignSchema
- NÃO modificar mapper.ts, service.ts, selectors.ts, logic.ts ou types.ts
- NÃO alterar rotas de API, componentes ou UI
- NÃO fazer git push (delegar para @devops)
- AICampaignContentSchema = alias de CampaignAISchema (1 linha, nunca reescrita)
- CampaignDomainSchema usa z.enum(["product","service","message"]) para content_type
- domain_input no domínio é z.record(z.unknown()) — nunca nullable
- domain_input_version no domínio é z.number() — nunca nullable

[/CONSTRAINTS]

---

[FILES EXPECTED]

Arquivos modificados:
  lib/domain/campaigns/schemas.ts   ← append dos 2 exports ausentes ao final
  package.json                       ← scripts test/test:watch/test:coverage

Arquivos criados:
  lib/domain/campaigns/schemas.test.ts
  vitest.config.ts

[/FILES EXPECTED]
