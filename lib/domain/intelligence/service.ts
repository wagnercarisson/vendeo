export const INTELLIGENCE_CONTEXT_FIELDS = [
  "brand_voice",
  "target_audience",
  "seasonal_peaks",
  "main_differentiation",
  "top_products",
  "price_positioning",
  "average_ticket_brl",
  "competitors",
  "unique_selling_proposition",
  "customer_pain_points",
  "conversion_triggers",
  "successful_past_ctas",
  "local_events_calendar",
  "language_specifics",
  "copy_length_preferences",
] as const;

export type IntelligenceContextField = (typeof INTELLIGENCE_CONTEXT_FIELDS)[number];
export type IntelligenceContextRecord = Record<string, unknown>;

function isPlainObject(value: unknown): value is IntelligenceContextRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeContext(value: unknown): IntelligenceContextRecord {
  if (!isPlainObject(value)) {
    return { schema_version: "2.1" };
  }

  const schemaVersion =
    typeof value.schema_version === "string" && value.schema_version.trim().length > 0
      ? value.schema_version.trim()
      : "2.1";

  return {
    ...value,
    schema_version: schemaVersion,
  };
}

function isFilledValue(value: unknown) {
  if (value === null || value === undefined) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
}

export function countFilledIntelligenceFields(context: unknown) {
  const normalized = normalizeContext(context);

  return INTELLIGENCE_CONTEXT_FIELDS.filter((field) =>
    isFilledValue(normalized[field])
  ).length;
}

export function mergeIntelligenceContext(
  existingContext: unknown,
  patch: IntelligenceContextRecord
) {
  return {
    ...normalizeContext(existingContext),
    ...patch,
    schema_version: "2.1",
  };
}

export function calculateIntelligenceScore(context: unknown) {
  const filledFields = countFilledIntelligenceFields(context);

  return Math.round((filledFields / INTELLIGENCE_CONTEXT_FIELDS.length) * 100);
}