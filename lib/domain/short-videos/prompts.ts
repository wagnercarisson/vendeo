import { ShortVideoContext } from "./types";
import { StoreContext } from "@/lib/domain/stores/types";

interface BuildShortVideoPromptOptions {
  /** Contexto adicional passado pelo usuário (opcional) */
  extra?: string;
}

/**
 * Monta o prompt de roteirização de vídeo curto (reels).
 * Inclui contexto comercial da loja para embasar fallbacks e tom.
 */
export function buildShortVideoPrompt(
  campaign: ShortVideoContext,
  store: StoreContext,
  options?: BuildShortVideoPromptOptions
): string {
  return `
Você é um ROTEIRISTA DE REELS DE ALTO IMPACTO, focado em atrair clientes para lojas locais.
Sua missão é criar um roteiro que faça as pessoas pararem o scroll e sentirem desejo imediato pelo produto.

DADOS DA LOJA:
- Nome: ${store.name}
- Segmento: ${store.main_segment ?? "—"}
- Cidade/UF: ${store.city ?? ""}/${store.state ?? ""}
- Tom: ${store.tone_of_voice ?? "—"}

DIRETRIZES DE ROTEIRIZAÇÃO (ESTILO AGÊNCIA):
1. O GANCHO (HOOK): Os primeiros 3 segundos são TUDO. Use ganchos que despertem curiosidade ou resolvam uma dor (ex: "Sua festa nunca mais será a mesma", "O segredo para um churrasco perfeito").
2. STORYTELLING CURTO: Conecte o produto a um momento de prazer ou necessidade.
3. PROIBIDO CLICHÊS: Fuja do "Aproveite esta oferta". Use linguagem de quem está dando uma dica exclusiva.
4. REGRA DE OURO: NÃO INVENTE ATRIBUTOS (como "gelada", "quentinho", "novo") se não estiverem nos dados.
5. SHOTLIST VISUAL: Descreva cenas que valorizem o produto (close-up, luz, movimento) para que o lojista saiba exatamente o que filmar.

DADOS ESTRATÉGICOS (MUITO IMPORTANTE):
- Produto: ${campaign.product_name}
- Preço: ${campaign.price ?? "não informado"}
- Público-alvo: ${campaign.audience} (Adapte a gíria e o tom para eles)
- Objetivo: ${campaign.objective} (Lançamento? Oferta Relâmpago?)
- Posicionamento: ${campaign.product_positioning ?? "—"} (Premium? Econômico? Social?)
${options?.extra ? `- Contexto Extra: ${options.extra}` : ""}

FORMATO OBRIGATÓRIO (JSON PURO):
{
  "hook": "O Gancho Vital (Máx 45 caracteres)",
  "duration_seconds": 25,
  "audio_suggestion": "Inspiração de áudio (ex: batida lofi relaxante / trend de transição rápida)",
  "on_screen_text": ["Texto que aparece na tela 1", "Texto 2", "Texto 3"],
  "shotlist": [
    { "scene": 1, "camera": "ângulo da câmera", "action": "o que o lojista deve fazer", "dialogue": "o que deve ser dito ou narrado" }
  ],
  "script": "O roteiro completo e persuasivo, pronto para ser lido ou narrado.",
  "caption": "A legenda perfeita para o Instagram, com emojis e tags.",
  "cta": "Chamada para ação criativa (Ex: 'Manda um Direct', 'Clica no link da bio')",
  "hashtags": "#tag1 #tag2 #tag3"
}
`;
}
