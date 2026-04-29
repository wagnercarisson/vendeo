--
-- PostgreSQL database dump
--

\restrict JsvVKw3P4pFDMktH726Gyt4EVofxLJ678zHdvm0HsscBaFvNsadsKRDd9HnUI6d

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";

--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$

BEGIN

  INSERT INTO public.profiles (id, email)

  VALUES (new.id, new.email);

  RETURN new;

END;

$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$

BEGIN

    NEW.updated_at = now();

    RETURN NEW;

END;

$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";

--
-- Name: save_store_with_branches("uuid", "jsonb", "jsonb"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."save_store_with_branches"("p_store_id" "uuid", "p_store_data" "jsonb", "p_branches" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$

DECLARE

    v_branch jsonb;

    v_branch_id uuid;

    v_auth_uid uuid := auth.uid();

BEGIN

    -- SEGURAN├çA: Verificar se o usu├írio autenticado ├® o dono da loja (ou se ├® uma nova loja para si mesmo)

    IF p_store_id IS NOT NULL THEN

        -- Caso de atualiza├º├úo: o usu├írio deve ser dono da loja p_store_id

        IF NOT EXISTS (SELECT 1 FROM public.stores WHERE id = p_store_id AND owner_user_id = v_auth_uid) THEN

            RAISE EXCEPTION 'Acesso negado: Voc├¬ n├úo possui permiss├úo para editar esta loja.';

        END IF;

    ELSE

        -- Caso de nova loja: o owner_user_id no payload deve ser o do usu├írio autenticado

        IF (p_store_data->>'owner_user_id')::uuid <> v_auth_uid THEN

            RAISE EXCEPTION 'Acesso negado: O ID do propriet├írio n├úo coincide com o usu├írio autenticado.';

        END IF;

    END IF;

    -- 1. Criar ou Atualizar dados da loja (Resiliente a conflitos de dono)

    INSERT INTO public.stores (

        owner_user_id, name, city, state, logo_url, main_segment, 

        brand_positioning, tone_of_voice, address, neighborhood, 

        phone, whatsapp, instagram, primary_color, secondary_color

    ) VALUES (

        (p_store_data->>'owner_user_id')::uuid,

        p_store_data->>'name',

        p_store_data->>'city',

        p_store_data->>'state',

        p_store_data->>'logo_url',

        p_store_data->>'main_segment',

        p_store_data->>'brand_positioning',

        p_store_data->>'tone_of_voice',

        p_store_data->>'address',

        p_store_data->>'neighborhood',

        p_store_data->>'phone',

        p_store_data->>'whatsapp',

        p_store_data->>'instagram',

        p_store_data->>'primary_color',

        p_store_data->>'secondary_color'

    ) 

    ON CONFLICT (owner_user_id) DO UPDATE SET

        name = EXCLUDED.name,

        city = EXCLUDED.city,

        state = EXCLUDED.state,

        logo_url = EXCLUDED.logo_url,

        main_segment = EXCLUDED.main_segment,

        brand_positioning = EXCLUDED.brand_positioning,

        tone_of_voice = EXCLUDED.tone_of_voice,

        address = EXCLUDED.address,

        neighborhood = EXCLUDED.neighborhood,

        phone = EXCLUDED.phone,

        whatsapp = EXCLUDED.whatsapp,

        instagram = EXCLUDED.instagram,

        primary_color = EXCLUDED.primary_color,

        secondary_color = EXCLUDED.secondary_color,

        updated_at = now()

    RETURNING id INTO p_store_id;

    -- 2. Sincronizar filiais

    FOR v_branch IN SELECT * FROM jsonb_array_elements(p_branches)

    LOOP

        v_branch_id := (v_branch->>'id')::uuid;

        

        IF v_branch_id IS NULL THEN

            INSERT INTO public.store_branches (

                store_id, name, address, neighborhood, city, state, whatsapp, is_main, is_active

            ) VALUES (

                p_store_id, v_branch->>'name', v_branch->>'address', v_branch->>'neighborhood',

                v_branch->>'city', v_branch->>'state', v_branch->>'whatsapp',

                COALESCE((v_branch->>'is_main')::boolean, false),

                COALESCE((v_branch->>'is_active')::boolean, true)

            );

        ELSE

            INSERT INTO public.store_branches (

                id, store_id, name, address, neighborhood, city, state, whatsapp, is_main, is_active, updated_at

            ) VALUES (

                v_branch_id, p_store_id, v_branch->>'name', v_branch->>'address', v_branch->>'neighborhood',

                v_branch->>'city', v_branch->>'state', v_branch->>'whatsapp',

                COALESCE((v_branch->>'is_main')::boolean, false),

                COALESCE((v_branch->>'is_active')::boolean, true),

                now()

            )

            ON CONFLICT (id) DO UPDATE SET

                name = EXCLUDED.name, address = EXCLUDED.address, neighborhood = EXCLUDED.neighborhood,

                city = EXCLUDED.city, state = EXCLUDED.state, whatsapp = EXCLUDED.whatsapp,

                is_main = EXCLUDED.is_main, is_active = EXCLUDED.is_active, updated_at = now();

        END IF;

    END LOOP;

    -- 3. Inativar filiais n├úo enviadas

    UPDATE public.store_branches

    SET is_active = false

    WHERE store_id = p_store_id 

      AND id NOT IN (

          SELECT (elem->>'id')::uuid 

          FROM jsonb_array_elements(p_branches) elem 

          WHERE elem->>'id' IS NOT NULL

      );

END;

$$;


ALTER FUNCTION "public"."save_store_with_branches"("p_store_id" "uuid", "p_store_data" "jsonb", "p_branches" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: campaign_approved_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."campaign_approved_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "store_id" "uuid" NOT NULL,
    "asset_kind" "text" NOT NULL,
    "approval_status" "text" DEFAULT 'approved'::"text" NOT NULL,
    "approved_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "approved_by" "uuid",
    "storage_bucket" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "public_url_legacy" "text",
    "generation_source" "text" NOT NULL,
    "campaign_snapshot" "jsonb" NOT NULL,
    "visual_snapshot" "jsonb",
    "brand_profile_version" integer,
    "brand_profile_snapshot" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "campaign_approved_assets_approval_status_check" CHECK (("approval_status" = ANY (ARRAY['approved'::"text", 'superseded'::"text"]))),
    CONSTRAINT "campaign_approved_assets_asset_kind_check" CHECK (("asset_kind" = ANY (ARRAY['post_image'::"text", 'reels_cover'::"text", 'reels_video'::"text"])))
);


ALTER TABLE "public"."campaign_approved_assets" OWNER TO "postgres";

--
-- Name: campaign_branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."campaign_branches" (
    "campaign_id" "uuid" NOT NULL,
    "branch_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."campaign_branches" OWNER TO "postgres";

--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "store_id" "uuid" NOT NULL,
    "product_name" "text" NOT NULL,
    "price" numeric,
    "audience" "text",
    "objective" "text",
    "image_url" "text",
    "headline" "text",
    "body_text" "text",
    "cta" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "ai_text" "text",
    "ai_caption" "text",
    "ai_hashtags" "text",
    "ai_cta" "text",
    "ai_generated_at" timestamp with time zone,
    "reels_hook" "text",
    "reels_script" "text",
    "reels_shotlist" "jsonb",
    "reels_on_screen_text" "jsonb",
    "reels_audio_suggestion" "text",
    "reels_duration_seconds" integer,
    "reels_caption" "text",
    "reels_cta" "text",
    "reels_hashtags" "text",
    "reels_generated_at" timestamp with time zone,
    "product_positioning" "text",
    "description" "text",
    "content_type" "text" DEFAULT 'product'::"text",
    "product_image_url" "text",
    "origin" "text" DEFAULT 'manual'::"text" NOT NULL,
    "weekly_plan_item_id" "uuid",
    "campaign_type" "text" DEFAULT 'both'::"text" NOT NULL,
    "post_status" "text" DEFAULT 'none'::"text" NOT NULL,
    "reels_status" "text" DEFAULT 'none'::"text" NOT NULL,
    "price_label" "text",
    "brand_dna_snapshot" "jsonb",
    "layout_snapshot" "jsonb",
    "layout_suggestion" "jsonb",
    "domain_input" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "domain_input_version" integer DEFAULT 1 NOT NULL,
    "legacy_content_type" "text",
    "visual_signature_id" "uuid",
    "visual_context" "text" DEFAULT 'standard'::"text",
    CONSTRAINT "campaigns_campaign_type_check" CHECK (("campaign_type" = ANY (ARRAY['post'::"text", 'reels'::"text", 'both'::"text"]))),
    CONSTRAINT "campaigns_content_type_check" CHECK (("content_type" = ANY (ARRAY['product'::"text", 'service'::"text", 'info'::"text"]))),
    CONSTRAINT "campaigns_objective_check" CHECK ((("objective" IS NULL) OR ("objective" = ANY (ARRAY['promocao'::"text", 'novidade'::"text", 'queima'::"text", 'sazonal'::"text", 'reposicao'::"text", 'combo'::"text", 'engajamento'::"text", 'visitas'::"text", 'informativo'::"text", 'institucional'::"text", 'autoridade'::"text"])))),
    CONSTRAINT "campaigns_origin_check" CHECK (("origin" = ANY (ARRAY['manual'::"text", 'plan'::"text"]))),
    CONSTRAINT "campaigns_plan_origin_requires_item_check" CHECK (((("origin" = 'manual'::"text") AND ("weekly_plan_item_id" IS NULL)) OR (("origin" = 'plan'::"text") AND ("weekly_plan_item_id" IS NOT NULL)))),
    CONSTRAINT "campaigns_post_status_check" CHECK (("post_status" = ANY (ARRAY['none'::"text", 'draft'::"text", 'ready'::"text", 'approved'::"text"]))),
    CONSTRAINT "campaigns_reels_status_check" CHECK (("reels_status" = ANY (ARRAY['none'::"text", 'draft'::"text", 'ready'::"text", 'approved'::"text"]))),
    CONSTRAINT "campaigns_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'ready'::"text", 'approved'::"text"]))),
    CONSTRAINT "campaigns_visual_context_check" CHECK (("visual_context" = ANY (ARRAY['standard'::"text", 'promotional'::"text", 'seasonal'::"text", 'premium'::"text", 'urgency'::"text"])))
);


ALTER TABLE "public"."campaigns" OWNER TO "postgres";

--
-- Name: COLUMN "campaigns"."price_label"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."campaigns"."price_label" IS 'R├│tulo personalizado para o badge de pre├ºo (Ex: NOVIDADE, LAN├çAMENTO)';


--
-- Name: COLUMN "campaigns"."brand_dna_snapshot"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."campaigns"."brand_dna_snapshot" IS 'C├│pia imut├ível do DNA da loja no momento da gera├º├úo do conte├║do.';


--
-- Name: COLUMN "campaigns"."layout_snapshot"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."campaigns"."layout_snapshot" IS 'Configura├º├úo t├®cnica do layout utilizado (Geometria e Vers├úo) no momento da gera├º├úo.';


--
-- Name: COLUMN "campaigns"."layout_suggestion"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."campaigns"."layout_suggestion" IS 'Telemetria do Visual Intent Resolver: sugest├úo de layout exibida ao usu├írio + sinal de aceita├º├úo/rejei├º├úo impl├¡cita. NULL quando n├úo havia sugest├úo ativa.';


--
-- Name: COLUMN "campaigns"."visual_signature_id"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."campaigns"."visual_signature_id" IS 'Reference to the visual signature used for this campaign (optional during migration)';


--
-- Name: COLUMN "campaigns"."visual_context"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."campaigns"."visual_context" IS 'Visual context type for this campaign (determines which profile to use)';


--
-- Name: feedback_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."feedback_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "store_id" "uuid" NOT NULL,
    "page_path" "text",
    "step" "text",
    "attempt" "text",
    "result" "text",
    "would_help_sales" "text",
    "improvement" "text",
    "would_post" "text",
    "reason_not_post" "text",
    "score" integer,
    "allow_contact" boolean DEFAULT false,
    "user_agent" "text",
    "campaign_id" "uuid",
    CONSTRAINT "feedback_messages_score_check" CHECK ((("score" >= 0) AND ("score" <= 10)))
);


ALTER TABLE "public"."feedback_messages" OWNER TO "postgres";

--
-- Name: generation_feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."generation_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "store_id" "uuid" NOT NULL,
    "campaign_id" "uuid",
    "weekly_plan_id" "uuid",
    "page_path" "text",
    "content_type" "text" NOT NULL,
    "vote" "text" NOT NULL,
    "reason" "text",
    "would_post" "text",
    "user_agent" "text",
    CONSTRAINT "generation_feedback_content_type_check" CHECK (("content_type" = ANY (ARRAY['campaign'::"text", 'reels'::"text", 'weekly_plan'::"text", 'weekly_strategy'::"text"]))),
    CONSTRAINT "generation_feedback_vote_check" CHECK (("vote" = ANY (ARRAY['yes'::"text", 'maybe'::"text", 'no'::"text"])))
);


