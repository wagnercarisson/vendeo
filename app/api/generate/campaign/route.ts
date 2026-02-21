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

const AIResponseSchema = z.object({
  caption: z.string().optional(),
  text: z.string().optional(),
  cta: z.string().optional(),
  hashtags: z.string().optional(),
});

function parseJsonLoose(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");
    if (first >= 0 && last > first) return JSON.parse(raw.slice(first, last + 1));
    throw new Error("AI_RETURNED_NON_JSON");
  }
}

function safeStringify(v: any) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
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

    // 1) Buscar campanha (fonte da verdade)
    const { data: campaign, error: cErr } = await supabaseAdmin
      .from("campaigns")
      .select(
        `
        id, store_id, product_name, price, audience, objective, product_positioning,
        ai_caption, ai_text, ai_cta, ai_hashtags
      `
      )
      .eq("id", campaign_id)
      .single();

    if (cErr || !campaign) {
      return NextResponse.json(
        { ok: false, requestId, error: "CAMPAIGN_NOT_FOUND", details: cErr?.message },
        { status: 404 }
      );
    }

    // 2) Idempotência
    const already = (campaign.ai_caption ?? "").trim().length > 0;
    if (already && !force) {
      return NextResponse.json({
        ok: true,
        requestId,
        reused: true,
        campaign_id,
      });
    }

    // 3) Buscar loja (contexto)
    const { data: store, error: sErr } = await supabaseAdmin
      .from("stores")
      .select(
        `
        id, name, city, state,
        brand_positioning, main_segment, tone_of_voice,
        address, neighborhood, phone, whatsapp, instagram,
        primary_color, secondary_color, logo_url
      `
      )
      .eq("id", campaign.store_id)
      .single();

    if (sErr || !store) {
      return NextResponse.json(
        { ok: false, requestId, error: "STORE_NOT_FOUND", details: sErr?.message },
        { status: 404 }
      );
    }

    // 4) Validação mínima de dados essenciais (agora vindo do banco)
    if (
      !campaign.product_name ||
      !campaign.audience ||
      !campaign.objective
    ) {
      return NextResponse.json(
        {
          ok: false,
          requestId,
          error: "INSUFFICIENT_DATA",
          details:
            "Campanha incompleta no banco (product_name/audience/objective). Edite a campanha e tente novamente.",
        },
        { status: 400 }
      );
    }

    // 5) Prompt IA
    const prompt = `
Você é um especialista em marketing para comércios locais.
Crie 4 peças para uma campanha de redes sociais.

DADOS DA LOJA:
- Nome: ${store.name}
- Cidade/UF: ${store.city ?? ""}/${store.state ?? ""}
- Segmento: ${store.main_segment ?? "—"}
- Posicionamento: ${store.brand_positioning ?? "—"}
- Tom de voz: ${store.tone_of_voice ?? "—"}
- WhatsApp: ${store.whatsapp ?? store.phone ?? "—"}
- Instagram: ${store.instagram ?? "—"}

DADOS DA CAMPANHA:
- Produto: ${campaign.product_name}
- Preço: ${campaign.price ?? "—"}
- Público: ${campaign.audience}
- Objetivo: ${campaign.objective}
- Perfil do produto: ${campaign.product_positioning ?? "—"}

REGRAS:
- Responda SOMENTE em JSON válido (sem markdown).
- Use português do Brasil.
- Faça textos curtos, prontos para copiar e colar.

FORMATO OBRIGATÓRIO:
{
  "caption": "Legenda curta com emojis (se combinar)",
  "text": "Texto principal (pode ser um pouco maior)",
  "cta": "Chamada para ação",
  "hashtags": "#... #... #..."
}
`;

    // 6) Chamada OpenAI + parse robusto + retry
    const ai1 = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: "Responda somente com JSON válido." },
        { role: "user", content: prompt },
      ],
    });

    const raw1 = ai1.choices?.[0]?.message?.content ?? "";
    const parsed1 = parseJsonLoose(raw1);

    let aiData: z.infer<typeof AIResponseSchema>;
    try {
      const parsedSafe = AIResponseSchema.safeParse(parsed1);

      if (!parsedSafe.success) {
      throw new Error("AI_INVALID_FORMAT");  
    }

    let aiData = parsedSafe.data;

    // Fallbacks seguros (evita erro se IA esquecer campo)
    aiData.caption = aiData.caption ?? "Confira essa novidade!";
    aiData.text = aiData.text ?? "";
    aiData.cta = aiData.cta ?? "Fale conosco agora!";
    aiData.hashtags = aiData.hashtags ?? "";
    } catch (e: any) {
      const fixPrompt = `
O JSON abaixo está inválido ou não segue o formato.
Corrija e devolva SOMENTE o JSON válido no formato obrigatório.

ERRO:
${safeStringify(e?.issues ?? e?.message ?? e)}

JSON PARA CORRIGIR:
${safeStringify(parsed1)}
`;
      const ai2 = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: "Responda somente com JSON válido." },
          { role: "user", content: fixPrompt },
        ],
      });

      const raw2 = ai2.choices?.[0]?.message?.content ?? "";
      const parsed2 = parseJsonLoose(raw2);
      aiData = AIResponseSchema.parse(parsed2);
    }

    // 7) Salvar no banco
    const { error: upErr } = await supabaseAdmin
      .from("campaigns")
      .update({
        ai_caption: aiData.caption,
        ai_text: aiData.text,
        ai_cta: aiData.cta,
        ai_hashtags: aiData.hashtags,
        ai_generated_at: new Date().toISOString(),
      })
      .eq("id", campaign_id);

    if (upErr) {
      return NextResponse.json(
        { ok: false, requestId, error: "DB_UPDATE_FAILED", details: upErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      requestId,
      reused: false,
      campaign_id,
    });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "UNKNOWN_ERROR";
    console.error("[generate-campaign] error:", msg, err?.stack ?? err);
    return NextResponse.json({ ok: false, requestId, error: "UNHANDLED", details: msg }, { status: 500 });
  }
}
