import { campaignDbRowSchema } from './schemas';
import { Campaign } from './types';

/**
 * Mapper oficial para transformar dados brutos no domínio Campaign.
 * Garante normalização de snake_case para camelCase e falha explícita em erros estruturais.
 */
export function mapDbCampaignToDomain(raw: unknown): Campaign {
  const result = campaignDbRowSchema.safeParse(raw);

  if (!result.success) {
    // Falha explícita com logs detalhados para debug
    const errorDetails = JSON.stringify(result.error.format(), null, 2);
    console.error(`[mapDbCampaignToDomain] Falha na validação do registro do banco:\n${errorDetails}`);
    
    throw new Error(
      `Dados da campanha inválidos ou incompletos vindos do banco. Verifique o console para detalhes.`
    );
  }

  const data = result.data;

  // Retorno do objeto normalizado em camelCase
  return {
    // Dados estruturais
    id: data.id,
    storeId: data.store_id,
    productName: data.product_name,
    price: data.price,
    audience: data.audience,
    objective: data.objective,
    strategy: null, // Reservado para a Etapa 1B
    productPositioning: data.product_positioning,
    status: data.status,

    // Conteúdo gerado (Arte/Feed)
    headline: data.headline,
    bodyText: data.body_text,
    cta: data.cta,
    imageUrl: data.image_url,
    productImageUrl: data.product_image_url,

    // Conteúdo gerado (Video/Reels)
    reelsHook: data.reels_hook,
    reelsScript: data.reels_script,
    reelsShotlist: data.reels_shotlist,
    reelsOnScreenText: data.reels_on_screen_text,
    reelsAudioSuggestion: data.reels_audio_suggestion,
    reelsDurationSeconds: data.reels_duration_seconds,
    reelsCaption: data.reels_caption,
    reelsCta: data.reels_cta,
    reelsHashtags: data.reels_hashtags,
    reelsGeneratedAt: data.reels_generated_at,

    // Metadados de Geração IA
    aiText: data.ai_text,
    aiCaption: data.ai_caption,
    aiHashtags: data.ai_hashtags,
    aiCta: data.ai_cta,
    aiGeneratedAt: data.ai_generated_at,

    // Metadados do sistema
    createdAt: data.created_at,
  };
}
