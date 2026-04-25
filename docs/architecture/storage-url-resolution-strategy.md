# Estratégia de Resolução de URLs do Supabase Storage

**Status:** Decisão Arquitetural Pendente  
**Data:** 2026-04-25  
**Contexto:** Story 4.5 - Pipeline Integration (IMAGE_LOAD_FAILED em produção)  
**Relacionados:**
- `docs/stories/4.5.story.md` (Pipeline Integration)
- `lib/supabase/storage-server.ts` (healing logic existente)
- `lib/domain/campaigns/visual-pipeline.ts` (ponto de falha)
- `lib/domain/campaigns/service.ts` (origem do path)

---

## 1. Resumo Executivo

**Problema:** Após deploy da Story 4.5, geração de campanhas falha com `IMAGE_LOAD_FAILED` ao tentar processar imagens via Motor 1 (Visual Reader).

**Causa Raiz:** 
- Upload v2 salva **path relativo** em `product_image_url` (`stores/.../product.webp`)
- Listagem funciona porque usa `getSignedImageUrl()` que tem healing logic
- Pipeline v2 falha porque `assertImageReachable()` chama `fetch(path)` diretamente sem resolver URL

**Decisões Necessárias:**
1. Path vs URL como padrão de persistência?
2. Manter fallback para campanhas antigas ou fazer migration?
3. Onde adicionar resolução path → URL no código novo?

**Impacto:** BLOCKER para produção - Motors 1-4 não funcionam até resolução.

---

## 2. Contexto Técnico

### 2.1 Estado Atual da Persistência

| Campo | Campanhas Antigas (v1) | Campanhas Novas (v2) |
|-------|------------------------|----------------------|
| `image_url` | URL pública completa | NULL |
| `product_image_url` | NULL | Path relativo (`stores/.../file.webp`) |

### 2.2 Arquitetura de Consumo

```
┌─────────────────────────────────────────────────────────┐
│ DATABASE (campaigns)                                     │
│ - image_url: NULL (legacy)                              │
│ - product_image_url: "stores/.../product.webp" (v2)    │
└─────────────────────────────────────────────────────────┘
                      │
            ┌─────────┴────────────┐
            │                      │
     ┌──────▼──────┐      ┌───────▼────────┐
     │  LISTAGEM   │      │ VISUAL-READER  │
     │  (funciona) │      │  (falha)       │
     │             │      │                │
     │ Path        │      │ Path           │
     │   ↓         │      │   ↓            │
     │ getSignedImageUrl()│ fetch(path)   │
     │   ↓         │      │   ↓            │
     │ ✅ URL      │      │ ❌ ERROR       │
     └─────────────┘      └────────────────┘
```

### 2.3 Healing Logic Existente

**Arquivo:** `lib/supabase/storage-server.ts` (linhas 33-90)

```typescript
export async function getSignedImageUrl(path: string, expiresIn = 3600) {
  // 1. Detecta se input é path relativo ou URL completa
  // 2. Se URL, extrai path relativo via regex
  // 3. Limpa duplicações (ex: "logos/ID/logos/" → "logos/ID/")
  // 4. Resolve bucket (campaign-images)
  // 5. Chama supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  // 6. Retorna URL assinada com token de 1h
}
```

**Funciona para:**
- ✅ Listagem de campanhas (usa `getApprovedAssetSignedUrlAction`)
- ✅ Exibição de logos/artes aprovadas
- ✅ Campanhas antigas com URL completa (fallback)

**Não funciona para:**
- ❌ Pipeline v2 (`assertImageReachable` não usa helper)
- ❌ Motor 1 recebe path sem resolução

---

## 3. Análise de Decisões

### 3.1 Decisão 1: Padrão de Persistência (Path vs URL)

| Opção | Prós | Contras | Impacto |
|-------|------|---------|---------|
| **Path Relativo** (atual v2) | • Agnóstico de ambiente (dev/staging/prod)<br>• Tamanho menor no DB<br>• Portabilidade entre buckets<br>• Independente de token/assinatura | • Requer resolução em runtime<br>• Mais complexo para debugar<br>• Dependência de helper | Requer helper em toda operação de fetch |
| **URL Pública** | • Simples fetch() direto<br>• Menos processamento<br>• Fácil debugging (URL no log) | • Acoplamento ao ambiente<br>• Tamanho maior no DB<br>• Quebra se migrar bucket/domínio<br>• Sem controle de acesso | Simplifica código mas perde flexibilidade |
| **URL Assinada** | • Segurança (token expira)<br>• Controle de acesso granular | • Precisa renovar token periodicamente<br>• Complexo de gerenciar<br>• Performance overhead | Não recomendado para persistência |

**Recomendação Técnica:** **Path Relativo** (manter v2 atual)

**Justificativa:**
- Paths são a fonte de verdade no Supabase Storage
- URLs públicas podem mudar (mudança de domínio, migração de bucket)
- Resolver path → URL é responsabilidade da camada de acesso, não de persistência
- Padrão alinha com princípio de separação de concerns

---

### 3.2 Decisão 2: Campanhas Antigas (Fallback vs Migration)

**Contexto:** Campanhas antigas têm `image_url` (URL completa) e `product_image_url` = NULL.

| Opção | Prós | Contras | Esforço |
|-------|------|---------|---------|
| **Manter Fallback** | • Zero risco de perda de dados<br>• Backward compatible<br>• Deploy imediato | • Código mais complexo<br>• Dois paths de execução<br>• Dívida técnica permanente | Baixo (código já existe) |
| **Migration SQL** | • Arquitetura limpa<br>• Um único path de execução<br>• Remove complexidade | • Requer script one-time<br>• Risco de falha na migration<br>• Precisa validar URLs antigas | Médio (~4h de trabalho) |
| **Deprecar Antigas** | • Começo limpo<br>• Zero complexidade | • ❌ Perda de dados históricos<br>• ❌ Impacto em clientes | ❌ INACEITÁVEL |

**Análise de Impacto:** Quantas campanhas antigas existem?

```sql
-- Query para decisão
SELECT 
  COUNT(*) FILTER (WHERE image_url IS NOT NULL AND product_image_url IS NULL) as campanhas_antigas,
  COUNT(*) FILTER (WHERE product_image_url IS NOT NULL) as campanhas_v2,
  COUNT(*) as total
FROM campaigns;
```

**Critérios de Decisão:**
- Se `campanhas_antigas < 100` → **Migration SQL** (baixo risco)
- Se `campanhas_antigas > 100` → **Manter Fallback** (pragmático)

---

### 3.3 Decisão 3: Camada de Resolução (Onde Fixar)

| Camada | Prós | Contras | Complexidade |
|--------|------|---------|--------------|
| **service.ts** (antes de chamar pipeline) | • Motor 1 recebe URL pronta<br>• Simples para Motors | • Service.ts fica acoplado ao storage<br>• Não resolve para outros consumers | Baixa (5 linhas) |
| **visual-pipeline.ts** (assertImageReachable) | • Isolado na pipeline<br>• Resolve para todos os 4 Motors<br>• Service.ts fica clean | • Pipeline precisa importar storage helper<br>• Acoplamento cross-domain | Média (10 linhas) |
| **visual-reader/service.ts** (Motor 1 interno) | • Motor resolve próprio problema<br>• Isolamento máximo | • ❌ Cada motor precisaria resolver<br>• ❌ Duplicação de lógica | Alta (40+ linhas) |

**Recomendação Técnica:** **visual-pipeline.ts** (opção 2)

**Justificativa:**
- Pipeline é ponto de orquestração dos 4 Motors
- Resolve uma vez para todos os consumers
- Service.ts permanece agnóstico de storage (melhor separação)
- Alinha com princípio de Single Responsibility

---

## 4. Proposta de Implementação

### 4.1 Fix Imediato (Desbloquear Produção)

**Arquivo:** `lib/domain/campaigns/visual-pipeline.ts`

**Mudança em `assertImageReachable()`:**

```typescript
import { getSignedImageUrl } from "@/lib/supabase/storage-server";

async function assertImageReachable(imageUrl: string, trace_id: string) {
  const log = (msg: string) => console.log(`[visual-pipeline][${trace_id}] ${msg}`);
  
  // Resolve path relativo → URL assinada
  const resolvedUrl = await getSignedImageUrl(imageUrl);
  if (!resolvedUrl) {
    throw new Error(`Failed to resolve image URL: ${imageUrl}`);
  }

  try {
    const response = await fetch(resolvedUrl, { method: "GET" });
    // ... resto da validação
  }
}
```