ALTER TABLE "public"."generation_feedback" OWNER TO "postgres";

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "is_admin" boolean DEFAULT false,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";

--
-- Name: store_branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."store_branches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "store_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "neighborhood" "text",
    "city" "text",
    "state" "text",
    "whatsapp" "text",
    "is_main" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "store_branches_name_not_empty" CHECK (("length"(TRIM(BOTH FROM "name")) > 0))
);


ALTER TABLE "public"."store_branches" OWNER TO "postgres";

--
-- Name: CONSTRAINT "store_branches_name_not_empty" ON "store_branches"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT "store_branches_name_not_empty" ON "public"."store_branches" IS 'Impede o salvamento de unidades sem nome ou apenas com espa├ºos.';


--
-- Name: store_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."store_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "store_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'owner'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."store_members" OWNER TO "postgres";

--
-- Name: stores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."stores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "city" "text",
    "state" "text",
    "logo_url" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "brand_positioning" "text",
    "main_segment" "text",
    "tone_of_voice" "text",
    "address" "text",
    "neighborhood" "text",
    "phone" "text",
    "whatsapp" "text",
    "instagram" "text",
    "primary_color" "text",
    "secondary_color" "text",
    "owner_user_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "brand_profile" "jsonb",
    "brand_profile_version" integer DEFAULT 1 NOT NULL,
    "brand_profile_updated_at" timestamp with time zone
);


