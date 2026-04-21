# Release Workflow — Vendeo

Processo para documentar mudanças públicas e gerar releases.

---

## 🎯 Princípio: Story-Driven Changelog

**Regra de Ouro:** Apenas **mudanças visíveis ao usuário final** entram no changelog público.

Mudanças técnicas (refactor, infra, testes) ficam apenas nos commits — usuários não precisam saber.

---

## 📝 Documentando Impacto Público em Stories

### Quando adicionar?

Adicione seção **Public Impact** na story SE:
- ✅ Usuário final verá diferença na UI
- ✅ Comportamento do produto mudou
- ✅ Novo recurso está disponível
- ✅ Bug visível foi corrigido

NÃO adicione SE:
- ❌ Mudança é apenas técnica (refactor, testes, infra)
- ❌ Afeta apenas desenvolvimento interno
- ❌ Não está ativo em produção ainda

### Como documentar?

Adicione esta seção no final da story (após Change Log):

```markdown
## Public Impact

**Has Impact:** Yes

**Type:** feat
**Scope:** campaigns
**Description:** Campo de preço agora é opcional - ideal para campanhas de novidade ou lançamento sem informar valor

<!-- 
Types:
  - feat: nova funcionalidade
  - fix: correção de bug
  - refactor: melhoria sem mudar comportamento
  - perf: melhoria de performance
  - style: mudança visual/estética

Scopes comuns:
  - core: sistema geral
  - campaigns: criação/edição de campanhas
  - dashboard: painel principal
  - plans: weekly plans
  - auth: autenticação
  - onboarding: fluxo inicial
-->
```

Se NÃO tiver impacto:

```markdown
## Public Impact

**Has Impact:** No

<!-- Mudança técnica apenas - sem impacto visível ao usuário -->
```

---

## 🔄 Workflow de Release

### **1. Durante Desenvolvimento (a cada story Done)**

Ao marcar story como **Done**, revisar:

- [ ] Story tem seção **Public Impact**?
- [ ] Se SIM, descrição está em **linguagem não-técnica**?
- [ ] Tipo (feat/fix/refactor) está correto?

### **2. Preparação de Release (semanal/quinzenal)**

**Comando manual (temporário até automatizar):**

```bash
# 1. Grep stories Done desde última release
grep -r "Status: Done" docs/stories/*.story.md

# 2. Abrir cada story e extrair "Public Impact" com Has Impact: Yes

# 3. Consolidar em lista temporária
```

**Saída esperada:**
```
Story 2.X: feat | campaigns | "Campo de preço opcional..."
Story 3.Y: fix | dashboard | "Corrigido erro de carregamento..."
```

### **3. Atualizar Changelog Público**

Editar **`lib/data/changelog.ts`**:

```typescript
export const changelogData: ChangelogRelease[] = [
    {
        version: "v1.0.0-beta.8", // ⬅️ Incrementar
        date: "2026-04-21",       // ⬅️ Data de hoje
        title: "Flexibilidade de Preços e Correções",
        description: "Melhorias na criação de campanhas e correções de bugs reportados.",
        changes: [
            // ⬇️ Copiar de "Public Impact" das stories
            { 
                type: "feat", 
                scope: "campaigns", 
                description: "Campo de preço agora é opcional - ideal para campanhas de novidade ou lançamento sem informar valor" 
            },
            { 
                type: "fix", 
                scope: "dashboard", 
                description: "Corrigido erro de carregamento na lista de campanhas" 
            },
        ]
    },
    // ... releases anteriores
]
```

### **4. Git & Deploy**

```bash
# Commit changelog
git add lib/data/changelog.ts
git commit -m "chore: release v1.0.0-beta.8"

# Tag release
git tag v1.0.0-beta.8

# Push
git push origin main --tags
```

### **5. Validar Deploy**

- [ ] Abrir https://vendeo.tech/changelog
- [ ] Confirmar nova release visível
- [ ] Validar formatação e linguagem

---

## 📚 Exemplo Prático

### Story 2.6 (Epic 2)

**Mudança técnica:**
- Adicionou validação Zod em `/api/generate/campaign/strategy`
- Exportou schemas internos de `schemas.ts`
- Ativou `safeParse()` no endpoint

