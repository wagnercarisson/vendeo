import type { CompositionSpec } from "@/lib/ai/visual-composer/contracts";
import type { RendererBatchInput, RendererInput } from "@/lib/ai/renderer";

function toDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function buildProductSvg(fill: string, accent: string) {
  return toDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
      <rect width="900" height="900" rx="80" fill="${fill}"/>
      <circle cx="450" cy="360" r="220" fill="${accent}"/>
      <rect x="280" y="540" width="340" height="180" rx="30" fill="#ffffff" fill-opacity="0.9"/>
    </svg>
  `);
}

function buildLogoSvg(label: string) {
  return toDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="360" height="160" viewBox="0 0 360 160">
      <rect width="360" height="160" rx="30" fill="#111827"/>
      <text x="180" y="96" text-anchor="middle" font-family="Arial" font-size="54" font-weight="700" fill="#F9FAFB">${label}</text>
    </svg>
  `);
}

function createSpec(overrides: Partial<CompositionSpec> & { layout?: Partial<CompositionSpec["layout"]>; decorative?: Partial<CompositionSpec["decorative"]> }): CompositionSpec {
  const base: CompositionSpec = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    seed: "renderer-fixture-seed",
    layout: {
      productArea: { x: 120, y: 140, width: 720, height: 760 },
      textArea: { x: 120, y: 940, width: 840, height: 130 },
      priceArea: { x: 300, y: 1080, width: 480, height: 140 },
    },
    hierarchy: {
      primary: "product",
      secondary: "text",
      tertiary: "price",
    },
    spacing: {
      padding: 40,
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
      gaps: 20,
    },
    typography: {
      productName: { fontSize: 60, fontWeight: "700" },
      price: { fontSize: 82, fontWeight: "900" },
      description: { fontSize: 28, fontWeight: "400" },
    },
    decorative: {
      priceBadge: null,
      storeIdentity: { type: "logo", position: "top-left", size: { width: 180, height: 80 } },
    },
  };

  return {
    ...base,
    ...overrides,
    id: overrides.id ?? base.id,
    seed: overrides.seed ?? base.seed,
    layout: {
      ...base.layout,
      ...overrides.layout,
    },
    hierarchy: {
      ...base.hierarchy,
      ...overrides.hierarchy,
    },
    spacing: {
      ...base.spacing,
      margins: {
        ...base.spacing.margins,
        ...overrides.spacing?.margins,
      },
      ...overrides.spacing,
    },
    typography: {
      ...base.typography,
      ...overrides.typography,
    },
    decorative: {
      ...base.decorative,
      ...overrides.decorative,
    },
  };
}

const productImageUrl = buildProductSvg("#86EFAC", "#0F766E");
const altProductImageUrl = buildProductSvg("#FDE68A", "#B45309");
const logoUrl = buildLogoSvg("VX");

