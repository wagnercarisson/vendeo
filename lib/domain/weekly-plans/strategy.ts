import { supabaseAdmin } from "@/lib/supabase/admin";
import { callAI } from "@/lib/ai/parse";
import { buildWeeklyStrategyPrompt } from "./prompts";
import { normalizeStrategyItems } from "./mapper";
import { WeatherData, StrategyItem, WeeklyPlanItemBrief } from "./types";

interface PastPlan {
  id: string;
  week_start: string;
  items: Array<{
    day_of_week: number;
    brief: WeeklyPlanItemBrief | null | Record<string, any>;
  }>;
}

// ─── Weather helper ───────────────────────────────────────────────────────────

/** Busca previsão do tempo via HG Brasil. Retorna null em caso de falha. */
export async function fetchWeather(
  city: string,
  state?: string
): Promise<WeatherData | null> {
  if (!city || city.trim() === "") return null;
  try {
    const query = state ? `${city},${state}` : city;
    const res = await fetch(
      `https://api.hgbrasil.com/weather?format=json-cors&city_name=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    if (!data?.results || data.by !== "city_name") return null;

    return {
      cityName: data.results.city,
      temp: data.results.temp,
      condition: data.results.description,
      forecast: data.results.forecast.slice(0, 5),
    };
  } catch {
    return null;
  }
}

// ─── Strategy generation pipeline ─────────────────────────────────────────────

export interface GenerateWeeklyStrategyInput {
  storeId: string;
  weekStart?: string;
  selectedDays?: number[];
  city: string;
  state: string;
  holidays: Array<{ date: string; name: string }>;
}

export type GenerateWeeklyStrategyResult =
  | { ok: true; strategyItems: StrategyItem[] }
  | { ok: false; error: string; status: number };

/**
 * Pipeline de geração de estratégia semanal:
 * fetch store → fetch history → fetch weather → build prompt → AI → normalize → return
 */
export async function generateWeeklyStrategy(
  input: GenerateWeeklyStrategyInput
): Promise<GenerateWeeklyStrategyResult> {
  const { storeId, selectedDays, holidays, city, state } = input;

  // 1) Busca contexto da loja
  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("name, city, state, brand_positioning, main_segment, tone_of_voice")
    .eq("id", storeId)
    .single();

  if (!store) {
    return { ok: false, error: "STORE_NOT_FOUND", status: 404 };
  }

  const daysToGenerate =
    selectedDays && selectedDays.length > 0 ? selectedDays : [1, 3, 5, 6];

  // 2) Busca histórico recente dos últimos 2 planos
  const { data: pastPlans } = await supabaseAdmin
    .from("weekly_plans")
    .select(`id, week_start, items:weekly_plan_items(day_of_week, brief)`)
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(2) as { data: PastPlan[] | null };

  // 3) Busca clima
  const weather = await fetchWeather(city || store.city, state || store.state);

  // 4) Monta prompt
  const prompt = buildWeeklyStrategyPrompt({
    store,
    days: daysToGenerate,
    weather,
    holidays,
    history: pastPlans ?? [],
  });

  // 5) Chama IA
  const raw = await callAI(
    [
      { role: "system", content: "You respond strictly in pure JSON format adhering to the structure given." },
      { role: "user", content: prompt },
    ],
    { temperature: 0.7 }
  );

  // 6) Parse e normaliza
  let parsed: { items?: unknown[] } | null = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }

  const strategyItems = normalizeStrategyItems(parsed?.items ?? []);

  return { ok: true, strategyItems };
}
