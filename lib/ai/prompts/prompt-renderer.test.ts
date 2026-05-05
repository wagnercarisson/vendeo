import assert from 'node:assert/strict'
import test from 'node:test'

import { buildCampaignPrompt } from './prompt-renderer.ts'
import type { ContextBuilderClient } from '../../domain/campaigns/context-builder.ts'

type MockResponse = {
  data: unknown
  error: { message?: string | null; code?: string | null } | null
}

function createMockClient(config: {
  stores?: MockResponse
  intelligence?: MockResponse
  rpc?: MockResponse
}): ContextBuilderClient {
  return {
    from(table: string) {
      return {
        select() {
          return {
            eq() {
              return this
            },
            async maybeSingle() {
              if (table === 'stores') {
                return {
                  data: (config.stores?.data ?? null) as never,
                  error: config.stores?.error ?? null,
                }
              }

              if (table === 'store_intelligence') {
                return {
                  data: (config.intelligence?.data ?? null) as never,
                  error: config.intelligence?.error ?? null,
                }
              }

              return { data: null as never, error: { message: `unexpected table ${table}` } }
            },
            async single() {
              return this.maybeSingle()
            },
          }
        },
      }
    },
    async rpc() {
      return {
        data: config.rpc?.data ?? null,
        error: config.rpc?.error ?? null,
      }
    },
  }
}

function createDefaultClient(overrides?: {
  intelligenceScore?: number
  intelligenceContext?: Record<string, unknown> | null
  store?: Record<string, unknown>
}): ContextBuilderClient {
  const intelligenceScore = overrides?.intelligenceScore ?? 20

  return createMockClient({
    stores: {
      data: {
        id: 'store-1',
        name: 'Adega do Joao',
        main_segment: 'bebidas_alcoolicas',
        city: 'São Paulo',
        state: 'SP',
        neighborhood: 'Mooca',
        address: 'Rua A, 10',
        brand_positioning: 'premium de bairro',
        tone_of_voice: 'proximo e consultivo',
        phone: '1133334444',
        whatsapp: '5511999999999',
        ...overrides?.store,
      },
      error: null,
    },
    intelligence: {
      data:
        overrides?.intelligenceContext === null
          ? null
          : {
              context: overrides?.intelligenceContext ?? { brand_voice: 'informal e acolhedor' },
              intelligence_score: intelligenceScore,
            },
      error: null,
    },
    rpc: {
      data: [{ completeness_score: intelligenceScore, filled_fields_count: 8, total_fields_count: 20 }],
      error: null,
    },
  })
}

test('buildCampaignPrompt renders prompt with L1 and L3 when score is below threshold', async () => {
  const prompt = await buildCampaignPrompt('store-1', 'promocao', {
    client: createDefaultClient({ intelligenceScore: 20 }),
  })

  assert.match(prompt, /ATENCAO: Loja sem calibracao suficiente/)
  assert.match(prompt, /Adega do Joao/)
  assert.match(prompt, /Especialista em Marketing para Adegas e Distribuidoras/)
})

test('buildCampaignPrompt renders prompt with L1 L2 and L3 when score is at or above threshold', async () => {
  const prompt = await buildCampaignPrompt('store-1', 'promocao', {
    client: createDefaultClient({
      intelligenceScore: 75,
      intelligenceContext: { brand_voice: 'informal e acolhedor', target_audience: 'adultos urbanos' },
    }),
  })

  assert.match(prompt, /PREFERENCIAS CALIBRADAS DO LOJISTA/)
  assert.match(prompt, /informal e acolhedor/)
  assert.match(prompt, /Intelligence Score: 75%/)
})

test('buildCampaignPrompt injects segment and regional persona', async () => {
  const prompt = await buildCampaignPrompt('store-1', 'promocao', {
    client: createDefaultClient(),
  })

  assert.match(prompt, /Especialista em Marketing para Adegas e Distribuidoras/)
  assert.match(prompt, /Sao Paulo - Capital|São Paulo - Capital/)
})

test('buildCampaignPrompt formats intelligence arrays as readable lines', async () => {
  const prompt = await buildCampaignPrompt('store-1', 'promocao', {
    client: createDefaultClient({
      intelligenceScore: 60,
      intelligenceContext: {
        seasonal_peaks: ['Verao', 'Natal'],
        successful_past_ctas: ['Compre ja', 'Aproveite'],
      },
    }),
  })

  assert.match(prompt, /- Sazonalidade: Verao, Natal/)
  assert.match(prompt, /- CTAs testados: Compre ja, Aproveite/)
})

test('buildCampaignPrompt handles null-ish optional fields without throwing', async () => {
  const prompt = await buildCampaignPrompt('store-1', 'promocao', {
    client: createDefaultClient({
      intelligenceContext: null,
      store: {
        neighborhood: null,
        brand_positioning: null,
        tone_of_voice: null,
        whatsapp: null,
        phone: null,
      },
    }),
  })

  assert.match(prompt, /Posicionamento: Nao informado/)
  assert.match(prompt, /Tom de voz: profissional mas acessivel/)
  assert.match(prompt, /Contato: Nao informado/)
})

test('buildCampaignPrompt accepts custom intelligence threshold', async () => {
  const prompt = await buildCampaignPrompt('store-1', 'promocao', {
    client: createDefaultClient({ intelligenceScore: 40 }),
    intelligenceThreshold: 50,
  })

  assert.match(prompt, /ATENCAO: Loja sem calibracao suficiente \(Intelligence Score: 40%\)/)
})

test('buildCampaignPrompt renders campaign type dynamically', async () => {
  const prompt = await buildCampaignPrompt('store-1', 'lancamento', {
    client: createDefaultClient(),
  })

  assert.match(prompt, /Crie uma campanha de lancamento para Adega do Joao\./)
})

test('buildCampaignPrompt supports disabling L3 persona details', async () => {
  const prompt = await buildCampaignPrompt('store-1', 'promocao', {
    client: createDefaultClient(),
    useL3Persona: false,
  })

  assert.match(prompt, /Especialista em marketing para varejo local/)
  assert.doesNotMatch(prompt, /EXPERTISE:/)
})