export const rendererFixtures: Array<{
  id: string;
  input: RendererInput;
  expectations: {
    badgePoint?: { x: number; y: number };
    logoPoint?: { x: number; y: number };
    storeNamePoint?: { x: number; y: number };
    promoPoint?: { x: number; y: number };
    expectAlert?: boolean;
  };
}> = [
  {
    id: "hero-clean",
    input: {
      spec: createSpec({
        layout: { productArea: { x: 120, y: 120, width: 840, height: 760 } },
      }),
      productImage: { url: productImageUrl, targetBox: { x: 0.08, y: 0.08, width: 0.84, height: 0.84 } },
      campaignData: { campaignId: "campaign-hero", variationIndex: 0, productName: "Coca-Cola 2L", price: 8.99 },
      visualSignature: { logo_url: logoUrl, store_name: "Mercado Hero" },
    },
    expectations: { logoPoint: { x: 80, y: 80 } },
  },
  {
    id: "frame-premium",
    input: {
      spec: createSpec({
        layout: {
          productArea: { x: 180, y: 180, width: 720, height: 620 },
          textArea: { x: 140, y: 870, width: 800, height: 120 },
          priceArea: { x: 300, y: 1010, width: 480, height: 120 },
        },
        decorative: {
          storeIdentity: { type: "logo", position: "bottom-center", size: { width: 200, height: 90 } },
        },
      }),
      productImage: { url: altProductImageUrl, targetBox: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 } },
      campaignData: { campaignId: "campaign-frame", variationIndex: 1, productName: "Perfume Premium", price: 129.9 },
      visualSignature: { logo_url: logoUrl, store_name: "Maison Vendeo" },
    },
    expectations: { logoPoint: { x: 540, y: 1260 } },
  },
  {
    id: "split-dynamic",
    input: {
      spec: createSpec({
        layout: {
          productArea: { x: 40, y: 180, width: 480, height: 860 },
          textArea: { x: 560, y: 280, width: 420, height: 220 },
          priceArea: { x: 560, y: 560, width: 420, height: 140 },
        },
        decorative: {
          storeIdentity: { type: "logo", position: "bottom-right", size: { width: 170, height: 74 } },
        },
      }),
      productImage: { url: productImageUrl, targetBox: { x: 0.05, y: 0.05, width: 0.9, height: 0.9 } },
      campaignData: { campaignId: "campaign-split", variationIndex: 2, productName: "Combo Festa 12 Itens", price: 59.9 },
      visualSignature: { logo_url: logoUrl, store_name: "Atacado Split" },
    },
    expectations: { logoPoint: { x: 980, y: 1240 } },
  },
  {
    id: "overlay-aggressive",
    input: {
      spec: createSpec({
        layout: {
          productArea: { x: 50, y: 100, width: 980, height: 1100 },
          textArea: { x: 100, y: 180, width: 880, height: 180 },
          priceArea: { x: 180, y: 980, width: 720, height: 140 },
        },
        decorative: {
          storeIdentity: { type: "logo", position: "top-right", size: { width: 180, height: 80 } },
        },
      }),
      productImage: { url: altProductImageUrl, targetBox: { x: 0, y: 0, width: 1, height: 1 } },
      campaignData: { campaignId: "campaign-overlay", variationIndex: 3, productName: "Oferta Relâmpago Energético", price: 14.5 },
      visualSignature: { logo_url: logoUrl, store_name: "Overlay Store" },
    },
    expectations: { logoPoint: { x: 1000, y: 80 } },
  },
  {
    id: "badge-cloud",
    input: {
      spec: createSpec({
        layout: {
          badgeArea: { x: 760, y: 90, width: 240, height: 240 },
        },
        decorative: {
          priceBadge: {
            shape: "cloud",
            position: { x: 760, y: 90 },
            size: { width: 240, height: 240 },
            rotation: 8,
          },
        },
      }),
      productImage: { url: productImageUrl, targetBox: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 } },
      campaignData: { campaignId: "campaign-cloud", variationIndex: 0, productName: "Biscoito Recheado", price: 6.49 },
      visualSignature: { logo_url: logoUrl, store_name: "Badge Store" },
    },
    expectations: { badgePoint: { x: 880, y: 210 } },
  },
  {
    id: "badge-star",
    input: {
      spec: createSpec({
        layout: {
          badgeArea: { x: 90, y: 100, width: 240, height: 240 },
        },
        decorative: {
          priceBadge: {
            shape: "star",
            position: { x: 90, y: 100 },
            size: { width: 240, height: 240 },
          },
        },
      }),
      productImage: { url: altProductImageUrl, targetBox: { x: 0.1, y: 0.05, width: 0.8, height: 0.9 } },
      campaignData: { campaignId: "campaign-star", variationIndex: 1, productName: "Chips Crocante", price: 11.99 },
      visualSignature: { logo_url: logoUrl, store_name: "Star Market" },
    },
    expectations: { badgePoint: { x: 210, y: 220 } },
  },
  {
    id: "logo-and-promotional-title",
    input: {
      spec: createSpec({
        decorative: {
          priceBadge: {
            shape: "tag",
            position: { x: 760, y: 140 },
            size: { width: 200, height: 120 },
          },
          storeIdentity: { type: "logo", position: "top-left", size: { width: 180, height: 80 } },
          promotionalTitle: {
            text: "SUPER OFERTAS",
            position: "top",
            fontSize: 46,
            fontWeight: "900",
          },
        },
      }),
      productImage: { url: productImageUrl, targetBox: { x: 0.08, y: 0.1, width: 0.82, height: 0.82 } },
      campaignData: { campaignId: "campaign-logo", variationIndex: 2, productName: "Kit Churrasco", price: 89.9 },
      visualSignature: { logo_url: logoUrl, store_name: "Loja Promo" },
    },
    expectations: { logoPoint: { x: 80, y: 80 }, promoPoint: { x: 540, y: 60 } },
  },
  {
    id: "store-name-fallback",
    input: {
      spec: createSpec({
        decorative: {
          storeIdentity: { type: "text", position: "bottom-left", size: { width: 280, height: 84 } },
        },
      }),
      productImage: { url: productImageUrl, targetBox: null },
      campaignData: { campaignId: "campaign-text", variationIndex: 3, productName: "Super Cesta Básica Econômica", price: 49.9 },
      visualSignature: { logo_url: null, store_name: "Supermercado Exemplo" },
    },
    expectations: { storeNamePoint: { x: 180, y: 1260 }, expectAlert: true },
  },
];

export const rendererPerformanceBatch: RendererBatchInput = {
  variations: rendererFixtures.slice(0, 4).map((fixture) => fixture.input),
};