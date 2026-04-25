import { callAI, parseJsonFirstObject } from "@/lib/ai/parse";

import {
  CompositionInputSchema,
  CompositionVariantsSchema,
  emptyCompositionVariants,
  type CompositionInput,
  type CompositionVariants,
} from "./contracts";
import { generateFallbackVariations } from "./fallback";
import {
  buildVisualComposerUserPrompt,
  VISUAL_COMPOSER_SYSTEM_PROMPT,
} from "./prompts";
import { validateCompositionVariants, validateDistinctness } from "./validation";

export function buildVisualComposerPayload(input: CompositionInput) {
  return {
    image: input.image,
    direction: input.direction,
    signature: input.signature,
    campaign: input.campaign,
  };
}

export async function composeVariations(
  input: CompositionInput
): Promise<CompositionVariants> {
  const validatedInput = CompositionInputSchema.safeParse(input);
  if (!validatedInput.success) {
    return emptyCompositionVariants();
  }

  if (validatedInput.data.campaign.content_type === "message") {
    return emptyCompositionVariants(validatedInput.data.direction);
  }

  try {
    const raw = await callAI(
      [
        { role: "system", content: VISUAL_COMPOSER_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildVisualComposerUserPrompt(
            buildVisualComposerPayload(validatedInput.data)
          ),
        },
      ],
      {
        model: "gpt-5.4",
        temperature: 0.4,
        timeoutMs: 25000,
      }
    );

    const parsed = parseJsonFirstObject(raw);
    
    // TEMP DEBUG: Log raw GPT output structure for Story 4.5.2 investigation
    console.log("[MOTOR-3][RAW-OUTPUT-DEBUG]", JSON.stringify({
      hasDirection: !!parsed.direction,
      directionType: typeof parsed.direction,
      directionValue: typeof parsed.direction === 'object' ? 'object' : parsed.direction,
      hasVariations: !!parsed.variations,
      variationsCount: Array.isArray(parsed.variations) ? parsed.variations.length : 'not-array',
      firstVariationKeys: parsed.variations?.[0] ? Object.keys(parsed.variations[0]).slice(0, 5) : 'no-variations',
    }, null, 2));
    
    const safe = CompositionVariantsSchema.safeParse(parsed);
    if (!safe.success) {
      console.error("[MOTOR-3][VALIDATION-FAIL] Unexpected validation failure", {
        errors: safe.error.issues.length,
        firstError: safe.error.issues[0],
      });
      return generateFallbackVariations(validatedInput.data);
    }

    console.log(`[MOTOR-3][VALIDATION] All outputs valid (${safe.data.variations.length} variations)`);

    if (
      !validateCompositionVariants(safe.data, validatedInput.data) ||
      !validateDistinctness(safe.data.variations)
    ) {
      return generateFallbackVariations(validatedInput.data);
    }

    return safe.data;
  } catch (error) {
    console.error("[visual-composer] AI call failed", error);
    return generateFallbackVariations(validatedInput.data);
  }
}