ALTER TABLE "public"."stores" OWNER TO "postgres";

--
-- Name: v_campaign_time_to_first_useful; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."v_campaign_time_to_first_useful" WITH ("security_invoker"='true') AS
 WITH "first_useful" AS (
         SELECT "generation_feedback"."campaign_id",
            "min"("generation_feedback"."created_at") AS "first_useful_at"
           FROM "public"."generation_feedback"
          WHERE (("generation_feedback"."content_type" = 'campaign'::"text") AND ("generation_feedback"."vote" = 'yes'::"text") AND ("generation_feedback"."campaign_id" IS NOT NULL))
          GROUP BY "generation_feedback"."campaign_id"
        )
 SELECT "c"."id" AS "campaign_id",
    "c"."store_id",
    "c"."created_at" AS "campaign_created_at",
    "fu"."first_useful_at" AS "first_useful_feedback_at",
    (EXTRACT(epoch FROM ("fu"."first_useful_at" - ("c"."created_at")::timestamp with time zone)))::bigint AS "seconds_to_first_useful",
    "round"((EXTRACT(epoch FROM ("fu"."first_useful_at" - ("c"."created_at")::timestamp with time zone)) / 60.0), 2) AS "minutes_to_first_useful",
    "round"((EXTRACT(epoch FROM ("fu"."first_useful_at" - ("c"."created_at")::timestamp with time zone)) / 3600.0), 2) AS "hours_to_first_useful"
   FROM ("public"."campaigns" "c"
     JOIN "first_useful" "fu" ON (("c"."id" = "fu"."campaign_id")));


ALTER VIEW "public"."v_campaign_time_to_first_useful" OWNER TO "postgres";

--
-- Name: v_store_campaign_usefulness_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."v_store_campaign_usefulness_summary" WITH ("security_invoker"='true') AS
 SELECT "store_id",
    "count"(*) AS "useful_campaigns",
    "round"("avg"("minutes_to_first_useful"), 2) AS "avg_minutes_to_first_useful",
    "round"("min"("minutes_to_first_useful"), 2) AS "best_minutes_to_first_useful",
    "round"("max"("minutes_to_first_useful"), 2) AS "worst_minutes_to_first_useful"
   FROM "public"."v_campaign_time_to_first_useful"
  GROUP BY "store_id";


ALTER VIEW "public"."v_store_campaign_usefulness_summary" OWNER TO "postgres";

--
-- Name: visual_preference_learned; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."visual_preference_learned" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "store_id" "uuid" NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "consolidated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "signal_origin" "jsonb" NOT NULL,
    "preference" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."visual_preference_learned" OWNER TO "postgres";

--
-- Name: visual_reader_cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."visual_reader_cache" (
    "cache_key" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "product_name" "text" NOT NULL,
    "content_type" "text" NOT NULL,
    "profile" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "visual_reader_cache_content_type_check" CHECK (("content_type" = ANY (ARRAY['product'::"text", 'service'::"text", 'message'::"text"])))
);


ALTER TABLE "public"."visual_reader_cache" OWNER TO "postgres";

--
-- Name: visual_signature_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."visual_signature_profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "signature_id" "uuid" NOT NULL,
    "context_type" "text" NOT NULL,
    "composition_rules" "jsonb" DEFAULT '{}'::"jsonb",
    "typography_rules" "jsonb" DEFAULT '{}'::"jsonb",
    "color_rules" "jsonb" DEFAULT '{}'::"jsonb",
    "intensity_level" "text" DEFAULT 'balanced'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "visual_signature_profiles_context_check" CHECK (("context_type" = ANY (ARRAY['standard'::"text", 'promotional'::"text", 'seasonal'::"text", 'premium'::"text", 'urgency'::"text"]))),
    CONSTRAINT "visual_signature_profiles_intensity_check" CHECK (("intensity_level" = ANY (ARRAY['minimal'::"text", 'balanced'::"text", 'strong'::"text"])))
);


ALTER TABLE "public"."visual_signature_profiles" OWNER TO "postgres";

--
-- Name: TABLE "visual_signature_profiles"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE "public"."visual_signature_profiles" IS 'Context-specific visual rules that adapt core signature to different campaign types';


