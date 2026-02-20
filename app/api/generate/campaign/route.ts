import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY ausente no runtime." },
        { status: 500 }
      );
    }

    const body = await req.json();

    const prompt = `
Crie uma campanha de marketing para pequeno varejo no Brasil.

Dados:
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

Retorne APENAS JSON no formato:
{"caption":"","text":"","cta":"","hashtags":""}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um redator de marketing profissional. Responda apenas em JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 220,
    });

    const content =
      completion.choices?.[0]?.message?.content ?? "{}";

    let data;
    try {
      data = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "A IA não retornou JSON válido.", raw: content },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Erro desconhecido" },
      { status: 500 }
    );
  }
}
