# Vendeo — Contexto e Diretrizes para IA (Antigravity)

Este documento serve como fonte de verdade para o comportamento e tomada de decisão da IA dentro do projeto Vendeo. Ele deve ser consultado ANTES de qualquer sugestão ou alteração de código.

---

## 🛑 Regras de Ouro (Behavioral Rules)

1.  **Consulta Obrigatória**: SEMPRE consultar a documentação local (pasta `docs/`) para certificar-se dos padrões adotados antes de sugerir ou implementar mudanças.
2.  **Transparência nas Alterações**: NUNCA alterar arquivos sem antes:
    *   Informar claramente **por que** o arquivo será alterado.
    *   Confirmar que a alteração respeita os padrões consolidados na documentação.
3.  **Proibição de "Achismo"**: Se uma implementação não tiver padrões documentados ou houver dúvida sobre o caminho a seguir, **PARE E CONSULTE** o usuário. Entregue o problema encontrado e sua ação recomendada antes de prosseguir.
4.  **Plano de Implementação Prévio**: ANTES de qualquer intervenção (escrita de código), entregue um **plano de implementação claro** para avaliação e aprovação do usuário.
5.  **Adesão Estrita ao Escopo**: SEMPRE manter as alterações a serem realizadas após a aprovação de um plano de implementação, ou mesmo alguma de tarefa avulsa, ESTRITAMENTE dentro do escopo do que foi solicitado, não alterando layout, fluxo, lógica ou qualquer outro elemento sem o consentimento do usuário.
6.  **Reporte Proativo de Inconsistências**: Caso encontre algum componente, layout, fluxo, lógica ou detalhe em desacordo com os padrões do projeto ou que possa causar quebras, mas que não esteja no escopo da tarefa aprovada, **PREPARAR** uma apresentação detalhada do problema com um plano sugerido e aguardar aprovação antes de corrigir.
7.  **Controle Total do Usuário**: O usuário deve ter total controle sobre todas as intervenções realizadas no código.
8.  **Não-Alteração de Arquivos de Documentação**: NUNCA alterar arquivos dentro da pasta `docs/` sem aprovação explícita do usuário. Esta pasta é de leitura restrita para garantir a integridade da documentação.
9.  **Não-Alteração de Arquivos de Migrations**: NUNCA alterar arquivos dentro da pasta `database/migrations/` sem aprovação explícita do usuário. Esta pasta é de leitura restrita para garantir a integridade da documentação.
10. **Não-Alteração de Arquivos de Supabase**: NUNCA alterar arquivos dentro da pasta `database/` sem aprovação explícita do usuário. Esta pasta é de leitura restrita para garantir a integridade da documentação.
11. **Sempre apresentar diff** antes de fazer alterações. Não modifique nada sem aprovação.
12. **Siga estritamente os padrões do projeto** e baseie-se apenas no código atual, não assuma novas bibliotecas.

---

## 🛠 Padrões Técnicos Consolidados

### 1. Modelo de Dados e Multi-tenancy
*   **Owner-Based**: O sistema utiliza o modelo `stores.owner_user_id` como fonte única de verdade para posse e acesso.
*   **Isolamento**: Toda resolução de loja deve ser feita via servidor (consultando `owner_user_id = auth.uid()`). Nunca confie em `store_id` vindo do cliente em rotas privilegiadas.

### 2. Arquitetura de Software
*   **Domain Boundaries (Mappers)**: É obrigatório o uso de mappers para isolar o domínio da aplicação de dados externos (DB ou IA).
    *   Nomes: `mapDbToDomain`, `mapAiToDomain`.
    *   Localização: `lib/domain/[entidade]/mapper.ts`.
*   **Nomenclatura**: Predomínio de `snake_case` nas interfaces de domínio e banco de dados para manter compatibilidade direta com o Supabase, exceto em casos específicos de UI onde `camelCase` for explicitamente adotado.

### 3. Segurança e Infraestrutura
*   **Service Role**: O uso de `supabaseAdmin` (service role) é restrito a rotas de backend que exigem bypass de RLS (como gerações de IA), mas devem ser acompanhadas de verificações manuais de ownership.
*   **Geração de Conteúdo**: Falhas em gerações (IA, imagens, vídeos) não devem ser silenciosas. Devem ser tratadas e reportadas na UI.

### 4. Fontes de Verdade (Single Source of Truth)
*   **Constantes Estratégicas**: `app/dashboard/campaigns/new/_components/constants.ts` define os valores válidos para `objective`, `audience` e `product_positioning`. Nenhuma outra lista paralela deve ser criada.

---

## 🗣 Comunicação
*   O idioma preferencial para comunicação com o usuário é **Português (PT-BR)**.
