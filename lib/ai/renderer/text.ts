import type { PixelArea } from "@/lib/ai/visual-composer/contracts";

import {
  RENDERER_FONT_FALLBACK,
  RenderTextBlockResultSchema,
  type RenderTextBlockResult,
} from "./contracts";

type TextStyle = {
  fontSize: number;
  fontWeight: string;
  fillStyle: string;
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle";
  shadow?: boolean;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const character of text) {
    if (character === " ") {
      width += fontSize * 0.3;
    } else if (/[A-Z0-9]/.test(character)) {
      width += fontSize * 0.62;
    } else {
      width += fontSize * 0.56;
    }
  }

  return width;
}

function splitLongWord(word: string, maxWidth: number, fontSize: number): string[] {
  const chunks: string[] = [];
  let current = "";

  for (const character of word) {
    const candidate = `${current}${character}`;
    if (estimateTextWidth(candidate, fontSize) <= maxWidth || current.length === 0) {
      current = candidate;
      continue;
    }

    chunks.push(current);
    current = character;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const safeWordParts = estimateTextWidth(word, fontSize) > maxWidth
      ? splitLongWord(word, maxWidth, fontSize)
      : [word];

    for (const part of safeWordParts) {
      const candidate = currentLine ? `${currentLine} ${part}` : part;
      if (!currentLine || estimateTextWidth(candidate, fontSize) <= maxWidth) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = part;
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [""];
}

export function fitTextBlock(
  text: string,
  area: PixelArea,
  fontSize: number,
  fontWeight: string,
  maxReductions = 2
): RenderTextBlockResult {
  let resolvedSize = fontSize;
  let lines = [text];
  let truncated = false;

  for (let attempt = 0; attempt <= maxReductions; attempt += 1) {
    lines = wrapText(text, area.width, resolvedSize);
    const lineHeight = resolvedSize * 1.2;
    const maxLines = Math.max(1, Math.floor(area.height / lineHeight));

    if (lines.length <= maxLines) {
      return RenderTextBlockResultSchema.parse({
        lines,
        fontSize: resolvedSize,
        lineHeight,
        truncated,
      });
    }

    if (attempt < maxReductions) {
      resolvedSize = Math.max(12, Math.round(resolvedSize * 0.9));
      continue;
    }

    truncated = true;
    lines = lines.slice(0, maxLines);
    const lastIndex = lines.length - 1;
    let candidate = lines[lastIndex] ?? "";
    while (candidate.length > 0 && estimateTextWidth(`${candidate}...`, resolvedSize) > area.width) {
      candidate = candidate.slice(0, -1);
    }
    lines[lastIndex] = `${candidate}...`;

    return RenderTextBlockResultSchema.parse({
      lines,
      fontSize: resolvedSize,
      lineHeight,
      truncated,
    });
  }

  return RenderTextBlockResultSchema.parse({
    lines,
    fontSize: resolvedSize,
    lineHeight: resolvedSize * 1.2,
    truncated,
  });
}

export function buildTextOverlay(
  text: string,
  area: PixelArea,
  style: TextStyle,
  canvas = { width: 1080, height: 1350 }
): { buffer: Buffer; result: RenderTextBlockResult } {
  const result = fitTextBlock(text, area, style.fontSize, style.fontWeight);

  const totalHeight = result.lines.length * result.lineHeight;
  const originY = style.verticalAlign === "middle"
    ? area.y + Math.max(0, (area.height - totalHeight) / 2)
    : area.y;
  const originX = style.align === "left"
    ? area.x
    : style.align === "right"
      ? area.x + area.width
      : area.x + area.width / 2;

  const anchor = style.align === "left" ? "start" : style.align === "right" ? "end" : "middle";
  const textShadow = style.shadow
    ? `<filter id="shadow"><feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="rgba(255,255,255,0.9)" /></filter>`
    : "";
  const tspans = result.lines
    .map(
      (line, index) => `<tspan x="${originX}" y="${originY + index * result.lineHeight + result.fontSize}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const svg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
      <defs>${textShadow}</defs>
      <text
        font-family="${RENDERER_FONT_FALLBACK}"
        font-size="${result.fontSize}"
        font-weight="${style.fontWeight}"
        fill="${style.fillStyle}"
        text-anchor="${anchor}"
        ${style.shadow ? 'filter="url(#shadow)"' : ""}
      >${tspans}</text>
    </svg>
  `);

  return { buffer: svg, result };
}