**Impacto público:** ❌ **Nenhum**

**Public Impact:**
```markdown
## Public Impact

**Has Impact:** No

<!-- Mudança técnica de backend - validação de contratos de API.
     Não afeta comportamento visível ao usuário. -->
```

**Resultado:** NÃO entra em `lib/data/changelog.ts` público.

---

### Story 3.X (Hipotética): Preço Opcional

**Mudança técnica:**
- Campo `price` em `campaigns` agora permite `NULL`
- Atualizado form validation para tornar preço opcional
- Ajustado renderer para esconder badge quando preço ausente

**Impacto público:** ✅ **Sim** (usuário pode criar campanha sem preço)

**Public Impact:**
```markdown
## Public Impact

**Has Impact:** Yes

**Type:** feat
**Scope:** campaigns
**Description:** Agora você pode criar campanhas sem definir preço - ideal para divulgar novidades, lançamentos ou promoções com "consulte valores"
```

**Resultado:** Entra em `lib/data/changelog.ts`:
```typescript
{
    type: "feat",
    scope: "campaigns",
    description: "Agora você pode criar campanhas sem definir preço - ideal para divulgar novidades, lançamentos ou promoções com 'consulte valores'"
}
```

---

## 🎯 Checklist Final (TL;DR)

**Durante desenvolvimento:**
- [ ] Ao criar story, decidir se tem Public Impact
- [ ] Se sim, adicionar seção com tipo/scope/descrição não-técnica

**No release:**
- [ ] Grep stories Done desde última release
- [ ] Extrair Public Impact de cada uma
- [ ] Adicionar em `lib/data/changelog.ts`
- [ ] Commit: `chore: release vX.Y.Z`
- [ ] Tag: `git tag vX.Y.Z`
- [ ] Push: `git push origin main --tags`
- [ ] Validar `/changelog` público

---

## 🚀 Roadmap Futuro

**Fase 2 (automatização):**
- Script `npm run changelog:collect` que grep stories Done
- Output JSON para revisão
- Comando `npm run changelog:release --version vX.Y.Z`

**Fase 3 (integração agentes):**
- Hook `post-story-done` valida presença de Public Impact
- Agentes sugerem descrição não-técnica automaticamente
- Zero overhead manual

---

## 🎨 Exemplos de Descrições

### ✅ BOM (linguagem de produto)

```
"Campo de preço agora é opcional - ideal para campanhas de novidade"
"Corrigido erro ao aprovar campanhas com imagens muito grandes"
"Novo painel de feedback para avaliar qualidade das sugestões"
```

### ❌ RUIM (linguagem técnica)

```
"Implementado CampaignPriceSchema com .optional()"
"Refatorado mapper.ts para suportar null em price field"
"Adicionado safeParse no endpoint /api/feedback"
```

---

## 🔮 Automação Futura (TODO)

Quando implementarmos `scripts/changelog-collect.js`:

```bash
# Coletar automaticamente
npm run changelog:collect --since v1.0.0-beta.7

# Preview antes de adicionar
npm run changelog:preview

# Gerar entry pronto para copiar
npm run changelog:generate --version v1.0.0-beta.8
```

Até lá, processo é **manual assistido** conforme descrito acima.

---

## 📊 Checklist de Release

```markdown
### Preparação
- [ ] Todas stories da milestone com status Done
- [ ] Testes E2E passando
- [ ] QA aprovado (se aplicável)

### Changelog
- [ ] Coletadas stories com "Public Impact: Yes"
- [ ] Descrições revisadas (linguagem não-técnica)
- [ ] `lib/data/changelog.ts` atualizado
- [ ] Version incrementada corretamente
- [ ] Date atualizada

### Git
- [ ] Commit: "chore: release vX.Y.Z"
- [ ] Tag: git tag vX.Y.Z
- [ ] Push: git push origin main --tags

### Validação
- [ ] Deploy automático concluído
- [ ] /changelog renderizando corretamente
- [ ] Nova release visível

### Comunicação (opcional)
- [ ] Notificar beta testers
- [ ] Post em redes sociais (se milestone importante)
```

---

**Última atualização:** 2026-04-21  
**Responsável:** @aiox-master (Orion)