--
-- Name: COLUMN "visual_signature_profiles"."context_type"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."visual_signature_profiles"."context_type" IS 'Campaign context: standard (daily), promotional (sales), seasonal (dates), premium (high-end), urgency (limited time)';


--
-- Name: COLUMN "visual_signature_profiles"."composition_rules"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."visual_signature_profiles"."composition_rules" IS 'Layout and composition preferences: {layoutStyle, spacing, hierarchy, etc}';


--
-- Name: COLUMN "visual_signature_profiles"."typography_rules"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."visual_signature_profiles"."typography_rules" IS 'Text styling rules: {titleSize, bodySize, weights, alignment, etc}';


--
-- Name: COLUMN "visual_signature_profiles"."color_rules"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."visual_signature_profiles"."color_rules" IS 'Color adaptation rules: {accentColors, backgrounds, overlays, gradients, etc}';


--
-- Name: COLUMN "visual_signature_profiles"."intensity_level"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."visual_signature_profiles"."intensity_level" IS 'Visual intensity: minimal (clean), balanced (standard), strong (aggressive)';


--
-- Name: visual_signatures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."visual_signatures" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "store_id" "uuid" NOT NULL,
    "primary_color" "text" DEFAULT '#6366f1'::"text" NOT NULL,
    "secondary_color" "text" DEFAULT '#8b5cf6'::"text" NOT NULL,
    "logo_url" "text",
    "store_name_typography" "jsonb" DEFAULT '{"font": "Sora", "weight": "700"}'::"jsonb",
    "signature_seed" "text" DEFAULT ("extensions"."uuid_generate_v4"())::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."visual_signatures" OWNER TO "postgres";

--
-- Name: TABLE "visual_signatures"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE "public"."visual_signatures" IS 'Core visual identity for each store (fixed attributes, does not vary by campaign context)';


--
-- Name: COLUMN "visual_signatures"."store_name_typography"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."visual_signatures"."store_name_typography" IS 'Typography settings for store name: {font, weight, letterSpacing, etc}';


--
-- Name: COLUMN "visual_signatures"."signature_seed"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."visual_signatures"."signature_seed" IS 'UUID-based seed for generating consistent visual variations across campaigns';


--
-- Name: weekly_plan_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."weekly_plan_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plan_id" "uuid" NOT NULL,
    "day_of_week" integer NOT NULL,
    "content_type" "text" NOT NULL,
    "theme" "text" NOT NULL,
    "recommended_time" "text",
    "campaign_id" "uuid",
    "brief" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "target_content_type" "text",
    "target_domain_input" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    CONSTRAINT "weekly_plan_items_content_type_check" CHECK (("content_type" = ANY (ARRAY['post'::"text", 'reels'::"text"]))),
    CONSTRAINT "weekly_plan_items_day_check" CHECK ((("day_of_week" >= 1) AND ("day_of_week" <= 7))),
    CONSTRAINT "weekly_plan_items_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'ready'::"text", 'approved'::"text"])))
);


ALTER TABLE "public"."weekly_plan_items" OWNER TO "postgres";

--
-- Name: weekly_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."weekly_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "store_id" "uuid" NOT NULL,
    "week_start" "date" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "strategy" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "weekly_plans_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'approved'::"text"]))),
    CONSTRAINT "weekly_plans_week_start_is_monday_check" CHECK ((EXTRACT(isodow FROM "week_start") = (1)::numeric))
);


ALTER TABLE "public"."weekly_plans" OWNER TO "postgres";

--
-- Name: campaign_approved_assets campaign_approved_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."campaign_approved_assets"
    ADD CONSTRAINT "campaign_approved_assets_pkey" PRIMARY KEY ("id");


--
-- Name: campaign_branches campaign_branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."campaign_branches"
    ADD CONSTRAINT "campaign_branches_pkey" PRIMARY KEY ("campaign_id", "branch_id");


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id");


--
-- Name: feedback_messages feedback_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."feedback_messages"
    ADD CONSTRAINT "feedback_messages_pkey" PRIMARY KEY ("id");


--
-- Name: generation_feedback generation_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."generation_feedback"
    ADD CONSTRAINT "generation_feedback_pkey" PRIMARY KEY ("id");


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");


--
-- Name: store_branches store_branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."store_branches"
    ADD CONSTRAINT "store_branches_pkey" PRIMARY KEY ("id");


--
-- Name: store_members store_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."store_members"
    ADD CONSTRAINT "store_members_pkey" PRIMARY KEY ("id");


--
-- Name: store_members store_members_store_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."store_members"
    ADD CONSTRAINT "store_members_store_id_user_id_key" UNIQUE ("store_id", "user_id");


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."stores"
    ADD CONSTRAINT "stores_pkey" PRIMARY KEY ("id");


--
-- Name: visual_preference_learned visual_preference_learned_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."visual_preference_learned"
    ADD CONSTRAINT "visual_preference_learned_pkey" PRIMARY KEY ("id");


--
-- Name: visual_reader_cache visual_reader_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."visual_reader_cache"
    ADD CONSTRAINT "visual_reader_cache_pkey" PRIMARY KEY ("cache_key");


--
-- Name: visual_signature_profiles visual_signature_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."visual_signature_profiles"
    ADD CONSTRAINT "visual_signature_profiles_pkey" PRIMARY KEY ("id");


--
-- Name: visual_signature_profiles visual_signature_profiles_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."visual_signature_profiles"
    ADD CONSTRAINT "visual_signature_profiles_unique" UNIQUE ("signature_id", "context_type");


--
-- Name: visual_signatures visual_signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."visual_signatures"
    ADD CONSTRAINT "visual_signatures_pkey" PRIMARY KEY ("id");


--
-- Name: visual_signatures visual_signatures_store_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."visual_signatures"
    ADD CONSTRAINT "visual_signatures_store_unique" UNIQUE ("store_id");


--
-- Name: weekly_plan_items weekly_plan_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."weekly_plan_items"
    ADD CONSTRAINT "weekly_plan_items_pkey" PRIMARY KEY ("id");


--
-- Name: weekly_plans weekly_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."weekly_plans"
    ADD CONSTRAINT "weekly_plans_pkey" PRIMARY KEY ("id");


--
-- Name: campaigns_origin_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "campaigns_origin_idx" ON "public"."campaigns" USING "btree" ("origin");


