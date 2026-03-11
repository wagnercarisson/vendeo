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
  description: z.string().optional(),
});

// ⚠️ Mantenha schema “realista”: IA às vezes erra.
// Vamos validar e aplicar fallback.
const AISchema = z.object({
  headline: z.string().optional(),
  caption: z.string().optional(),
  text: z.string().optional(),
  cta: z.string().optional(),
  hashtags: z.string().optional(),
});

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms)),
  ]);
}

// Extrai o PRIMEIRO objeto JSON completo (robusto contra texto extra e múltiplos JSONs)
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
  try {
    return JSON.parse(raw);
  } catch {
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

    const { campaign_id, force, description: bodyDescription } = body.data;

    //alteração
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

    
    // 1) Busca campanha (fonte da verdade)
    const { data: campaign, error: cErr } = await supabaseAdmin
      .from("campaigns")
      .select(`
        id, store_id, product_name, price, audience, objective, product_positioning,
        headline, ai_caption, ai_text, ai_cta, ai_hashtags
      `)
      .eq("id", campaign_id)
      .eq("store_id", storeId)
      .single();

    if (cErr || !campaign) {
      return NextResponse.json(
        { ok: false, requestId, error: "CAMPAIGN_NOT_FOUND", details: cErr?.message },
        { status: 404 }
      );
    }

    // 2) Idempotência
    const already = !!(campaign.ai_caption && String(campaign.ai_caption).trim().length > 0);
    if (!force && already) {
      return NextResponse.json({ ok: true, requestId, reused: true });
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
          details: "Campanha incompleta: preencha Produto, Público e Objetivo antes de gerar o texto.",
        },
        { status: 400 }
      );
    }

    // 4) Busca loja (contexto)
    const { data: store, error: sErr } = await supabaseAdmin
      .from("stores")
      .select(
        `
        id, name, city, state,
        brand_positioning, main_segment, tone_of_voice,
        whatsapp, phone, instagram,
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

    // 5) Prompt
    const prompt = `
Você é um REDATOR DE VAREJO. Seu objetivo é criar conteúdo que faça o cliente comprar AGORA.
Nada de papo furado ou termos técnicos. Seja direto, persuasivo e "uau".

DADOS DA LOJA:
- Nome: ${store.name}
- Segmento: ${store.main_segment ?? "—"}
- Cidade/UF: ${store.city ?? ""}/${store.state ?? ""}
- Tom: ${store.tone_of_voice ?? "—"}
- Contato: ${store.whatsapp ?? store.phone ?? "—"}

DIRETRIZES DE AGÊNCIA (COPYWRITING DE ALTO IMPACTO):
1. PROIBIDO CLICHÊS: Evite frases como "Aproveite a melhor...", "O melhor preço...", "Venha conferir...". Seja criativo e específico.
2. FOCO NO MOOD: Se o público é "Jovens/Festa", use um tom vibrante e social. Se o posicionamento é "Premium", use sofisticação e exclusividade.
3. REGRA DE OURO: NÃO INVENTE ATRIBUTOS (como "gelada" ou "fresquinho") se não estiverem nos dados.
4. HEADLINE (Impacto): Máximo 30 caracteres. Em vez de "Heineken em oferta", use "SUA FESTA PEDE HEINEKEN" ou "O SABOR QUE VOCÊ MERECE".
5. TEXT (Desejo): Máximo 90 caracteres. Conecte o produto ao momento de uso. Use gatilhos de exclusividade, sabor ou conveniência.
6. CTA (Ação): Máximo 15 caracteres. Fuja do "Compre agora". Use "Garantir a Minha", "Reservar Pedido", "Ver no Cardápio".

DADOS ESTRATÉGICOS (MUITO IMPORTANTE):
- Produto: ${campaign.product_name}
- Preço: ${campaign.price ?? "não informado"}
- Público-alvo: ${campaign.audience} (Adapte o vocabulário para eles)
- Objetivo: ${campaign.objective} (Lançamento? Oferta? Giro de Estoque?)
- Posicionamento: ${campaign.product_positioning ?? "—"} (Premium? Econômico? Social?)
- Contexto Extra: ${bodyDescription || "não informado"}

DADOS DA LOJA:
- Nome: ${store.name}
- Tom de Voz: ${store.tone_of_voice ?? "Profissional"} - Respeite isso rigorosamente.

FORMATO OBRIGATÓRIO (JSON PURO):
{
  "headline": "O TÍTULO IMPACTANTE",
  "text": "O texto que convence o cliente sobre o produto.",
  "caption": "Legenda curta para o Instagram com emojis.",
  "cta": "Chamada para ação direta",
  "hashtags": "#tag1 #tag2 #tag3"
}
`;

    // 6) OpenAI (forçar JSON + parse robusto)
    const ai1 = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.7,
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

    // 7) Validar + retry se necessário
    let aiData: z.infer<typeof AISchema>;

    const firstTry = AISchema.safeParse(parsed1);
    if (firstTry.success) {
      aiData = firstTry.data;
    } else {
      const fixPrompt = `
O JSON abaixo está inválido ou fora do formato.
Corrija e devolva SOMENTE o JSON válido no formato exigido (sem texto fora do JSON).

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

      aiData = AISchema.parse(parsed2);
    }

    // 8) Fallbacks (NUNCA quebra por campo ausente)
    const headline = (aiData.headline ?? "").trim() || campaign.product_name;
    const caption = (aiData.caption ?? "").trim() || `✨ ${campaign.product_name} em destaque!`;
    const text = (aiData.text ?? "").trim() || `Passe na ${store.name} e garanta o seu hoje.`;
    const cta =
      (aiData.cta ?? "").trim() ||
      (store.whatsapp ? "Chama no WhatsApp e peça agora!" : "Fale conosco e peça agora!");
    const hashtags =
      (aiData.hashtags ?? "").trim() ||
      "#promo #oferta #instafood #loja #bairro";

    // 9) Salvar no banco
    const { error: upErr } = await supabaseAdmin
      .from("campaigns")
      .update({
        headline: headline,
        ai_caption: caption,
        ai_text: text,
        ai_cta: cta,
        ai_hashtags: hashtags,
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
    console.error("[generate/campaign] error:", msg, err?.stack ?? err);
    return NextResponse.json(
      { ok: false, requestId, error: "UNHANDLED", details: msg },
      { status: 500 }
    );
  }
}
