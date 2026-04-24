import type { CompositionInput } from "@/lib/ai/visual-composer/contracts";

type FixtureExpectation = {
  expectPriceBadge: boolean;
  expectPromotionalTitle: boolean;
  expectCenteredProduct?: boolean;
  expectOverlay?: boolean;
  expectHeroDominance?: boolean;
  expectHighPriceTypography?: boolean;
  expectBadgeProductOverlap?: boolean;
};

export type VisualComposerFixture = {
  id: string;
  input: CompositionInput;
  expectation: FixtureExpectation;
};

const baseInput: CompositionInput = {
  image: {
    targetBox: { x: 0.2, y: 0.12, width: 0.42, height: 0.66 },
    targetPosition: "center",
    targetOrientation: "vertical",
    targetOccupancy: "medium",
    backgroundType: "solid",
    sceneType: "single_product",
    imageQuality: "good",
    visibility: "clear",
    framing: "good",
  },
  direction: {
    directionType: "hero",
    mood: "clean",
    productTreatment: "framed",
    textDistribution: "center",
    priceEmphasis: "medium",
    visualIntensity: "balanced",
  },
  signature: {
    logo_url: null,
    store_name_typography: { font: "Sora", weight: "700" },
    signature_seed: "123e4567-e89b-12d3-a456-426614174000",
    intensity_level: "balanced",
    context_type: "standard",
  },
  campaign: {
    content_type: "product",
    objective: "novidade",
    price: 49.9,
    price_label: "R$ 49,90",
    product_name: "Produto teste",
    audience: "geral",
    product_positioning: "popular",
  },
};

export const visualComposerFixtures: VisualComposerFixture[] = [
  {
    id: "hero-transparent-target",
    input: {
      ...baseInput,
      image: { ...baseInput.image, backgroundType: "transparent" },
    },
    expectation: { expectPriceBadge: true, expectPromotionalTitle: false, expectHeroDominance: true },
  },
  {
    id: "frame-solid-target",
    input: {
      ...baseInput,
      direction: { ...baseInput.direction, directionType: "frame" },
    },
    expectation: { expectPriceBadge: true, expectPromotionalTitle: false },
  },
  {
    id: "overlay-complex",
    input: {
      ...baseInput,
      image: { ...baseInput.image, backgroundType: "complex", sceneType: "lifestyle_scene" },
      direction: { ...baseInput.direction, directionType: "overlay", textDistribution: "overlay", productTreatment: "background" },
    },
    expectation: { expectPriceBadge: true, expectPromotionalTitle: false, expectOverlay: true },
  },
  {
    id: "target-box-null",
    input: {
      ...baseInput,
      image: { ...baseInput.image, targetBox: null, targetPosition: "unknown", targetOrientation: "unknown" },
    },
    expectation: { expectPriceBadge: true, expectPromotionalTitle: false, expectCenteredProduct: true },
  },
  {
    id: "high-price-emphasis",
    input: {
      ...baseInput,
      direction: { ...baseInput.direction, priceEmphasis: "high", mood: "aggressive", visualIntensity: "strong" },
      campaign: { ...baseInput.campaign, objective: "promocao" },
      signature: { ...baseInput.signature, context_type: "promotional", intensity_level: "strong" },
    },
    expectation: { expectPriceBadge: true, expectPromotionalTitle: true, expectHighPriceTypography: true },
  },
  {
    id: "minimal-intensity",
    input: {
      ...baseInput,
      direction: { ...baseInput.direction, visualIntensity: "minimal", mood: "premium" },
      signature: { ...baseInput.signature, intensity_level: "minimal", context_type: "premium" },
    },
    expectation: { expectPriceBadge: true, expectPromotionalTitle: false },
  },
  {
    id: "strong-intensity",
    input: {
      ...baseInput,
      direction: { ...baseInput.direction, visualIntensity: "strong", mood: "aggressive" },
      signature: { ...baseInput.signature, intensity_level: "strong", context_type: "urgency" },
      campaign: { ...baseInput.campaign, objective: "queima" },
    },
    expectation: { expectPriceBadge: true, expectPromotionalTitle: true },
  },
  {
    id: "no-price",
    input: {
      ...baseInput,
      campaign: { ...baseInput.campaign, price: null, price_label: null },
      direction: { ...baseInput.direction, priceEmphasis: "low" },
    },
    expectation: { expectPriceBadge: false, expectPromotionalTitle: false },
  },
  {
    id: "promotional-title",
    input: {
      ...baseInput,
      campaign: { ...baseInput.campaign, objective: "promocao" },
      signature: { ...baseInput.signature, context_type: "promotional" },
    },
    expectation: { expectPriceBadge: true, expectPromotionalTitle: true },
  },
  {
    id: "full-occupancy-hero",
    input: {
      ...baseInput,
      image: { ...baseInput.image, targetOccupancy: "full", targetBox: { x: 0.05, y: 0.05, width: 0.9, height: 0.9 }, framing: "tight" },
      direction: {
        ...baseInput.direction,
        mood: "aggressive",
        productTreatment: "background",
        priceEmphasis: "high",
        visualIntensity: "strong",
      },
      signature: {
        ...baseInput.signature,
        logo_url: null,
        signature_seed: "seed-full-hero",
        intensity_level: "strong",
        context_type: "promotional",
        store_name_typography: { font: "Arial", weight: "700" },
      },
      campaign: {
        ...baseInput.campaign,
        objective: "promocao",
        price: 9.99,
        price_label: null,
        product_name: "Coca-Cola 2L",
      },
    },
    expectation: {
      expectPriceBadge: true,
      expectPromotionalTitle: true,
      expectHeroDominance: true,
      expectHighPriceTypography: true,
      expectBadgeProductOverlap: true,
    },
  },
  {
    id: "poor-image-quality",
    input: {
      ...baseInput,
      image: { ...baseInput.image, imageQuality: "poor", visibility: "partial", framing: "tight" },
      direction: { ...baseInput.direction, visualIntensity: "minimal" },
    },
    expectation: { expectPriceBadge: true, expectPromotionalTitle: false },
  },
  {
    id: "multiple-products-scene",
    input: {
      ...baseInput,
      image: { ...baseInput.image, sceneType: "multiple_products", targetOrientation: "mixed", targetOccupancy: "high" },
      direction: { ...baseInput.direction, directionType: "split-dynamic" },
      campaign: { ...baseInput.campaign, objective: "combo" },
    },
    expectation: { expectPriceBadge: true, expectPromotionalTitle: true },
  },
];
