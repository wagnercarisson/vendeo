# Estados da Campanha — Vendeo v1

## 1. Visão Geral
Este documento define os estados oficiais das campanhas, distinguindo entre a **persistência técnica** (Banco de Dados) e a **experiência do usuário** (Interface).

A distinção clara evita confusão entre o valor salvo no sistema e o que o usuário visualiza na Dashboard.

---

## 2. Estados de Persistência (Sistema/Banco)
Estes são os valores reais salvos na coluna `status` da tabela `campaigns`.

*   **`draft`**: Estado inicial. A campanha foi criada, mas ainda não possui conteúdo gerado ou revisado.
*   **`ready`**: Conteúdo (arte/vídeo/texto) foi gerado pela IA e está aguardando revisão.
    *   *Nota: Este estado substitui o termo antigo "generated".*
*   **`approved`**: O usuário revisou e aprovou o conteúdo final. A campanha está pronta para uso.

---

## 3. Estados de Experiência (Interface/UX)
São estados "calculados" pela lógica do frontend (`lib/domain/campaigns/logic.ts`) para oferecer uma linguagem mais amigável ao usuário.

*   **"Sem conteúdo" (interno: `none`)**
    *   Representa campanhas em estado `draft` sem nenhum asset associado.
*   **"Aguardando aprovação" (interno: `pending`)**
    *   Representa campanhas que já possuem conteúdo gerado (status `ready` ou assets presentes), mas que ainda não foram finalizadas pelo usuário. 
    *   **Cor na UI**: Âmbar/Amarelo.
*   **"Aprovada" / "Arte pronta" / "Vídeo pronto" (interno: `approved`)**
    *   Representa campanhas que o usuário validou explicitamente.
    *   **Cor na UI**: Verde.

---

## 4. Estados Transientes (Processamento)
Estados efêmeros que indicam processamento em tempo real.

*   **`generating`**: Indica que a IA está trabalhando na geração de texto, arte ou vídeo. Geralmente representado por loaders e desabilitação de botões.

---

## 5. Matriz de Transição Oficial

| Estado Atual | Ação do Usuário | Status no Banco | Comportamento na UI |
| :--- | :--- | :--- | :--- |
| **`DRAFT`** | Editar campos base | **`DRAFT`** | Continua "Sem conteúdo" |
| **`DRAFT`** | Gerar Conteúdo (IA) | **`READY`** | Passa a "Aguardando aprovação" |
| **`READY`** | Editar ou Regerar | **`READY`** | Mantém "Aguardando aprovação" |
| **`READY`** | Aprovar | **`APPROVED`** | Passa a "Aprovada" |
| **`APPROVED`** | Editar ou Regerar | **`READY`** | Volta para "Aguardando aprovação" |


---

## 6. Princípios de Decisão
1.  **Prioridade da UI**: O rótulo em tela deve sempre priorizar a clareza sobre o termo técnico.
2.  **Transparência**: O sistema deve deixar claro se o conteúdo atual veio da IA (Aguardando aprovação) ou se já foi validado pelo humano (Aprovada).
3.  **Consistência**: Toda nova funcionalidade deve respeitar o mapeamento entre o status do banco e o rótulo de UI definido neste documento.