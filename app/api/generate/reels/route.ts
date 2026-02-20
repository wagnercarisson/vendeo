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

Gere UM roteiro de Reels em PORTUGUÊS-BR e responda SOMENTE com JSON válido.
NÃO inclua markdown, comentários, texto antes/depois do JSON.

DADOS DA CAMPANHA:
- Produto: ${campaign.product_name}
- Preço: ${campaign.price ?? "não informado"}
- Público: ${campaign.audience ?? "não informado"}
- Objetivo: ${campaign.objective ?? "não informado"}

REGRAS:
- duration_seconds entre 15 e 45
- "on_screen_text" deve ser array de frases curtas
- "shotlist" deve ser array com 3 a 8 itens, cada item contendo scene, camera, action, dialogue
- Preencha TODOS os campos abaixo (NENHUM pode faltar)

FORMATO OBRIGATÓRIO (exemplo):
{
  "hook": "frase curta e forte",
  "duration_seconds": 25,
  "audio_suggestion": "um estilo de áudio (ex: funk leve / trend X / pop animado)",
  "on_screen_text": ["frase 1", "frase 2", "frase 3"],
  "shotlist": [
    { "scene": 1, "camera": "close no produto", "action": "mostrar o produto", "dialogue": "fala curta" },
    { "scene": 2, "camera": "plano médio", "action": "apontar preço", "dialogue": "fala curta" },
    { "scene": 3, "camera": "close", "action": "final com convite", "dialogue": "fala curta" }
  ],
  "script": "roteiro corrido com as falas, em parágrafos curtos",
  "caption": "legenda pronta para postar",
  "cta": "chamada para ação (ex: peça no WhatsApp)",
  "hashtags": "#tag1 #tag2 #tag3"
}

AGORA gere o JSON para a campanha acima.
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

let reels;
try {
  reels = ReelsSchema.parse(parsed);
} catch (zerr: any) {
  // Retry: pedir para o modelo corrigir o JSON exatamente no schema
  const fixPrompt = `
O JSON abaixo está INVALIDO e NÃO bate com o schema obrigatório.
Corrija e devolva SOMENTE o JSON válido no formato exigido.

ERROS:
${JSON.stringify(zerr?.issues ?? zerr, null, 2)}

JSON PARA CORRIGIR:
${JSON.stringify(parsed, null, 2)}
`;

  const ai2 = await openai.chat.completions.create({
    model: "gpt-4o-mini", // ou o mesmo que você usa em campaign
    temperature: 0.2,
    messages: [
      { role: "system", content: "Responda somente com JSON válido." },
      { role: "user", content: fixPrompt },
    ],
  });

  const raw2 = ai2.choices?.[0]?.message?.content ?? "";
  let parsed2: unknown;

  try {
    parsed2 = JSON.parse(raw2);
  } catch {
    const first = raw2.indexOf("{");
    const last = raw2.lastIndexOf("}");
    if (first >= 0 && last > first) parsed2 = JSON.parse(raw2.slice(first, last + 1));
    else throw new Error("AI_RETURNED_NON_JSON_AFTER_FIX");
  }

  reels = ReelsSchema.parse(parsed2);
}

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
  console.error("[generate/reels] error:", msg, err?.stack ?? err);
  return NextResponse.json(
    { ok: false, error: "UNHANDLED", details: msg },
    { status: 500 }
  );
}
}
