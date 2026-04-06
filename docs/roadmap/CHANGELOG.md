# Changelog - Vendeo Brand Identity Engine

Este arquivo registra as evoluções técnicas e de produto do motor de identidade visual do Vendeo.

## [1.1.0] - 2026-04-06

### Adicionado
- **Fase 1: Motor de DNA Automático (V2)**: Implementação completa do gerador determinístico de identidade visual.
- **Catálogo de Arquétipos**: Criação de 9 arquétipos visuais (`luxury`, `editorial`, `sensorial`, `friendly`, `clean`, `impact`, `precision`, `trust`, `modern`) com tokens de design específicos.
- **Auto DNA Engine**: Novo motor (`auto-dna.ts`) que gera paletas, tipografia e tratamentos de imagem baseados no segmento e ID da loja (anti-colisão).
- **Scripts de Validação**: Ferramentas de teste para garantir determinismo e completude do DNA.

### Alterado
- **Contrato BrandDNA**: Expandido para versão 2, incluindo `brand_temperature`, `image_treatment` e `background_treatment`.
- **Camada de Mapeamento**: O `resolveBrandDNA` no `mapper.ts` agora utiliza o motor automático e realiza "hidratação" de DNAs legados (V1 para V2).

### Corrigido
- Inconsistências de tipagem no objeto de DNA que causavam falhas silenciosas na UI.
- Problema de "clonagem visual" em lojas do mesmo segmento através do uso de seeds determinísticas.
