# Padronização de Commits (Git) — Vendeo

Este documento define o padrão oficial de mensagens de commit para o projeto, garantindo um histórico claro e rastreável.

> **Nota Arquitetural:** As classificações e descrições definidas neste documento atuam como o padrão comportamental (behavior.md) para a IA criar, ao fim do processo de fechamento de release da ferramenta, as strings do painel público de novidades `lib/data/changelog.ts`.  

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
