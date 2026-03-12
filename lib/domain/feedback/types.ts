export type DetailedFeedback = {
  id?: string;
  created_at?: string;
  user_id: string;
  store_id: string;
  page_path?: string;
  step?: string;
  attempt?: string;
  result?: string;
  would_help_sales?: string;
  improvement?: string;
  would_post?: string;
  reason_not_post?: string;
  score?: number;
  allow_contact?: boolean;
  user_agent?: string;
};

export type GenerationFeedback = {
  id?: string;
  created_at?: string;
  user_id: string;
  store_id: string;
  campaign_id?: string;
  weekly_plan_id?: string;
  page_path?: string;
  content_type: 'campaign' | 'reels' | 'weekly_plan' | 'weekly_strategy';
  vote: 'yes' | 'maybe' | 'no';
  reason?: string;
  would_post?: string;
  user_agent?: string;
};
