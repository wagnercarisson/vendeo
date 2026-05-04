/**
 * Campaign Prompt Template v1
 * 
 * Assembles 3-layer context (L1/L2/L3) into XML-structured prompt
 * with deterministic fallback rules based on intelligence score.
 * 
 * Architecture:
 * - L1 (Store Metadata): 100% available
 * - L2 (Intelligence Calibrated): 0-100% available
 * - L3 (Agentic Persona): 100% available (always loaded)
 * 
 * Fallback Strategy:
 * - score < 30%: Use L1 + L3 only (70% quality baseline)
 * - score 30-70%: Use L1 + L2 (partial) + L3 (95% target)
 * - score > 70%: Use L1 + L2 (complete) + L3 (95% target)
 */

import { StoreMetadata, IntelligenceContext } from '@/lib/domain/campaigns/context-builder'
import { SegmentExpert, RegionalExpert } from '@/lib/ai/prompts/registries/types'

interface CampaignPromptInput {
  storeId: string
  campaignType: 'image' | 'copy' | 'full'
  productName?: string
  occasion?: string
  useIntelligence?: boolean // Allow override
}

interface PromptAssemblyContext {
  L1: StoreMetadata
  L2: IntelligenceContext | null
  L3: {
    segment: SegmentExpert
    regional: RegionalExpert
  }
  intelligenceScore: number
  useL2: boolean // Computed from score + override
  tokenCount: number
}

/**
 * Build complete campaign prompt from 3 layers
 * Returns XML-tagged structure optimized for LLM parsing
 */
export function buildCampaignPrompt(input: CampaignPromptInput): string {
  // TODO: Context builder will provide these
  // For now, interface definition only
  
  return `
<!-- PROMPT STRUCTURE PLACEHOLDER -->
<!-- This function will be implemented after context-builder (B1-B3) -->
  `
}

/**
 * Format L1 Store Metadata section
 * Always present, high priority for token allocation
 */
function formatL1Metadata(L1: StoreMetadata): string {
  return `
<store_metadata>
  <name>${L1.name}</name>
  <segment>${L1.segment}</segment>
  <location>
    <city>${L1.location.city}</city>
    <state>${L1.location.state}</state>
    <region>${L1.location.region}</region>
    <neighborhood>${L1.location.neighborhood}</neighborhood>
    <address>${L1.location.address}</address>
  </location>
  <years_in_business>${L1.businessProfile.yearsInBusiness}</years_in_business>
  <avg_ticket>${L1.businessProfile.avgTicket}</avg_ticket>
</store_metadata>
  `.trim()
}

/**
 * Format L2 Intelligence Context section
 * Conditionally present based on score
 * 
 * Priority order (if truncation needed):
 * 1. brand_voice (tone critical)
 * 2. target_audience (persona critical)
 * 3. unique_selling_proposition (positioning)
 * 4. seasonal_peaks (timing critical)
 * 5. successful_past_ctas (proven patterns)
 * 6. conversion_triggers (urgency)
 * 7. price_positioning (pricing strategy)
 * 8. competitors (competitive context)
 * 9. customer_pain_points (messaging hooks)
 * 10. local_events_calendar (timing/relevance)
 */
function formatL2Intelligence(
  L2: IntelligenceContext | null,
  score: number
): string {
  if (!L2 || score < 30) {
    return `
<intelligence_context status="unavailable">
  <reason>Intelligence score ${score}% below threshold (30%)</reason>
  <recommendation>Use L3 regional/segment expertise as fallback</recommendation>
</intelligence_context>
    `.trim()
  }

  // Partial intelligence (30-70%)
  if (score < 70) {
    return `
<intelligence_context status="partial" score="${score}%">
  ${L2.context?.brand_voice ? `<brand_voice>${L2.context.brand_voice}</brand_voice>` : ''}
  ${L2.context?.target_audience ? `<target_audience>${L2.context.target_audience}</target_audience>` : ''}
  ${L2.context?.unique_selling_proposition ? `<unique_selling_proposition>${L2.context.unique_selling_proposition}</unique_selling_proposition>` : ''}
  ${L2.context?.seasonal_peaks ? `<seasonal_peaks>${JSON.stringify(L2.context.seasonal_peaks)}</seasonal_peaks>` : ''}
  <note>Partial calibration — supplement with regional expertise (L3) for completeness</note>
</intelligence_context>
    `.trim()
  }

  // Complete intelligence (>70%)
  return `
<intelligence_context status="complete" score="${score}%">
  <brand_voice>${L2.context?.brand_voice || ''}</brand_voice>
  <target_audience>${L2.context?.target_audience || ''}</target_audience>
  <unique_selling_proposition>${L2.context?.unique_selling_proposition || ''}</unique_selling_proposition>
  <seasonal_peaks>${JSON.stringify(L2.context?.seasonal_peaks || {})}</seasonal_peaks>
  <successful_past_ctas>${JSON.stringify(L2.context?.successful_past_ctas || [])}</successful_past_ctas>
  <conversion_triggers>${JSON.stringify(L2.context?.conversion_triggers || [])}</conversion_triggers>
  <price_positioning>${L2.context?.price_positioning || ''}</price_positioning>
  <competitors>${JSON.stringify(L2.context?.competitors || [])}</competitors>
  <customer_pain_points>${JSON.stringify(L2.context?.customer_pain_points || [])}</customer_pain_points>
  <local_events_calendar>${JSON.stringify(L2.context?.local_events_calendar || [])}</local_events_calendar>
</intelligence_context>
  `.trim()
}

/**
 * Format L3 Agentic Persona section
 * Segment expert + Regional expert combined
 */
function formatL3Persona(segment: SegmentExpert, regional: RegionalExpert): string {
  return `
<agentic_persona>
  <segment_expertise>
    <title>${segment.title}</title>
    <description>${segment.description}</description>
    <expertise_areas>${segment.expertise?.slice(0, 3).join(' | ') || ''}</expertise_areas>
    <seasonal_focus>
      <peak_season>${segment.seasonal_patterns?.verao?.urgency_level || 'N/A'}</peak_season>
      <key_messaging>${segment.seasonal_patterns?.verao?.messaging_focus || ''}</key_messaging>
    </seasonal_focus>
  </segment_expertise>
  
  <regional_expertise>
    <region>${regional.region_name}</region>
    <cultural_context>${regional.cultural_context?.overview || ''}</cultural_context>
    <linguistic_markers>${regional.linguistic_markers?.informal?.slice(0, 2).join(' | ') || ''}</linguistic_markers>
    <local_events>${regional.local_events?.slice(0, 2).map(e => e.name).join(', ') || 'N/A'}</local_events>
  </regional_expertise>
  
  <integration_note>
    L3 serves as fallback when L2 unavailable, and enhancement when L2 partial.
    Should NOT contradict explicit L2 settings when score > 70%.
  </integration_note>
</agentic_persona>
  `.trim()
}

/**
 * Format Task Definition section
 * Clear imperative for AI generation system
 */
function formatTaskDefinition(
  input: CampaignPromptInput,
  storeMetadata: StoreMetadata,
): string {
  const taskTypes = {
    image: 'professional social media image (Instagram, TikTok format)',
    copy: 'compelling marketing copy with CTA',
    full: 'complete campaign (image description + copy with CTA)',
  }

  return `
<task>
  <objective>Generate ${taskTypes[input.campaignType]} for ${storeMetadata.name}</objective>
  <segment>${storeMetadata.segment}</segment>
  <location>${storeMetadata.location.city}, ${storeMetadata.location.state}</location>
  ${input.productName ? `<product_focus>${input.productName}</product_focus>` : ''}
  ${input.occasion ? `<occasion>${input.occasion}</occasion>` : ''}
  
  <requirements>
    <tone>Professional, segment-appropriate, regionally authentic</tone>
    <length_copy>100-150 tokens</length_copy>
    <cta_required>Yes — segment-specific, proven pattern</cta_required>
    <brand_consistency>Respect lojista's calibrated preferences (if score > 70%)</brand_consistency>
  </requirements>
</task>
  `.trim()
}

/**
 * Format Rules and Constraints section
 * Hard rules for generation system
 */
function formatRules(score: number): string {
  const rules = [
    'NEVER generate generic campaigns (e.g., "Shop now" without urgency/context)',
    'ALWAYS include specific, testable CTAs (never subjective)',
    'RESPECT regional linguistic markers — use appropriate formality/tone',
    'PRIORITIZE seasonal/timing context from L2 if available, fallback to L3',
    'AVOID invented features or promises not in store metadata or intelligence',
    'INCLUDE specific product names or categories (not generic "items")',
  ]

  if (score > 70) {
    rules.push('OVERRIDE generic L3 persona with explicit L2 preferences where specified')
  } else if (score < 30) {
    rules.push('USE L3 regional expertise as primary guidance (no L2 available)')
  } else {
    rules.push('USE L2 for provided fields, L3 for gaps')
  }

  return `
<rules>
  ${rules.map((r, i) => `<rule priority="${i + 1}">${r}</rule>`).join('\n  ')}
</rules>
  `.trim()
}

/**
 * Compute final intelligence usage decision
 */
function computeUseL2(score: number, override?: boolean): boolean {
  if (override !== undefined) return override
  return score >= 30
}

/**
 * Estimate token count of assembled prompt
 * Used for early truncation if needed
 */
export function estimatePromptTokens(context: PromptAssemblyContext): number {
  // Rough estimation: ~1.3 tokens per word for English
  // Will be refined with actual tokenizer integration
  
  let estimate = 0
  estimate += 150 // XML structure overhead
  estimate += 80 // L1 metadata (~60 words)
  
  if (context.useL2) {
    if (context.intelligenceScore > 70) {
      estimate += 400 // Full L2 (~300 words)
    } else {
      estimate += 200 // Partial L2 (~150 words)
    }
  }
  
  estimate += 250 // L3 segment + regional (~200 words)
  estimate += 100 // Task definition
  estimate += 80 // Rules
  
  return estimate
}

/**
 * Assembly strategy: Deterministic priority if token truncation needed
 * 
 * Priority order (each component removable in this order):
 * 1. Full L2 intelligence → reduce to partial (keep top 5 fields)
 * 2. L2 entire section → remove if score < 30%
 * 3. Regional expertise details → keep core only
 * 4. Task definition details → abbreviate
 * 
 * NEVER REMOVE: L1 metadata, L3 segment expertise, rules
 */
export interface TruncationStrategy {
  maxTokens: number
  priorityOrder: Array<'L2_full' | 'L2_partial' | 'regional_details' | 'task_details'>
  fallbackL2FieldCount: number // How many L2 fields to keep if truncating
}

export const DEFAULT_TRUNCATION_STRATEGY: TruncationStrategy = {
  maxTokens: 8000,
  priorityOrder: ['task_details', 'regional_details', 'L2_partial', 'L2_full'],
  fallbackL2FieldCount: 5,
}

/**
 * Export interface for context builder
 * Defines what info context builder must provide
 */
export interface PromptTemplateContext {
  store: StoreMetadata
  intelligence: IntelligenceContext | null
  segmentExpert: SegmentExpert
  regionalExpert: RegionalExpert
  campaignInput: CampaignPromptInput
}