**Impacto:**
- ✅ Desbloqueia Motors 1-4 em produção
- ✅ Compatível com paths (v2) e URLs (v1)
- ✅ Usa healing logic já validado
- ⚠️ Adiciona latência de ~50-100ms para obter signed URL

**Esforço:** 1 hora (código + testes)

---

### 4.2 Fallback Strategy (Se Manter)

**Manter código atual em `storage-server.ts`:**
- Healing logic já trata path e URL
- `getApprovedAssetSignedUrlAction()` aceita `fallbackPathOrUrl`
- Zero mudanças necessárias

**Documentação:**
- Adicionar comentário explicando transição v1 → v2
- Documentar que fallback será removido em v3 (futuro)

---

### 4.3 Migration Strategy (Se Migrar)

**Script SQL:**

```sql
-- 1. Extrai path relativo de URLs antigas
UPDATE campaigns
SET product_image_url = regexp_replace(
  image_url,
  '^https://[^/]+/storage/v1/object/(public|sign)/campaign-images/',
  ''
)
WHERE image_url IS NOT NULL 
  AND product_image_url IS NULL
  AND image_url LIKE '%supabase%';

-- 2. Valida migration
SELECT 
  id, 
  image_url as old_url,
  product_image_url as new_path
FROM campaigns
WHERE image_url IS NOT NULL
LIMIT 10;

-- 3. (Após validação) Limpa coluna legacy
UPDATE campaigns SET image_url = NULL WHERE product_image_url IS NOT NULL;
```

**Rollback Plan:**
```sql
-- Restaurar URLs antigas (se necessário)
UPDATE campaigns
SET image_url = 'https://efxiupkxtvhbekyorddn.supabase.co/storage/v1/object/public/campaign-images/' || product_image_url
WHERE image_url IS NULL AND product_image_url IS NOT NULL;
```

**Esforço:** 4 horas (script + validação + deploy + rollback plan)

---

## 5. Recomendação Final

### 5.1 Decisões Recomendadas

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| **Padrão de Persistência** | Path Relativo (v2) | Agnóstico de ambiente, padrão Supabase |
| **Campanhas Antigas** | **DEPENDE DA QUERY** | Se < 100: Migration; Se > 100: Fallback |
| **Camada de Resolução** | visual-pipeline.ts | Resolve para todos os Motors, isolado |

### 5.2 Plano de Ação

1. **[IMEDIATO]** Executar query para contar campanhas antigas
2. **[1h]** Implementar fix em `visual-pipeline.ts` (desbloqueia produção)
3. **[DECISÃO]** Baseado em resultado da query:
   - **< 100 antigas:** Fazer migration SQL (4h)
   - **> 100 antigas:** Manter fallback + documentar
4. **[FUTURO]** Story 4.6.1 - Migration de `domain_input.visual_v2` → `visual_outputs` column

### 5.3 Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Migration SQL falha | Baixa | Alto | Rollback plan + validação step-by-step |
| Performance degradation (signed URL) | Média | Baixo | Cache signed URLs por 1h (feature futura) |
| Campanhas antigas quebram | Baixa | Médio | Fallback mantém compatibilidade |

---

## 6. Decisão Necessária

**@architect, favor decidir:**

1. **Path vs URL:** Concordo com manter Path Relativo? ☐ SIM ☐ NÃO
2. **Fallback:** Executar query primeiro para decidir? ☐ SIM | Ir direto para Migration? ☐ NÃO
3. **Camada:** Adicionar resolução em `visual-pipeline.ts`? ☐ SIM ☐ OUTRA (especificar)
4. **Prioridade:** Fix imediato (1h) ou análise completa primeiro? ☐ FIX ☐ ANÁLISE

**Próximos Passos Após Decisão:**
- [ ] Story 4.5.1: Fix IMAGE_LOAD_FAILED (1 ponto, 1h)
- [ ] Story 4.5.2: Migration SQL (se aprovado, 2 pontos, 4h)
- [ ] Story 4.6: Visual Signature Integration (bloqueada por este fix)

---

**Autor:** @aiox-master (Orion)  
**Reviewer Necessário:** @architect (Aria)  
**Data Limite:** 2026-04-25 (BLOCKER de produção)
