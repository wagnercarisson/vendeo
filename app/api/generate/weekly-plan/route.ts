import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const PostBodySchema = z.object({
  store_id: z.string().uuid(),
  week_start: z.string().optional(), // YYYY-MM-DD
  force: z.boolean().optional().default(false),
});

const QuerySchema = z.object({
  store_id: z.string().uuid(),
  week_start: z.string().optional(), // YYYY-MM-DD
});

const AIItemSchema = z.object({
  day_of_week: z.number().int().min(1).max(7),
  content_type: z.enum(["post", "reels"]),
  theme: z.string().min(3),
  recommended_time: z.string().min(3), // "19:30"
  campaign: z.object({
    product_name: z.string().min(3),
    price: z.number().nonnegative().optional().nullable(),
    audience: z.string().min(3),
    objective: z.string().min(3),
    product_positioning: z.string().optional().nullable(), // popular|medio|premium|jovem|familia...
  }),
  brief: z.object({
    angle: z.string().min(3), // ângulo/ideia
    hook_hint: z.string().min(3),
    cta_hint: z.string().min(3),
  }),
});

const AIResponseSchema = z.object({
  strategy_summary: z.string().min(10),
  items: z.array(AIItemSchema).length(4),
});

function toISODate(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Week start = Monday (Segunda). We compute in UTC; good enough for MVP.
function getWeekStartMondayISO(today = new Date()) {
  const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const jsDay = d.getUTCDay(); // 0=Sun..6=Sat
  const diffToMonday = (jsDay + 6) % 7; // Monday->0, Tuesday->1, Sunday->6
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return toISODate(d);
}

function parseJsonLoose(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");
    if (first >= 0 && last > first) return JSON.parse(raw.slice(first, last + 1));
    throw new Error("AI_RETURNED_NON_JSON");
  }
}

function uniqueByDay(items: any[]) {
  const seen = new Set<number>();
  for (const it of items) {
    if (seen.has(it.day_of_week)) return false;
    seen.add(it.day_of_week);
  }
  return true;
}