--
-- Name: campaigns_store_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "campaigns_store_id_idx" ON "public"."campaigns" USING "btree" ("store_id");


--
-- Name: campaigns_weekly_plan_item_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "campaigns_weekly_plan_item_id_unique" ON "public"."campaigns" USING "btree" ("weekly_plan_item_id") WHERE ("weekly_plan_item_id" IS NOT NULL);


--
-- Name: feedback_messages_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "feedback_messages_created_at_idx" ON "public"."feedback_messages" USING "btree" ("created_at");


--
-- Name: feedback_messages_store_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "feedback_messages_store_id_idx" ON "public"."feedback_messages" USING "btree" ("store_id");


--
-- Name: feedback_messages_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "feedback_messages_user_id_idx" ON "public"."feedback_messages" USING "btree" ("user_id");


--
-- Name: generation_feedback_campaign_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "generation_feedback_campaign_id_idx" ON "public"."generation_feedback" USING "btree" ("campaign_id");


--
-- Name: generation_feedback_campaign_vote_created_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "generation_feedback_campaign_vote_created_idx" ON "public"."generation_feedback" USING "btree" ("campaign_id", "vote", "created_at");


--
-- Name: generation_feedback_content_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "generation_feedback_content_type_idx" ON "public"."generation_feedback" USING "btree" ("content_type");


--
-- Name: generation_feedback_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "generation_feedback_created_at_idx" ON "public"."generation_feedback" USING "btree" ("created_at");


--
-- Name: generation_feedback_store_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "generation_feedback_store_id_idx" ON "public"."generation_feedback" USING "btree" ("store_id");


--
-- Name: generation_feedback_weekly_plan_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "generation_feedback_weekly_plan_id_idx" ON "public"."generation_feedback" USING "btree" ("weekly_plan_id");


--
-- Name: idx_campaign_approved_assets_active_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_campaign_approved_assets_active_lookup" ON "public"."campaign_approved_assets" USING "btree" ("store_id", "campaign_id", "asset_kind") WHERE ("approval_status" = 'approved'::"text");


--
-- Name: idx_campaign_approved_assets_campaign_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_campaign_approved_assets_campaign_id" ON "public"."campaign_approved_assets" USING "btree" ("campaign_id");


--
-- Name: idx_campaign_approved_assets_campaign_kind_approved_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_campaign_approved_assets_campaign_kind_approved_at" ON "public"."campaign_approved_assets" USING "btree" ("campaign_id", "asset_kind", "approved_at" DESC);


--
-- Name: idx_campaign_approved_assets_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_campaign_approved_assets_store_id" ON "public"."campaign_approved_assets" USING "btree" ("store_id");


--
-- Name: idx_campaign_branches_branch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_campaign_branches_branch_id" ON "public"."campaign_branches" USING "btree" ("branch_id");


--
-- Name: idx_campaigns_id_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "idx_campaigns_id_store_id" ON "public"."campaigns" USING "btree" ("id", "store_id");


--
-- Name: idx_campaigns_visual_context; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_campaigns_visual_context" ON "public"."campaigns" USING "btree" ("visual_context");


--
-- Name: idx_campaigns_visual_signature_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_campaigns_visual_signature_id" ON "public"."campaigns" USING "btree" ("visual_signature_id");


--
-- Name: idx_store_branches_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_store_branches_store_id" ON "public"."store_branches" USING "btree" ("store_id");


--
-- Name: idx_visual_preference_learned_store_consolidated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_visual_preference_learned_store_consolidated_at" ON "public"."visual_preference_learned" USING "btree" ("store_id", "consolidated_at" DESC);


--
-- Name: idx_visual_preference_learned_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_visual_preference_learned_store_id" ON "public"."visual_preference_learned" USING "btree" ("store_id");


--
-- Name: idx_visual_reader_cache_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_visual_reader_cache_updated_at" ON "public"."visual_reader_cache" USING "btree" ("updated_at" DESC);


--
-- Name: idx_visual_signature_profiles_context_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_visual_signature_profiles_context_type" ON "public"."visual_signature_profiles" USING "btree" ("context_type");


--
-- Name: idx_visual_signature_profiles_signature_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_visual_signature_profiles_signature_id" ON "public"."visual_signature_profiles" USING "btree" ("signature_id");


--
-- Name: idx_visual_signatures_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_visual_signatures_store_id" ON "public"."visual_signatures" USING "btree" ("store_id");


--
-- Name: store_members_store_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "store_members_store_id_idx" ON "public"."store_members" USING "btree" ("store_id");


--
-- Name: store_members_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "store_members_user_id_idx" ON "public"."store_members" USING "btree" ("user_id");


--
-- Name: stores_owner_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stores_owner_user_id_idx" ON "public"."stores" USING "btree" ("owner_user_id");


--
-- Name: stores_owner_user_id_unique_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "stores_owner_user_id_unique_idx" ON "public"."stores" USING "btree" ("owner_user_id");


--
-- Name: weekly_plan_items_plan_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "weekly_plan_items_plan_idx" ON "public"."weekly_plan_items" USING "btree" ("plan_id");


--
-- Name: weekly_plans_store_week_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "weekly_plans_store_week_unique" ON "public"."weekly_plans" USING "btree" ("store_id", "week_start");


--
-- Name: stores set_stores_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "set_stores_updated_at" BEFORE UPDATE ON "public"."stores" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();


--
-- Name: campaign_approved_assets campaign_approved_assets_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."campaign_approved_assets"
    ADD CONSTRAINT "campaign_approved_assets_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");


--
-- Name: campaign_approved_assets campaign_approved_assets_campaign_store_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."campaign_approved_assets"
    ADD CONSTRAINT "campaign_approved_assets_campaign_store_fkey" FOREIGN KEY ("campaign_id", "store_id") REFERENCES "public"."campaigns"("id", "store_id") ON DELETE CASCADE;


--
-- Name: campaign_approved_assets campaign_approved_assets_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."campaign_approved_assets"
    ADD CONSTRAINT "campaign_approved_assets_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;


--
-- Name: campaign_branches campaign_branches_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."campaign_branches"
    ADD CONSTRAINT "campaign_branches_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."store_branches"("id");


