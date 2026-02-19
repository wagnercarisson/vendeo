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

    const input = [
      {
        role: "system",
        content:
          "Você é um redator de marketing para pequeno varejo no Brasil. Seja direto, persuasivo e claro.",
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
Retorne no formato solicitado.`,
      },
    ];

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input,
      response_format: {
        type: "json_schema",
        json_schema: {
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
              hashtags: { type: "string" },
            },
          },
        },
      },
    });

    // Com response_format JSON Schema, a saída vem como JSON válido
    // Em muitos casos o SDK também expõe output_text, mas aqui vamos parsear com segurança:
    const raw = response.output_text?.trim() || "{}";
    const data = JSON.parse(raw);

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Erro desconhecido" },
      { status: 500 }
    );
  }
}
