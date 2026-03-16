import { CampaignObjective, CampaignStatus, CampaignStrategy } from './contracts';

/**
 * Interface central do domínio Campaign em camelCase.
 * Representa a campanha normalizada e pronta para consumo na UI.
 */
export interface Campaign {
  // --- DADOS ESTRUTURAIS ---
  id: string;
  storeId: string;
  productName: string | null;
  price: number | null;
  audience: string | null;
  objective: CampaignObjective | string | null;
  strategy: CampaignStrategy | string | null;
  productPositioning: string | null;
  status: CampaignStatus | string | null;

  // --- CONTEÚDO GERADO (FEED/ARTE) ---
  headline: string | null;
  bodyText: string | null;
  cta: string | null;
  imageUrl: string | null;
  productImageUrl: string | null;

  // --- CONTEÚDO GERADO (VIDEO/REELS) ---
  reelsHook: string | null;
  reelsScript: string | null;
  reelsShotlist: any[] | null;
  reelsOnScreenText: string[] | null;
  reelsAudioSuggestion: string | null;
  reelsDurationSeconds: number | null;
  reelsCaption: string | null;
  reelsCta: string | null;
  reelsHashtags: string | null;
  reelsGeneratedAt: string | null;

  // --- METADADOS DE GERAÇÃO IA ---
  aiText: string | null;
  aiCaption: string | null;
  aiHashtags: string | null;
  aiCta: string | null;
  aiGeneratedAt: string | null;

  // --- METADADOS DO SISTEMA ---
  createdAt: string;
}