--
-- Name: campaign_branches campaign_branches_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."campaign_branches"
    ADD CONSTRAINT "campaign_branches_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;


--
-- Name: campaigns campaigns_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id");


--
-- Name: campaigns campaigns_visual_signature_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_visual_signature_id_fkey" FOREIGN KEY ("visual_signature_id") REFERENCES "public"."visual_signatures"("id") ON DELETE SET NULL;


--
-- Name: campaigns campaigns_weekly_plan_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_weekly_plan_item_id_fkey" FOREIGN KEY ("weekly_plan_item_id") REFERENCES "public"."weekly_plan_items"("id") ON DELETE SET NULL;


--
-- Name: feedback_messages feedback_messages_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."feedback_messages"
    ADD CONSTRAINT "feedback_messages_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE SET NULL;


--
-- Name: feedback_messages feedback_messages_store_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."feedback_messages"
    ADD CONSTRAINT "feedback_messages_store_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;


--
-- Name: feedback_messages feedback_messages_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."feedback_messages"
    ADD CONSTRAINT "feedback_messages_user_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: generation_feedback generation_feedback_campaign_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."generation_feedback"
    ADD CONSTRAINT "generation_feedback_campaign_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE SET NULL;


--
-- Name: generation_feedback generation_feedback_store_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."generation_feedback"
    ADD CONSTRAINT "generation_feedback_store_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;


--
-- Name: generation_feedback generation_feedback_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."generation_feedback"
    ADD CONSTRAINT "generation_feedback_user_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: generation_feedback generation_feedback_weekly_plan_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."generation_feedback"
    ADD CONSTRAINT "generation_feedback_weekly_plan_fk" FOREIGN KEY ("weekly_plan_id") REFERENCES "public"."weekly_plans"("id") ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: store_branches store_branches_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."store_branches"
    ADD CONSTRAINT "store_branches_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;


--
-- Name: store_members store_members_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."store_members"
    ADD CONSTRAINT "store_members_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;


--
-- Name: store_members store_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."store_members"
    ADD CONSTRAINT "store_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: stores stores_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."stores"
    ADD CONSTRAINT "stores_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: visual_preference_learned visual_preference_learned_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."visual_preference_learned"
    ADD CONSTRAINT "visual_preference_learned_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;


--
-- Name: visual_signature_profiles visual_signature_profiles_signature_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."visual_signature_profiles"
    ADD CONSTRAINT "visual_signature_profiles_signature_id_fkey" FOREIGN KEY ("signature_id") REFERENCES "public"."visual_signatures"("id") ON DELETE CASCADE;


--
-- Name: visual_signatures visual_signatures_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."visual_signatures"
    ADD CONSTRAINT "visual_signatures_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;


--
-- Name: weekly_plan_items weekly_plan_items_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."weekly_plan_items"
    ADD CONSTRAINT "weekly_plan_items_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE SET NULL;


--
-- Name: weekly_plan_items weekly_plan_items_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."weekly_plan_items"
    ADD CONSTRAINT "weekly_plan_items_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."weekly_plans"("id") ON DELETE CASCADE;


--
-- Name: weekly_plans weekly_plans_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."weekly_plans"
    ADD CONSTRAINT "weekly_plans_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;


--
-- Name: feedback_messages Users and Admins can view feedback; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users and Admins can view feedback" ON "public"."feedback_messages" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true))))));


--
-- Name: generation_feedback Users and Admins can view generation feedback; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users and Admins can view generation feedback" ON "public"."generation_feedback" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true))))));


--
-- Name: generation_feedback Users can insert generation feedback; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert generation feedback" ON "public"."generation_feedback" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));


--
-- Name: campaigns Users can manage campaigns of their own stores; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can manage campaigns of their own stores" ON "public"."campaigns" USING ((EXISTS ( SELECT 1
   FROM "public"."stores"
  WHERE (("stores"."id" = "campaigns"."store_id") AND ("stores"."owner_user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stores"
  WHERE (("stores"."id" = "campaigns"."store_id") AND ("stores"."owner_user_id" = "auth"."uid"())))));


--
-- Name: stores Users can manage their own stores; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can manage their own stores" ON "public"."stores" USING (("auth"."uid"() = "owner_user_id")) WITH CHECK (("auth"."uid"() = "owner_user_id"));


--
-- Name: weekly_plan_items Users can manage their own weekly plan items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can manage their own weekly plan items" ON "public"."weekly_plan_items" USING ((EXISTS ( SELECT 1
   FROM ("public"."weekly_plans"
     JOIN "public"."stores" ON (("stores"."id" = "weekly_plans"."store_id")))
  WHERE (("weekly_plans"."id" = "weekly_plan_items"."plan_id") AND ("stores"."owner_user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."weekly_plans"
     JOIN "public"."stores" ON (("stores"."id" = "weekly_plans"."store_id")))
  WHERE (("weekly_plans"."id" = "weekly_plan_items"."plan_id") AND ("stores"."owner_user_id" = "auth"."uid"())))));


--
-- Name: weekly_plans Users can manage their own weekly plans; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can manage their own weekly plans" ON "public"."weekly_plans" USING ((EXISTS ( SELECT 1
   FROM "public"."stores"
  WHERE (("stores"."id" = "weekly_plans"."store_id") AND ("stores"."owner_user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stores"
  WHERE (("stores"."id" = "weekly_plans"."store_id") AND ("stores"."owner_user_id" = "auth"."uid"())))));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));


--
-- Name: campaign_approved_assets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."campaign_approved_assets" ENABLE ROW LEVEL SECURITY;

