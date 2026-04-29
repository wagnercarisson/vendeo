Diagrama — Fluxo Oficial do Vendeo v1
┌─────────────────────────────┐
│          DASHBOARD          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        NOVA CAMPANHA        │
└──────────────┬──────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│         FORMULÁRIO DA NOVA CAMPANHA          │
│                                              │
│  Nome do conteúdo *                          │
│  Preço                                       │
│  Objetivo *                                  │
│  Público                                     │
│  Detalhes (opcional)                         │
│  Imagem (opcional)                           │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│      CLASSIFICAÇÃO E NORMALIZAÇÃO INTERNA    │
│                                              │
│  Detectar tipo de conteúdo                   │
│  (produto | serviço | informativo)           │
│                                              │
│  Detectar marca / genérico                   │
│  Detectar categoria                          │
│  Normalizar dados para IA                    │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│           RESOLUÇÃO DE IMAGEM                │
│                                              │
│  Se usuário enviou imagem → usar             │
│  Senão → buscar imagem compatível            │
│  Senão → gerar imagem por IA                 │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│             MOTOR DE GERAÇÃO IA              │
│                                              │
│  Copy                                        │
│  Legenda                                     │
│  CTA                                         │
│  Hashtags                                    │
│  Roteiro de vídeo                            │
│  Estrutura da arte                           │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│            GERAÇÃO DA CAMPANHA               │
│                                              │
│  Criação manual → Arte + Vídeo               │
│  Derivada de plano → Arte OU Vídeo           │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│             CAMPANHA GERADA                  │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│         EDIÇÃO / REGENERAÇÃO / APROVAÇÃO     │
│                                              │
│   ┌──────────────────┐   ┌────────────────┐  │
│   │      ABA ARTE    │   │   ABA VÍDEO    │  │
│   │                  │   │                │  │
│   │ editar           │   │ editar         │  │
│   │ regenerar        │   │ regenerar      │  │
│   │ aprovar          │   │ aprovar        │  │
│   └──────────────────┘   └────────────────┘  │
│                                              │
│  Indicador de progresso:                     │
│  Arte ✓  |  Vídeo •                          │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│            CAMPANHA APROVADA                 │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│           GERENCIAR CAMPANHAS                │
│                                              │
│  Visualizar                                  │
│  Editar                                      │
│  Duplicar                                    │
│  Copiar conteúdo                             │
│  Baixar arte                                 │
│  Ver roteiro                                 │
└──────────────────────────────────────────────┘
Diagrama — Fluxo derivado de plano semanal
┌─────────────────────────────┐
│         PLANO SEMANAL       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   ITEM DO PLANO SELECIONADO │
│   post OU reels             │
└──────────────┬──────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│      CRIAR CAMPANHA DERIVADA DO PLANO        │
│                                              │
│  Herdar tipo do conteúdo                     │
│  Herdar estratégia                           │
│  Herdar contexto do plano                    │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│         FORMULÁRIO PRÉ-PREENCHIDO            │
│                                              │
│  Tipo e estratégia herdados                  │
│  Campos bloqueados                           │
│  Nome / preço / detalhes / imagem editáveis  │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│            GERAÇÃO ESPECÍFICA                │
│                                              │
│  post  → gerar arte                          │
│  reels → gerar vídeo                         │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌─────────────────────────────┐
│ EDITAR / APROVAR / VINCULAR │
└─────────────────────────────┘
Diagrama — Lógica interna de imagem
Nome do conteúdo
      │
      ▼
Detectar marca / genérico
      │
      ▼
Existe imagem enviada?
   ├─ Sim → usar imagem do usuário
   └─ Não
        │
        ▼
Buscar imagem compatível
   ├─ Encontrou → usar imagem encontrada
   └─ Não encontrou
        │
        ▼
Gerar imagem por IA
Diagrama — Aprovação por abas
Campanha gerada
      │
      ▼
┌──────────────┬──────────────┐
│     ARTE     │    VÍDEO     │
│              │              │
│ editar       │ editar       │
│ regenerar    │ regenerar    │
│ aprovar      │ aprovar      │
└──────┬───────┴───────┬──────┘
       │               │
       └──────┬────────┘
              ▼
   Verificar progresso geral
              │
              ▼
Arte aprovada?   Vídeo aprovado?
      │                 │
      └────────┬────────┘
               ▼
      Campanha totalmente aprovada
Regra visual recomendada para documentação
Arte ✓ aprovado
Vídeo • pendente

ou

1 de 2 conteúdos aprovados