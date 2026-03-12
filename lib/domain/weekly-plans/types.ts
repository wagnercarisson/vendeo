/** Brief detalhado de um item do plano. */
export interface WeeklyPlanItemBrief {
  angle: string;
  hook_hint: string;
  cta_hint: string;
  audience: string;
  objective: string;
  product_positioning: string;
}

/** Item de planejamento semanal. */
export interface WeeklyPlanItem {
  id: string;
  plan_id: string;
  day_of_week: number;
  content_type: "post" | "reels";
  theme: string | null;
  recommended_time: string | null;
  campaign_id: string | null;
  brief: WeeklyPlanItemBrief | null;
  created_at: string;
}

/** Estratégia completa salva no plano. */
export interface WeeklyPlanStrategy {
  strategy_summary: string;
  items: StrategyItem[];
  store_snapshot?: Record<string, unknown>;
}

/** Plano semanal (cabeçalho). */
export interface WeeklyPlan {
  id: string;
  store_id: string;
  week_start: string;
  status: string;
  strategy: WeeklyPlanStrategy | null;
  created_at: string;
}

/** Item de estratégia gerado pela IA ou enviado pelo usuário. */
export interface StrategyItem {
  day_of_week: number;
  audience: string;
  objective: string;
  positioning: string;
  content_type: "post" | "reels";
  reasoning: string;
}

/** Previsão do tempo simplificada. */
export interface WeatherData {
  cityName: string;
  temp: number;
  condition: string;
  forecast: Array<{
    weekday: string;
    date: string;
    description: string;
    max: number;
    min: number;
  }>;
}