--
-- Name: campaign_approved_assets campaign_approved_assets_delete_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "campaign_approved_assets_delete_owner" ON "public"."campaign_approved_assets" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "campaign_approved_assets"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: campaign_approved_assets campaign_approved_assets_insert_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "campaign_approved_assets_insert_owner" ON "public"."campaign_approved_assets" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "campaign_approved_assets"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: campaign_approved_assets campaign_approved_assets_select_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "campaign_approved_assets_select_owner" ON "public"."campaign_approved_assets" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "campaign_approved_assets"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: campaign_approved_assets campaign_approved_assets_update_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "campaign_approved_assets_update_owner" ON "public"."campaign_approved_assets" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "campaign_approved_assets"."store_id") AND ("s"."owner_user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "campaign_approved_assets"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: campaign_branches; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."campaign_branches" ENABLE ROW LEVEL SECURITY;

--
-- Name: campaign_branches campaign_branches_delete_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "campaign_branches_delete_owner" ON "public"."campaign_branches" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."campaigns" "c"
     JOIN "public"."stores" "s" ON (("s"."id" = "c"."store_id")))
  WHERE (("c"."id" = "campaign_branches"."campaign_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: campaign_branches campaign_branches_insert_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "campaign_branches_insert_owner" ON "public"."campaign_branches" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."campaigns" "c"
     JOIN "public"."stores" "s" ON (("s"."id" = "c"."store_id")))
  WHERE (("c"."id" = "campaign_branches"."campaign_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: campaign_branches campaign_branches_select_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "campaign_branches_select_owner" ON "public"."campaign_branches" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."campaigns" "c"
     JOIN "public"."stores" "s" ON (("s"."id" = "c"."store_id")))
  WHERE (("c"."id" = "campaign_branches"."campaign_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: campaigns; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."campaigns" ENABLE ROW LEVEL SECURITY;

--
-- Name: campaigns campaigns_delete_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "campaigns_delete_owner" ON "public"."campaigns" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "campaigns"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: campaigns campaigns_insert_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "campaigns_insert_owner" ON "public"."campaigns" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "campaigns"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: campaigns campaigns_select_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "campaigns_select_owner" ON "public"."campaigns" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "campaigns"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: campaigns campaigns_update_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "campaigns_update_owner" ON "public"."campaigns" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "campaigns"."store_id") AND ("s"."owner_user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "campaigns"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: feedback_messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."feedback_messages" ENABLE ROW LEVEL SECURITY;

--
-- Name: generation_feedback; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."generation_feedback" ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: store_branches; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."store_branches" ENABLE ROW LEVEL SECURITY;

--
-- Name: store_branches store_branches_delete_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "store_branches_delete_owner" ON "public"."store_branches" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "store_branches"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: store_branches store_branches_insert_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "store_branches_insert_owner" ON "public"."store_branches" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "store_branches"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: store_branches store_branches_select_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "store_branches_select_owner" ON "public"."store_branches" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "store_branches"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: store_branches store_branches_update_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "store_branches_update_owner" ON "public"."store_branches" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "store_branches"."store_id") AND ("s"."owner_user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "store_branches"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: store_members; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."store_members" ENABLE ROW LEVEL SECURITY;

--
-- Name: store_members store_members_delete_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "store_members_delete_owner" ON "public"."store_members" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "store_members"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: store_members store_members_insert_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "store_members_insert_owner" ON "public"."store_members" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "store_members"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: store_members store_members_select_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "store_members_select_owner" ON "public"."store_members" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "store_members"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: store_members store_members_update_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "store_members_update_owner" ON "public"."store_members" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "store_members"."store_id") AND ("s"."owner_user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "store_members"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: stores; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."stores" ENABLE ROW LEVEL SECURITY;

--
-- Name: stores stores_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "stores_delete_own" ON "public"."stores" FOR DELETE TO "authenticated" USING (("owner_user_id" = "auth"."uid"()));


--
-- Name: stores stores_insert_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "stores_insert_owner" ON "public"."stores" FOR INSERT TO "authenticated" WITH CHECK (("owner_user_id" = "auth"."uid"()));


--
-- Name: stores stores_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "stores_select_own" ON "public"."stores" FOR SELECT TO "authenticated" USING (("owner_user_id" = "auth"."uid"()));


--
-- Name: stores stores_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "stores_update_own" ON "public"."stores" FOR UPDATE TO "authenticated" USING (("owner_user_id" = "auth"."uid"())) WITH CHECK (("owner_user_id" = "auth"."uid"()));


--
-- Name: visual_preference_learned; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."visual_preference_learned" ENABLE ROW LEVEL SECURITY;

--
-- Name: visual_preference_learned visual_preference_learned_insert_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "visual_preference_learned_insert_owner" ON "public"."visual_preference_learned" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "visual_preference_learned"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: visual_preference_learned visual_preference_learned_select_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "visual_preference_learned_select_owner" ON "public"."visual_preference_learned" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "visual_preference_learned"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: visual_preference_learned visual_preference_learned_update_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "visual_preference_learned_update_owner" ON "public"."visual_preference_learned" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "visual_preference_learned"."store_id") AND ("s"."owner_user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "visual_preference_learned"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: visual_reader_cache; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."visual_reader_cache" ENABLE ROW LEVEL SECURITY;

--
-- Name: visual_signature_profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."visual_signature_profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: visual_signatures; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."visual_signatures" ENABLE ROW LEVEL SECURITY;

--
-- Name: weekly_plan_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."weekly_plan_items" ENABLE ROW LEVEL SECURITY;

--
-- Name: weekly_plan_items weekly_plan_items_delete_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "weekly_plan_items_delete_owner" ON "public"."weekly_plan_items" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."weekly_plans" "wp"
     JOIN "public"."stores" "s" ON (("s"."id" = "wp"."store_id")))
  WHERE (("wp"."id" = "weekly_plan_items"."plan_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: weekly_plan_items weekly_plan_items_insert_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "weekly_plan_items_insert_owner" ON "public"."weekly_plan_items" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM ("public"."weekly_plans" "wp"
     JOIN "public"."stores" "s" ON (("s"."id" = "wp"."store_id")))
  WHERE (("wp"."id" = "weekly_plan_items"."plan_id") AND ("s"."owner_user_id" = "auth"."uid"())))) AND (("campaign_id" IS NULL) OR (EXISTS ( SELECT 1
   FROM ("public"."campaigns" "c"
     JOIN "public"."stores" "s2" ON (("s2"."id" = "c"."store_id")))
  WHERE (("c"."id" = "weekly_plan_items"."campaign_id") AND ("s2"."owner_user_id" = "auth"."uid"())))))));


