import { emptyImageProfile, type ImageProfile, type NormalizedBox } from "./contracts";

function cloneProfile(profile: ImageProfile): ImageProfile {
  return {
    ...profile,
    ignoredElements: [...profile.ignoredElements],
    targetBox: profile.targetBox ? { ...profile.targetBox } : null,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getArea(box: NormalizedBox) {
  return box.width * box.height;
}

function normalizeMatchConsistency(profile: ImageProfile): ImageProfile {
  if (profile.matchType === "none") {
    profile.detected = false;
    profile.matchedTarget = null;
    profile.targetBox = null;
    profile.relevantCount = 0;
    profile.targetOrientation = "unknown";
    profile.targetPosition = "unknown";
    profile.targetOccupancy = "low";
    return profile;
  }

  if (profile.matchType === "exact") {
    profile.detected = true;
  }

  if (profile.matchType === "category_only") {
    profile.detected = false;
    profile.matchedTarget = profile.matchedTarget ?? "similar product detected";
  }

  if (!profile.targetBox) {
    return emptyImageProfile(
      "Inconsistent model output: non-none match returned without targetBox."
    );
  }

  return profile;
}

function normalizeTargetBox(profile: ImageProfile): ImageProfile {
  if (!profile.targetBox) {
    return profile;
  }

  const x = clamp(profile.targetBox.x, 0, 1);
  const y = clamp(profile.targetBox.y, 0, 1);
  const width = clamp(profile.targetBox.width, 0.0001, 1);
  const height = clamp(profile.targetBox.height, 0.0001, 1);

  profile.targetBox = {
    x: x + width > 1 ? Math.max(0, 1 - width) : x,
    y: y + height > 1 ? Math.max(0, 1 - height) : y,
    width,
    height,
  };

  return profile;
}

function normalizeSceneType(profile: ImageProfile): ImageProfile {
  if (profile.relevantCount > 1 && profile.sceneType === "single_product") {
    profile.sceneType = "multiple_products";
  }

  return profile;
}

function normalizePosition(profile: ImageProfile): ImageProfile {
  if (!profile.targetBox) {
    return profile;
  }

  const centerX = profile.targetBox.x + profile.targetBox.width / 2;
  const centerY = profile.targetBox.y + profile.targetBox.height / 2;

  if (profile.targetBox.width > 0.7 && profile.targetBox.height > 0.7) {
    profile.targetPosition = "mixed";
    return profile;
  }

  if (centerY < 0.2) {
    profile.targetPosition = "top";
    return profile;
  }

  if (centerY > 0.8) {
    profile.targetPosition = "bottom";
    return profile;
  }

  if (centerX < 0.33) {
    profile.targetPosition = "left";
  } else if (centerX > 0.66) {
    profile.targetPosition = "right";
  } else {
    profile.targetPosition = "center";
  }

  return profile;
}

function normalizeOccupancy(profile: ImageProfile): ImageProfile {
  if (!profile.targetBox) {
    return profile;
  }

  const area = getArea(profile.targetBox);

  if (area >= 0.75) {
    profile.targetOccupancy = "full";
  } else if (area >= 0.4) {
    profile.targetOccupancy = "high";
  } else if (area >= 0.15) {
    profile.targetOccupancy = "medium";
  } else {
    profile.targetOccupancy = "low";
  }

  return profile;
}

function normalizeIgnoredElements(profile: ImageProfile): ImageProfile {
  profile.ignoredElements = profile.ignoredElements
    .map((item) => item.trim())
    .filter(Boolean);

  return profile;
}

export function normalizeImageProfile(profile: ImageProfile): ImageProfile {
  let normalized = cloneProfile(profile);

  normalized = normalizeMatchConsistency(normalized);
  normalized = normalizeTargetBox(normalized);
  normalized = normalizeSceneType(normalized);
  normalized = normalizePosition(normalized);
  normalized = normalizeOccupancy(normalized);
  normalized = normalizeIgnoredElements(normalized);

  return normalized;
}