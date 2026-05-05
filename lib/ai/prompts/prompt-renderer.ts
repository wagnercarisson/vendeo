/**
 * Prompt Renderer — B4 Phase 2.3B Backend Integration
 * 
 * Template engine que monta o prompt final da campanha integrando as 3 camadas de contexto:
 * - L1: Store Metadata (100% disponível)
 * - L2: Intelligence Calibrada (0-100% disponível, threshold-based)
 * - L3: Profissional Agêntico (100% disponível via registries)
 * 
 * @module prompt-renderer
 */

import {
  buildPromptContext,
  type ContextBuilderClient,
  type IntelligenceContext,
  type IntelligenceContextPayload,
  type PromptAssemblyContext,
} from '../../domain/campaigns/context-builder.ts'
import type { RegionalExpert, SegmentExpert } from './registries/types.ts'

/**
 * Opções de configuração para o prompt renderer.
 */
type PromptRendererOptions = {
  /** Score mínimo de intelligence para usar L2 (default: 30) */
  intelligenceThreshold?: number
  /** Se deve incluir detalhes completos da persona L3 (default: true) */
  useL3Persona?: boolean
  /** Client Supabase para injeção em testes (opcional) */
  client?: ContextBuilderClient
}

function stringifyValue(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return null
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => stringifyValue(entry))
    .filter((entry): entry is string => Boolean(entry))
}

function joinBullets(values: string[], fallback?: string): string {
  if (values.length === 0) {
    return fallback ?? 'Nao informado'
  }

  return values.map((value) => `- ${value}`).join('\n')
}

function joinInline(values: string[], fallback?: string): string {
  if (values.length === 0) {
    return fallback ?? 'Nao informado'
  }

  return values.join(', ')
}

function safeText(value: string | undefined | null, fallback = 'Nao informado'): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

/**
 * Determina a chave de sazonalidade baseada no mês atual.
 * 
 * @param date - Data de referência (default: new Date())
 * @returns Chave da estação: 'verao', 'inverno' ou 'year_round'
 */
function currentSeasonKey(date = new Date()): keyof SegmentExpert['seasonal_patterns'] {
  const month = date.getMonth() + 1

  if ([12, 1, 2, 3].includes(month)) {
    return 'verao'
  }

  if ([6, 7, 8, 9].includes(month)) {
    return 'inverno'
  }

  return 'year_round'
}

/**
 * Formata a seção <system> do prompt com a persona agêntica L3.
 * 
 * @param segment - Especialista de segmento (L3)
 * @param regional - Especialista regional (L3)
 * @param useL3Persona - Se deve incluir detalhes completos da expertise
 * @returns Seção system formatada em XML
 */
function formatSystemSection(
  segment: SegmentExpert,
  regional: RegionalExpert,
  useL3Persona: boolean
): string {
  if (!useL3Persona) {
    return [
      '<system>',
      'VOCE E: Especialista em marketing para varejo local.',
      `SEGMENTO BASE: ${segment.segment_name}.`,
      `REGIAO BASE: ${regional.region_name}.`,
      '</system>',
    ].join('\n')
  }

  const expertise = joinBullets(segment.expertise.slice(0, 5))
  const localEvents = joinBullets(regional.local_events.slice(0, 4).map((event) => `${event.name}: ${event.relevance}`))
  const vocabulary = joinBullets([
    ...toStringArray(regional.linguistic_markers.informal),
    ...toStringArray(regional.linguistic_markers.formal),
    ...toStringArray(regional.linguistic_markers.regional_specifics),
  ])
  const competitors = joinBullets([
    ...(regional.competitive_context.major_chains ?? []).map(
      (player) => `${player.name}: ${player.positioning}`
    ),
    ...(regional.competitive_context.local_players ?? []).map(
      (player) => `${player.name}: ${player.positioning}`
    ),
  ])

  return [
    '<system>',
    `VOCE E: ${segment.title} especializado em ${regional.region_name}.`,
    '',
    'EXPERTISE:',
    expertise,
    '',
    'CONTEXTO REGIONAL:',
    regional.cultural_context.overview,
    '- Eventos locais:',
    localEvents,
    '- Vocabulario:',
    vocabulary,
    '- Concorrencia:',
    competitors,
    '</system>',
  ].join('\n')
}

/**
 * Formata a seção <store_context> do prompt com metadata da loja (L1).
 * 
 * @param context - Store metadata (L1 layer)
 * @returns Seção store_context formatada em XML
 */
