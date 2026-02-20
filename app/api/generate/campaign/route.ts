import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// controla tempo máximo da chamada (segurança)
const TIMEOUT_MS = 15000;

function clampStr(v: unknown, max = 400): string {
  const s = String(v ?? "").trim();
  return s.length > max ? s.slice(0, max) : s;
}

function clampNumber(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return n;
}

function extractJson(text: string) {
  // tenta pegar o primeiro JSON “aparente”
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function normalizeResult(parsed: any) {
  // garante shape e tipos
  return {
    caption: clampStr(parsed?.caption, 260),
    text: clampStr(parsed?.text, 800),
    cta: clampStr(parsed?.cta, 200),
    hashtags: clampStr(parsed?.hashtags, 250),
  };
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY ausente no runtime." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // valida / normaliza input
    const product_name = clampStr(body.product_name, 80);
    const audience = clampStr(body.audience, 120);
    const objective = clampStr(body.objective, 120);
    const price = clampNumber(body.price);

    const store_name = clampStr(body.store_name, 80);
    const city = clampStr(body.city, 60);
    const state = clampStr(body.state, 30);

    if (!product_name || !audience || !objective || !price) {
      return NextResponse.json(
        {
          error:
            "Dados insuficientes para gerar campanha. Verifique produto, preço, público e objetivo.",
        },
        { status: 400 }
      );
    }

    const prompt = `
Crie uma campanha de marketing para pequeno varejo no Brasil.

Dados:
- Produto: ${product_name}
- Preço: R$ ${price}
- Público: ${audience}
- Objetivo: ${objective}
- Loja: ${store_name || "—"}
- Cidade/UF: ${city || "—"} ${state || ""}

Regras:
- Retorne APENAS JSON válido (sem texto extra)
- caption: até 240 caracteres
- text: 1 parágrafo curto
- cta: 1 frase
- hashtags: 5 a 10 hashtags separadas por espaço (sem vírgulas)

Formato obrigatório:
{"caption":"","text":"","cta":"","hashtags":""}
`.trim();

    // timeout com AbortController
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let content = "";
    try {
      const completion = await openai.chat.completions.create(
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Você é um redator de marketing. Responda somente em JSON válido, sem markdown, sem explicações.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 220, // controla custo
        },
        { signal: controller.signal } as any
      );

      content = completion.choices?.[0]?.message?.content ?? "";
    } finally {
      clearTimeout(t);
    }

    // parse robusto
    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = extractJson(content);
    }

    if (!parsed) {
      return NextResponse.json(
        {
          error: "A IA não retornou JSON válido.",
          raw: content.slice(0, 800),
        },
        { status: 502 }
      );
    }

    const result = normalizeResult(parsed);

    // valida campos mínimos (evita salvar lixo)
    if (!result.caption || !result.text || !result.cta || !result.hashtags) {
      return NextResponse.json(
        {
          error: "JSON veio incompleto (faltando campos).",
          raw: parsed,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    const msg = String(err?.message ?? "Erro desconhecido");

    // AbortController/timeout
    if (msg.toLowerCase().includes("aborted")) {
      return NextResponse.json(
        { error: "Timeout ao gerar campanha. Tente novamente." },
        { status: 504 }
      );
    }

    // erro da OpenAI costuma vir com status/message
    return NextResponse.json(
      {
        error: msg,
        status: err?.status,
        type: err?.type,
      },
      { status: 500 }
    );
  }
}
