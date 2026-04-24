# TODO: Limpeza de Código Pós-Epic 4

**Data:** 22/04/2026  
**Autor:** @aiox-master  
**Contexto:** Durante debug de erros TypeScript, descobrimos imports de `visual-preference` que não existem nesta branch

---

## 🔍 Situação

### Módulos Comentados (Temporariamente)

Os seguintes imports e usos de `visual-preference` foram **comentados** temporariamente porque os módulos não existem na branch `feat/story-2.1-schemas`:

#### Arquivos Afetados:

1. **lib/domain/campaigns/service.ts**
   - Linhas 4-5: imports comentados
   - Linhas 89-95: bloco de busca de visual preference comentado
   - Linha 109: `brand_profile_source` comentado (não existe em `fetchStoreContext`)
   - Linha 111: `visual_preference: null` hardcoded
   - Linha 148: parâmetro `null` em `buildCampaignPrompt`

2. **lib/supabase/storage-actions.ts**
   - Linhas 3-4: imports comentados
   - Linhas 118-125: bloco de consolidação comentado

3. **lib/domain/campaigns/prompts.ts**
   - Linha 3: import comentado
   - Linhas 5-59: função `buildVisualPreferenceSection` comentada (bloco completo)
   - Linha 65: tipo `any` temporário para `visualPreference`
   - Linhas 68-71: logs e uso da função comentados
   - Linha 89: template section vazio (hardcoded `${''}`)

---

## ✅ Estado Atual

- ✅ Código compila sem erros (`npx tsc --noEmit`)
- ✅ Nenhum erro TypeScript relacionado a visual-preference
- ✅ Funcionalidade preservada (sistema funciona sem visual preference)

---

## 📋 Ações Necessárias ao Final da Epic 4

### Opção A: Remover Permanentemente (se não for implementado)

Se visual-preference não for parte da Epic 4 final:

1. Deletar todos os comentários TODO relacionados a visual-preference
2. Remover completamente a função `buildVisualPreferenceSection`
3. Remover parâmetro `visualPreference` de `buildCampaignPrompt`
4. Remover campo `visual_preference` de `generationContext`

### Opção B: Implementar (se for parte do Motor V2)

Se visual-preference for implementado na Epic 4:

1. Criar os módulos faltantes:
   - `lib/domain/visual-preference/types.ts`
   - `lib/domain/visual-preference/schemas.ts`
   - `lib/domain/visual-preference/processor.ts`
   - `lib/domain/visual-preference/service.ts`

2. Descomentar os imports e usos nos 3 arquivos

3. Corrigir `fetchStoreContext` para incluir ou calcular `brand_profile_source`

4. Remover todos os TODOs "Revisar ao final da Epic 4"

### Opção C: Manter em Branch Separada

Se visual-preference está em `intra-motor-visual`:

1. Decidir estratégia de merge entre branches
2. Manter comentários até merge
3. Resolver conflitos de forma consciente

---

## 🎯 Checklist de Revisão

- [ ] Decisão tomada: Remover / Implementar / Merge
- [ ] Todos os TODOs "Revisar ao final da Epic 4" resolvidos
- [ ] `npx tsc --noEmit` passa sem erros
- [ ] Testes funcionais passam
- [ ] Documentação atualizada (se implementado)
- [ ] Este arquivo deletado após conclusão

---

## 📝 Notas Adicionais

**Por que os imports existiam?**

- Story 2.6 planejava criar `visual_preference_learned`
- Durante implementação, design mudou para `visual_signatures`
- Imports foram adicionados mas módulos nunca criados nesta branch
- Provavelmente implementados em branch `intra-motor-visual` separada
- Apareceram aqui por trabalho em branch errada ou stash incorreto

**Estado Correto da Epic 2:**
- ❌ SEM `lib/domain/visual-preference/`
- ❌ SEM migration `visual_preference_learned`
- ✅ COM migration `025_visual_signatures_core.sql`
- ✅ COM `lib/domain/visual-composition/contracts.ts`

---

**⚠️ IMPORTANTE:** Este arquivo deve ser revisado e deletado ao finalizar Epic 4!
