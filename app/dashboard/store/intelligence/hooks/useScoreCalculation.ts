"use client";

import { useMemo } from "react";
import {
  INTELLIGENCE_CONTEXT_FIELDS,
  calculateIntelligenceScore,
  countFilledIntelligenceFields,
} from "@/lib/domain/intelligence/service";

export function getIntelligenceBadge(score: number) {
  if (score < 40) return "🥉 Inteligência Básica";
  if (score < 70) return "🥈 Inteligência Média";
  return "🥇 Inteligência Avançada";
}

export function getScoreSummary(context: Record<string, unknown>) {
  const filledFields = countFilledIntelligenceFields(context);
  const score = calculateIntelligenceScore(context);

  return {
    score,
    filledFields,
    totalFields: INTELLIGENCE_CONTEXT_FIELDS.length,
    badge: getIntelligenceBadge(score),
  };
}

export function useScoreCalculation(context: Record<string, unknown>) {
  return useMemo(() => getScoreSummary(context), [context]);
}