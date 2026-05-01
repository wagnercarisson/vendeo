import test from "node:test";
import assert from "node:assert/strict";
import { getIntelligenceBadge, getScoreSummary } from "./useScoreCalculation.ts";

test("getIntelligenceBadge returns bronze, silver, and gold thresholds correctly", () => {
  assert.equal(getIntelligenceBadge(0), "🥉 Inteligência Básica");
  assert.equal(getIntelligenceBadge(53), "🥈 Inteligência Média");
  assert.equal(getIntelligenceBadge(75), "🥇 Inteligência Avançada");
});

test("getScoreSummary keeps filled fields and score aligned", () => {
  const summary = getScoreSummary({
    brand_voice: "informal",
    seasonal_peaks: ["Natal"],
    main_differentiation: "Entrega rápida",
    top_products: ["Produto 1"],
    price_positioning: "premium",
    average_ticket_brl: 150,
    competitors: ["Loja A"],
    customer_pain_points: ["Preço"],
  });

  assert.equal(summary.filledFields, 8);
  assert.equal(summary.score, 53);
  assert.equal(summary.badge, "🥈 Inteligência Média");
});