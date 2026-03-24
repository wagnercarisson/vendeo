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
Você é um ROTEIRISTA DE REELS DE ALTO IMPACTO, especializado em "Varejo Real". Seu objetivo é criar roteiros magnéticos que o lojista consiga filmar sozinho, na própria loja, usando apenas o celular e o que tem à mão.

CONTEXTO DA CAMPANHA:
- LOJA: ${store.name} em ${store.city ?? "—"}/${store.state ?? "—"}.
- PRODUTO: ${campaign.product_name} (Preço: ${campaign.price ?? "não informado"}).
- ESTRATÉGIA: ${campaign.objective} para ${campaign.audience}.
- RACIOCÍNIO VAREJISTA: ${campaign.theme || options?.extra || "Focar no desejo imediato e benefícios do produto."}

DIRETRIZES DE ROTEIRO (FOCO EM EXECUÇÃO REAL):
1. O GANCHO (HOOK) DE 3 SEGUNDOS: Comece com uma pergunta direta ou um visual impactante do produto. Fuja de introduções lentas como "Olá pessoal". Ex: "O segredo de ${store.city} para...", "Pare tudo o que está fazendo e veja esse/essa ${campaign.product_name}".
2. REGRA DE OURO (CONCORDÂNCIA DE GÊNERO): Verifique o gênero do produto (${campaign.product_name}). Use "O seu/O melhor" para masculinos e "A sua/A melhor" para femininos. NUNCA erre a concordância no roteiro ou nos textos de tela.
3. CENAS REALISTAS (MÃO NA MASSA): Proibido sugerir cenas com figurantes, multidões ou decorações complexas. Sugira tomadas simples:
   - POV (Ponto de Vista): O lojista segurando o produto ou tirando da prateleira.
   - CLOSE-UP: Foco total no detalhe, na textura ou no rótulo.
   - AMBIENTE: O produto no balcão ou em destaque na vitrine.
4. CONTEXTO REGIONAL: Use o "sotaque" de ${store.city || "sua região"}. Se o tom for informal, use gírias leves locais.
5. ÁUDIO/TRENDS: Sugira estilos de áudio que combinem com o tom da marca (Premium = Sofisticado, Popular = Animado/Trends).
6. FIDELIDADE AO RACIOCÍNIO: Se o raciocínio varejista sugeriu cross-selling (venda casada), o roteiro DEVE citar ou mostrar os produtos complementares.

FORMATO OBRIGATÓRIO (JSON PURO):
{
  "hook": "Frase de abertura impactante (Máx 45 carac.)",
  "duration_seconds": 25,
  "audio_suggestion": "Inspiração de áudio/estilo de transição",
  "on_screen_text": ["Legenda de tela 1", "Texto 2", "Texto 3"],
  "shotlist": [
     { "scene": 1, "camera": "tomada simples (ex: close nas mãos)", "action": "ação fácil de filmar", "dialogue": "o que dizer ou narrar" }
  ],
  "script": "Texto completo para narração ou fala para câmera",
  "caption": "Legenda magnética com emojis e sotaque local.",
  "cta": "Chamada para ação estratégica no gênero correto",
  "hashtags": "#tag1 #tag2 #tag3"
}
`;
}
