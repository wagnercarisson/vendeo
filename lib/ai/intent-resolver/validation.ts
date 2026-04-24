import {
  emptyCreativeDirection,
  type ContextType,
  type CreativeDirection,
  type IntentResolverInput,
} from "./contracts";
import {
  CONTEXT_PROFILE_CHARACTERISTICS,
  deriveContextProfile,
} from "./context-profiles";

export const DIRECTION_TYPE_MAP = {
  transparent: ["hero", "split-dynamic", "stacked", "frame"],
  solid: ["frame", "hero", "split-dynamic"],
  complex: ["overlay", "frame", "hero"],
  unknown: ["frame", "hero"],
} as const satisfies Record<
  IntentResolverInput["image"]["backgroundType"],
  CreativeDirection["directionType"][]
>;

export const PRODUCT_TREATMENT_RULES = {
  transparent: ["framed", "background"],
  solid: ["framed", "background"],
  complex: ["background"],
  unknown: ["framed"],
} as const satisfies Record<
  IntentResolverInput["image"]["backgroundType"],
  CreativeDirection["productTreatment"][]
>;

const FULL_OCCUPANCY_DIRECTION_PREFERENCE: CreativeDirection["directionType"][] = [
  "overlay",
  "frame",
  "stacked",
  "split-dynamic",
];

function inferTextDistribution(input: IntentResolverInput): CreativeDirection["textDistribution"] {
  if (input.image.targetPosition === "left") {
    return "right";
  }

  if (input.image.targetPosition === "right") {
    return "left";
  }

  return "center";
}

function inferPriceEmphasis(
  input: IntentResolverInput,
  contextType: ContextType
): CreativeDirection["priceEmphasis"] {
  if (input.campaign.price == null) {
    return "low";
  }

  if (contextType === "promotional" || contextType === "urgency") {
    return "high";
  }

  if (contextType === "premium") {
    return "low";
  }

  return "medium";
}

function inferVisualIntensity(
  input: IntentResolverInput,
  contextType: ContextType
): CreativeDirection["visualIntensity"] {
  if (input.image.imageQuality === "poor") {
    return "minimal";
  }

  const base = input.signature.intensity_level;
  const preferred = CONTEXT_PROFILE_CHARACTERISTICS[contextType].preferredIntensity;

  if (contextType === "urgency" || contextType === "promotional") {
    return base === "minimal" ? preferred : base;
  }

  return base;
}

export function buildFallbackDirection(input: IntentResolverInput): CreativeDirection {
  if (input.campaign.content_type === "message") {
    return emptyCreativeDirection();
  }

  const contextType = deriveContextProfile(input.campaign.objective);
  const allowedDirections = DIRECTION_TYPE_MAP[input.image.backgroundType];
  const allowedTreatment = PRODUCT_TREATMENT_RULES[input.image.backgroundType];

  const direction: CreativeDirection = {
    directionType: allowedDirections[0],
    mood: CONTEXT_PROFILE_CHARACTERISTICS[contextType].moodBias,
    productTreatment: allowedTreatment[0],
    textDistribution: inferTextDistribution(input),
    priceEmphasis: inferPriceEmphasis(input, contextType),
    visualIntensity: inferVisualIntensity(input, contextType),
  };

  return applyValidationRules(direction, input);
}

export function applyValidationRules(
  direction: CreativeDirection,
  input: IntentResolverInput
): CreativeDirection {
  const next = { ...direction };
  const allowedDirections = DIRECTION_TYPE_MAP[input.image.backgroundType];
  const allowedTreatment = PRODUCT_TREATMENT_RULES[input.image.backgroundType];

  if (!allowedDirections.includes(next.directionType)) {
    next.directionType = allowedDirections[0];
  }

  if (!allowedTreatment.includes(next.productTreatment)) {
    next.productTreatment = allowedTreatment[0];
  }

  if (input.image.targetOccupancy === "full" && next.directionType === "hero") {
    // Some source rules conflict here. Prefer the first feasible non-hero layout
    // allowed by the current background instead of returning an impossible design.
    next.directionType =
      FULL_OCCUPANCY_DIRECTION_PREFERENCE.find((candidate) =>
        allowedDirections.includes(candidate)
      ) ?? allowedDirections[0];
  }

  if (next.directionType === "overlay") {
    next.textDistribution = "overlay";
  } else if (next.textDistribution === "overlay") {
    next.textDistribution = inferTextDistribution(input);
  }

  if (input.image.imageQuality === "poor") {
    next.visualIntensity = "minimal";
  }

  if (input.campaign.price == null && next.priceEmphasis === "high") {
    next.priceEmphasis = "medium";
  }

  if (input.campaign.price == null && input.campaign.objective === "institucional") {
    next.priceEmphasis = "low";
  }

  if (input.image.matchType === "none" && next.directionType === "hero") {
    next.directionType = allowedDirections.includes("frame") ? "frame" : allowedDirections[0];
  }

  return next;
}