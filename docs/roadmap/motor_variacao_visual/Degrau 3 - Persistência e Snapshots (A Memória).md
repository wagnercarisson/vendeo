Degrau 3: Persistência e Snapshots (A Memória)
Este degrau transforma o DNA sintético (volátil) em dados persistentes e introduz o conceito de imutabilidade histórica nas campanhas. É aqui que o banco de dados se torna "ciente" da nova arquitetura.
## User Review Required
> [!IMPORTANT]
> **Migração de Banco**: Esta etapa exige a execução de SQL para adicionar as novas colunas JSONB. Embora seguro, é o primeiro passo de alteração física no schema consolidado.
> [!WARNING]
> **Imutabilidade**: A partir deste degrau, uma vez que o conteúdo da campanha é gerado, o seu DNA é "congelado". Se você mudar a cor da loja depois, a campanha antiga manterá a cor original via snapshot.
---
## Proposed Changes
### [Banco de Dados]
#### [NEW] [020_add_brand_dna_and_snapshots.sql](file:///g:/Projetos/vendeo/database/migrations/020_add_brand_dna_and_snapshots.sql)
- `ALTER TABLE public.stores ADD COLUMN brand_dna jsonb DEFAULT NULL;`
- `ALTER TABLE public.campaigns ADD COLUMN brand_dna_snapshot jsonb DEFAULT NULL;`
- `ALTER TABLE public.campaigns ADD COLUMN layout_snapshot jsonb DEFAULT NULL;`
### [Domínio: Campanhas]

#### [MODIFY] [types.ts](file:///g:/Projetos/vendeo/lib/domain/campaigns/types.ts)
- Adicionar interface `LayoutSnapshot { id: string; version: number; }`.
- Adicionar `brand_dna_snapshot: BrandDNA | null` e `layout_snapshot: LayoutSnapshot | null` à interface `Campaign`.

#### [MODIFY] [mapper.ts](file:///g:/Projetos/vendeo/lib/domain/campaigns/mapper.ts)
- Atualizar o mapper para ler as novas colunas JSONB do banco e converter para camelCase no domínio.
- **Regra**: Manter como `null` para campanhas antigas (Sem retroatividade automática).

#### [MODIFY] [service.ts](file:///g:/Projetos/vendeo/lib/domain/campaigns/service.ts)
- No método `generateCampaignContent`, durante o `update` da campanha:
    - Persistir o `brand_dna_snapshot` capturado do objeto `store`.
    - Persistir o `layout_snapshot` (Ex: `{ id: 'split', version: 1 }`).

---

## Decisões de Projeto (Fechadas)

1. **Retroatividade**: **Não será feita**. Campanhas antigas permanecerão com snapshots nulos. O sistema deve estar preparado para lidar com `null` usando fallbacks dinâmicos se necessário.
2. **Layout Snapshot**: Iniciaremos com um objeto explícito `{ id: 'split', version: 1 }` para todas as novas gerações, preparando o terreno para o Catálogo de Layouts.

---
## Verification Plan
### Automated Tests
- Validar se, após a criação de uma campanha, os campos `brand_dna_snapshot` e `layout_snapshot` no banco de dados contêm o JSON correto.
### Manual Verification
- Alterar a cor primária de uma loja nas configurações.
- Gerar uma nova campanha.
- Verificar se a nova campanha tem a cor nova no snapshot, enquanto uma campanha gerada ANTES da alteração mantém o snapshot com a cor antiga.
