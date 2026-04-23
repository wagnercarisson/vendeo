import { callAI, parseJsonFirstObject } from "@/lib/ai/parse";

import {
  emptyImageProfile,
  ImageProfileSchema,
  VisualReaderInputSchema,
  type ImageProfile,
  type VisualReaderInput,
} from "./contracts";
import { getCachedImageProfile, setCachedImageProfile } from "./cache";
import { normalizeImageProfile } from "./normalizer";
import {
  buildVisualReaderUserPrompt,
  VISUAL_READER_V2_SYSTEM_PROMPT,
} from "./prompts";

function buildFallbackProfile(reasoningSummary: string) {
  return emptyImageProfile(reasoningSummary);
}

function validateFinalProfile(profile: ImageProfile) {
  const parsed = ImageProfileSchema.safeParse(profile);
  if (parsed.success) {
    return parsed.data;
  }

  console.error("[visual-reader] normalized profile validation failed", {
    issues: parsed.error.issues,
    profile,
  });

  return buildFallbackProfile("Visual analysis returned an inconsistent profile.");
}

export async function readVisualTarget(input: VisualReaderInput): Promise<ImageProfile> {
  const validatedInput = VisualReaderInputSchema.safeParse(input);
  if (!validatedInput.success) {
    return buildFallbackProfile("Invalid visual reader input.");
  }

  if (validatedInput.data.content_type === "message") {
    return buildFallbackProfile("Visual analysis skipped for message content.");
  }

  const cached = await getCachedImageProfile(validatedInput.data);
  if (cached) {
    return cached;
  }

  try {
    const raw = await callAI(
      [
        { role: "system", content: VISUAL_READER_V2_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildVisualReaderUserPrompt({
            productName: validatedInput.data.productName,
            content_type: validatedInput.data.content_type,
          }),
        },
      ],
      {
        model: "gpt-5.4-mini",
        temperature: 0.2,
        timeoutMs: 25000,
        imageUrl: validatedInput.data.imageUrl,
      }
    );

    const parsed = parseJsonFirstObject(raw);
    const safe = ImageProfileSchema.safeParse(parsed);
    if (!safe.success) {
      console.error("[visual-reader] AI profile validation failed", {
        issues: safe.error.issues,
        parsed,
      });
      return buildFallbackProfile("Visual analysis returned an invalid response.");
    }

    const normalized = validateFinalProfile(normalizeImageProfile(safe.data));
    await setCachedImageProfile(validatedInput.data, normalized);
    return normalized;
  } catch (error) {
    console.error("[visual-reader] AI call failed", error);
    return buildFallbackProfile("Visual analysis failed.");
  }
}