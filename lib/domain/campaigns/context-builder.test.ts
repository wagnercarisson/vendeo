import assert from 'node:assert/strict'
import test from 'node:test'

import {
  __setContextBuilderClientFactoryForTests,
  buildAgenticPersona,
  buildPromptContext,
  fetchIntelligenceContext,
  fetchStoreMetadata,
  mapLocationToRegion,
} from './context-builder.ts'

type MockResponse = {
  data: unknown
  error: { message?: string | null; code?: string | null } | null
}

function createMockClient(config: {
  stores?: MockResponse
  intelligence?: MockResponse
  rpc?: MockResponse
}) {
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

test.afterEach(() => {
  __setContextBuilderClientFactoryForTests(null)
})

test('fetchStoreMetadata maps store fields into L1 metadata', async () => {
  __setContextBuilderClientFactoryForTests(async () =>
    createMockClient({
      stores: {
        data: {
          id: 'store-1',
          name: 'Mercearia da Vila',
          main_segment: 'mercearia',
          city: 'São Paulo',
          state: 'SP',
          neighborhood: 'Mooca',
          address: 'Rua A, 10',
          brand_positioning: 'bairro',
          tone_of_voice: 'próximo',
          phone: '1133334444',
          whatsapp: '5511999999999',
        },
        error: null,
      },
    }) as never
  )

  const metadata = await fetchStoreMetadata('store-1')

  assert.equal(metadata.name, 'Mercearia da Vila')
  assert.equal(metadata.segment, 'mercearia')
  assert.equal(metadata.location.region, 'SP-capital')
  assert.equal(metadata.contact.whatsapp, '5511999999999')
})

test('fetchStoreMetadata throws when store is not found', async () => {
  __setContextBuilderClientFactoryForTests(async () =>
    createMockClient({
      stores: { data: null, error: null },
    }) as never
  )

  await assert.rejects(() => fetchStoreMetadata('missing-store'), /Store not found: missing-store/)
})

test('fetchIntelligenceContext returns fallback when no intelligence exists', async () => {
  __setContextBuilderClientFactoryForTests(async () =>
    createMockClient({
      intelligence: { data: null, error: null },
    }) as never
  )

  const result = await fetchIntelligenceContext('store-1')
  assert.equal(result.score, 0)
  assert.equal(result.context, null)
})

test('fetchIntelligenceContext extracts completeness score from rpc table result', async () => {
  __setContextBuilderClientFactoryForTests(async () =>
    createMockClient({
      intelligence: {
        data: {
          context: { brand_voice: 'informal' },
          intelligence_score: 15,
        },
        error: null,
      },
      rpc: {
        data: [{ completeness_score: 70, filled_fields_count: 14, total_fields_count: 20 }],
        error: null,
      },
    }) as never
  )

  const result = await fetchIntelligenceContext('store-1')
  assert.equal(result.score, 70)
  assert.deepEqual(result.context, { brand_voice: 'informal' })
})

test('mapLocationToRegion handles capitals and accent-insensitive input', () => {
  assert.equal(mapLocationToRegion('São Paulo', 'SP'), 'SP-capital')
  assert.equal(mapLocationToRegion('sao paulo', 'SP'), 'SP-capital')
  assert.equal(mapLocationToRegion('Rio de Janeiro', 'RJ'), 'RJ-capital')
  assert.equal(mapLocationToRegion('Belo Horizonte', 'MG'), 'MG-capital')
})

test('buildAgenticPersona loads the expected registries for supported capitals', () => {
  const persona = buildAgenticPersona('bebidas_alcoolicas', {
    city: 'Rio de Janeiro',
    state: 'RJ',
  })

  assert.equal(persona.segment.segment_id, 'bebidas_alcoolicas')
  assert.equal(persona.regional.region_id, 'RJ-capital')
})

test('buildAgenticPersona rejects unsupported regions', () => {
  assert.throws(
    () =>
      buildAgenticPersona('mercearia', {
        city: 'Curitiba',
        state: 'PR',
      }),
    /Region mapping not available/
  )
})

test('buildPromptContext assembles L1 L2 and L3 and disables L2 below threshold', async () => {
  __setContextBuilderClientFactoryForTests(async () =>
    createMockClient({
      stores: {
        data: {
          id: 'store-1',
          name: 'Mercearia da Vila',
          main_segment: 'mercearia',
          city: 'São Paulo',
          state: 'SP',
        },
        error: null,
      },
      intelligence: {
        data: {
          context: { brand_voice: 'informal' },
          intelligence_score: 10,
        },
        error: null,
      },
      rpc: {
        data: [{ completeness_score: 20, filled_fields_count: 4, total_fields_count: 20 }],
        error: null,
      },
    }) as never
  )

  const context = await buildPromptContext('store-1')
  assert.equal(context.L1.segment, 'mercearia')
  assert.equal(context.L3.regional.region_id, 'SP-capital')
  assert.equal(context.intelligenceScore, 20)
  assert.equal(context.useL2, false)
})

test('buildPromptContext enables L2 at threshold or above', async () => {
  __setContextBuilderClientFactoryForTests(async () =>
    createMockClient({
      stores: {
        data: {
          id: 'store-2',
          name: 'Adega Centro',
          main_segment: 'bebidas_alcoolicas',
          city: 'Belo Horizonte',
          state: 'MG',
        },
        error: null,
      },
      intelligence: {
        data: {
          context: { target_audience: 'adultos' },
          intelligence_score: 30,
        },
        error: null,
      },
      rpc: {
        data: [{ completeness_score: 30, filled_fields_count: 6, total_fields_count: 20 }],
        error: null,
      },
    }) as never
  )

  const context = await buildPromptContext('store-2')
  assert.equal(context.L3.regional.region_id, 'MG-capital')
  assert.equal(context.useL2, true)
})