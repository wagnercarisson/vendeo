import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import {
  __clearRegistryCachesForTests,
  __setRegistriesRootForTests,
  buildL3Context,
  clearRegistryCaches,
  isRegionalExpert,
  isSegmentExpert,
  loadRegionalExpert,
  loadSegmentExpert,
} from './loader.ts'

test.afterEach(() => {
  __setRegistriesRootForTests(null)
  __clearRegistryCachesForTests()
})

test('loadSegmentExpert loads bebidas_alcoolicas using normalized folder name', () => {
  const expert = loadSegmentExpert('bebidas_alcoolicas')

  assert.equal(expert.segment_id, 'bebidas_alcoolicas')
  assert.ok(expert.expertise.length > 0)
})

test('loadSegmentExpert reuses cache on repeated calls', () => {
  const first = loadSegmentExpert('mercearia')
  const second = loadSegmentExpert('mercearia')

  assert.equal(first, second)
})

test('clearRegistryCaches clears object references for subsequent loads', () => {
  const first = loadSegmentExpert('mercearia')

  clearRegistryCaches()

  const second = loadSegmentExpert('mercearia')
  assert.notEqual(first, second)
})

test('loadRegionalExpert loads a typed regional expert', () => {
  const expert = loadRegionalExpert('bebidas_alcoolicas', 'SP-capital')

  assert.equal(expert.region_id, 'SP-capital')
  assert.equal(expert.segment_id, 'bebidas_alcoolicas')
  assert.equal(expert.cultural_context.overview.length > 0, true)
})

test('buildL3Context returns segment and regional experts together', () => {
  const context = buildL3Context('mercearia', 'RJ-capital')

  assert.equal(context.segment.segment_id, 'mercearia')
  assert.equal(context.regional.region_id, 'RJ-capital')
})

test('loadSegmentExpert throws when segment does not exist', () => {
  assert.throws(() => loadSegmentExpert('segmento_invalido'), /Segment expert not found/) 
})

test('loadRegionalExpert throws when region does not exist', () => {
  assert.throws(() => loadRegionalExpert('mercearia', 'invalid-region'), /Regional expert not found/) 
})

test('loadSegmentExpert throws a parse error for invalid yaml', () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'vendeo-registry-test-'))
  const segmentDir = join(tempRoot, 'mercearia')
  mkdirSync(segmentDir, { recursive: true })
  writeFileSync(join(segmentDir, 'segment-expert.yaml'), 'segment_id: mercearia\nsegment_name: [broken\n')

  __setRegistriesRootForTests(tempRoot)

  assert.throws(() => loadSegmentExpert('mercearia'), /Failed to parse YAML/) 
})

test('loadRegionalExpert validates required fields', () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'vendeo-registry-test-'))
  const segmentDir = join(tempRoot, 'mercearia', 'regional')
  mkdirSync(segmentDir, { recursive: true })
  writeFileSync(
    join(tempRoot, 'mercearia', 'segment-expert.yaml'),
    [
      'segment_id: mercearia',
      'segment_name: "Mercados e Mercearias"',
      'version: "1.0"',
      'title: "Teste"',
      'description: "Teste"',
      'expertise:',
      '  - "item"',
      'seasonal_patterns: {}',
      'conversion_triggers:',
      '  occasions: []',
      'language_rules:',
      '  tone: "teste"',
      '  formality: "teste"',
      'version_notes: "teste"',
      'last_updated: "2026-05-04"',
    ].join('\n')
  )
  writeFileSync(
    join(segmentDir, 'SP-capital.yaml'),
    [
      'region_id: SP-capital',
      'region_name: "São Paulo - Capital"',
      'segment_id: mercearia',
      'version: "1.0"',
      'local_events: []',
      'linguistic_markers: {}',
      'competitive_context: {}',
      'seasonal_specifics: {}',
      'regional_messaging_strategy: {}',
      'version_notes: "teste"',
      'last_updated: "2026-05-04"',
    ].join('\n')
  )

  __setRegistriesRootForTests(tempRoot)

  assert.throws(() => loadRegionalExpert('mercearia', 'SP-capital'), /missing required field 'cultural_context'/)
})

test('isSegmentExpert and isRegionalExpert discriminate valid structures', () => {
  assert.equal(isSegmentExpert(loadSegmentExpert('mercearia')), true)
  assert.equal(isRegionalExpert(loadRegionalExpert('mercearia', 'SP-capital')), true)
  assert.equal(isSegmentExpert({ segment_id: 'x' }), false)
  assert.equal(isRegionalExpert({ region_id: 'x' }), false)
})