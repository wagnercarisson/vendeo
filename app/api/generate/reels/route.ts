import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const BodySchema = z.object({
  campaign_id: z.string().uuid(),
  force: z.boolean().optional().default(false),
});

const ReelsSchema = z.object({
  hook: z.string().min(5),
  duration_seconds: z.number().int().min(10).max(90),
  audio_suggestion: z.string().min(3),
  on_screen_text: z.array(z.string().min(1)).min(2).max(12),
  shotlist: z.array(
    z.object({
      scene: z.number().int().min(1),
      camera: z.string().min(2),
      action: z.string().min(2),
      dialogue: z.string().min(1),
    })
  ).min(3).max(12),
  script: z.string().min(20),
  caption: z.string().min(10),
  cta: z.string().min(3),
  hashtags: z.string().min(3),
});

function withTimeout<T>(promise: Promise<T>, ms: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  // Nota: OpenAI SDK já aceita signal em várias chamadas; aqui mantemos simples:
  return Promise.race([
    promise.finally(() => clearTimeout(timeout)),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), ms)
    ),
  ]);
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const json = await req.json().catch(() => null);
    const body = BodySchema.safeParse(json);
    if (!body.success) {
      return NextResponse.json(
        { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() },
        { status: 400 }
      );
    }

    const { campaign_id, force } = body.data;

    // 1) Busca campanha
    const { data: campaign, error: campaignErr } = await supabaseAdmin
      .from("campaigns")
      .select("id, store_id, product_name, price, audience, objective, ai_caption, ai_text, ai_cta, ai_hashtags, reels_generated_at, reels_hook, reels_script, reels_shotlist, reels_on_screen_text, reels_audio_suggestion, reels_duration_seconds, reels_caption, reels_cta, reels_hashtags")
      .eq("id", campaign_id)
      .single();

    if (campaignErr || !campaign) {
      return NextResponse.json(
        { ok: false, requestId, error: "CAMPAIGN_NOT_FOUND", details: campaignErr?.message },
        { status: 404 }
      );
    }

    // 2) Idempotência
    if (!force && campaign.reels_generated_at) {
      return NextResponse.json({
        ok: true,
        requestId,
        reused: true,
        reels: {
          hook: campaign.reels_hook,
          script: campaign.reels_script,
          shotlist: campaign.reels_shotlist,
          on_screen_text: campaign.reels_on_screen_text,
          audio_suggestion: campaign.reels_audio_suggestion,
          duration_seconds: campaign.reels_duration_seconds,
          caption: campaign.reels_caption,
          cta: campaign.reels_cta,
          hashtags: campaign.reels_hashtags,
        },
      });
    }

    // 3) Prompt “com contexto” usando o que já existe na campanha
    const prompt = `
Você é um roteirista especialista em Reels/Instagram para vendas locais.
Crie UM roteiro de Reels curto e altamente prático para vender o produto abaixo.

DADOS DA CAMPANHA:
- Produto: ${campaign.product_name}
- Preço: ${campaign.price ?? "não informado"}
- Público: ${campaign.audience ?? "não informado"}
- Objetivo: ${campaign.objective ?? "não informado"}

COPY EXISTENTE (se ajudar):
- Legenda: ${campaign.ai_caption ?? ""}
- Texto: ${campaign.ai_text ?? ""}
- CTA: ${campaign.ai_cta ?? ""}
- Hashtags: ${campaign.ai_hashtags ?? ""}

REGRAS:
- Duração entre 15 e 45s (defina duration_seconds).
- Linguagem brasileira, direta, sem enrolação.
- Estruture exatamente no JSON do schema (sem markdown, sem texto fora do JSON).
- Inclua: hook forte, shotlist por cenas, on_screen_text (frases curtas), áudio sugerido, roteiro corrido, legenda, CTA e hashtags.
`;

    // 4) Chamada OpenAI com parse robusto (via JSON “puro”)
    const ai = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: "Responda somente com JSON válido." },
          { role: "user", content: prompt },
        ],
      }),
      20000
    );

    const raw = ai.choices?.[0]?.message?.content ?? "";
    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      // tentativa simples de “extrair JSON” se vier lixo antes/depois
      const first = raw.indexOf("{");
      const last = raw.lastIndexOf("}");
      if (first >= 0 && last > first) {
        parsed = JSON.parse(raw.slice(first, last + 1));
      } else {
        throw new Error("AI_RETURNED_NON_JSON");
      }
    }

    const reels = ReelsSchema.parse(parsed);

    // 5) Salvar no banco
    const { error: upErr } = await supabaseAdmin
      .from("campaigns")
      .update({
        reels_hook: reels.hook,
        reels_script: reels.script,
        reels_shotlist: reels.shotlist,
        reels_on_screen_text: reels.on_screen_text,
        reels_audio_suggestion: reels.audio_suggestion,
        reels_duration_seconds: reels.duration_seconds,
        reels_caption: reels.caption,
        reels_cta: reels.cta,
        reels_hashtags: reels.hashtags,
        reels_generated_at: new Date().toISOString(),
      })
      .eq("id", campaign_id);

    if (upErr) {
      return NextResponse.json(
        { ok: false, requestId, error: "DB_UPDATE_FAILED", details: upErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, requestId, reused: false, reels });

  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "UNKNOWN_ERROR";
    return NextResponse.json(
      { ok: false, error: "UNHANDLED", details: msg },
      { status: 500 }
    );
  }
}
