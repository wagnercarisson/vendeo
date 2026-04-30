/**
 * DALL-E 3 Logo Generation API
 * Story 3: Logo IA - Intelligence Sprint 1
 * 
 * Generates 3 logo suggestions using OpenAI DALL-E 3 with segment-optimized prompts.
 * Implements rate limiting (5 generations/hour per store) to control costs.
 * 
 * Cost: $0.04/image × 3 = $0.12/generation
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getLogoPromptBySegment, type Segment, type ToneOfVoice } from "@/lib/ai/logo-prompts";
import { createClient } from "@supabase/supabase-js";
import { ratelimit } from "@/lib/ratelimit";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase admin client for rate limit tracking
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GenerateLogoRequest {
  storeName: string;
  segment: Segment;
  tone?: ToneOfVoice;
  storeId: string;
}

interface LogoSuggestion {
  id: string;
  url: string;
  prompt: string;
  revised_prompt?: string;
}

interface GenerateLogoResponse {
  success: boolean;
  suggestions?: LogoSuggestion[];
  cost_usd?: number;
  error?: string;
  remaining_generations?: number;
}

/**
 * Check rate limit for logo generation
 * Max 5 generations per hour per store
 */
async function checkRateLimit(storeId: string): Promise<{ allowed: boolean; remaining: number }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Count generations in the last hour
  const { data, error } = await supabase
    .from("logo_generations")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId)
    .gte("generated_at", oneHourAgo);

  if (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true, remaining: 5 }; // Fail open
  }

  const count = data ? (data as any).count || 0 : 0;
  const remaining = Math.max(0, 5 - count);

  return { allowed: count < 5, remaining };
}

/**
 * Log generation for rate limiting and cost tracking
 */
async function logGeneration(
  storeId: string,
  promptUsed: string,
  costUsd: number,
  selectedLogoUrl?: string
): Promise<void> {
  try {
    await supabase.from("logo_generations").insert({
      store_id: storeId,
      prompt_used: promptUsed,
      cost_usd: costUsd,
      selected_logo_url: selectedLogoUrl,
    });
  } catch (error) {
    console.error("Failed to log generation:", error);
    // Non-blocking - don't throw
  }
}

/**
 * Generate a single logo via DALL-E 3
 * DALL-E 3 only allows n=1, so we call it 3 times
 */
async function generateSingleLogo(prompt: string): Promise<LogoSuggestion> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1, // DALL-E 3 constraint
      size: "1024x1024",
      quality: "standard", // NOT "hd" (4x more expensive)
      style: "natural", // More consistent than "vivid"
    });

    const imageData = response.data[0];

    return {
      id: crypto.randomUUID(),
      url: imageData.url!, // Temporary URL (expires in 1 hour)
      prompt: prompt,
      revised_prompt: imageData.revised_prompt,
    };
  } catch (error: any) {
    console.error("DALL-E 3 generation error:", error);
    throw new Error(`Logo generation failed: ${error.message || "Unknown error"}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: GenerateLogoRequest = await req.json();
    const { storeName, segment, tone, storeId } = body;

    // Validate required fields
    if (!storeName || !segment || !storeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: storeName, segment, storeId",
        } as GenerateLogoResponse,
        { status: 400 }
      );
    }

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(storeId);

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Maximum 5 generations per hour. Try again later.",
          remaining_generations: remaining,
        } as GenerateLogoResponse,
        { status: 429 }
      );
    }

    // Generate optimized prompt using @prompt-eng's templates
    const optimizedPrompt = getLogoPromptBySegment(storeName, segment, tone);

    console.log(`[Logo Generation] Store: ${storeName}, Segment: ${segment}, Tone: ${tone || "default"}`);
    console.log(`[Logo Generation] Prompt: ${optimizedPrompt.substring(0, 100)}...`);

    // Generate 3 logo suggestions (sequential due to DALL-E 3 n=1 constraint)
    const suggestions: LogoSuggestion[] = [];
    const errors: string[] = [];

    for (let i = 0; i < 3; i++) {
      try {
        const suggestion = await generateSingleLogo(optimizedPrompt);
        suggestions.push(suggestion);
        console.log(`[Logo Generation] Generated suggestion ${i + 1}/3`);
      } catch (error: any) {
        console.error(`[Logo Generation] Failed suggestion ${i + 1}/3:`, error.message);
        errors.push(error.message);
        
        // If first generation fails, abort completely
        if (i === 0) {
          throw error;
        }
      }
    }

    // If we got at least 1 suggestion, consider it a success
    if (suggestions.length === 0) {
      throw new Error(`All logo generations failed: ${errors.join(", ")}`);
    }

    const costUsd = suggestions.length * 0.04; // $0.04 per image

    // Log generation for rate limiting and analytics
    await logGeneration(storeId, optimizedPrompt, costUsd);

    console.log(`[Logo Generation] Success: ${suggestions.length} suggestions, cost: $${costUsd.toFixed(2)}`);

    return NextResponse.json(
      {
        success: true,
        suggestions,
        cost_usd: costUsd,
        remaining_generations: remaining - 1,
      } as GenerateLogoResponse,
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Logo Generation] Error:", error);

    // Check if OpenAI API key is missing
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API configuration error. Please contact support.",
        } as GenerateLogoResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate logos. Please try again.",
      } as GenerateLogoResponse,
      { status: 500 }
    );
  }
}

// Configure API route timeout (30s for DALL-E 3 generation)
export const maxDuration = 30;
