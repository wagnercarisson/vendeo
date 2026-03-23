import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
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
  shotlist: z
    .array(
      z.object({
        scene: z.number().int().min(1),
        camera: z.string().min(2),
        action: z.string().min(2),
        dialogue: z.string().min(1),
      })
    )
    .min(3)
    .max(12),
  script: z.string().min(20),
  caption: z.string().min(10),
  cta: z.string().min(3),
  hashtags: z.string().min(3),
});

// Extrai o PRIMEIRO objeto JSON completo do texto (robusto contra texto extra e múltiplos JSONs)
// Respeita strings e escapes.
function extractFirstJSONObject(raw: string) {
  const s = raw ?? "";
  let start = -1;
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      if (inString) escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
      continue;
    }
    if (ch === "}") {
      if (depth > 0) depth--;
      if (depth === 0 && start !== -1) {
        return s.slice(start, i + 1);
      }
      continue;
    }
  }

  throw new Error("AI_RETURNED_NON_JSON");
}

function parseJsonFirstObject(raw: string) {
  // tenta parse direto primeiro (caso venha só JSON puro)
  try {
    return JSON.parse(raw);
  } catch {
    // extrai o primeiro objeto JSON completo e parseia
    const jsonStr = extractFirstJSONObject(raw);
    return JSON.parse(jsonStr);
  }
}

function safeStringify(v: any) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms)),
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

    let storeId: string;
    try {
      ({ storeId } = await getUserStoreIdOrThrow());
      } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg === "not_authenticated") {
        return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
      }
      return NextResponse.json({ error: "store_not_found" }, { status: 403 });
    }

    // 1) Busca campanha
    const { data: campaign, error: campaignErr } = await supabaseAdmin
      .from("campaigns")
      .select(
        `
        id, store_id, product_name, price, audience, objective, product_positioning,
        reels_generated_at, reels_hook, reels_script, reels_shotlist, reels_on_screen_text,
        reels_audio_suggestion, reels_duration_seconds, reels_caption, reels_cta, reels_hashtags
      `
      )
      .eq("id", campaign_id)
      .eq("store_id", storeId)
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

    // 3) Validação mínima
    const nameOk = !!String(campaign.product_name ?? "").trim();
    const audOk = !!String(campaign.audience ?? "").trim();
    const objOk = !!String(campaign.objective ?? "").trim();
    if (!nameOk || !audOk || !objOk) {
      return NextResponse.json(
        {
          ok: false,
          requestId,
          error: "INSUFFICIENT_DATA",
          details: "Campanha incompleta: preencha Produto, Público e Objetivo antes de gerar o Reels.",
        },
        { status: 400 }
      );
    }

    // 4) Prompt
    const prompt = `
Você é um roteirista especialista em Reels/Instagram para vendas locais.

Gere UM roteiro de Reels em PORTUGUÊS-BR e responda SOMENTE com JSON válido.
NÃO inclua markdown, comentários, texto antes/depois do JSON.

DADOS DA CAMPANHA:
- Produto: ${campaign.product_name}
- Preço: ${campaign.price ?? "não informado"}
- Público: ${campaign.audience}
- Objetivo: ${campaign.objective}
- Perfil do produto: ${campaign.product_positioning ?? "não informado"}

REGRAS:
- duration_seconds entre 15 e 45
- on_screen_text: array de frases curtas
- shotlist: 3 a 8 itens, cada item com scene, camera, action, dialogue
- Preencha TODOS os campos abaixo (nenhum pode faltar)

FORMATO OBRIGATÓRIO:
{
  "hook": "frase curta e forte",
  "duration_seconds": 25,
  "audio_suggestion": "um estilo de áudio (ex: funk leve / pop animado)",
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
`;

    // 5) OpenAI (mantemos response_format, mas não confiamos 100%)
    const ai1 = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.6,
        response_format: { type: "json_object" } as any,
        messages: [
          { role: "system", content: "Responda somente com JSON válido." },
          { role: "user", content: prompt },
        ],
      }),
      20000
    );

    const raw1 = ai1.choices?.[0]?.message?.content ?? "";
    const parsed1 = parseJsonFirstObject(raw1);

    let reels: z.infer<typeof ReelsSchema>;

    const firstTry = ReelsSchema.safeParse(parsed1);
    if (firstTry.success) {
      reels = firstTry.data;
    } else {
      // Retry de correção
      const fixPrompt = `
O JSON abaixo está INVÁLIDO e não bate com o schema obrigatório.
Corrija e devolva SOMENTE o JSON válido no formato exigido.
Não inclua texto antes/depois do JSON.

ERROS:
${safeStringify(firstTry.error.issues)}

JSON PARA CORRIGIR:
${safeStringify(parsed1)}
`;

      const ai2 = await withTimeout(
        openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.2,
          response_format: { type: "json_object" } as any,
          messages: [
            { role: "system", content: "Responda somente com JSON válido." },
            { role: "user", content: fixPrompt },
          ],
        }),
        20000
      );

      const raw2 = ai2.choices?.[0]?.message?.content ?? "";
      const parsed2 = parseJsonFirstObject(raw2);

      reels = ReelsSchema.parse(parsed2);
    }

    // 6) Salvar
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
      { ok: false, requestId, error: "UNHANDLED", details: msg },
      { status: 500 }
    );
  }
}
