/**
 * Valores oficiais permitidos para o domínio de campanhas.
 * Esta é a fonte única da verdade para objetivos, status e estratégias.
 */

import {
  OBJECTIVE_VALUES,
  type CampaignObjective as OfficialCampaignObjective,
} from "../constants/strategy";

export const CAMPAIGN_OBJECTIVES = OBJECTIVE_VALUES;

/**
 * @deprecated Use CampaignObjective from '@/lib/constants/strategy' directly, or Objective from '@/lib/domain/campaigns/types'.
 */
export type CampaignObjective = OfficialCampaignObjective;

export const CAMPAIGN_STATUS = [
  'RASCUNHO',
  'ATIVO',
  'PAUSADO',
  'FINALIZADO',
  'ARQUIVADO'
] as const;

/**
 * @deprecated Use CampaignStatus from '@/lib/domain/campaigns/types' when available.
 * Tipo legado — migrar para domain layer.
 */
export type CampaignStatus = (typeof CAMPAIGN_STATUS)[number];

export const CAMPAIGN_STRATEGIES = [
  'OFERTA',
  'COMBO',
  'MOMENTO',
  'DESTAQUE',
  'PRESENTE'
] as const;

/**
 * @deprecated CampaignStrategy (uppercase) e legado. Use tipos de lib/domain/campaigns/ quando disponiveis.
 */
export type CampaignStrategy = (typeof CAMPAIGN_STRATEGIES)[number];
