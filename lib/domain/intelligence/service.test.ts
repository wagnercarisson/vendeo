import test from "node:test";
import assert from "node:assert/strict";
import {
  INTELLIGENCE_CONTEXT_FIELDS,
  calculateIntelligenceScore,
  mergeIntelligenceContext,
} from "./service.ts";

test("mergeIntelligenceContext preserves existing fields and upgrades schema version", () => {
  const merged = mergeIntelligenceContext(
    {
      schema_version: "2.0",
      brand_voice: "formal",
      target_audience: "B2C",
    },
    {
      top_products: ["Produto 1"],
    }
  );

  assert.equal(merged.schema_version, "2.1");
  assert.equal(merged.brand_voice, "formal");
  assert.equal(merged.target_audience, "B2C");
  assert.deepEqual(merged.top_products, ["Produto 1"]);
});

test("calculateIntelligenceScore returns 0 for empty context", () => {
  assert.equal(calculateIntelligenceScore({}), 0);
});

test("calculateIntelligenceScore returns 100 when all tracked fields are filled", () => {
  const fullContext = Object.fromEntries(
    INTELLIGENCE_CONTEXT_FIELDS.map((field) => {
      if (
        field === "seasonal_peaks" ||
        field === "top_products" ||
        field === "competitors" ||
        field === "customer_pain_points" ||
        field === "successful_past_ctas" ||
        field === "local_events_calendar"
      ) {
        return [field, ["value"]];
      }

      if (field === "average_ticket_brl") {
        return [field, 100];
      }

      if (
        field === "unique_selling_proposition" ||
        field === "conversion_triggers" ||
        field === "language_specifics" ||
        field === "copy_length_preferences"
      ) {
        return [field, { ok: true }];
      }

      return [field, "value"];
    })
  );

  assert.equal(calculateIntelligenceScore(fullContext), 100);
});

test("calculateIntelligenceScore ignores null, undefined, blank strings, and empty arrays", () => {
  const score = calculateIntelligenceScore({
    brand_voice: null,
    target_audience: undefined,
    main_differentiation: "   ",
    top_products: [],
    price_positioning: "premium",
  });

  assert.equal(score, 7);
});