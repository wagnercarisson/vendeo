import { buildL3Context } from '../../ai/prompts/registries/loader.ts'
import type { RegionalExpert, SegmentExpert } from '@/lib/ai/prompts/registries/types'

type QueryError = {
  code?: string | null
  message?: string | null
}

type QueryResponse<T> = {
  data: T | null
  error: QueryError | null
}

type QueryChain<T> = {
  eq(column: string, value: unknown): QueryChain<T>
  single(): Promise<QueryResponse<T>>
  maybeSingle(): Promise<QueryResponse<T>>
}

type QueryTable = {
  select<T = unknown>(columns: string): QueryChain<T>
}

type ContextBuilderClient = {
  from(table: string): QueryTable
  rpc(fn: string, args: Record<string, unknown>): Promise<QueryResponse<unknown>>
}

type StoreRecord = {
  id?: string | null
  name?: string | null
  main_segment?: string | null
  city?: string | null
  state?: string | null
  neighborhood?: string | null
  address?: string | null
  brand_positioning?: string | null
  tone_of_voice?: string | null
  phone?: string | null
  whatsapp?: string | null
}

type IntelligenceRecord = {
  context?: IntelligenceContextPayload | null
  intelligence_score?: number | null
}

export type IntelligenceContextPayload = {
  [key: string]: unknown
  brand_voice?: string | null
  target_audience?: string | null
  unique_selling_proposition?: unknown
  seasonal_peaks?: unknown
  successful_past_ctas?: unknown
  conversion_triggers?: unknown
  price_positioning?: string | null
  competitors?: unknown
  customer_pain_points?: unknown
  local_events_calendar?: unknown
}

export interface StoreMetadata {
  id: string
  name: string
  segment: string
  mainSegment: string
  location: {
    city: string
    state: string
    region: string
    neighborhood: string
    address: string
  }
  brandPositioning?: string
  toneOfVoice?: string
  contact: {
    phone?: string
    whatsapp?: string
  }
  businessProfile: {
    yearsInBusiness: string | null
    avgTicket: number | null
  }
}

export interface IntelligenceContext {
  score: number
  context: IntelligenceContextPayload | null
}

export interface PromptAssemblyContext {
  L1: StoreMetadata
  L2: IntelligenceContext | null
  L3: {
    segment: SegmentExpert
    regional: RegionalExpert
  }
  intelligenceScore: number
  useL2: boolean
  tokenCount: number
}

let clientFactoryOverride: (() => Promise<ContextBuilderClient>) | null = null

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function toStoreMetadata(raw: StoreRecord): StoreMetadata {
  const id = toOptionalString(raw.id)
  const name = toOptionalString(raw.name)
  const mainSegment = toOptionalString(raw.main_segment)
  const city = toOptionalString(raw.city)
  const state = toOptionalString(raw.state)

  if (!id) {
    throw new Error("Invalid store metadata: missing required field 'id'")
  }

  if (!name) {
    throw new Error("Invalid store metadata: missing required field 'name'")
  }

  if (!mainSegment) {
    throw new Error("Invalid store metadata: missing required field 'main_segment'")
  }

  if (!city) {
    throw new Error("Invalid store metadata: missing required field 'city'")
  }

  if (!state) {
    throw new Error("Invalid store metadata: missing required field 'state'")
  }

  return {
    id,
    name,
    segment: mainSegment,
    mainSegment,
    location: {
      city,
      state,
      region: mapLocationToRegion(city, state),
      neighborhood: toOptionalString(raw.neighborhood) ?? '',
      address: toOptionalString(raw.address) ?? '',
    },
    brandPositioning: toOptionalString(raw.brand_positioning),
    toneOfVoice: toOptionalString(raw.tone_of_voice),
    contact: {
      phone: toOptionalString(raw.phone),
      whatsapp: toOptionalString(raw.whatsapp),
    },
    businessProfile: {
      yearsInBusiness: null,
      avgTicket: null,
    },
  }
}

