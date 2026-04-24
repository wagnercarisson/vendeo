import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { RENDERER_COLORS, renderVariation, renderVariationToBuffer, renderVariations } from "@/lib/ai/renderer";
import { hexToRgb } from "@/lib/ai/renderer/formatters";

import { rendererFixtures, rendererPerformanceBatch } from "./fixtures/manifest";

async function samplePixel(buffer: Buffer, x: number, y: number) {
  const pixel = await sharp(buffer)
    .extract({ left: x, top: y, width: 1, height: 1 })
    .raw()
    .toBuffer();

  return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] };
}

function colorDistance(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
  return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
}

describe("renderer integration", () => {
  it("renders all 8 mandatory fixtures as PNG 1080x1350", async () => {
    const badgeColor = hexToRgb(RENDERER_COLORS.badge);
    const backgroundColor = hexToRgb(RENDERER_COLORS.background);

    expect(rendererFixtures).toHaveLength(8);

    for (const fixture of rendererFixtures) {
      const rendered = await renderVariationToBuffer(fixture.input);
      const metadata = await sharp(rendered.buffer).metadata();

      expect(metadata.format).toBe("png");
      expect(metadata.width).toBe(1080);
      expect(metadata.height).toBe(1350);
      expect(rendered.metadata.size).toBeGreaterThan(1000);

      if (fixture.expectations.badgePoint) {
        const pixel = await samplePixel(
          rendered.buffer,
          fixture.expectations.badgePoint.x,
          fixture.expectations.badgePoint.y
        );

        expect(colorDistance(pixel, badgeColor)).toBeLessThan(80);
      }

      if (fixture.expectations.logoPoint) {
        const pixel = await samplePixel(
          rendered.buffer,
          fixture.expectations.logoPoint.x,
          fixture.expectations.logoPoint.y
        );

        expect(colorDistance(pixel, backgroundColor)).toBeGreaterThan(120);
      }

      if (fixture.expectations.promoPoint) {
        const pixel = await samplePixel(
          rendered.buffer,
          fixture.expectations.promoPoint.x,
          fixture.expectations.promoPoint.y
        );

        expect(colorDistance(pixel, backgroundColor)).toBeGreaterThan(30);
      }

      if (fixture.expectations.storeNamePoint) {
        const pixel = await samplePixel(
          rendered.buffer,
          fixture.expectations.storeNamePoint.x,
          fixture.expectations.storeNamePoint.y
        );

        expect(colorDistance(pixel, backgroundColor)).toBeGreaterThan(40);
      }

      expect(rendered.alerts.length > 0).toBe(Boolean(fixture.expectations.expectAlert));
    }
  });

  it("renders and uploads 4 variations in parallel under the performance budget", async () => {
    const startedAt = Date.now();
    const results = await renderVariations(rendererPerformanceBatch, {
      uploader: async ({ path }) => `mock://${path}`,
    });
    const elapsed = Date.now() - startedAt;

    expect(results).toHaveLength(4);
    expect(results.every((result) => result.artUrl.startsWith("mock://campaigns/"))).toBe(true);
    expect(elapsed).toBeLessThan(8000);
  });

  it("renders a single variation through the public service API", async () => {
    const result = await renderVariation(rendererFixtures[0].input, {
      uploader: async ({ path }) => `mock://${path}`,
    });

    expect(result.artUrl).toContain("variation-0.png");
    expect(result.metadata.width).toBe(1080);
    expect(result.metadata.height).toBe(1350);
    expect(result.metadata.format).toBe("png");
  });
});