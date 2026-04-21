/**
 * @deprecated This file is deprecated. Import from './selectors' instead.
 *
 * All functions below are re-exported for backward compatibility.
 *
 * Migration guide:
 * - Change: import { hasGeneratedArt } from '@/lib/domain/campaigns/logic'
 * - To:     import { hasGeneratedArt } from '@/lib/domain/campaigns/selectors'
 */

// Re-exports — backward compatibility
export { hasGeneratedArt } from "./selectors";
export { hasGeneratedCampaignContent } from "./selectors";
export { hasGeneratedVideo } from "./selectors";
export { getCampaignListStatus } from "./selectors";
export { getCampaignStatusLine } from "./selectors";
export { getContentState } from "./selectors";
export { hasGeneratedVisualAsset } from "./selectors";
export { getCampaignDisplayStatuses } from "./selectors";

/**
 * @deprecated Use getStrategicLabel from './selectors' instead.
 * Alias for backward compatibility.
 */
export { getStrategicLabel as getCampaignStrategyLabel } from "./selectors";

/**
 * @deprecated Use getGlobalStatus from './selectors' instead.
 * Equivalence proven by selectors.test.ts (5 test cases).
 * Note: Signature changed from (postStatus, reelsStatus, campaignType) to (campaign: Campaign).
 */
export { getGlobalStatus as calculateGlobalStatus } from "./selectors";

export type { DisplayBadge } from "./selectors";
