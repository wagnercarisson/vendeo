# Padronização de Commits (Git) — Vendeo

Este documento define o padrão oficial de mensagens de commit para o projeto, garantindo um histórico claro e rastreável.

> **Changelog Público:** Commits técnicos NÃO aparecem automaticamente no changelog público (`lib/data/changelog.ts`). Apenas mudanças com **impacto visível ao usuário final** são documentadas manualmente ao fechar releases. Ver [Release Workflow](../guides/release-workflow.md) para processo completo.

## 1. Estrutura da Mensagem
As mensagens devem seguir o formato:
`[tipo]: breve descrição [detalhes opcionais]`

### 2. Tipos Permitidos (Prefixos)
*   **feat**: Novas funcionalidades (ex: novos campos, novas telas).
*   **fix**: Correções de bugs ou erros de lógica.
*   **refactor**: Mudanças que não alteram a funcionalidade, mas melhoram a estrutura ou semântica (ex: renomear campos, extrair funções).
*   **docs**: Alterações apenas em documentação técnica ou README.
*   **chore**: Manutenção técnica (atualização de pacotes, configurações de build).
*   **style**: Ajustes visuais/estéticos que não alteram a lógica (CSS, espaçamento).

## 3. Diretrizes de Conteúdo
1.  **Idioma**: O padrão oficial de mensagens é o **Português (PT-BR)**.
2.  **Contexto**: Sempre cite o nome do componente ou campo principal (ex: `refactor: implementa content_type...`).
3.  **Especificidade**: Cite Migrations e Casos de Uso específicos (ex: `(Migration 015)` ou `(Casos 1, 2 e 3)`).
4.  **Impacto**: Use a descrição para listar os pontos principais da mudança.

## 4. Exemplo Ideal
`refactor: implementa content_type e travas estratégicas de consistência`

`- Renomeia coluna 'type' para 'content_type' (Migration 015).`
`- Adiciona lógica de trava dinâmica (Casos 1, 2 e 3).`

---

## 5. Changelog Público (Story-Driven)

O changelog público (`lib/data/changelog.ts`) é atualizado **apenas com mudanças visíveis ao usuário final**.

### Processo:
1. **Durante desenvolvimento:** Ao marcar story como Done, adicionar seção `## Public Impact` se houver impacto visível
2. **No release:** Consolidar Public Impact de todas stories Done em `lib/data/changelog.ts`
3. **Linguagem:** Não-técnica, focada em benefício para o usuário

### Exemplo:
**Story técnica (backend):** Public Impact = No → NÃO entra no changelog público

**Story com impacto:** Public Impact = Yes → Entra com descrição adaptada:
```markdown
## Public Impact
**Has Impact:** Yes
**Type:** feat
**Scope:** campaigns
**Description:** Agora você pode criar campanhas sem definir preço - ideal para novidades
```

**Ver documentação completa:** `docs/guides/release-workflow.md`