function extractCompletenessScore(data: unknown, fallbackScore?: number | null): number {
  if (Array.isArray(data) && data.length > 0) {
    return extractCompletenessScore(data[0], fallbackScore)
  }

  if (isPlainObject(data) && typeof data.completeness_score === 'number') {
    return data.completeness_score
  }

  if (typeof data === 'number') {
    return data
  }

  if (typeof fallbackScore === 'number') {
    return fallbackScore
  }

  return 0
}

async function getContextBuilderClient(): Promise<ContextBuilderClient> {
  if (clientFactoryOverride) {
    return clientFactoryOverride()
  }

  const { createSupabaseServerClient } = await import('../../supabase/server.ts')
  return (await createSupabaseServerClient()) as unknown as ContextBuilderClient
}

export function mapLocationToRegion(city: string, state: string): string {
  const normalizedCity = normalizeText(city)
  const normalizedState = state.trim().toUpperCase()

  if (normalizedState === 'SP' && normalizedCity === 'sao paulo') {
    return 'SP-capital'
  }

  if (normalizedState === 'RJ' && normalizedCity === 'rio de janeiro') {
    return 'RJ-capital'
  }

  if (normalizedState === 'MG' && normalizedCity === 'belo horizonte') {
    return 'MG-capital'
  }

  throw new Error(`Region mapping not available for: ${city}, ${state}. MVP supports only SP/RJ/MG capitals.`)
}

export async function fetchStoreMetadata(storeId: string): Promise<StoreMetadata> {
  const supabase = await getContextBuilderClient()
  const { data, error } = await supabase
    .from('stores')
    .select<StoreRecord>(
      'id, name, main_segment, city, state, neighborhood, address, brand_positioning, tone_of_voice, phone, whatsapp'
    )
    .eq('id', storeId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch store metadata: ${error.message || 'unknown error'}`)
  }

  if (!data) {
    throw new Error(`Store not found: ${storeId}`)
  }

  return toStoreMetadata(data)
}

export async function fetchIntelligenceContext(storeId: string): Promise<IntelligenceContext> {
  const supabase = await getContextBuilderClient()
  const { data, error } = await supabase
    .from('store_intelligence')
    .select<IntelligenceRecord>('context, intelligence_score')
    .eq('store_id', storeId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch intelligence context: ${error.message || 'unknown error'}`)
  }

  if (!data) {
    return {
      score: 0,
      context: null,
    }
  }

  const { data: scoreData, error: scoreError } = await supabase.rpc('calculate_intelligence_score', {
    p_store_id: storeId,
  })

  if (scoreError) {
    throw new Error(`Failed to calculate intelligence score: ${scoreError.message || 'unknown error'}`)
  }

  return {
    score: extractCompletenessScore(scoreData, data.intelligence_score),
    context: isPlainObject(data.context) ? (data.context as IntelligenceContextPayload) : null,
  }
}

export function buildAgenticPersona(
  segment: string,
  location: { city: string; state: string }
): { segment: SegmentExpert; regional: RegionalExpert } {
  const normalizedSegment = segment.trim()
  if (!normalizedSegment) {
    throw new Error('Segment is required to build agentic persona')
  }

  const region = mapLocationToRegion(location.city, location.state)
  return buildL3Context(normalizedSegment, region)
}

export async function buildPromptContext(storeId: string): Promise<PromptAssemblyContext> {
  const [L1, L2] = await Promise.all([fetchStoreMetadata(storeId), fetchIntelligenceContext(storeId)])
  const L3 = buildAgenticPersona(L1.mainSegment, {
    city: L1.location.city,
    state: L1.location.state,
  })

  return {
    L1,
    L2,
    L3,
    intelligenceScore: L2.score,
    useL2: L2.score >= 30,
    tokenCount: 0,
  }
}

export function __setContextBuilderClientFactoryForTests(factory: (() => Promise<ContextBuilderClient>) | null): void {
  clientFactoryOverride = factory
}