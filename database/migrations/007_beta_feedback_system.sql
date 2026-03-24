-- Migration: Beta Feedback System
-- Description: Create tables for detailed and generation feedback.

-- 1. Detailed Feedback Table
CREATE TABLE IF NOT EXISTS feedback_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    store_id uuid NOT NULL REFERENCES stores(id),
    page_path text,
    step text,
    attempt text,
    result text,
    would_help_sales text,
    improvement text,
    would_post text,
    reason_not_post text,
    score integer,
    allow_contact boolean DEFAULT false,
    user_agent text
);

-- 2. Generation Feedback Table
CREATE TABLE IF NOT EXISTS generation_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    store_id uuid NOT NULL REFERENCES stores(id),
    campaign_id uuid REFERENCES campaigns(id),
    weekly_plan_id uuid REFERENCES weekly_plans(id),
    page_path text,
    content_type text NOT NULL, -- 'campaign', 'reels', 'weekly_plan', 'weekly_strategy'
    vote text NOT NULL CHECK (vote IN ('yes', 'maybe', 'no')),
    reason text,
    would_post text,
    user_agent text
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_feedback_messages_store_id ON feedback_messages(store_id);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_created_at ON feedback_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_generation_feedback_store_id ON generation_feedback(store_id);
CREATE INDEX IF NOT EXISTS idx_generation_feedback_created_at ON generation_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_generation_feedback_content_type ON generation_feedback(content_type);
CREATE INDEX IF NOT EXISTS idx_generation_feedback_campaign_id ON generation_feedback(campaign_id);
CREATE INDEX IF NOT EXISTS idx_generation_feedback_weekly_plan_id ON generation_feedback(weekly_plan_id);

-- RLS Policies
ALTER TABLE feedback_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_feedback ENABLE ROW LEVEL SECURITY;

-- feedback_messages: Owner can see their own feedback
CREATE POLICY "Users can insert their own feedback"
ON feedback_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
ON feedback_messages FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- generation_feedback: Owner can see/insert their own
CREATE POLICY "Users can insert their own generation feedback"
ON generation_feedback FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own generation feedback"
ON generation_feedback FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
