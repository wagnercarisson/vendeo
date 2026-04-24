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
    const safe = CompositionVariantsSchema.safeParse(parsed);
    if (!safe.success) {
      console.error("[visual-composer] AI output validation failed", {
        issues: safe.error.issues,
        parsed,
      });
      return generateFallbackVariations(validatedInput.data);
    }

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
