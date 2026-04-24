import { describe, expect, it } from "vitest";

import { buildBadgePath, buildBadgeSvg } from "@/lib/ai/renderer";

const shapes = ["rounded-rect", "cloud", "star", "splash", "diamond", "oval", "tag"] as const;

describe("renderer badge shapes", () => {
  it("builds SVG paths for all supported badge shapes", () => {
    for (const shape of shapes) {
      const path = buildBadgePath(shape, 240, 240);
      const svg = buildBadgeSvg({
        shape,
        position: { x: 20, y: 20 },
        size: { width: 240, height: 240 },
        rotation: 12,
      }).toString();

      expect(path.length).toBeGreaterThan(10);
      expect(svg).toContain("<path");
    }
  });
});