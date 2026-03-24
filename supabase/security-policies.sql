-- ==========================================
-- ENDURECIMENTO DE SEGURANÇA (RLS) - VENDEO
-- ==========================================

-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plan_items ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para a tabela STORES
-- O usuário só pode ver/editar suas próprias lojas
DROP POLICY IF EXISTS "Users can manage their own stores" ON stores;
CREATE POLICY "Users can manage their own stores" ON stores
    FOR ALL
    USING (auth.uid() = owner_user_id)
    WITH CHECK (auth.uid() = owner_user_id);

-- 3. Políticas para a tabela CAMPAIGNS
-- O usuário só pode gerenciar campanhas de lojas que ele possui
DROP POLICY IF EXISTS "Users can manage campaigns of their own stores" ON campaigns;
CREATE POLICY "Users can manage campaigns of their own stores" ON campaigns
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = campaigns.store_id 
            AND stores.owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = campaigns.store_id 
            AND stores.owner_user_id = auth.uid()
        )
    );

-- 4. Políticas para a tabela WEEKLY_PLANS
-- O usuário só pode gerenciar planos de suas lojas
DROP POLICY IF EXISTS "Users can manage their own weekly plans" ON weekly_plans;
CREATE POLICY "Users can manage their own weekly plans" ON weekly_plans
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = weekly_plans.store_id 
            AND stores.owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = weekly_plans.store_id 
            AND stores.owner_user_id = auth.uid()
        )
    );

-- 5. Políticas para a tabela WEEKLY_PLAN_ITEMS
-- O usuário só pode gerenciar itens de planos que ele possui (via vinculação com a loja)
DROP POLICY IF EXISTS "Users can manage their own weekly plan items" ON weekly_plan_items;
CREATE POLICY "Users can manage their own weekly plan items" ON weekly_plan_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM weekly_plans
            JOIN stores ON stores.id = weekly_plans.store_id
            WHERE weekly_plans.id = weekly_plan_items.plan_id
            AND stores.owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM weekly_plans
            JOIN stores ON stores.id = weekly_plans.store_id
            WHERE weekly_plans.id = weekly_plan_items.plan_id
            AND stores.owner_user_id = auth.uid()
        )
    );
