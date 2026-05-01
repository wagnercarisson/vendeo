import OpenAI from "openai";
import {
  getLogoPromptBySegment as getV1LogoPromptBySegment,
  type Segment,
  type ToneOfVoice,
} from "../../lib/ai/logo-prompts";
import { getLogoPromptBySegment as getV2LogoPromptBySegment } from "../../lib/ai/logo-prompts-v2";

type Provider = "dalle-v1" | "dalle-v2" | "flux-v2";

type TestCase = {
  storeName: string;
  segment: Segment;
  tone?: ToneOfVoice;
};

type GenerationResult = {
  provider: Provider;
  storeName: string;
  segment: Segment;
  url?: string;
  revisedPrompt?: string;
  error?: string;
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const testCases: TestCase[] = [
  { storeName: "Adega Premium", segment: "Loja de bebidas", tone: "Premium" },
  { storeName: "TechLoja", segment: "Eletrônicos", tone: "Técnico" },
  { storeName: "Bella Salon", segment: "Salão / Estética", tone: "Premium" },
];

function assertEnvironment() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required to run DALL-E comparisons.");
  }

  if (!process.env.REPLICATE_API_KEY) {
    throw new Error("REPLICATE_API_KEY is required to run Flux Schnell comparisons.");
  }
}

async function generateWithDalle(prompt: string): Promise<{ url?: string; revisedPrompt?: string }> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    style: "natural",
  });

  return {
    url: response.data[0]?.url,
    revisedPrompt: response.data[0]?.revised_prompt,
  };
}

async function generateWithFlux(prompt: string): Promise<{ url?: string }> {
  const createResponse = await fetch(
    "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "wait=30",
      },
      body: JSON.stringify({
        input: {
          prompt,
          aspect_ratio: "1:1",
          num_outputs: 1,
          output_format: "png",
          output_quality: 90,
        },
      }),
    }
  );

  const prediction = await createResponse.json();

  if (!createResponse.ok) {
    throw new Error(prediction?.error || "Flux prediction creation failed.");
  }

  const output = Array.isArray(prediction.output)
    ? prediction.output[0]
    : prediction.output;

  return { url: typeof output === "string" ? output : undefined };
}

async function runCase(testCase: TestCase): Promise<GenerationResult[]> {
  const v1Prompt = getV1LogoPromptBySegment(testCase.storeName, testCase.segment, testCase.tone);
  const v2Prompt = getV2LogoPromptBySegment(testCase.storeName, testCase.segment, testCase.tone);

  const runs: Array<{ provider: Provider; prompt: string }> = [
    { provider: "dalle-v1", prompt: v1Prompt },
    { provider: "dalle-v2", prompt: v2Prompt },
    { provider: "flux-v2", prompt: v2Prompt },
  ];

  const results: GenerationResult[] = [];

  for (const run of runs) {
    try {
      if (run.provider === "flux-v2") {
        const flux = await generateWithFlux(run.prompt);
        results.push({
          provider: run.provider,
          storeName: testCase.storeName,
          segment: testCase.segment,
          url: flux.url,
        });
        continue;
      }

      const dalle = await generateWithDalle(run.prompt);
      results.push({
        provider: run.provider,
        storeName: testCase.storeName,
        segment: testCase.segment,
        url: dalle.url,
        revisedPrompt: dalle.revisedPrompt,
      });
    } catch (error: any) {
      results.push({
        provider: run.provider,
        storeName: testCase.storeName,
        segment: testCase.segment,
        error: error?.message || "Unknown error",
      });
    }
  }

  return results;
}

async function main() {
  assertEnvironment();

  const allResults: GenerationResult[] = [];

  for (const testCase of testCases) {
    const caseResults = await runCase(testCase);
    allResults.push(...caseResults);
  }

  console.log(JSON.stringify(allResults, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});