# TODO: Automação de Changelog

## 🎯 Objetivo

Automatizar coleta de "Public Impact" das stories para facilitar releases.

---

## 📋 Escopo

Criar script `scripts/changelog-collect.js` que:

1. **Coleta stories Done desde última release**
   - Grep `docs/stories/*.story.md`
   - Filter por `Status: Done`
   - Opcionalmente: `--since v1.0.0-beta.X`

2. **Extrai seções "Public Impact"**
   - Parse Markdown
   - Busca seção `## Public Impact`
   - Extrai campos: `Has Impact`, `Type`, `Scope`, `Description`

3. **Gera output estruturado**
   - JSON com array de entries
   - Preview formatado para revisão
   - Template pronto para copiar em `changelog.ts`

---

## 🔧 Comandos Esperados

```bash
# Coletar desde última release
npm run changelog:collect

# Preview antes de adicionar
npm run changelog:preview

# Gerar com version específica
npm run changelog:generate --version v1.0.0-beta.8

# Especificar range
npm run changelog:collect --since v1.0.0-beta.7
```

---

## 📦 Output Esperado

### JSON (`changelog-unreleased.json`):
```json
{
  "version": "unreleased",
  "since": "v1.0.0-beta.7",
  "stories": [
    {
      "id": "2.X",
      "file": "docs/stories/2.X.story.md",
      "impact": {
        "has_impact": true,
        "type": "feat",
        "scope": "campaigns",
        "description": "Campo de preço opcional..."
      }
    }
  ],
  "changelogEntries": [
    {
      "type": "feat",
      "scope": "campaigns",
      "description": "Campo de preço opcional..."
    }
  ]
}
```

### Preview (Terminal):
```
📊 Changelog Preview (desde v1.0.0-beta.7)

Stories com impacto público: 3

✅ Story 2.X (feat | campaigns)
   "Campo de preço opcional - ideal para novidades"

✅ Story 3.Y (fix | dashboard)
   "Corrigido erro ao carregar campanhas"

✅ Story 4.Z (style | mobile)
   "Dashboard responsiva em smartphones"

---

📋 Template para lib/data/changelog.ts:

{
    version: "v1.0.0-beta.8",
    date: "2026-04-21",
    title: "...", // <-- PREENCHER
    description: "...", // <-- PREENCHER (opcional)
    changes: [
        { type: "feat", scope: "campaigns", description: "Campo de preço opcional - ideal para novidades" },
        { type: "fix", scope: "dashboard", description: "Corrigido erro ao carregar campanhas" },
        { type: "style", scope: "mobile", description: "Dashboard responsiva em smartphones" },
    ]
}
```

---

## 🏗️ Implementação (Referência)

```javascript
// scripts/changelog-collect.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 1. Glob stories
const storyFiles = glob.sync('docs/stories/*.story.md');

// 2. Parse cada story
storyFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Extract "## Public Impact" section
  const impactMatch = content.match(/## Public Impact\n\n[\s\S]*?(?=\n##|$)/);
  
  if (!impactMatch) return; // No impact section
  
  const impactSection = impactMatch[0];
  
  // Parse fields
  const hasImpact = /Has Impact:\*\* (Yes|No)/i.exec(impactSection)?.[1];
  if (hasImpact !== 'Yes') return;
  
  const type = /Type:\*\* (\w+)/i.exec(impactSection)?.[1];
  const scope = /Scope:\*\* (\w+)/i.exec(impactSection)?.[1];
  const description = /Description:\*\* (.+)/i.exec(impactSection)?.[1];
  
  // Collect
  entries.push({ type, scope, description });
});

// 3. Output JSON + preview
console.log(JSON.stringify(entries, null, 2));
```

---

## ✅ Critérios de Aceitação

- [ ] Script roda com `npm run changelog:collect`
- [ ] Detecta stories Done desde última tag
- [ ] Extrai "Public Impact" corretamente
- [ ] Ignora stories com "Has Impact: No"
- [ ] Gera JSON estruturado
- [ ] Exibe preview formatado no terminal
- [ ] Permite `--since` customizado
- [ ] Gera template pronto para copiar em `changelog.ts`

---

## 🎯 Prioridade

**Baixa-Média** - Processo manual funciona bem. Automatizar quando releases ficarem mais frequentes (pós-v1.0).

---

**Criado em:** 2026-04-21  
**Responsável:** @aiox-master (Orion)
