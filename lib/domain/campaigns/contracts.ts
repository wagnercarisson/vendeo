import { z } from "zod";
import { CampaignAISchema, CampaignRequestSchema } from "./schemas";

// ----------------------------------------------------------------
// Generate Campaign - Request
// ----------------------------------------------------------------

/**
 * Schema de validacao para request de geracao de campanha.
 * Re-export de CampaignRequestSchema (schemas.ts) - sem duplicacao.
 *
 * @example
 * const request: GenerateCampaignRequest = {
 *   campaign_id: "123e4567-e89b-12d3-a456-426614174000",
 *   force: false,
 *   persist: true,
 * };
 * const result = GenerateCampaignRequestSchema.safeParse(request);
 */
export const GenerateCampaignRequestSchema = CampaignRequestSchema;
export type GenerateCampaignRequest = z.infer<
  typeof GenerateCampaignRequestSchema
>;

// ----------------------------------------------------------------
// Generate Campaign - Response
// ----------------------------------------------------------------

const CampaignAIOutputSchema = CampaignAISchema.extend({
  price_label: z.string().nullable().optional(),
});

/**
 * Schema de validacao para response de geracao de campanha.
 * Discriminated union por campo 'ok' (success vs error).
 *
 * @example
 * // Success case
 * const success: GenerateCampaignResponse = {
 *   ok: true,
 *   requestId: "req-123",
 *   reused: false,
 *   campaign_id: "camp-456",
 *   output: { headline: "Oferta especial", caption: "..." },
 * };
 *
 * // Error case
 * const error: GenerateCampaignResponse = {
 *   ok: false,
 *   requestId: "req-789",
 *   error: "CAMPAIGN_NOT_FOUND",
 * };
 */
export const GenerateCampaignResponseSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    requestId: z.string(),
    reused: z.boolean(),
    campaign_id: z.string().optional(),
    output: CampaignAIOutputSchema.optional(),
  }),
  z.object({
    ok: z.literal(false),
    requestId: z.string(),
    error: z.string(),
    details: z.unknown().optional(),
    status: z.number().optional(),
  }),
]);
export type GenerateCampaignResponse = z.infer<
  typeof GenerateCampaignResponseSchema
>;

// ----------------------------------------------------------------
// Strategy - Request
// ----------------------------------------------------------------

/**
 * Schema de validacao para request de sugestao de estrategia.
 * Endpoint: POST /api/generate/campaign/strategy
 *
 * @example
 * const request: StrategyRequest = {
 *   product: {
 *     type: "product",
 *     productName: "Tenis Nike Air Max",
 *     description: "Tenis esportivo premium",
 *     price: "299.90",
 *   },
 * };
 */
export const StrategyRequestSchema = z.object({
  product: z.object({
    type: z.enum(["product", "service", "message"]),
    productName: z.string().min(1, "Nome do produto e obrigatorio"),
    description: z.string().optional(),
    price: z.string().optional(),
  }),
});
export type StrategyRequest = z.infer<typeof StrategyRequestSchema>;

// ----------------------------------------------------------------
// Strategy - Response
// ----------------------------------------------------------------

const StrategySuggestionSchema = z.object({
  audience: z.string(),
  objective: z.string(),
  productPositioning: z.string(),
  reasoning: z.string(),
});

/**
 * Schema de validacao para response de sugestao de estrategia.
 * Discriminated union por campo 'ok'.
 *
 * @example
 * // Success case
 * const success: StrategyResponse = {
 *   ok: true,
 *   requestId: "req-123",
 *   suggestion: {
 *     audience: "Atletas amadores 25-40 anos",
 *     objective: "Destacar beneficios tecnicos",
 *     productPositioning: "Tenis premium com tecnologia avancada",
 *     reasoning: "Este publico valoriza performance...",
 *   },
 * };
 *
 * // Error case
 * const error: StrategyResponse = {
 *   ok: false,
 *   error: "INVALID_PRODUCT_TYPE",
 * };
 */
export const StrategyResponseSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    requestId: z.string(),
    suggestion: StrategySuggestionSchema,
  }),
  z.object({
    ok: z.literal(false),
    error: z.string(),
  }),
]);
export type StrategyResponse = z.infer<typeof StrategyResponseSchema>;