function formatStoreSection(context: PromptAssemblyContext['L1']): string {
  const locationParts = [
    `${context.location.city}/${context.location.state}`,
    context.location.neighborhood || null,
  ].filter((part): part is string => Boolean(part))

  return [
    '<store_context>',
    'INFORMACOES DA LOJA:',
    `- Nome: ${context.name}`,
    `- Segmento: ${context.mainSegment}`,
    `- Localizacao: ${locationParts.join(' - ') || safeText(context.location.address)}`,
    `- Posicionamento: ${safeText(context.brandPositioning)}`,
    `- Tom de voz: ${safeText(context.toneOfVoice, 'profissional mas acessivel')}`,
    `- Contato: ${safeText(context.contact.whatsapp ?? context.contact.phone)}`,
    '</store_context>',
  ].join('\n')
}

function formatIntelligenceLines(payload: IntelligenceContextPayload | null): string[] {
  if (!payload) {
    return []
  }

  const lines: string[] = []
  const entries: Array<[string, string | null]> = [
    ['Tom de marca', stringifyValue(payload.brand_voice)],
    ['Publico-alvo', stringifyValue(payload.target_audience)],
    ['Diferencial', stringifyValue(payload.unique_selling_proposition)],
    ['Preco', stringifyValue(payload.price_positioning)],
  ]

  for (const [label, value] of entries) {
    if (value) {
      lines.push(`- ${label}: ${value}`)
    }
  }

  const listEntries: Array<[string, string[]]> = [
    ['Sazonalidade', toStringArray(payload.seasonal_peaks)],
    ['CTAs testados', toStringArray(payload.successful_past_ctas)],
    ['Gatilhos', toStringArray(payload.conversion_triggers)],
    ['Concorrentes', toStringArray(payload.competitors)],
    ['Dores', toStringArray(payload.customer_pain_points)],
    ['Eventos locais', toStringArray(payload.local_events_calendar)],
  ]

  for (const [label, values] of listEntries) {
    if (values.length > 0) {
      lines.push(`- ${label}: ${values.join(', ')}`)
    }
  }

  return lines
}

/**
 * Formata a seção <intelligence_calibration> do prompt com preferências calibradas (L2).
 * 
 * Aplica lógica de fallback:
 * - score < threshold: Usa apenas L1+L3, exibe mensagem de calibração insuficiente
 * - score >= threshold: Usa L1+L2+L3, exibe preferências calibradas do lojista
 * 
 * @param L2 - Contexto de intelligence (L2 layer)
 * @param intelligenceScore - Score de completude (0-100)
 * @param useL2 - Se L2 deve ser usado (baseado em threshold)
 * @param segment - Especialista de segmento (para referência no fallback)
 * @param regional - Especialista regional (para referência no fallback)
 * @returns Seção intelligence_calibration formatada em XML
 */
function formatIntelligenceSection(
  L2: IntelligenceContext | null,
  intelligenceScore: number,
  useL2: boolean,
  segment: SegmentExpert,
  regional: RegionalExpert
): string {
  if (!useL2 || !L2?.context) {
    return [
      '<intelligence_calibration>',
      `ATENCAO: Loja sem calibracao suficiente (Intelligence Score: ${intelligenceScore}%)`,
      `Use sua expertise de mercado (${segment.segment_name} + ${regional.region_name}).`,
      '</intelligence_calibration>',
    ].join('\n')
  }

  const lines = formatIntelligenceLines(L2.context)

  return [
    '<intelligence_calibration>',
    `PREFERENCIAS CALIBRADAS DO LOJISTA (Intelligence Score: ${intelligenceScore}%):`,
    ...lines,
    'ATENCAO: Use prioritariamente essas preferencias calibradas pelo lojista.',
    '</intelligence_calibration>',
  ].join('\n')
}

function formatSeasonality(segment: SegmentExpert, intelligence: IntelligenceContext | null, useL2: boolean): string {
  const season = currentSeasonKey()
  const seasonalPattern = segment.seasonal_patterns[season] ?? segment.seasonal_patterns.year_round
  const intelligencePeaks = useL2 ? toStringArray(intelligence?.context?.seasonal_peaks) : []
  const registryPeaks = seasonalPattern?.peak_products ?? seasonalPattern?.peak_categories ?? []
  return joinInline(intelligencePeaks.length > 0 ? intelligencePeaks : registryPeaks, 'contexto sazonal do segmento')
}

function formatCompetition(regional: RegionalExpert, intelligence: IntelligenceContext | null, useL2: boolean): string {
  const intelligenceCompetitors = useL2 ? toStringArray(intelligence?.context?.competitors) : []

  if (intelligenceCompetitors.length > 0) {
    return intelligenceCompetitors.join(', ')
  }

  const regionalCompetitors = [
    ...(regional.competitive_context.major_chains ?? []).map((player) => player.name),
    ...(regional.competitive_context.local_players ?? []).map((player) => player.name),
  ]

  return joinInline(regionalCompetitors, 'concorrentes locais relevantes')
}

