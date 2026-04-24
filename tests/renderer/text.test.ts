import { describe, expect, it } from "vitest";

import { buildTextOverlay, fitTextBlock } from "@/lib/ai/renderer";

describe("renderer text wrapping", () => {
  it("wraps text and truncates with ellipsis when height is insufficient", () => {
    const result = fitTextBlock(
      "Produto muito grande com embalagem especial edição limitada para o fim de semana",
      { x: 0, y: 0, width: 220, height: 80 },
      32,
      "700"
    );

    expect(result.lines.length).toBeGreaterThan(0);
    expect(result.lines[result.lines.length - 1]?.endsWith("...")).toBe(true);
    expect(result.fontSize).toBeLessThanOrEqual(32);
  });

  it("builds a text overlay SVG for wrapped content", () => {
    const overlay = buildTextOverlay(
      "Super oferta do fim de semana",
      { x: 0, y: 0, width: 260, height: 90 },
      { fontSize: 30, fontWeight: "700", fillStyle: "#111827", align: "center", verticalAlign: "middle" }
    );

    expect(overlay.buffer.toString()).toContain("<text");
    expect(overlay.result.lines.length).toBeGreaterThan(0);
  });
});