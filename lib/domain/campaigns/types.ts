/** Campos de campanha que os services de IA precisam (lean — não duplica o banco inteiro). */
export interface CampaignContext {
  id: string;
  store_id: string;
  product_name: string;
  price: string | null;
  audience: string;
  objective: string;
  product_positioning: string | null;
}

/** Output normalizado após geração de copy de campanha. */
export interface CampaignAIOutput {
  headline: string;
  caption: string;
  text: string;
  cta: string;
  hashtags: string;
}
