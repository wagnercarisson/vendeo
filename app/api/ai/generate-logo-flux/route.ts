import { NextRequest, NextResponse } from "next/server";
import {
  getLogoPromptBySegment as getV1LogoPromptBySegment,
  type Segment,
  type ToneOfVoice,
} from "@/lib/ai/logo-prompts";
import { getLogoPromptBySegment as getV2LogoPromptBySegment } from "@/lib/ai/logo-prompts-v2";

type PromptVersion = "v1" | "v2";

interface GenerateLogoRequest {
  storeName: string;
  segment: Segment;
  tone?: ToneOfVoice;
  promptVersion?: PromptVersion;
}

interface FluxPredictionResponse {
  id: string;
  status: string;
  output?: string[] | string | null;
  error?: string | null;
  urls?: {
    get?: string;
  };
}

interface LogoSuggestion {
  id: string;
  url: string;
  prompt: string;
  prediction_id: string;
}

interface GenerateLogoResponse {
  success: boolean;
  suggestions?: LogoSuggestion[];
  cost_usd?: number;
  provider?: "flux-schnell";
  prompt_version?: PromptVersion;
  error?: string;
}

const FLUX_MODEL_URL = "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions";
const FLUX_COST_PER_IMAGE = 0.003;

function getPromptVersion(requestedVersion?: PromptVersion): PromptVersion {
  if (requestedVersion === "v1" || requestedVersion === "v2") {
    return requestedVersion;
  }

  return process.env.LOGO_PROMPT_VERSION === "v1" ? "v1" : "v2";
}

function buildOptimizedPrompt(
  storeName: string,
  segment: Segment,
  tone: ToneOfVoice | undefined,
  promptVersion: PromptVersion
): string {
  return promptVersion === "v2"
    ? getV2LogoPromptBySegment(storeName, segment, tone)
    : getV1LogoPromptBySegment(storeName, segment, tone);
}

function getOutputUrl(output?: string[] | string | null): string | null {
  if (Array.isArray(output)) {
    return output[0] ?? null;
  }

  return typeof output === "string" ? output : null;
}

async function createFluxPrediction(prompt: string): Promise<FluxPredictionResponse> {
  if (!process.env.REPLICATE_API_KEY) {
    throw new Error("Replicate API key is missing");
  }

  const response = await fetch(FLUX_MODEL_URL, {
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
  });

  const prediction = (await response.json()) as FluxPredictionResponse;

  if (!response.ok) {
    throw new Error(prediction.error || "Flux prediction creation failed");
  }

  return prediction;
}

async function pollFluxPrediction(prediction: FluxPredictionResponse): Promise<FluxPredictionResponse> {
  if (!prediction.urls?.get) {
    return prediction;
  }

  let currentPrediction = prediction;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (currentPrediction.status === "succeeded") {
      return currentPrediction;
    }

    if (currentPrediction.status === "failed" || currentPrediction.status === "canceled") {
      throw new Error(currentPrediction.error || `Flux prediction ${currentPrediction.status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const response = await fetch(currentPrediction.urls.get, {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    currentPrediction = (await response.json()) as FluxPredictionResponse;

    if (!response.ok) {
      throw new Error(currentPrediction.error || "Flux polling failed");
    }
  }

  throw new Error("Flux prediction timed out before completion");
}

async function generateSingleFluxLogo(prompt: string): Promise<LogoSuggestion> {
  const createdPrediction = await createFluxPrediction(prompt);
  const completedPrediction = await pollFluxPrediction(createdPrediction);
  const outputUrl = getOutputUrl(completedPrediction.output);

  if (!outputUrl) {
    throw new Error("Flux returned no image output");
  }

  return {
    id: crypto.randomUUID(),
    url: outputUrl,
    prompt,
    prediction_id: completedPrediction.id,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateLogoRequest = await req.json();
    const { storeName, segment, tone, promptVersion: requestedPromptVersion } = body;

    if (!storeName || !segment) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: storeName, segment",
        } as GenerateLogoResponse,
        { status: 400 }
      );
    }

    const promptVersion = getPromptVersion(requestedPromptVersion);
    const optimizedPrompt = buildOptimizedPrompt(
      storeName,
      segment,
      tone,
      promptVersion
    );

    const suggestions: LogoSuggestion[] = [];

    for (let index = 0; index < 3; index += 1) {
      const suggestion = await generateSingleFluxLogo(optimizedPrompt);
      suggestions.push(suggestion);
    }

    return NextResponse.json(
      {
        success: true,
        suggestions,
        cost_usd: suggestions.length * FLUX_COST_PER_IMAGE,
        provider: "flux-schnell",
        prompt_version: promptVersion,
      } as GenerateLogoResponse,
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message === "Replicate API key is missing"
            ? "Replicate API configuration error. Please contact support."
            : error?.message || "Failed to generate logos with Flux Schnell.",
      } as GenerateLogoResponse,
      { status: 500 }
    );
  }
}

export const maxDuration = 60;