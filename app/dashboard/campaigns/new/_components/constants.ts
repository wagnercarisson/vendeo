/**
 * Vendeo — Fonte de verdade dos valores estratégicos normalizados do fluxo de campanhas.
 *
 * Regras:
 * 1. objective, audience e product_positioning devem usar apenas valores definidos neste arquivo.
 * 2. UI, APIs, serviços, planos semanais, mapeadores e futuras implementações não devem criar listas paralelas ou hardcodes equivalentes.
 * 3. stores.brand_positioning é um campo textual da loja e NÃO pode servir como fallback automático para campaigns.product_positioning.
 *
 * Documentação de referência:
 * - docs/CAMPAIGN_FLOW_RULES.md
 * - docs/architecture/strategy-field-normalization-v1.md
 */

import { 
    AUDIENCE_OPTIONS as AUDIENCE_OPTIONS_LIB, 
    OBJECTIVE_OPTIONS as OBJECTIVE_OPTIONS_LIB, 
    PRODUCT_POSITIONING_OPTIONS as PRODUCT_POSITIONING_OPTIONS_LIB 
} from "@/lib/constants/strategy";

export const AUDIENCE_OPTIONS = AUDIENCE_OPTIONS_LIB;
export const OBJECTIVE_OPTIONS = OBJECTIVE_OPTIONS_LIB;
export const PRODUCT_POSITIONING_OPTIONS = PRODUCT_POSITIONING_OPTIONS_LIB;

