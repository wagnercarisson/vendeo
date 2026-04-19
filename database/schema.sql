-- =============================================
-- VENDEO — DATABASE SCHEMA (BETA CONSOLIDATED)
-- Data: 2026-04-19
-- Versão: 1.1 (Motor V2 - Visual Signature System)
-- Encoding: UTF-8
-- =============================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STORES
CREATE TABLE IF NOT EXISTS public.stores (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_user_id uuid NOT NULL,
    name text NOT NULL,
    city text,
    state text,
    logo_url text,
    address text,
    neighborhood text,
    phone text,
    whatsapp text,
    instagram text,
    primary_color text,
    secondary_color text,
    main_segment text,
    brand_positioning text,
    tone_of_voice text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT stores_owner_user_id_unique UNIQUE (owner_user_id)
);

-- 2. VISUAL SIGNATURES (Motor V2)
CREATE TABLE IF NOT EXISTS public.visual_signatures (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    
    -- Core Identity (fixo, não varia por contexto)
    primary_color text NOT NULL DEFAULT '#6366f1',
    secondary_color text NOT NULL DEFAULT '#8b5cf6',
    logo_url text,
    store_name_typography jsonb DEFAULT '{"font": "Sora", "weight": "700"}'::jsonb,
    signature_seed text NOT NULL DEFAULT uuid_generate_v4()::text,
    
    -- Metadados
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    CONSTRAINT visual_signatures_store_unique UNIQUE(store_id)
);

-- 3. VISUAL SIGNATURE PROFILES (Motor V2)
CREATE TABLE IF NOT EXISTS public.visual_signature_profiles (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    signature_id uuid NOT NULL REFERENCES public.visual_signatures(id) ON DELETE CASCADE,
    
    -- Context Type
    context_type text NOT NULL,
    
    -- Visual Rules (JSON flexível para evolução)
    composition_rules jsonb DEFAULT '{}'::jsonb,
    typography_rules jsonb DEFAULT '{}'::jsonb,
    color_rules jsonb DEFAULT '{}'::jsonb,
    intensity_level text DEFAULT 'balanced' NOT NULL,
    
    -- Metadados
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    CONSTRAINT visual_signature_profiles_context_check 
        CHECK (context_type IN ('standard', 'promotional', 'seasonal', 'premium', 'urgency')),
    CONSTRAINT visual_signature_profiles_intensity_check 
        CHECK (intensity_level IN ('minimal', 'balanced', 'strong')),
    CONSTRAINT visual_signature_profiles_unique 
        UNIQUE(signature_id, context_type)
);

-- 4. WEEKLY PLANS
CREATE TABLE IF NOT EXISTS public.weekly_plans (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    week_start date NOT NULL,
    status text DEFAULT 'draft' NOT NULL,
    strategy jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT weekly_plans_status_check CHECK (status IN ('draft', 'approved')),
    CONSTRAINT weekly_plans_week_start_monday_check CHECK (EXTRACT(ISODOW FROM week_start) = 1)
);

-- 5. WEEKLY PLAN ITEMS
CREATE TABLE IF NOT EXISTS public.weekly_plan_items (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    plan_id uuid NOT NULL REFERENCES public.weekly_plans(id) ON DELETE CASCADE,
    day_of_week int NOT NULL,
    content_type text NOT NULL,
    theme text,
    recommended_time text,
    campaign_id uuid, -- Legado/Link auxiliar (vínculo oficial agora é via campaigns.weekly_plan_item_id)
    brief jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'draft' NOT NULL,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT weekly_plan_items_day_check CHECK (day_of_week >= 1 AND day_of_week <= 7),
    CONSTRAINT weekly_plan_items_content_type_check CHECK (content_type IN ('post', 'reels', 'both')),
    CONSTRAINT weekly_plan_items_status_check CHECK (status IN ('draft', 'ready', 'approved'))
);

