# Degrau 2: Mapeamento e Fallback (Ponte de Domínio)

Este degrau conecta o novo contrato `BrandDNA` ao modelo de `Store` existente. O objetivo é garantir que toda a aplicação passe a enxergar o DNA, mesmo que os dados ainda estejam apenas nas colunas legadas do banco de dados.

## User Review Required

> [!IMPORTANT]
> **Consistência de Tipagem**: Ao final desta etapa, o objeto de domínio `Store` sempre terá um `brand_dna`. Se o banco não tiver o JSONB, criaremos um objeto "sintético" em memória via Mapper.

> [!TIP]
> **Deterministic Seed**: Conforme discutido, usaremos um hash simples do `store.id` para preencher o `visual_seed` caso ele não exista no banco.

---

## Proposed Changes

### [Domínio: Lojas]

#### [MODIFY] [types.ts](file:///g:/Projetos/vendeo/lib/domain/stores/types.ts)
- Importar `BrandDNA` de `./brand-dna`.
- Adicionar `brand_dna: BrandDNA` à interface `Store`.

#### [MODIFY] [mapper.ts](file:///g:/Projetos/vendeo/lib/domain/stores/mapper.ts)
- Implementar a lógica de resolução do DNA dentro de `mapDbStoreToDomain`.
- **Lógica de Fallback (Em Memória - Transitória)**:
    - Se `raw.brand_dna` existir ➔ Usar (prioridade).
    - Caso contrário ➔ Ativar o **Fabrificador de DNA Legado**:
        - `palette.primary` ➔ `raw.primary_color` (ou Default Zinc-900).
        - `palette.secondary` ➔ `raw.secondary_color` (ou Default Zinc-500).
        - `palette.accent` ➔ Derivar da `primary` (ou Default Amber-500).
        - `palette.neutral` ➔ Derivar (Fallback: Zinc-100/800 conforme contraste).
        - `visual_style` ➔ Default **"modern"**.
        - `visual_seed` ➔ Hash (UUID-like) do `raw.id`.
        - `tone_of_voice` ➔ Mapear `raw.tone_of_voice` (Fallback: **"friendly"**).
        - `typography` ➔ Default "sans_display" / "sans_clean".
        - `visual_aggression` ➔ Default 0.5.
    - **IMPORTANTE**: Este objeto é sintético e volátil; não deve ser persistido no banco de dados nesta fase técnica.

---

## Verification Plan

### Automated Tests
- Criar um teste unitário para o `mapper.ts` passando um objeto cru SEM `brand_dna` e validar se o objeto de saída possui um DNA gerado corretamente a partir das cores primárias.

### Manual Verification
- Visualizar via console log no Dashboard se a loja carregada já possui o objeto estruturado de DNA.
