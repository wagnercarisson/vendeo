import { RENDERER_COLORS, type RendererInput } from "./contracts";
import { normalizeRotation } from "./formatters";

function roundedRectPath(width: number, height: number, radius: number) {
  const resolvedRadius = Math.min(radius, width / 2, height / 2);
  return [
    `M ${resolvedRadius} 0`,
    `L ${width - resolvedRadius} 0`,
    `Q ${width} 0 ${width} ${resolvedRadius}`,
    `L ${width} ${height - resolvedRadius}`,
    `Q ${width} ${height} ${width - resolvedRadius} ${height}`,
    `L ${resolvedRadius} ${height}`,
    `Q 0 ${height} 0 ${height - resolvedRadius}`,
    `L 0 ${resolvedRadius}`,
    `Q 0 0 ${resolvedRadius} 0`,
    "Z",
  ].join(" ");
}

function cloudPath(width: number, height: number) {
  return [
    `M ${width * 0.18} ${height * 0.68}`,
    `C ${width * 0.02} ${height * 0.66}, ${width * 0.04} ${height * 0.34}, ${width * 0.24} ${height * 0.34}`,
    `C ${width * 0.22} ${height * 0.1}, ${width * 0.48} ${height * 0.05}, ${width * 0.58} ${height * 0.22}`,
    `C ${width * 0.78} ${height * 0.08}, ${width * 0.98} ${height * 0.28}, ${width * 0.9} ${height * 0.5}`,
    `C ${width * 1.02} ${height * 0.68}, ${width * 0.84} ${height * 0.92}, ${width * 0.62} ${height * 0.82}`,
    `C ${width * 0.5} ${height * 0.98}, ${width * 0.22} ${height * 0.92}, ${width * 0.18} ${height * 0.68}`,
    "Z",
  ].join(" ");
}

function starPath(width: number, height: number) {
  const outerRadius = Math.min(width, height) / 2;
  const innerRadius = outerRadius * 0.45;
  const centerX = width / 2;
  const centerY = height / 2;
  const points: string[] = [];

  for (let index = 0; index < 10; index += 1) {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / 5) * index - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push(`${index === 0 ? "M" : "L"} ${x} ${y}`);
  }
  return [...points, "Z"].join(" ");
}

function splashPath(width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.min(width, height) / 2;
  const spikes = 12;
  const points: string[] = [];

  for (let index = 0; index < spikes; index += 1) {
    const angle = (Math.PI * 2 * index) / spikes;
    const radius = outerRadius * (index % 2 === 0 ? 1 : 0.65);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push(`${index === 0 ? "M" : "L"} ${x} ${y}`);
  }
  return [...points, "Z"].join(" ");
}

function diamondPath(width: number, height: number) {
  return `M ${width / 2} 0 L ${width} ${height / 2} L ${width / 2} ${height} L 0 ${height / 2} Z`;
}

function ovalPath(width: number, height: number) {
  return `M ${width / 2} 0 A ${width / 2} ${height / 2} 0 1 1 ${width / 2} ${height} A ${width / 2} ${height / 2} 0 1 1 ${width / 2} 0 Z`;
}

function tagPath(width: number, height: number) {
  return `M ${width * 0.12} 0 L ${width} 0 L ${width} ${height} L ${width * 0.12} ${height} L 0 ${height / 2} Z`;
}

export function buildBadgePath(
  shape: NonNullable<RendererInput["spec"]["decorative"]["priceBadge"]>["shape"],
  width: number,
  height: number
) {
  switch (shape) {
    case "rounded-rect":
      return roundedRectPath(width, height, 20);
    case "cloud":
      return cloudPath(width, height);
    case "star":
      return starPath(width, height);
    case "splash":
      return splashPath(width, height);
    case "diamond":
      return diamondPath(width, height);
    case "oval":
      return ovalPath(width, height);
    case "tag":
      return tagPath(width, height);
  }
}

export function buildBadgeSvg(
  badge: NonNullable<RendererInput["spec"]["decorative"]["priceBadge"]>,
  fillStyle = RENDERER_COLORS.badge,
  canvas = { width: 1080, height: 1350 }
): Buffer {
  const path = buildBadgePath(badge.shape, badge.size.width, badge.size.height);
  const rotation = normalizeRotation(badge.rotation);

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
      <g transform="translate(${badge.position.x + badge.size.width / 2} ${badge.position.y + badge.size.height / 2}) rotate(${rotation}) translate(${-badge.size.width / 2} ${-badge.size.height / 2})">
        <path d="${path}" fill="${fillStyle}" />
      </g>
    </svg>
  `);
}

export function buildRoundedPillSvg(
  x: number,
  y: number,
  width: number,
  height: number,
  fillStyle: string,
  canvas = { width: 1080, height: 1350 }
): Buffer {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
      <path d="${roundedRectPath(width, height, height / 2)}" fill="${fillStyle}" transform="translate(${x} ${y})" />
    </svg>
  `);
}