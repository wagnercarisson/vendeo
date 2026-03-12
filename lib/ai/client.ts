import OpenAI from "openai";

/**
 * Client OpenAI singleton.
 * Importado por todos os services de geração de IA.
 */
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
