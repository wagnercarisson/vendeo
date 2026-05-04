import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'

import type { RegionalExpert, SegmentExpert } from '@/lib/ai/prompts/registries/types'

const segmentCache = new Map<string, SegmentExpert>()
const regionalCache = new Map<string, RegionalExpert>()

let registriesRootOverride: string | null = null

function getRegistriesRoot(): string {
  return registriesRootOverride ?? join(process.cwd(), 'lib', 'ai', 'prompts', 'registries')
}

function assertNonEmptyIdentifier(value: string, label: string): void {
  if (!value || !value.trim()) {
    throw new Error(`Invalid ${label}: value is required`)
  }
}

function resolveSegmentDirectory(segment: string): { cacheKey: string; directoryPath: string } {
  assertNonEmptyIdentifier(segment, 'segment code')

  const registriesRoot = getRegistriesRoot()
  const normalizedSegment = segment.trim()
  const candidates = [normalizedSegment, normalizedSegment.replace(/_/g, '-'), normalizedSegment.replace(/-/g, '_')]

  for (const candidate of candidates) {
    const directoryPath = join(registriesRoot, candidate)
    if (existsSync(directoryPath)) {
      return {
        cacheKey: candidate,
        directoryPath,
      }
    }
  }

  throw new Error(`Segment expert not found: ${segment}`)
}

function parseYamlFile<T>(filePath: string, errorLabel: string): T {
  try {
    const fileContent = readFileSync(filePath, 'utf8')
    return parse(fileContent) as T
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException
    if (nodeError.code === 'ENOENT') {
      throw new Error(`${errorLabel} not found: ${filePath}`)
    }

    const message = error instanceof Error ? error.message : 'Unknown YAML parsing error'
    throw new Error(`Failed to parse YAML in ${filePath}: ${message}`)
  }
}

export function isSegmentExpert(value: unknown): value is SegmentExpert {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.segment_id === 'string' &&
    typeof candidate.segment_name === 'string' &&
    typeof candidate.version === 'string' &&
    Array.isArray(candidate.expertise) &&
    candidate.expertise.length > 0
  )
}

export function isRegionalExpert(value: unknown): value is RegionalExpert {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.region_id === 'string' &&
    typeof candidate.region_name === 'string' &&
    typeof candidate.segment_id === 'string' &&
    typeof candidate.version === 'string' &&
    !!candidate.cultural_context &&
    typeof candidate.cultural_context === 'object'
  )
}

function validateSegmentExpert(expert: unknown, filePath: string): SegmentExpert {
  if (!expert || typeof expert !== 'object') {
    throw new Error(`Invalid segment expert structure in ${filePath}: expected object`)
  }

  const candidate = expert as Record<string, unknown>
  if (!candidate.segment_id) {
    throw new Error(`Invalid segment expert structure in ${filePath}: missing required field 'segment_id'`)
  }

  if (!candidate.segment_name) {
    throw new Error(`Invalid segment expert structure in ${filePath}: missing required field 'segment_name'`)
  }

  if (!candidate.version) {
    throw new Error(`Invalid segment expert structure in ${filePath}: missing required field 'version'`)
  }

  if (!Array.isArray(candidate.expertise) || candidate.expertise.length === 0) {
    throw new Error(`Invalid segment expert structure in ${filePath}: 'expertise' must be a non-empty array`)
  }

  if (!isSegmentExpert(candidate)) {
    throw new Error(`Invalid segment expert structure in ${filePath}`)
  }

  return candidate
}

function validateRegionalExpert(expert: unknown, filePath: string): RegionalExpert {
  if (!expert || typeof expert !== 'object') {
    throw new Error(`Invalid regional expert structure in ${filePath}: expected object`)
  }

  const candidate = expert as Record<string, unknown>
  if (!candidate.region_id) {
    throw new Error(`Invalid regional expert structure in ${filePath}: missing required field 'region_id'`)
  }

  if (!candidate.region_name) {
    throw new Error(`Invalid regional expert structure in ${filePath}: missing required field 'region_name'`)
  }

  if (!candidate.segment_id) {
    throw new Error(`Invalid regional expert structure in ${filePath}: missing required field 'segment_id'`)
  }

  if (!candidate.version) {
    throw new Error(`Invalid regional expert structure in ${filePath}: missing required field 'version'`)
  }

  if (!candidate.cultural_context || typeof candidate.cultural_context !== 'object') {
    throw new Error(`Invalid regional expert structure in ${filePath}: missing required field 'cultural_context'`)
  }

  if (!isRegionalExpert(candidate)) {
    throw new Error(`Invalid regional expert structure in ${filePath}`)
  }

  return candidate
}

export function loadSegmentExpert(segment: string): SegmentExpert {
  const resolved = resolveSegmentDirectory(segment)

  if (segmentCache.has(resolved.cacheKey)) {
    return segmentCache.get(resolved.cacheKey) as SegmentExpert
  }

  const filePath = join(resolved.directoryPath, 'segment-expert.yaml')
  const parsed = parseYamlFile<unknown>(filePath, 'Segment expert')
  const validated = validateSegmentExpert(parsed, filePath)

  segmentCache.set(resolved.cacheKey, validated)
  return validated
}

export function loadRegionalExpert(segment: string, region: string): RegionalExpert {
  assertNonEmptyIdentifier(region, 'region code')

  const resolved = resolveSegmentDirectory(segment)
  const regionKey = region.trim()
  const cacheKey = `${resolved.cacheKey}:${regionKey}`

  if (regionalCache.has(cacheKey)) {
    return regionalCache.get(cacheKey) as RegionalExpert
  }

  const filePath = join(resolved.directoryPath, 'regional', `${regionKey}.yaml`)
  const parsed = parseYamlFile<unknown>(filePath, 'Regional expert')
  const validated = validateRegionalExpert(parsed, filePath)

  regionalCache.set(cacheKey, validated)
  return validated
}

export function buildL3Context(segment: string, region: string): { segment: SegmentExpert; regional: RegionalExpert } {
  return {
    segment: loadSegmentExpert(segment),
    regional: loadRegionalExpert(segment, region),
  }
}

export function clearRegistryCaches(): void {
  segmentCache.clear()
  regionalCache.clear()
}

export function __clearRegistryCachesForTests(): void {
  clearRegistryCaches()
}

export function __setRegistriesRootForTests(path: string | null): void {
  registriesRootOverride = path
  clearRegistryCaches()
}