/**
 * Formata a seção <task> do prompt com instruções de geração da campanha.
 * 
 * @param campaignType - Tipo de campanha (e.g., "promocao", "lancamento")
 * @param context - Contexto completo (L1+L2+L3)
 * @param useL3Persona - Se deve usar vocabulário regional detalhado
 * @returns Seção task formatada em XML
 */
function formatTaskSection(
  campaignType: string,
  context: PromptAssemblyContext,
  useL3Persona: boolean
): string {
  const tone = context.useL2
    ? safeText(stringifyValue(context.L2?.context?.brand_voice), safeText(context.L1.toneOfVoice, 'profissional mas acessivel'))
    : safeText(context.L1.toneOfVoice, 'profissional mas acessivel')

  const vocabulary = useL3Persona
    ? joinInline(
        [
          ...toStringArray(context.L3.regional.linguistic_markers.informal),
          ...toStringArray(context.L3.regional.linguistic_markers.formal),
        ].slice(0, 4),
        'referencias locais da regiao'
      )
    : 'referencias locais da regiao'

  return [
    '<task>',
    'TAREFA:',
    `Crie uma campanha de ${campaignType} para ${context.L1.name}.`,
    '',
    'FORMATO ESPERADO:',
    '- Titulo: [titulo impactante]',
    '- Corpo: [texto persuasivo com 2-3 paragrafos]',
    '- CTA: [call-to-action claro e direto]',
    '- Hashtags: [3-5 hashtags relevantes]',
    '',
    'RESTRICOES:',
    `- Tom de voz: ${tone}`,
    `- Referencias locais: Use ${vocabulary} quando apropriado`,
    `- Sazonalidade: Considere ${formatSeasonality(context.L3.segment, context.L2, context.useL2)}`,
    `- Concorrencia: Diferencie de ${formatCompetition(context.L3.regional, context.L2, context.useL2)}`,
    '</task>',
  ].join('\n')
}

/**
 * Monta o prompt final da campanha integrando L1/L2/L3.
 * 
 * Sequência de montagem:
 * 1. Busca L1 (store metadata) via context-builder
 * 2. Busca L2 (intelligence context + score) via context-builder
 * 3. Carrega L3 (segment + regional experts) via registry loader
 * 4. Aplica lógica de threshold para decidir uso de L2
 * 5. Renderiza 4 seções XML: system, store_context, intelligence_calibration, task
 * 
 * @param storeId - UUID da loja (e.g., "store-123")
 * @param campaignType - Tipo de campanha (e.g., "promocao", "lancamento", "evento")
 * @param options - Opções de configuração (opcional)
 * @param options.intelligenceThreshold - Score mínimo para usar L2 (default: 30)
 * @param options.useL3Persona - Se deve incluir detalhes da persona L3 (default: true)
 * @param options.client - Client Supabase para injeção em testes (opcional)
 * 
 * @returns Prompt completo renderizado com estrutura XML
 * 
 * @example
 * ```typescript
 * // Uso básico
 * const prompt = await buildCampaignPrompt('store-123', 'promocao');
 * 
 * // Com threshold customizado
 * const prompt = await buildCampaignPrompt('store-123', 'lancamento', {
 *   intelligenceThreshold: 50
 * });
 * 
 * // Em testes com mock client
 * const prompt = await buildCampaignPrompt('store-123', 'promocao', {
 *   client: mockClient
 * });
 * ```
 * 
 * @throws {Error} Se store não for encontrada ou se região não for suportada (MVP: SP/RJ/MG capitais)
 */
export async function buildCampaignPrompt(
  storeId: string,
  campaignType: string,
  options?: PromptRendererOptions
): Promise<string> {
  const threshold = options?.intelligenceThreshold ?? 30
  const context = await buildPromptContext(storeId, {
    client: options?.client,
    intelligenceThreshold: threshold,
  })
  const useL3Persona = options?.useL3Persona ?? true

  return [
    formatSystemSection(context.L3.segment, context.L3.regional, useL3Persona),
    '',
    formatStoreSection(context.L1),
    '',
    formatIntelligenceSection(
      context.L2,
      context.intelligenceScore,
      context.useL2,
      context.L3.segment,
      context.L3.regional
    ),
    '',
    formatTaskSection(campaignType, context, useL3Persona),
  ].join('\n')
}