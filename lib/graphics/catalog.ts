import { SafeZones, Rect } from "../domain/campaigns/types";

/**
 * Definição formal de um layout para o motor V4.
 * Consolida a geometria (onde os elementos estão) e as regras de exclusão.
 */
export interface LayoutDefinition {
  id: string;
  version: number;
  name: string;
  zones: SafeZones;
  rules: {
    visual_aggression_limit: number;
    recommended_image_fit: "cover" | "contain";
  };
}

/**
 * O Catálogo é a fonte de verdade para as Safe Zones.
 * Unidade: Pixels absolutos (Base 1080x1350).
 */
export const LAYOUT_CATALOG: Record<string, LayoutDefinition> = {
  split: {
    id: "split",
    version: 1,
    name: "Split Vertical",
    zones: {
      content_image: { x: 0, y: 0, w: 540, h: 1350 },
      text_area: { x: 580, y: 250, w: 440, h: 500 },
      price_area: { x: 580, y: 920, w: 440, h: 105 },
      branding_area: { x: 580, y: 90, w: 440, h: 100 },
      cta_area: { x: 580, y: 1070, w: 440, h: 92 },
    },
    rules: {
      visual_aggression_limit: 0.8,
      recommended_image_fit: "cover",
    },
  },
  solid: {
    id: "solid",
    version: 1,
    name: "Solid Base",
    zones: {
      content_image: { x: 0, y: 0, w: 1080, h: 742 },
      branding_area: { x: 86, y: 826, w: 908, h: 40 },
      text_area: { x: 86, y: 896, w: 908, h: 250 },
      cta_area: { x: 609, y: 1204, w: 385, h: 80 },
    },
    rules: {
      visual_aggression_limit: 1.0,
      recommended_image_fit: "cover",
    },
  },
  floating: {
    id: "floating",
    version: 1,
    name: "Floating Premium",
    zones: {
      content_image: { x: 0, y: 0, w: 1080, h: 1350 },
      text_area: { x: 74, y: 800, w: 932, h: 400 },
      cta_area: { x: 600, y: 1150, w: 400, h: 80 },
      branding_area: { x: 74, y: 760, w: 200, h: 40 },
    },
    rules: {
      visual_aggression_limit: 0.6,
      recommended_image_fit: "cover",
    },
  },
};

/**
 * Utilitário para buscar uma definição de layout por ID.
 * Caso não encontre, retorna o 'split' como fallback de segurança.
 */
export function getLayoutDefinition(id: string): LayoutDefinition {
  return LAYOUT_CATALOG[id] || LAYOUT_CATALOG.split;
}
