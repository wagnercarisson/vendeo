import { NextResponse } from "next/server";

type Body = {
  product_name: string;
  price: number;
  audience: string;
  objective: string;
  store_name?: string;
  city?: string;
  state?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  const prompt = `
Você é um redator de marketing para pequeno varejo no Brasil.
Crie uma campanha curta e direta.

Dados:
- Loja: ${body.store_name ?? "—"} (${body.city ?? ""} ${body.state ?? ""})
- Produto: ${body.product_name}
- Preço: R$ ${body.price}
- Público: ${body.audience}
- Objetivo: ${body.objective}

Retorne em JSON com as chaves:
caption (até 240 caracteres),
text (um parágrafo curto),
cta (chamada para ação),
hashtags (5 a 10 hashtags, separadas por espaço).
`.trim();

  // Placeholder: por enquanto devolve mock.
  // No próximo passo a gente conecta no provedor de IA.
  return NextResponse.json({
    caption: `🔥 Oferta imperdível: ${body.product_name} por R$ ${body.price}!`,
    text: `Corre garantir! ${body.product_name} com preço especial. Aproveite enquanto durar o estoque.`,
    cta: "Chama no WhatsApp e reserve agora!",
    hashtags: "#oferta #promocao #mercadinho #economia #precoBaixo",
    prompt_used: prompt,
  });
}
