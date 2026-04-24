export function formatBrlPrice(price: number | null): string {
  if (price == null || Number.isNaN(price)) {
    return "";
  }

  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function normalizeRotation(rotation?: number): number {
  if (rotation == null) {
    return 0;
  }

  const normalized = rotation % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((chunk) => `${chunk}${chunk}`).join("")
    : normalized;

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}