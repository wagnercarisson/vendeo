import {
  CompositionVariantsSchema,
  VISUAL_COMPOSER_CANVAS,
  emptyCompositionVariants,
  type CompositionInput,
  type CompositionVariants,
} from "./contracts";
import { generateDeterministicVariations } from "./layout-rules";

export function generateFallbackVariations(input: CompositionInput): CompositionVariants {
  if (input.campaign.content_type === "message") {
    return emptyCompositionVariants(input.direction);
  }

  return CompositionVariantsSchema.parse({
    direction: input.direction,
    variations: generateDeterministicVariations(input),
    canvas: { ...VISUAL_COMPOSER_CANVAS },
    generated_at: new Date().toISOString(),
  });
}
