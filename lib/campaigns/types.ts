import { CampaignObjective, CampaignStatus, CampaignStrategy } from './contracts';

export interface Campaign {
  id: string;
  storeId: string;
  productName: string | null;
  price: number | null;
  audience: string | null;
  objective: CampaignObjective | string | null;
  strategy: CampaignStrategy | string | null;
  productPositioning: string | null;
  status: CampaignStatus | string | null;

  origin: 'manual' | 'plan';
  weeklyPlanItemId: string | null;

  headline: string | null;
  bodyText: string | null;
  cta: string | null;
  imageUrl: string | null;
  productImageUrl: string | null;

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

  aiText: string | null;
  aiCaption: string | null;
  aiHashtags: string | null;
  aiCta: string | null;
  aiGeneratedAt: string | null;

  createdAt: string;
}