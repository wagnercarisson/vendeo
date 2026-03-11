import { getUserStoreIdOrThrow } from "@/lib/store/getUserStoreId";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { AUDIENCE_OPTIONS, OBJECTIVE_OPTIONS, PRODUCT_POSITIONING_OPTIONS } from "@/app/dashboard/campaigns/new/_components/constants";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`MISSING_ENV:${name}`);
  return value;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabaseAdmin = createClient(
  requireEnv("SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } }
);

const PostBodySchema = z.object({
  store_id: z.string().uuid(),
  week_start: z.string().optional(),
  selected_days: z.array(z.number().int().min(1).max(7)).optional(),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  holidays: z.array(
    z.object({
      date: z.string(),
      name: z.string()
    })
  ).optional().default([]),
});

// Fetch weather
async function fetchWeather(city: string, state?: string) {
    if (!city || city.trim() === "") return null;
    try {
        const query = state ? `${city},${state}` : city;
        const res = await fetch(
            `https://api.hgbrasil.com/weather?format=json-cors&city_name=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        if (!data || !data.results || data.by !== "city_name") return null;
        
        return {
            cityName: data.results.city,
            temp: data.results.temp,
            condition: data.results.description,
            forecast: data.results.forecast.slice(0, 5) // Próximos 5 dias
        };
    } catch (error) {
        return null;
    }
}

// Map days
const mapDays: Record<number, string> = {
  1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta",
  5: "Sexta", 6: "Sábado", 7: "Domingo"
};

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const json = await req.json().catch(() => null);
    const body = PostBodySchema.safeParse(json);

    if (!body.success) {
      return NextResponse.json({ ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() }, { status: 400 });
    }

    const { store_id, selected_days, holidays, city, state } = body.data;

    // Build context
    const { data: store } = await supabaseAdmin
      .from("stores")
      .select("name, city, state, brand_positioning, main_segment, tone_of_voice")
      .eq("id", store_id)
      .single();

    if (!store) {
      return NextResponse.json({ ok: false, requestId, error: "STORE_NOT_FOUND" }, { status: 404 });
    }

    const daysToGenerate = selected_days && selected_days.length > 0 ? selected_days : [1, 3, 5, 6];
    
    // Fetch History
    const { data: pastPlans } = await supabaseAdmin
        .from("weekly_plans")
        .select(`id, week_start, items:weekly_plan_items(day_of_week, brief)`)
        .eq("store_id", store_id)
        .order("created_at", { ascending: false })
        .limit(2);

    let historyContext = "Ainda não há histórico recente de campanhas.";
    if (pastPlans && pastPlans.length > 0) {
        historyContext = "Nas últimas semanas focamos nos seguintes objetivos/públicos:\n";
        pastPlans.forEach(p => {
            historyContext += `- Semana de ${p.week_start}:\n`;
            p.items.slice(0,3).forEach((i: any) => {
                const b = i.brief || {};
                historyContext += `  Dia ${i.day_of_week}: Obj: ${b.objective}, Púb: ${b.audience}\n`;
            });
        });
    }

    // Fetch Weather
    const weather = await fetchWeather(city || store.city, state || store.state);
    let weatherContext = "Previsão do tempo não disponível.";
    if (weather) {
        weatherContext = `No momento faz ${weather.temp}°C em ${weather.cityName} (${weather.condition}). `;
        weatherContext += `\nA previsão para os próximos dias é:\n${weather.forecast.map((f:any) => `- ${f.weekday} (${f.date}): ${f.description}, Max ${f.max}°C, Min ${f.min}°C`).join("\n")}`;
    }

    const holidaysContext = holidays.length > 0 
        ? `Temos os seguintes feriados essa semana:\n${holidays.map(h => `- ${h.date}: ${h.name}`).join("\n")}`
        : "Nenhum feriado sazonal detectado nesta semana.";

    const prompt = `
Você é uma Diretora de Marketing sênior auxiliando a loja ${store.name} (Segmento: ${store.main_segment || "Geral"}).
Nossa missão é planejar a ESTRATÉGIA das postagens estruturadas da semana.
Análise inteligentemente o clima, feriados e dias selecionados, e retorne o JSON solicitado.

DIAS SOLICITADOS PARA A CAMPANHA:
${daysToGenerate.map(d => `- ${d} (${mapDays[d]})`).join("\n")}

CONTEXTO CLIMÁTICO (Use a previsão do tempo para sugerir produtos apropriados para o clima dos dias de planejamento):
${weatherContext}

CALENDÁRIO DE FERIADOS:
${holidaysContext}

HISTÓRICO RECENTE:
${historyContext}

REGRAS:
1. Para cada dia solicitado acima, devolva um objeto json cobrindo: audience, objective, positioning, content_type, e reasoning.
2. [audience]: escolha EXATAMENTE dentre: "geral", "jovens_festa", "familia", "infantil", "maes_pais", "mulheres", "homens", "fitness", "terceira_idade", "premium_exigente", "economico", "b2b".
3. [objective]: escolha EXATAMENTE dentre: "promocao", "novidade", "queima", "sazonal", "reposicao", "combo", "engajamento", "visitas".
4. [positioning]: escolha EXATAMENTE dentre: "popular", "medio", "premium", "jovem", "familia".
5. [content_type]: "post" ou "reels".
6. [reasoning]: Crie UMA FRASE muito curta e persuasiva (MAX 15 palavras) explicando POR QUE essa escolha é perfeita hoje considerando o clima, feriado ou padrão de consumo. (ex: "Clima chuvoso pede reels de lanches quentes entregues em casa.").

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

    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You respond strictly in pure JSON format adhering to the structure given." },
        { role: "user", content: prompt },
      ],
    });

    const content = ai.choices?.[0]?.message?.content || "{}";
    const data = JSON.parse(content);
    
    // Fallback if missing items
    if (!data.items || !Array.isArray(data.items)) {
       data.items = [];
    }

    return NextResponse.json({
      ok: true,
      requestId,
      strategy_summary: data.items, // We send the parsed items under the same generic key WizardShell expects
    });

  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "UNKNOWN_ERROR";
    console.error("[weekly-strategy][POST] error:", msg, err?.stack ?? err);
    return NextResponse.json({ ok: false, requestId, error: "UNHANDLED", details: msg }, { status: 500 });
  }
}
