import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/ai/client";
import {
  AUDIENCE_OPTIONS,
  OBJECTIVE_VALUES,
  PRODUCT_POSITIONING_OPTIONS,
} from "@/lib/constants/strategy";

const AUDIENCE_PROMPT_VALUES = AUDIENCE_OPTIONS.map((option) => `"${option.value}"`).join(", ");
const OBJECTIVE_PROMPT_VALUES = OBJECTIVE_VALUES.map((value) => `"${value}"`).join(", ");
const POSITIONING_PROMPT_VALUES = PRODUCT_POSITIONING_OPTIONS.map((option) => `"${option.value}"`).join(", ");

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
Opções: ${AUDIENCE_PROMPT_VALUES}

2. OBJETIVO (objective):
Opções: ${OBJECTIVE_PROMPT_VALUES}
Use "novidade" quando a intenção for lançamento/chegada recente. Não use "lancamento" como valor.

3. POSICIONAMENTO (productPositioning):
Opções: ${POSITIONING_PROMPT_VALUES}

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
