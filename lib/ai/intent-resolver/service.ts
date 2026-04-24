import { callAI, parseJsonFirstObject } from "@/lib/ai/parse";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { CampaignObjective } from "@/lib/constants/strategy";

import {
  CampaignDataSchema,
  CreativeDirectionSchema,
  IntentResolverInputSchema,
  VisualSignatureSchema,
  emptyCreativeDirection,
  type CreativeDirection,
  type IntentResolverInput,
  type VisualSignature,
} from "./contracts";
import { deriveContextProfile } from "./context-profiles";
import { buildIntentResolverUserPrompt, INTENT_RESOLVER_SYSTEM_PROMPT } from "./prompts";
import { applyValidationRules, buildFallbackDirection } from "./validation";

type VisualSignatureRow = {
  id: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  store_name_typography: Record<string, unknown> | null;
  signature_seed: string;
};

type VisualSignatureProfileRow = {
  context_type: string;
  intensity_level: "minimal" | "balanced" | "strong";
  composition_rules: Record<string, unknown> | null;
  typography_rules: Record<string, unknown> | null;
  color_rules: Record<string, unknown> | null;
};

function sanitizeJsonRules(value: Record<string, unknown> | null | undefined) {
  return value ?? {};
}

function mergeVisualSignature(
  signature: VisualSignatureRow,
  profile: VisualSignatureProfileRow
): VisualSignature {
  return VisualSignatureSchema.parse({
    id: signature.id,
    primary_color: signature.primary_color,
    secondary_color: signature.secondary_color,
    logo_url: signature.logo_url,
    store_name_typography: signature.store_name_typography ?? {},
    signature_seed: signature.signature_seed,
    intensity_level: profile.intensity_level,
    composition_rules: sanitizeJsonRules(profile.composition_rules),
    typography_rules: sanitizeJsonRules(profile.typography_rules),
    color_rules: sanitizeJsonRules(profile.color_rules),
    context_type: profile.context_type,
  });
}

export async function getVisualSignatureProfile(
  storeId: string,
  objective: CampaignObjective
): Promise<VisualSignature> {
  const supabase = getSupabaseAdmin();
  const contextType = deriveContextProfile(objective);

  const { data: signature, error: signatureError } = await supabase
    .from("visual_signatures")
    .select(
      "id, primary_color, secondary_color, logo_url, store_name_typography, signature_seed"
    )
    .eq("store_id", storeId)
    .maybeSingle();

  if (signatureError || !signature) {
    throw new Error("VISUAL_SIGNATURE_NOT_FOUND");
  }

  const { data: profile, error: profileError } = await supabase
    .from("visual_signature_profiles")
    .select(
      "context_type, intensity_level, composition_rules, typography_rules, color_rules"
    )
    .eq("signature_id", signature.id)
    .eq("context_type", contextType)
    .maybeSingle();

  if (!profileError && profile) {
    return mergeVisualSignature(signature as VisualSignatureRow, profile as VisualSignatureProfileRow);
  }

  const { data: fallbackProfile, error: fallbackError } = await supabase
    .from("visual_signature_profiles")
    .select(
      "context_type, intensity_level, composition_rules, typography_rules, color_rules"
    )
    .eq("signature_id", signature.id)
    .eq("context_type", "standard")
    .maybeSingle();

  if (fallbackError || !fallbackProfile) {
    throw new Error("VISUAL_SIGNATURE_PROFILE_NOT_FOUND");
  }

  return mergeVisualSignature(
    signature as VisualSignatureRow,
    fallbackProfile as VisualSignatureProfileRow
  );
}

export function buildIntentResolverPayload(input: IntentResolverInput) {
  return {
    image: input.image,
    campaign: input.campaign,
    signature: input.signature,
  };
}

export async function resolveIntent(input: IntentResolverInput): Promise<CreativeDirection> {
  const validatedInput = IntentResolverInputSchema.safeParse(input);
  if (!validatedInput.success) {
    return emptyCreativeDirection();
  }

  if (validatedInput.data.campaign.content_type === "message") {
    return emptyCreativeDirection();
  }

  try {
    const raw = await callAI(
      [
        { role: "system", content: INTENT_RESOLVER_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildIntentResolverUserPrompt(
            buildIntentResolverPayload(validatedInput.data)
          ),
        },
      ],
      {
        model: "gpt-5.4",
        temperature: 0.3,
        timeoutMs: 20000,
      }
    );

    const parsed = parseJsonFirstObject(raw);
    const safe = CreativeDirectionSchema.safeParse(parsed);
    if (!safe.success) {
      console.error("[intent-resolver] AI output validation failed", {
        issues: safe.error.issues,
        parsed,
      });
      return buildFallbackDirection(validatedInput.data);
    }

    return applyValidationRules(safe.data, validatedInput.data);
  } catch (error) {
    console.error("[intent-resolver] AI call failed", error);
    return buildFallbackDirection(validatedInput.data);
  }
}

export async function resolveIntentFromSources(input: {
  storeId: string;
  image: IntentResolverInput["image"];
  campaign: IntentResolverInput["campaign"];
}): Promise<CreativeDirection> {
  const validatedCampaign = CampaignDataSchema.safeParse(input.campaign);
  if (!validatedCampaign.success) {
    return emptyCreativeDirection();
  }

  const signature = await getVisualSignatureProfile(
    input.storeId,
    validatedCampaign.data.objective
  );

  return resolveIntent({
    image: input.image,
    campaign: validatedCampaign.data,
    signature,
  });
}