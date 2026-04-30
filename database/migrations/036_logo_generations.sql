-- Migration 036: Logo Generations Tracking
-- Story 3: Logo IA - DALL-E 3
-- Purpose: Track logo generation requests for rate limiting and cost analytics

BEGIN;

-- Table: logo_generations
-- Tracks each logo generation request for rate limiting (5/hour) and cost monitoring
CREATE TABLE IF NOT EXISTS logo_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prompt_used TEXT NOT NULL,
  cost_usd DECIMAL(5,2) NOT NULL CHECK (cost_usd >= 0),
  selected_logo_url TEXT, -- NULL until user selects a logo
  
  CONSTRAINT fk_logo_generations_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- Index: Rate limit queries (last hour for specific store)
CREATE INDEX IF NOT EXISTS idx_logo_generations_store_recent 
  ON logo_generations(store_id, generated_at DESC);

-- Index: Cost analytics (monthly aggregation)
CREATE INDEX IF NOT EXISTS idx_logo_generations_cost_analytics
  ON logo_generations(generated_at DESC, cost_usd);

-- RLS: Enable row level security
ALTER TABLE logo_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own store's logo generations
CREATE POLICY logo_generations_select_own_store
  ON logo_generations
  FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_user_id = auth.uid()
    )
  );

-- RLS Policy: Service role can insert (used by API)
CREATE POLICY logo_generations_insert_service_role
  ON logo_generations
  FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway

-- Comments
COMMENT ON TABLE logo_generations IS 'Tracks DALL-E 3 logo generation requests for rate limiting (5/hour per store) and cost monitoring ($0.04/image)';
COMMENT ON COLUMN logo_generations.prompt_used IS 'Full DALL-E 3 prompt used (from lib/ai/logo-prompts.ts templates)';
COMMENT ON COLUMN logo_generations.cost_usd IS 'Generation cost: $0.04 per image, typically $0.12 for 3 suggestions';
COMMENT ON COLUMN logo_generations.selected_logo_url IS 'URL of logo user selected (NULL if generation was abandoned)';

COMMIT;
