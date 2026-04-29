# Registro de Decisão Técnica: Migration 015

**Data:** 21/03/2026
**Status:** Aplicado

## Contexto
Durante a evolução do fluxo de campanhas, identificamos a necessidade de persistir a "Natureza do Conteúdo" (Produto, Serviço ou Aviso) para garantir que placeholders e lógicas de preço fossem consistentes entre Arte e Vídeo.

## Decisão
Renomear a coluna legada e nula `type` para `content_type`.

## Racional
1. **Semântica**: O termo `type` era genérico. Como já existe `campaign_type` (formato: post/reels), o nome `content_type` descreve com precisão a natureza da oferta.
2. **Normalização**: Alinha o banco de dados com a tipagem do frontend (`CampaignContentType`).
3. **Escalabilidade**: Permite implementar travas de consistência (Casos 1, 2 e 3) ancoradas em dados reais, evitando que uma campanha de "Produto" gere um vídeo de "Aviso".

## Impactos
- **Domínio**: Interface `Campaign` agora inclui `content_type`.
- **Mapeadores**: Atualizados para ler do banco.
- **Wizard/Edição**: Persistência obrigatória deste campo.
