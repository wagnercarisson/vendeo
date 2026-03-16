import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CampaignStrategyBodySchema = z
  .object({
    product: z
      .object({
        type: z.string().trim().min(1).max(40),
        productName: z.string().trim().min(1).max(120),
        description: z.string().trim().max(500).optional().default(""),
        price: z.union([z.string(), z.number()]).optional(),
      })
      .strict(),
  })
  .strict();

function normalizeField(value: string, max: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const json = await req.json().catch(() => null);
    const body = CampaignStrategyBodySchema.safeParse(json);

    if (body.success === false) {
      return NextResponse.json(
        {
          ok: false,
          requestId,
          error: "INVALID_INPUT",
          details: body.error.flatten(),
        },
        { status: 400 }
      );
    }

    await getUserStoreIdOrThrow();

    const productType = normalizeField(body.data.product.type, 40);
    const productName = normalizeField(body.data.product.productName, 120);
    const description = normalizeField(body.data.product.description ?? "", 500);

    const rawPrice = body.data.product.price;
    const price =
      typeof rawPrice === "number"
        ? String(rawPrice)
        : normalizeField(rawPrice ?? "", 40);

    const prompt = `
Você é um estrategista de marketing para VAREJO LOCAL. Sua missão é ajudar lojistas de bairro a venderem mais.
Evite termos genéricos de agência (ex: "brand awareness", "conscientização"). Foque em RESULTADO IMEDIATO.

ITEM:
TIPO: ${productType}
NOME: ${productName}
DESCRIÇÃO: ${description || "não informada"}
PREÇO: ${price || "não informado"}

REGRAS DE CONTEÚDO (ESCOLHA OBRIGATORIAMENTE DAS OPÇÕES ABAIXO):

1. PÚBLICO (audience):
Opções: "geral", "jovens_festa", "familia", "infantil", "maes_pais", "mulheres", "homens", "fitness", "terceira_idade", "premium_exigente", "economico", "b2b"

2. OBJETIVO (objective):
Opções: "promocao", "novidade", "queima", "sazonal", "reposicao", "combo", "engajamento", "visitas"

3. POSICIONAMENTO (productPositioning):
Opções: "popular", "medio", "premium", "jovem", "familia"

4. REASONING: Explique em 2 frases curtas POR QUE essa combinação vai ajudar o lojista a vender.

Responda SOMENTE com JSON válido.

FORMATO:
{
  "audience": "chave_escolhida",
  "objective": "chave_escolhida",
  "productPositioning": "chave_escolhida",
  "reasoning": "..."
}
`;

    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Responda somente com JSON válido." },
        { role: "user", content: prompt },
      ],
    });

    const content = ai.choices[0].message.content || "{}";
    const suggestion = JSON.parse(content);

    return NextResponse.json({
      ok: true,
      requestId,
      suggestion,
    });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "UNKNOWN_ERROR";

    if (msg === "not_authenticated") {
      return NextResponse.json(
        { ok: false, requestId, error: "not_authenticated" },
        { status: 401 }
      );
    }

    if (msg === "store_not_found") {
      return NextResponse.json(
        { ok: false, requestId, error: "store_not_found" },
        { status: 403 }
      );
    }

    console.error("[generate/campaign/strategy] error:", err);

    return NextResponse.json(
      { ok: false, requestId, error: msg || "UNKNOWN_ERROR" },
      { status: 500 }
    );
  }
}