import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/ai/client";

export async function POST(req: Request) {
  const openai = getOpenAI();
  const requestId = crypto.randomUUID();

  try {
    const { product } = await req.json();

    const { storeId } = await getUserStoreIdOrThrow();

    const prompt = `
Você é um estrategista de marketing para VAREJO LOCAL. Sua missão é ajudar lojistas de bairro a venderem mais.
Evite termos genéricos de agência (ex: "brand awareness", "conscientização"). Foque em RESULTADO IMEDIATO.

ITEM:
TIPO: ${product.type}
NOME: ${product.productName}
DESCRIÇÃO: ${product.description || "não informada"}
PREÇO: ${product.price || "não informado"}

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
    console.error("[generate/campaign/strategy] error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "UNKNOWN_ERROR" },
      { status: 500 }
    );
  }
}
