import { StoreContext } from "@/lib/domain/stores/types";
import { OBJECTIVE_VALUES } from "@/lib/constants/strategy";
import { WeatherData, WeeklyPlanItemBrief } from "./types";

const OBJECTIVE_PROMPT_VALUES = OBJECTIVE_VALUES.map((value) => `"${value}"`).join(", ");

const MAP_DAYS: Record<number, string> = {
  1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta",
  5: "Sexta", 6: "Sábado", 7: "Domingo",
};

function formatWeatherContext(weather: WeatherData | null): string {
  if (!weather) return "Previsão do tempo não disponível.";
  const forecast = weather.forecast
    .map((f) => `- ${f.weekday} (${f.date}): ${f.description}, Max ${f.max}°C, Min ${f.min}°C`)
    .join("\n");
  return `No momento faz ${weather.temp}°C em ${weather.cityName} (${weather.condition}).\nPrevisão:\n${forecast}`;
}

function formatHolidaysContext(
  holidays: Array<{ date: string; name: string }>
): string {
  if (!holidays.length) return "Nenhum feriado sazonal detectado nesta semana.";
  return `Temos os seguintes feriados essa semana:\n${holidays
    .map((h) => `- ${h.date}: ${h.name}`)
    .join("\n")}`;
}

function formatHistoryContext(
  pastPlans: Array<{
    week_start: string;
    items: Array<{ day_of_week: number; brief: WeeklyPlanItemBrief | null | Record<string, any> }>;
  }>
): string {
  if (!pastPlans?.length) return "Ainda não há histórico recente de campanhas.";
  let ctx = "Nas últimas semanas focamos nos seguintes objetivos/públicos:\n";
  pastPlans.forEach((p) => {
    ctx += `- Semana de ${p.week_start}:\n`;
    p.items.slice(0, 3).forEach((i) => {
      const b = i.brief;
      const objective = b && "objective" in b ? b.objective : "—";
      const audience = b && "audience" in b ? b.audience : "—";
      ctx += `  Dia ${i.day_of_week}: Obj: ${objective}, Púb: ${audience}\n`;
    });
  });
  return ctx;
}

/**
 * Monta o prompt da estratégia semanal com clima, feriados e histórico.
 */
export function buildWeeklyStrategyPrompt(opts: {
  store: Pick<StoreContext, "name" | "main_segment" | "city" | "state" | "neighborhood">;
  days: number[];
  weather: WeatherData | null;
  holidays: Array<{ date: string; name: string }>;
  history: Array<{
    week_start: string;
    items: Array<{ day_of_week: number; brief: WeeklyPlanItemBrief | null | Record<string, any> }>;
  }>;
}): string {
  const { store, days, weather, holidays, history } = opts;

  return `
Você é o Consultor de Marketing de Varejo mais experiente do Brasil, especialista em comportamento de consumo regional e estratégias de giro de estoque para lojas físicas. 

Sua missão na loja ${store.name} (Segmento: ${store.main_segment ?? "Geral"}), localizada em ${store.city ?? "não informada"}/${store.state ?? "não informado"} (Bairro: ${store.neighborhood ?? "não informado"}), é garantir que nenhuma postagem seja "só para constar". Cada post deve ter um motivo comercial matador.

Dê um "sotaque" local à estratégia: considere feriados regionais, clima específico da região e hábitos de consumo locais.

DIAS SOLICITADOS PARA A CAMPANHA:
${days.map((d) => `- ${d} (${MAP_DAYS[d] ?? d})`).join("\n")}

CONTEXTO ESTRATÉGICO:
- LOCALIZAÇÃO: ${store.city ?? "—"}/${store.state ?? "—"} (Respeite a cultura e o clima regional!)
- CLIMA: ${formatWeatherContext(weather)}
- CALENDÁRIO DE FERIADOS: ${formatHolidaysContext(holidays)}
- HISTÓRICO RECENTE: ${formatHistoryContext(history)}

SUA LÓGICA DE DECISÃO (O "PULO DO GATO"):
1. ARREGAÇAR AS MANGAS: Sua linguagem deve ser de quem está no chão de loja, focada em resultados. Use termos como "bater meta", "limpar estoque", "fidelizar vizinhança" no seu raciocínio interno para decidir.
2. LÓGICA DE CROSS-SELLING: Sempre que sugerir um produto principal, pense no que o cliente "leva junto". Se for cerveja, lembre do petisco/gelo. Se for churrasco, lembre do carvão. Traga essa inteligência para o 'reasoning'.
3. INTELIGÊNCIA REGIONAL: Adapte a oferta ao clima local. Se houver frio, foque em conforto/aquecimento. Se houver calor, foque em refrescância/verão. Respeite os costumes de ${store.city}/${store.state}.
4. GANCHO DE URGÊNCIA MODERADO: Use gatilhos de escassez ou tempo (ex: "só até amanhã", "últimas unidades") APENAS se o objetivo for "promocão", "queima" ou "sazonal". Para públicos "premium", foque em exclusividade e oportunidade, não em desespero.
5. FILTRO DE PÚBLICO: Priorize B2C. Sugira B2B APENAS se o segmento "${store.main_segment}" for claramente voltado para empresas/atacado.

REGRAS:
1. Para cada dia solicitado acima, devolva um objeto json cobrindo: audience, objective, positioning, content_type, e reasoning.
2. [audience]: escolha EXATAMENTE dentre: "geral", "jovens_festa", "familia", "infantil", "maes_pais", "mulheres", "homens", "fitness", "terceira_idade", "premium_exigente", "economico", "b2b".
3. [objective]: escolha EXATAMENTE dentre: ${OBJECTIVE_PROMPT_VALUES}.
  Observação: use "novidade" quando a intenção for lançamento/chegada recente; não use "lancamento" como valor.
4. [positioning]: escolha EXATAMENTE dentre: "popular", "medio", "premium", "jovem", "familia".
5. [content_type]: "post" ou "reels".
6. [reasoning]: Crie uma frase CURTA, AGRESSIVA e "MÃO NA MASSA" (MÁXIMO 12 PALAVRAS). Foque em vender e girar estoque. Ex: "Fim de estoque: combo de gelada + petisco para girar prateleira hoje."

RETORNE APENAS JSON STRICT, SEM MARKDOWN:
{
  "items": [
    {
       "day_of_week": 1,
       "audience": "...",
       "objective": "...",
       "positioning": "...",
       "content_type": "post",
       "reasoning": "Sua justificativa de consultor aqui."
    }
  ]
}
`;
}
