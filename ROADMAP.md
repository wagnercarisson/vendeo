# Vendeo - Roadmap e Decisões Estratégicas

Este documento centraliza as discussões sobre o futuro do produto, decisões estratégicas de roadmap e funcionalidades mapeadas para próximas fases.

## Estratégia Atual (Foco no Core Value)
*Status: Foco no Plano Básico (Starter)*

A estratégia imediata do Vendeo é resolver 80% do problema de marketing das lojas físicas focando na combinação mais eficaz atualmente:
- **Posts (Imagens Estáticas)** focados em conversão e vitrine.
- **Vídeos Curtos (Reels / TikTok / Shorts)** verticais (9:16) com ganchos fortes, focados em alcance e engajamento.

**Decisão Importante (Março/2026):** 
Em vez de desenvolver múltiplos formatos complexos (como Stories com features interativas e Carrosséis longos) na V1, optamos por aperfeiçoar a geração de roteiros de vídeos curtos. Para maximizar o valor percebido, a nomenclatura "Reels" foi alterada em toda a plataforma para **"Vídeos Curtos"**, deixando claro para o lojista que o mesmo roteiro gerado atende perfeitamente a Reels, TikTok e YouTube Shorts.

---

## Próximos Passos (Upgrades Futuros)

Os recursos abaixo foram congelados no curto prazo para evitar complexidade excessiva no lançamento ("feature bloat"), mas já estão no radar para integrar planos superiores de assinatura.

### Fase 2 (Plano Intermediário / Pro)
- **Stories (Foco em Relacionamento & Rotina):**
  - A IA deverá gerar sequências curtas para os bastidores.
  - Sugestões de "enquetes do dia", "caixinhas de perguntas" e interação direta com a audiência, exigindo modelos de prompt totalmente diferentes dos Reels.
- **Carrosséis (Conteúdo Educacional / Catálogo):**
  - A IA deverá estruturar o conteúdo dividindo-o logicamente em 5 a 8 telas (arraste para o lado).
  - Exige uma lógica narrativa sequencial continuada.
- **Encartes Digitais (Estilo Promoção / Supermercado):**
  - Sugestão vinda de usuários reais na fase Beta.
  - A IA reuniria de 4 a 8 produtos em uma única peça gráfica focada em preço agressivo e urgência (ideal para mercados, farmácias, açougues e adegas).

### Fase 3 (Plano Premium / Enterprise)
- **YouTube Long-form (Vídeos Longos):**
  - Roteiros profundos adequados para vídeos no formato horizontal.
- **Campanhas Cross-Channel Integradas:**
  - Gerar uma teia completa de conteúdo que interliga um Post, um Short e uma sequência de Stories sob o mesmo tema de campanha.

---

## Escalabilidade Técnica (WIP)

### Otimização e Storage de Imagens (Atenção Pós-PMF)
Conforme a base de usuários crescer (ex: rumo a 100k+ lojas ativas), a forma como lidamos com uploads de imagem (Logos e Produtos) no Supabase Storage precisará de otimizações para conter custos de banda (Egress) e manter o painel rápido:
1. **Compressão/Redimensionamento Automático:** Implementar a API de transformação de imagens do Supabase (ou Cloudflare) para servir imagens otimizadas (ex: `format=webp`, `width=300`) nos previews ao invés de baixar a logo gigante de 5MB do usuário toda vez.
2. **Garbage Collection (Limpeza de Órfãos):** Criar um Cron Job ou Edge Function que rode semanalmente para deletar imagens no bucket `campaign-images` que não estejam mais atreladas a nenhuma coluna `logo_url` na tabela `stores` ou `image_url` na tabela `campaigns`, economizando na conta final.
3. **Escrita via CDN/Edge:** Avaliar distribuição CDN agressiva para a exibição de imagens públicas caso os acessos simultâneos ao painel disparem muito.
