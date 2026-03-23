import OpenAI from "openai";

function requireEnv(name: string) {
    const value = process.env[name];
    if (!value) throw new Error(`MISSING_ENV:${name}`);
    return value;
}

let openaiClient: OpenAI | null = null;

/**
 * Client OpenAI singleton com lazy init.
 * Evita quebrar o build ao importar módulos server-side.
 */
export function getOpenAI() {
    if (openaiClient) return openaiClient;

    openaiClient = new OpenAI({
        apiKey: requireEnv("OPENAI_API_KEY"),
    });

    return openaiClient;
}