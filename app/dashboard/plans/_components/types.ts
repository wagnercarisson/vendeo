import { Store as StoreDomain } from "@/lib/domain/stores/types";
import { WeeklyPlan, WeeklyPlanItem as WeeklyPlanItemDomain, StrategyItem } from "@/lib/domain/weekly-plans/types";
import { Campaign as CampaignDomain } from "@/lib/domain/campaigns/types";
import { ShortVideoShotScene } from "@/lib/domain/short-videos/types";

export type Store = StoreDomain;
export type Plan = WeeklyPlan;
export type WeeklyPlanItem = WeeklyPlanItemDomain;
export type ReelsShot = ShortVideoShotScene;
export type Campaign = CampaignDomain;

// Wizard Specific Types
export type WizardStep = 0 | 1 | 2 | 3;

export type StrategyDraftItem = StrategyItem;
