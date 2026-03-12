import { StoreContext } from "@/lib/domain/stores/types";
import { WeatherData, WeeklyPlanItemBrief } from "./types";

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
  store: Pick<StoreContext, "name" | "main_segment">;
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
Você é uma Diretora de Marketing sênior auxiliando a loja ${store.name} (Segmento: ${store.main_segment ?? "Geral"}).
Nossa missão é planejar a ESTRATÉGIA das postagens estruturadas da semana.
Analise inteligentemente o clima, feriados e dias selecionados, e retorne o JSON solicitado.

DIAS SOLICITADOS PARA A CAMPANHA:
${days.map((d) => `- ${d} (${MAP_DAYS[d] ?? d})`).join("\n")}

CONTEXTO CLIMÁTICO (Use a previsão do tempo para sugerir produtos apropriados para o clima dos dias de planejamento):
${formatWeatherContext(weather)}

CALENDÁRIO DE FERIADOS:
${formatHolidaysContext(holidays)}

HISTÓRICO RECENTE:
${formatHistoryContext(history)}

REGRAS:
1. Para cada dia solicitado acima, devolva um objeto json cobrindo: audience, objective, positioning, content_type, e reasoning.
2. [audience]: escolha EXATAMENTE dentre: "geral", "jovens_festa", "familia", "infantil", "maes_pais", "mulheres", "homens", "fitness", "terceira_idade", "premium_exigente", "economico", "b2b".
3. [objective]: escolha EXATAMENTE dentre: "promocao", "novidade", "queima", "sazonal", "reposicao", "combo", "engajamento", "visitas".
4. [positioning]: escolha EXATAMENTE dentre: "popular", "medio", "premium", "jovem", "familia".
5. [content_type]: "post" ou "reels".
6. [reasoning]: Crie UMA FRASE muito curta e persuasiva (MAX 15 palavras) explicando POR QUE essa escolha é perfeita hoje considerando o clima, feriado ou padrão de consumo.

RETORNE APENAS JSON STRICT, SEM MARKDOWN:
{
  "items": [
    {
       "day_of_week": 1,
       "audience": "...",
       "objective": "...",
       "positioning": "...",
       "content_type": "post",
       "reasoning": "Uma frase de 15 palavras explicando a lógica."
    }
  ]
}
`;
}
