/**
 * Feature Flags — Phase 2.3B Backend Integration
 */
export const FEATURE_FLAGS = {
  /**
   * Habilita Context Layering System (L1/L2/L3) no prompt de campanha.
   *
   * - true: usa o prompt renderer contextual
   * - false: usa o prompt legado
   */
  USE_CONTEXT_LAYERING_PROMPT: true,
} as const

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS