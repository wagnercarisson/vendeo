export interface SegmentSeasonalPattern {
  months?: number[]
  peak_products?: string[]
  peak_categories?: string[]
  urgency_level?: string
  messaging_focus?: string
}

export interface ConversionTrigger {
  occasion: string
  timing: string
  messaging: string
  product_focus: string
}

export interface LanguageRules {
  tone: string
  formality: string
  personality_traits?: string[]
  recommended_expressions?: string[]
  taboo_expressions?: string[]
}

export interface CompetitivePositioning {
  typical_differentiators?: string[]
  price_strategy?: string[]
}

export interface SegmentExpert {
  segment_id: string
  segment_name: string
  version: string
  title: string
  description: string
  expertise: string[]
  seasonal_patterns: {
    verao?: SegmentSeasonalPattern
    inverno?: SegmentSeasonalPattern
    year_round?: SegmentSeasonalPattern
  }
  conversion_triggers: {
    occasions: ConversionTrigger[]
  }
  language_rules: LanguageRules
  cta_strategies?: Record<string, string[]>
  competitive_positioning?: CompetitivePositioning
  purchase_patterns?: Record<string, string>
  pain_points?: string[]
  version_notes: string
  last_updated: string
}

export interface CulturalContext {
  overview: string
  mentality: string
  lifestyle: string
  income_profile: string
  digital_adoption?: string
}

export interface LocalEvent {
  name: string
  month?: number | string
  relevance: string
  messaging?: string
}

export interface LinguisticMarkers {
  informal?: string[]
  formal?: string[]
  regional_specifics?: string[]
}

export interface CompetitivePlayer {
  name: string
  positioning: string
  threat_level?: string
}

export interface CompetitiveContext {
  major_chains?: CompetitivePlayer[]
  local_players?: CompetitivePlayer[]
  differentiator?: string
}

export interface RegionalSeasonalPattern {
  climate?: string
  behavior: string
  messaging?: string
  peak_hours?: string
  urgency?: string
}

export interface SeasonalSpecifics {
  verao?: RegionalSeasonalPattern
  inverno?: RegionalSeasonalPattern
}

export interface MessagingStrategy {
  tone?: string
  tone_of_voice?: string
  urgency?: string
  urgency_level?: string
  personality?: string
  key_messages?: string[]
  forbidden_messages?: string[]
}

export interface RegionalExpert {
  region_id: string
  region_name: string
  segment_id: string
  version: string
  cultural_context: CulturalContext
  local_events: LocalEvent[]
  linguistic_markers: LinguisticMarkers
  competitive_context: CompetitiveContext
  seasonal_specifics: SeasonalSpecifics
  payment_patterns?: Record<string, string>
  pain_points?: string[]
  opportunities?: string[]
  regional_messaging_strategy: MessagingStrategy
  version_notes: string
  last_updated: string
}