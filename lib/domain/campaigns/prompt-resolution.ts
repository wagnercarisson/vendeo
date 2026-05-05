import { buildCampaignPrompt as buildContextLayeredPrompt } from '../../ai/prompts/prompt-renderer.ts'
import { FEATURE_FLAGS } from '../../constants/feature-flags.ts'
import type { StoreContext } from '../stores/types.ts'
import { buildCampaignPromptLegacy } from './prompts.ts'
import type { CampaignContext } from './types.ts'

type PromptResolutionSource = 'layered' | 'legacy' | 'legacy-fallback'

type ResolveCampaignPromptInput = {
  campaign: CampaignContext
  store: StoreContext
  storeId: string
  description?: string
  strategicTheme?: string | null
}

type ResolveCampaignPromptDeps = {
  buildLayeredPrompt?: typeof buildContextLayeredPrompt
  buildLegacyPrompt?: typeof buildCampaignPromptLegacy
  featureFlags?: typeof FEATURE_FLAGS
  onFallbackError?: (error: unknown) => void
}

function inferCampaignType(campaign: CampaignContext, strategicTheme?: string | null): string {
  const normalizedTheme = strategicTheme?.trim()
  if (normalizedTheme) {
    return normalizedTheme.toLowerCase()
  }

  const normalizedObjective = String(campaign.objective ?? '').toLowerCase()
  if (normalizedObjective.includes('lancamento') || normalizedObjective.includes('lançamento')) {
    return 'lancamento'
  }

  if (normalizedObjective.includes('novidade')) {
    return 'lancamento'
  }

  return 'promocao'
}

function buildCampaignSpecificContext(campaign: CampaignContext, description?: string): string {
  return `

CONTEXTO ESPECIFICO DA CAMPANHA:
- PRODUTO: ${campaign.product_name} (Preco: ${campaign.price ?? 'não informado'})
- ESTRATEGIA: ${campaign.objective} para ${campaign.audience}
- RACIOCINIO VAREJISTA: ${campaign.theme || description || 'Focar no desejo imediato e beneficios do produto'}
- DATA ATUAL: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}

FORMATO OBRIGATORIO (JSON PURO):
{
  "headline": "TITULO CURTO (MAX 25 CARAC)",
  "text": "FRASE DE APOIO PARA A ARTE (MAX 60 CARAC)",
  "caption": "Legenda persuasiva com emojis e sotaque local",
  "cta": "Acao direta no genero correto",
  "hashtags": "#tag1 #tag2 #tag3"
}
`
}

export async function resolveCampaignPrompt(
  input: ResolveCampaignPromptInput,
  deps: ResolveCampaignPromptDeps = {}
): Promise<{ prompt: string; source: PromptResolutionSource }> {
  const buildLayeredPrompt = deps.buildLayeredPrompt ?? buildContextLayeredPrompt
  const buildLegacyPrompt = deps.buildLegacyPrompt ?? buildCampaignPromptLegacy
  const featureFlags = deps.featureFlags ?? FEATURE_FLAGS

  if (!featureFlags.USE_CONTEXT_LAYERING_PROMPT) {
    return {
      prompt: buildLegacyPrompt(input.campaign, input.store, input.description),
      source: 'legacy',
    }
  }

  try {
    const prompt = await buildLayeredPrompt(
      input.storeId,
      inferCampaignType(input.campaign, input.strategicTheme),
      {
        intelligenceThreshold: 30,
      }
    )

    return {
      prompt: `${prompt}${buildCampaignSpecificContext(input.campaign, input.description)}`,
      source: 'layered',
    }
  } catch (error) {
    deps.onFallbackError?.(error)
    return {
      prompt: buildLegacyPrompt(input.campaign, input.store, input.description),
      source: 'legacy-fallback',
    }
  }
}