--
-- Name: weekly_plan_items weekly_plan_items_select_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "weekly_plan_items_select_owner" ON "public"."weekly_plan_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."weekly_plans" "wp"
     JOIN "public"."stores" "s" ON (("s"."id" = "wp"."store_id")))
  WHERE (("wp"."id" = "weekly_plan_items"."plan_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: weekly_plan_items weekly_plan_items_update_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "weekly_plan_items_update_owner" ON "public"."weekly_plan_items" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."weekly_plans" "wp"
     JOIN "public"."stores" "s" ON (("s"."id" = "wp"."store_id")))
  WHERE (("wp"."id" = "weekly_plan_items"."plan_id") AND ("s"."owner_user_id" = "auth"."uid"()))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM ("public"."weekly_plans" "wp"
     JOIN "public"."stores" "s" ON (("s"."id" = "wp"."store_id")))
  WHERE (("wp"."id" = "weekly_plan_items"."plan_id") AND ("s"."owner_user_id" = "auth"."uid"())))) AND (("campaign_id" IS NULL) OR (EXISTS ( SELECT 1
   FROM ("public"."campaigns" "c"
     JOIN "public"."stores" "s2" ON (("s2"."id" = "c"."store_id")))
  WHERE (("c"."id" = "weekly_plan_items"."campaign_id") AND ("s2"."owner_user_id" = "auth"."uid"())))))));


--
-- Name: weekly_plans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."weekly_plans" ENABLE ROW LEVEL SECURITY;

--
-- Name: weekly_plans weekly_plans_delete_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "weekly_plans_delete_owner" ON "public"."weekly_plans" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "weekly_plans"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: weekly_plans weekly_plans_insert_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "weekly_plans_insert_owner" ON "public"."weekly_plans" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "weekly_plans"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: weekly_plans weekly_plans_select_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "weekly_plans_select_owner" ON "public"."weekly_plans" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "weekly_plans"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: weekly_plans weekly_plans_update_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "weekly_plans_update_owner" ON "public"."weekly_plans" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "weekly_plans"."store_id") AND ("s"."owner_user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stores" "s"
  WHERE (("s"."id" = "weekly_plans"."store_id") AND ("s"."owner_user_id" = "auth"."uid"())))));


--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: FUNCTION "handle_new_user"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


--
-- Name: FUNCTION "handle_updated_at"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";


--
-- Name: FUNCTION "save_store_with_branches"("p_store_id" "uuid", "p_store_data" "jsonb", "p_branches" "jsonb"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."save_store_with_branches"("p_store_id" "uuid", "p_store_data" "jsonb", "p_branches" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."save_store_with_branches"("p_store_id" "uuid", "p_store_data" "jsonb", "p_branches" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_store_with_branches"("p_store_id" "uuid", "p_store_data" "jsonb", "p_branches" "jsonb") TO "service_role";


--
-- Name: TABLE "campaign_approved_assets"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."campaign_approved_assets" TO "anon";
GRANT ALL ON TABLE "public"."campaign_approved_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_approved_assets" TO "service_role";


--
-- Name: TABLE "campaign_branches"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."campaign_branches" TO "anon";
GRANT ALL ON TABLE "public"."campaign_branches" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_branches" TO "service_role";


--
-- Name: TABLE "campaigns"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."campaigns" TO "anon";
GRANT ALL ON TABLE "public"."campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."campaigns" TO "service_role";


--
-- Name: TABLE "feedback_messages"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."feedback_messages" TO "anon";
GRANT ALL ON TABLE "public"."feedback_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback_messages" TO "service_role";


--
-- Name: TABLE "generation_feedback"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."generation_feedback" TO "anon";
GRANT ALL ON TABLE "public"."generation_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."generation_feedback" TO "service_role";


--
-- Name: TABLE "profiles"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";


--
-- Name: TABLE "store_branches"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."store_branches" TO "anon";
GRANT ALL ON TABLE "public"."store_branches" TO "authenticated";
GRANT ALL ON TABLE "public"."store_branches" TO "service_role";


--
-- Name: TABLE "store_members"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."store_members" TO "anon";
GRANT ALL ON TABLE "public"."store_members" TO "authenticated";
GRANT ALL ON TABLE "public"."store_members" TO "service_role";


--
-- Name: TABLE "stores"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."stores" TO "anon";
GRANT ALL ON TABLE "public"."stores" TO "authenticated";
GRANT ALL ON TABLE "public"."stores" TO "service_role";


--
-- Name: TABLE "v_campaign_time_to_first_useful"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."v_campaign_time_to_first_useful" TO "anon";
GRANT ALL ON TABLE "public"."v_campaign_time_to_first_useful" TO "authenticated";
GRANT ALL ON TABLE "public"."v_campaign_time_to_first_useful" TO "service_role";


--
-- Name: TABLE "v_store_campaign_usefulness_summary"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."v_store_campaign_usefulness_summary" TO "anon";
GRANT ALL ON TABLE "public"."v_store_campaign_usefulness_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."v_store_campaign_usefulness_summary" TO "service_role";


--
-- Name: TABLE "visual_preference_learned"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."visual_preference_learned" TO "anon";
GRANT ALL ON TABLE "public"."visual_preference_learned" TO "authenticated";
GRANT ALL ON TABLE "public"."visual_preference_learned" TO "service_role";


--
-- Name: TABLE "visual_reader_cache"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."visual_reader_cache" TO "anon";
GRANT ALL ON TABLE "public"."visual_reader_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."visual_reader_cache" TO "service_role";


--
-- Name: TABLE "visual_signature_profiles"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."visual_signature_profiles" TO "anon";
GRANT ALL ON TABLE "public"."visual_signature_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."visual_signature_profiles" TO "service_role";


--
-- Name: TABLE "visual_signatures"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."visual_signatures" TO "anon";
GRANT ALL ON TABLE "public"."visual_signatures" TO "authenticated";
GRANT ALL ON TABLE "public"."visual_signatures" TO "service_role";


--
-- Name: TABLE "weekly_plan_items"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."weekly_plan_items" TO "anon";
GRANT ALL ON TABLE "public"."weekly_plan_items" TO "authenticated";
GRANT ALL ON TABLE "public"."weekly_plan_items" TO "service_role";


--
-- Name: TABLE "weekly_plans"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."weekly_plans" TO "anon";
GRANT ALL ON TABLE "public"."weekly_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."weekly_plans" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


--
-- PostgreSQL database dump complete
--

\unrestrict JsvVKw3P4pFDMktH726Gyt4EVofxLJ678zHdvm0HsscBaFvNsadsKRDd9HnUI6d

