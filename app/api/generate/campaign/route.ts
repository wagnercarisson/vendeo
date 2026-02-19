import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY não está configurada no ambiente." },
        { status: 500 }
      );
    }

    const body = await req.json();

    const schema = {
      name: "campaign_copy",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["caption", "text", "cta", "hashtags"],
        properties: {
          caption: { type: "string" },
          text: { type: "string" },
          cta: { type: "string" },
          hashtags: { type: "string" }
        }
      }
    } as const;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um redator de marketing para pequeno varejo no Brasil. Seja direto, persuasivo e claro."
        },
        {
          role: "user",
          content: `Crie uma campanha com base nos dados abaixo:
Produto: ${body.product_name}
Preço: R$ ${body.price}
Público: ${body.audience}
Objetivo: ${body.objective}
Loja: ${body.store_name ?? ""}
Cidade/UF: ${body.city ?? ""} ${body.state ?? ""}

Regras:
- caption: até 240 caracteres
- text: 1 parágrafo curto
- cta: 1 frase
- hashtags: 5 a 10 hashtags separadas por espaço (sem vírgulas)
Retorne no formato JSON do schema.`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: schema
      }
    });

    const content = completion.choices?.[0]?.message?.content ?? "{}";
    const data = JSON.parse(content);

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Erro desconhecido" },
      { status: 500 }
    );
  }
}