async function fetchPlan(store_id: string, week_start: string) {
  const { data: plan, error: planErr } = await supabaseAdmin
    .from("weekly_plans")
    .select("id, store_id, week_start, status, strategy, created_at")
    .eq("store_id", store_id)
    .eq("week_start", week_start)
    .maybeSingle();

  if (planErr) throw new Error(planErr.message);
  if (!plan) return null;

  const { data: items, error: itemsErr } = await supabaseAdmin
    .from("weekly_plan_items")
    .select("id, plan_id, day_of_week, content_type, theme, recommended_time, campaign_id, brief, created_at")
    .eq("plan_id", plan.id)
    .order("day_of_week", { ascending: true });

  if (itemsErr) throw new Error(itemsErr.message);

  // opcional: carregar campaigns vinculadas
  const campaignIds = (items ?? []).map((i: any) => i.campaign_id).filter(Boolean);
  let campaigns: any[] = [];
  if (campaignIds.length) {
    const { data: cData, error: cErr } = await supabaseAdmin
      .from("campaigns")
      .select("id, store_id, product_name, price, audience, objective, product_positioning, created_at")
      .in("id", campaignIds);

    if (cErr) throw new Error(cErr.message);
    campaigns = (cData as any) ?? [];
  }

  return { plan, items: items ?? [], campaigns };
}

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const url = new URL(req.url);
    const store_id = url.searchParams.get("store_id") ?? "";
    const week_start = url.searchParams.get("week_start") ?? getWeekStartMondayISO();

    const q = QuerySchema.safeParse({ store_id, week_start });
    if (!q.success) {
      return NextResponse.json(
        { ok: false, requestId, error: "INVALID_QUERY", details: q.error.flatten() },
        { status: 400 }
      );
    }

    const result = await fetchPlan(q.data.store_id, q.data.week_start!);
    return NextResponse.json({ ok: true, requestId, exists: !!result, ...result });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "UNKNOWN_ERROR";
    console.error("[weekly-plan][GET] error:", msg, err?.stack ?? err);
    return NextResponse.json({ ok: false, error: "UNHANDLED", details: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const json = await req.json().catch(() => null);
    const body = PostBodySchema.safeParse(json);

    if (!body.success) {
      return NextResponse.json(
        { ok: false, requestId, error: "INVALID_INPUT", details: body.error.flatten() },
        { status: 400 }
      );
    }

    const { store_id, force } = body.data;
    const week_start = (body.data.week_start ?? getWeekStartMondayISO()).trim();

    // 1) Buscar loja (contexto)
    const { data: store, error: sErr } = await supabaseAdmin
      .from("stores")
      .select(
        `
        id, name, city, state,
        brand_positioning, main_segment, tone_of_voice,
        address, neighborhood, phone, whatsapp, instagram,
        primary_color, secondary_color, logo_url
      `
      )
      .eq("id", store_id)
      .single();

    if (sErr || !store) {
      return NextResponse.json(
        { ok: false, requestId, error: "STORE_NOT_FOUND", details: sErr?.message },
        { status: 404 }
      );
    }

    // 2) Idempotência: se já existe e não for force, retorna
    const existing = await fetchPlan(store_id, week_start);
    if (existing && !force) {
      return NextResponse.json({
        ok: true,
        requestId,
        reused: true,
        plan: existing.plan,
        items: existing.items,
        campaigns: existing.campaigns,
      });
    }

    // 3) Se force e existe: limpar itens e campanhas vinculadas (somente as campanhas criadas por este plano)
    // MVP: vamos deletar itens e manter campaigns (não deletar campaigns antigas para evitar acidente)
    if (existing && force) {
      const { error: delItemsErr } = await supabaseAdmin
        .from("weekly_plan_items")
        .delete()
        .eq("plan_id", existing.plan.id);

      if (delItemsErr) throw new Error(delItemsErr.message);
    }

    // 4) Criar/Upsert do plano (garante 1 por semana)
    const { data: upPlan, error: upPlanErr } = await supabaseAdmin
      .from("weekly_plans")
      .upsert(
        {
          store_id,
          week_start,
          status: "generated",
          // strategy preenchida depois
        },
        { onConflict: "store_id,week_start" }
      )
      .select("id, store_id, week_start, status, strategy, created_at")
      .single();

    if (upPlanErr || !upPlan) throw new Error(upPlanErr?.message ?? "FAILED_UPSERT_PLAN");

    // 5) Gerar plano via IA (4 itens)
    const prompt = `
Você é um estrategista de marketing para comércios locais.
Crie um PLANO SEMANAL de 4 conteúdos para a loja abaixo (foco em vendas e recorrência).

LOJA:
- Nome: ${store.name}
- Cidade/UF: ${store.city ?? ""}/${store.state ?? ""}
- Segmento principal: ${store.main_segment ?? "não informado"}
- Posicionamento padrão: ${store.brand_positioning ?? "não informado"}
- Tom de voz: ${store.tone_of_voice ?? "não informado"}

REGRAS:
- Responda SOMENTE com JSON válido (sem markdown).
- Gere exatamente 4 itens em "items".
- Cada item deve ter day_of_week (1=Seg ... 7=Dom), e deve ser ÚNICO (não repetir dia).
- content_type: "post" ou "reels".
- recommended_time: use formato "HH:MM" (24h).
- theme: curto (ex: "Promoção relâmpago", "Produto destaque", "Engajamento", "Combo do fim de semana").
- Em campaign, preencha SEMPRE:
  product_name, audience, objective
  price pode ser null.
  product_positioning pode ser null (ou "popular"/"premium"/"jovem"/"medio"/"familia").
- Em brief: preencha angle, hook_hint, cta_hint.
- A estratégia deve considerar o segmento (ex: bebidas: quinta/sexta/sábado mais forte, horário noturno; boutiques: horários e temas diferentes).

FORMATO OBRIGATÓRIO:
{
  "strategy_summary": "texto curto com a estratégia da semana",
  "items": [
    {
      "day_of_week": 1,
      "content_type": "post",
      "theme": "...",
      "recommended_time": "19:30",
      "campaign": {
        "product_name": "...",
        "price": 0,
        "audience": "...",
        "objective": "...",
        "product_positioning": "..."
      },
      "brief": { "angle": "...", "hook_hint": "...", "cta_hint": "..." }
    }
  ]
}
`;

    const ai1 = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: "Responda somente com JSON válido." },
        { role: "user", content: prompt },
      ],
    });

    const raw1 = ai1.choices?.[0]?.message?.content ?? "";
    const parsed1 = parseJsonLoose(raw1);

    let planAI: z.infer<typeof AIResponseSchema>;
    try {
      planAI = AIResponseSchema.parse(parsed1);
      if (!uniqueByDay(planAI.items)) throw new Error("DUPLICATE_DAY_OF_WEEK");
    } catch (e: any) {
      // Retry de correção
      const fixPrompt = `
O JSON abaixo está inválido ou não atende as regras.
Corrija e devolva SOMENTE o JSON válido no mesmo formato obrigatório.

ERRO:
${safeStringify(e?.issues ?? e?.message ?? e)}

JSON PARA CORRIGIR:
${safeStringify(parsed1)}
`;
      const ai2 = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: "Responda somente com JSON válido." },
          { role: "user", content: fixPrompt },
        ],
      });

      const raw2 = ai2.choices?.[0]?.message?.content ?? "";
      const parsed2 = parseJsonLoose(raw2);
      planAI = AIResponseSchema.parse(parsed2);

      if (!uniqueByDay(planAI.items)) {
        throw new Error("DUPLICATE_DAY_OF_WEEK_AFTER_FIX");
      }
    }

    // 6) Salvar strategy no plano
    const { error: updPlanErr } = await supabaseAdmin
      .from("weekly_plans")
      .update({
        strategy: {
          strategy_summary: planAI.strategy_summary,
          store_snapshot: {
            name: store.name,
            city: store.city,
            state: store.state,
            main_segment: store.main_segment,
            brand_positioning: store.brand_positioning,
            tone_of_voice: store.tone_of_voice,
          },
        },
      })
      .eq("id", upPlan.id);

    if (updPlanErr) throw new Error(updPlanErr.message);

    // 7) Criar campaigns + items
    const createdCampaigns: any[] = [];
    const createdItems: any[] = [];

    for (const it of planAI.items) {
      // campaign row
      const { data: cRow, error: cErr } = await supabaseAdmin
        .from("campaigns")
        .insert({
          store_id: store_id,
          product_name: it.campaign.product_name,
          price: typeof it.campaign.price === "number" ? it.campaign.price : null,
          audience: it.campaign.audience,
          objective: it.campaign.objective,
          product_positioning: it.campaign.product_positioning ?? null,
        })
        .select(`
          id, store_id, product_name, price, audience, objective, product_positioning, created_at,
          ai_caption, ai_text, ai_cta, ai_hashtags,  
          reels_hook, reels_script, reels_shotlist, reels_on_screen_text,
          reels_audio_suggestion, reels_duration_seconds,
          reels_caption, reels_cta, reels_hashtags, reels_generated_at
        `)
        .single();

      if (cErr || !cRow) throw new Error(cErr?.message ?? "FAILED_CREATE_CAMPAIGN");
      createdCampaigns.push(cRow);

      // plan item row
      const { data: iRow, error: iErr } = await supabaseAdmin
        .from("weekly_plan_items")
        .insert({
          plan_id: upPlan.id,
          day_of_week: it.day_of_week,
          content_type: it.content_type,
          theme: it.theme,
          recommended_time: it.recommended_time,
          campaign_id: cRow.id,
          brief: it.brief,
        })
        .select("id, plan_id, day_of_week, content_type, theme, recommended_time, campaign_id, brief, created_at")
        .single();

      if (iErr || !iRow) throw new Error(iErr?.message ?? "FAILED_CREATE_ITEM");
      createdItems.push(iRow);
    }

    // 8) Retornar plano completo
    const final = await fetchPlan(store_id, week_start);

    return NextResponse.json({
      ok: true,
      requestId,
      reused: false,
      plan: final?.plan ?? upPlan,
      items: final?.items ?? createdItems,
      campaigns: final?.campaigns ?? createdCampaigns,
    });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "UNKNOWN_ERROR";
    console.error("[weekly-plan][POST] error:", msg, err?.stack ?? err);
    return NextResponse.json({ ok: false, error: "UNHANDLED", details: msg }, { status: 500 });
  }
}

function safeStringify(v: any) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
