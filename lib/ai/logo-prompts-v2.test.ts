import test from "node:test";
import assert from "node:assert/strict";
import { getLogoPromptBySegment } from "./logo-prompts-v2.ts";

test("beverage v2 prompt enforces single icon guardrails", () => {
  const prompt = getLogoPromptBySegment("Adega Premium", "Loja de bebidas", "Premium");

  assert.match(prompt, /Choose EITHER a bottle silhouette OR a glass outline/);
  assert.match(prompt, /ONE cohesive shape/);
  assert.match(prompt, /Do NOT CREATE|DO NOT CREATE/);
  assert.doesNotMatch(prompt, /suitable for social media/i);
});

test("electronics v2 prompt blocks overly complex circuit outputs", () => {
  const prompt = getLogoPromptBySegment("TechLoja", "Eletrônicos", "Técnico");

  assert.match(prompt, /Avoid overly complex circuit patterns/);
  assert.match(prompt, /Dated tech symbols \(floppy disk\) or overly complex circuits/);
  assert.match(prompt, /OUTPUT FORMAT: The logo icon itself, isolated and centered/);
});

test("beauty v2 prompt broadens appeal while keeping logo isolated", () => {
  const prompt = getLogoPromptBySegment("Bella Salon", "Salão / Estética", "Premium");

  assert.match(prompt, /not overly feminine/i);
  assert.match(prompt, /suitable for diverse clientele/i);
  assert.match(prompt, /No shadows, no borders, no decorative frames/);
});