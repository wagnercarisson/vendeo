-- =============================================
-- VENDEO — MIGRATION 018 (CLEAN VERSION)
-- Descrição: Refatoração relacional de filiais e RPC de salvamento
-- Data: 2026-04-03
-- =============================================

-- 1. CRIAR TABELA DE FILIAIS (store_branches)
CREATE TABLE IF NOT EXISTS public.store_branches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name text NOT NULL,
    address text,
    neighborhood text,
    city text,
    state text,
    whatsapp text,
    is_main boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_store_branches_store_id ON public.store_branches(store_id);

-- 2. ATUALIZAR TABELA DE CAMPANHAS (campaigns)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='campaigns' AND column_name='info_subtype') THEN
        ALTER TABLE public.campaigns ADD COLUMN info_subtype text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='campaigns' AND column_name='branch_scope') THEN
        ALTER TABLE public.campaigns ADD COLUMN branch_scope text NOT NULL DEFAULT 'store_wide';
    END IF;
END $$;

-- 3. CRIAR TABELA PIVÔ DE VÍNCULO (campaign_branches)
CREATE TABLE IF NOT EXISTS public.campaign_branches (
    campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    branch_id uuid NOT NULL REFERENCES public.store_branches(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (campaign_id, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_branches_branch_id ON public.campaign_branches(branch_id);

-- 4. IMPLEMENTAR RPC save_store_with_branches
CREATE OR REPLACE FUNCTION public.save_store_with_branches(
    p_store_id uuid,
    p_store_data jsonb,
    p_branches jsonb -- Array de objetos de filial
) RETURNS void AS $$
DECLARE
    v_branch jsonb;
    v_branch_id uuid;
    v_auth_uid uuid := auth.uid();
BEGIN
    -- SEGURANÇA: Verificar se o usuário autenticado é o dono da loja (ou se é uma nova loja para si mesmo)
    IF p_store_id IS NOT NULL THEN
        -- Caso de atualização: o usuário deve ser dono da loja p_store_id
        IF NOT EXISTS (SELECT 1 FROM public.stores WHERE id = p_store_id AND owner_user_id = v_auth_uid) THEN
            RAISE EXCEPTION 'Acesso negado: Você não possui permissão para editar esta loja.';
        END IF;
    ELSE
        -- Caso de nova loja: o owner_user_id no payload deve ser o do usuário autenticado
        IF (p_store_data->>'owner_user_id')::uuid <> v_auth_uid THEN
            RAISE EXCEPTION 'Acesso negado: O ID do proprietário não coincide com o usuário autenticado.';
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

    -- 3. Inativar filiais não enviadas
    UPDATE public.store_branches
    SET is_active = false
    WHERE store_id = p_store_id 
      AND id NOT IN (
          SELECT (elem->>'id')::uuid 
          FROM jsonb_array_elements(p_branches) elem 
          WHERE elem->>'id' IS NOT NULL
      );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. SEGURANÇA (RLS)

-- Habilitar RLS
ALTER TABLE public.store_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_branches ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas prévias (caso existam)
DROP POLICY IF EXISTS "store_branches_select_owner" ON public.store_branches;
DROP POLICY IF EXISTS "store_branches_insert_owner" ON public.store_branches;
DROP POLICY IF EXISTS "store_branches_update_owner" ON public.store_branches;
DROP POLICY IF EXISTS "store_branches_delete_owner" ON public.store_branches;

DROP POLICY IF EXISTS "campaign_branches_select_owner" ON public.campaign_branches;
DROP POLICY IF EXISTS "campaign_branches_insert_owner" ON public.campaign_branches;
DROP POLICY IF EXISTS "campaign_branches_delete_owner" ON public.campaign_branches;

-- Políticas para store_branches (Isolamento por Dono via tabela stores)
CREATE POLICY "store_branches_select_owner" ON public.store_branches
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_branches.store_id AND s.owner_user_id = auth.uid())
);

CREATE POLICY "store_branches_insert_owner" ON public.store_branches
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_branches.store_id AND s.owner_user_id = auth.uid())
);

CREATE POLICY "store_branches_update_owner" ON public.store_branches
FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_branches.store_id AND s.owner_user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_branches.store_id AND s.owner_user_id = auth.uid())
);

CREATE POLICY "store_branches_delete_owner" ON public.store_branches
FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_branches.store_id AND s.owner_user_id = auth.uid())
);

-- Políticas para campaign_branches (Isolamento por Dono via tabela campaigns/stores)
CREATE POLICY "campaign_branches_select_owner" ON public.campaign_branches
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    JOIN public.stores s ON s.id = c.store_id 
    WHERE c.id = campaign_branches.campaign_id AND s.owner_user_id = auth.uid()
  )
);

CREATE POLICY "campaign_branches_insert_owner" ON public.campaign_branches
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    JOIN public.stores s ON s.id = c.store_id 
    WHERE c.id = campaign_branches.campaign_id AND s.owner_user_id = auth.uid()
  )
);

CREATE POLICY "campaign_branches_delete_owner" ON public.campaign_branches
FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    JOIN public.stores s ON s.id = c.store_id 
    WHERE c.id = campaign_branches.campaign_id AND s.owner_user_id = auth.uid()
  )
);
