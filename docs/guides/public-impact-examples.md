# Exemplo: Public Impact em Stories

Este arquivo demonstra como documentar impacto público em stories existentes.

---

## Exemplo 1: Nova Funcionalidade (feat)

**Contexto:** Story implementa campo de preço opcional em campanhas.

```markdown
## Public Impact

**Has Impact:** Yes

**Type:** feat
**Scope:** campaigns
**Description:** Campo de preço agora é opcional - ideal para campanhas de novidade ou lançamento sem informar valor. Lojistas podem criar campanhas focadas apenas em divulgar produtos novos.
```

**Resultado no Changelog Público:**
```typescript
{
    type: "feat",
    scope: "campaigns",
    description: "Campo de preço agora é opcional - ideal para campanhas de novidade ou lançamento sem informar valor. Lojistas podem criar campanhas focadas apenas em divulgar produtos novos."
}
```

---

## Exemplo 2: Correção de Bug (fix)

**Contexto:** Story corrige erro ao aprovar campanhas com imagens grandes.

```markdown
## Public Impact

**Has Impact:** Yes

**Type:** fix
**Scope:** campaigns
**Description:** Corrigido erro ao aprovar campanhas com imagens muito grandes. Agora você pode usar fotos de alta qualidade sem problemas.
```

**Resultado no Changelog Público:**
```typescript
{
    type: "fix",
    scope: "campaigns",
    description: "Corrigido erro ao aprovar campanhas com imagens muito grandes. Agora você pode usar fotos de alta qualidade sem problemas."
}
```

---

## Exemplo 3: Melhoria Visual (style)

**Contexto:** Story melhora layout da dashboard em mobile.

```markdown
## Public Impact

**Has Impact:** Yes

**Type:** style
**Scope:** dashboard
**Description:** Dashboard agora responsiva em smartphones - navegação mais fluida e botões melhor posicionados em telas pequenas.
```

**Resultado no Changelog Público:**
```typescript
{
    type: "style",
    scope: "dashboard",
    description: "Dashboard agora responsiva em smartphones - navegação mais fluida e botões melhor posicionados em telas pequenas."
}
```

---

## Exemplo 4: Mudança Técnica SEM Impacto (refactor)

**Contexto:** Story refatora arquitetura de validação (Epic 2).

```markdown
## Public Impact

**Has Impact:** No

<!-- 
Mudança técnica apenas - implementação de schemas Zod para validação interna.
Usuário final não vê diferença direta, mas previne bugs futuros.
NÃO entra no changelog público.
-->
```

**Resultado:** Nada adicionado ao changelog público. Apenas commits técnicos no git.

---

## Exemplo 5: Performance (perf)

**Contexto:** Story otimiza carregamento de campanhas.

```markdown
## Public Impact

**Has Impact:** Yes

**Type:** perf
**Scope:** dashboard
**Description:** Lista de campanhas carrega 3x mais rápido - navegação mais ágil mesmo com centenas de campanhas criadas.
```

**Resultado no Changelog Público:**
```typescript
{
    type: "perf",
    scope: "dashboard",
    description: "Lista de campanhas carrega 3x mais rápido - navegação mais ágil mesmo com centenas de campanhas criadas."
}
```

---

## Dicas para Descrições de Qualidade

### ✅ Boas Práticas

1. **Foque no benefício:** "Agora você pode..." em vez de "Sistema permite..."
2. **Seja específico:** "Dashboard responsiva em smartphones" > "Melhorias mobile"
3. **Use linguagem simples:** Evite termos técnicos (schema, endpoint, mapper)
4. **Explique o valor:** Por que isso importa para o usuário?

### ❌ Evite

- Jargão técnico: "Implementado CampaignPriceSchema.optional()"
- Termos internos: "Refatorado mapper.ts"
- Linguagem vaga: "Melhorias gerais"
- Detalhes de implementação: "Adicionado safeParse no route.ts"

### 🎯 Template Mental

```
[Ação concreta] + [Benefício] + [Contexto de uso opcional]

Exemplos:
- "Campo de preço opcional" + "ideal para novidades" + "sem informar valor"
- "Lista carrega mais rápido" + "navegação ágil" + "mesmo com centenas de campanhas"
- "Dashboard responsiva" + "navegação fluida" + "em telas pequenas"
```

---

## Retroativo: Epic 2 (Exemplo)

Epic 2 (Stories 2.1-2.6) implementou arquitetura de validação. Impacto é **indireto** (previne bugs futuros):

```markdown
## Public Impact

**Has Impact:** No

<!-- 
Epic 2 implementou arquitetura de contratos e validação interna.
Mudanças técnicas que previnem bugs futuros, mas sem impacto visível ao usuário neste momento.
Se houver melhorias perceptíveis (ex: mensagens de erro mais claras), documentar em story específica.
-->
```

**Quando documentar Epic 2 publicamente?**

Apenas quando houver **efeito visível**:
- Story futura implementa mensagens de erro amigáveis usando schemas → `feat: "Mensagens de erro mais claras ao criar campanhas"`
- Bug é evitado e usuário percebe → `fix: "Prevenido erro ao salvar campanhas com dados inválidos"`

---

**Última atualização:** 2026-04-21  
**Responsável:** @aiox-master (Orion)