-- 6. CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.campaigns (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    weekly_plan_item_id uuid REFERENCES public.weekly_plan_items(id) ON DELETE SET NULL,
    origin text DEFAULT 'manual' NOT NULL,
    product_name text,
    price numeric,
    price_label text,
    content_type text DEFAULT 'product' NOT NULL,
    campaign_type text DEFAULT 'both' NOT NULL,
    audience text,
    objective text,
    product_positioning text,
    
    -- Visual Signature (Motor V2)
    visual_signature_id uuid REFERENCES public.visual_signatures(id) ON DELETE SET NULL,
    visual_context text DEFAULT 'standard',
    
    -- Status
    status text DEFAULT 'draft' NOT NULL, -- Status Global
    post_status text DEFAULT 'none' NOT NULL,
    reels_status text DEFAULT 'none' NOT NULL,
    
    -- Conteúdo Arte
    image_url text,
    product_image_url text,
    headline text,
    body_text text,
    cta text,
    ai_text text,
    ai_caption text,
    ai_hashtags text,
    ai_cta text,
    ai_generated_at timestamptz,
    
    -- Conteúdo Reels
    reels_hook text,
    reels_script text,
    reels_shotlist jsonb,
    reels_on_screen_text jsonb,
    reels_audio_suggestion text,
    reels_duration_seconds int,
    reels_caption text,
    reels_cta text,
    reels_hashtags text,
    reels_generated_at timestamptz,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT campaigns_status_check CHECK (status IN ('draft', 'ready', 'approved')),
    CONSTRAINT campaigns_origin_check CHECK (origin IN ('manual', 'plan')),
    CONSTRAINT campaigns_plan_origin_requires_item_check CHECK (
        (origin = 'manual' AND weekly_plan_item_id IS NULL) OR
        (origin = 'plan' AND weekly_plan_item_id IS NOT NULL)
    ),
    CONSTRAINT campaigns_campaign_type_check CHECK (campaign_type IN ('post', 'reels', 'both')),
    CONSTRAINT campaigns_post_status_check CHECK (post_status IN ('none', 'draft', 'ready', 'approved')),
    CONSTRAINT campaigns_reels_status_check CHECK (reels_status IN ('none', 'draft', 'ready', 'approved')),
    CONSTRAINT campaigns_content_type_check CHECK (content_type IN ('product', 'service', 'info')),
    CONSTRAINT campaigns_visual_context_check CHECK (visual_context IN ('standard', 'promotional', 'seasonal', 'premium', 'urgency'))
);

-- 7. AUXILIARY TABLES
CREATE TABLE IF NOT EXISTS public.beta_feedbacks (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    store_id uuid REFERENCES public.stores(id),
    rating int CHECK (rating >= 1 AND rating <= 5),
    comment text,
    category text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campaign_metrics (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    metric_type text NOT NULL, -- 'usefulness', 'regeneration', etc.
    value_text text,
    value_num numeric,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS campaigns_weekly_plan_item_id_idx ON public.campaigns (weekly_plan_item_id);
CREATE UNIQUE INDEX IF NOT EXISTS campaigns_weekly_plan_item_id_unique ON public.campaigns (weekly_plan_item_id) WHERE weekly_plan_item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS campaigns_origin_idx ON public.campaigns (origin);
CREATE INDEX IF NOT EXISTS campaigns_visual_signature_id_idx ON public.campaigns (visual_signature_id);
CREATE INDEX IF NOT EXISTS campaigns_visual_context_idx ON public.campaigns (visual_context);
CREATE INDEX IF NOT EXISTS weekly_plan_items_plan_id_idx ON public.weekly_plan_items (plan_id);
CREATE INDEX IF NOT EXISTS weekly_plans_store_id_idx ON public.weekly_plans (store_id);
CREATE INDEX IF NOT EXISTS visual_signatures_store_id_idx ON public.visual_signatures (store_id);
CREATE INDEX IF NOT EXISTS visual_signature_profiles_signature_id_idx ON public.visual_signature_profiles (signature_id);
CREATE INDEX IF NOT EXISTS visual_signature_profiles_context_type_idx ON public.visual_signature_profiles (context_type);

-- RLS (Exemplos simplificados - ver migrations para políticas completas)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_signature_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;

-- Nota: Políticas de segurança detalhadas devem ser configuradas via console Supabase ou migrations 002+.

-- =============================================
-- MOTOR V2 - VISUAL SIGNATURE SYSTEM
-- =============================================
-- visual_signatures: Core visual identity (cores, logo, tipografia) - fixo por loja
-- visual_signature_profiles: Regras visuais por contexto de campanha
--   - standard: Campanhas diárias normais
--   - promotional: Promoções e descontos
--   - seasonal: Datas especiais (Natal, Black Friday, etc)
--   - premium: Produtos de luxo/coleções especiais
--   - urgency: Ofertas limitadas/contagem regressiva
-- 
-- Migrations: 025-029 (Motor V2 - Schema Clean)
-- Data: 2026-04-19