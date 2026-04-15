/**
 * Valores oficiais permitidos para o domínio de campanhas.
 * Esta é a fonte única da verdade para objetivos, status e estratégias.
 */

import {
  OBJECTIVE_VALUES,
  type CampaignObjective as OfficialCampaignObjective,
} from "../constants/strategy";

export const CAMPAIGN_OBJECTIVES = OBJECTIVE_VALUES;

export type CampaignObjective = OfficialCampaignObjective;

export const CAMPAIGN_STATUS = [
  'RASCUNHO',
  'ATIVO',
  'PAUSADO',
  'FINALIZADO',
  'ARQUIVADO'
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUS)[number];

export const CAMPAIGN_STRATEGIES = [
  'OFERTA',
  'COMBO',
  'MOMENTO',
  'DESTAQUE',
  'PRESENTE'
] as const;

export type CampaignStrategy = (typeof CAMPAIGN_STRATEGIES)[number];
