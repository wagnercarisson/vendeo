import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Configuração do Rate Limit (5 requisições por minuto por usuário)
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "@vendeo/ratelimit",
});

/**
 * Helper para verificar se uma requisição deve ser bloqueada.
 * @param identifier Identificador único (geralmente userId ou IP)
 */
export async function checkRateLimit(identifier: string) {
  const result = await ratelimit.limit(identifier);
  return result;
}
