import { z, ZodSchema } from "zod";
import { getOpenAI } from "./client";
import { AICallResult } from "./types";

// ─────────────────────────────────────────────
// Parsing helpers
// ─────────────────────────────────────────────

/**
 * Extrai o PRIMEIRO objeto JSON completo de um texto arbitrário.
 * Robusto contra texto extra antes/depois e múltiplos objetos.
 */
export function extractFirstJSONObject(raw: string): string {
  const s = raw ?? "";
  let start = -1;
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { if (inString) escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") { if (depth === 0) start = i; depth++; continue; }
    if (ch === "}") {
      if (depth > 0) depth--;
      if (depth === 0 && start !== -1) return s.slice(start, i + 1);
      continue;
    }
  }

  throw new Error("AI_RETURNED_NON_JSON");
}

/** Tenta JSON.parse direto; se falhar, extrai o primeiro objeto JSON. */
export function parseJsonFirstObject(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(extractFirstJSONObject(raw));
  }
}

/** JSON.stringify seguro (não lança em caso de circular refs). */
export function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

// ─────────────────────────────────────────────
// Timeout
// ─────────────────────────────────────────────

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), ms)
    ),
  ]);
}

// ─────────────────────────────────────────────
// Chamada OpenAI
// ─────────────────────────────────────────────

interface CallAIOpts {
  model?: string;
  temperature?: number;
  timeoutMs?: number;
}

/** Faz uma chamada simples ao OpenAI e retorna o texto bruto. */
export async function callAI(
  messages: { role: "system" | "user"; content: string }[],
  opts: CallAIOpts = {}
): Promise<string> {
  const { model = "gpt-4o-mini", temperature = 0.7, timeoutMs = 20000 } = opts;
  const openai = getOpenAI();

  const completion = await withTimeout(
    openai.chat.completions.create({
      model,
      temperature,
      response_format: { type: "json_object" } as any,
      messages,
    }),
    timeoutMs
  );

  return completion.choices?.[0]?.message?.content ?? "";
}

// ─────────────────────────────────────────────
// Validação
// ─────────────────────────────────────────────

/** Valida dados com um schema Zod. Retorna { ok, data } ou { ok, issues }. */
export function validateAI<T>(
  data: unknown,
  schema: ZodSchema<T>
): { ok: true; data: T } | { ok: false; issues: z.ZodIssue[] } {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, issues: result.error.issues };
}

// ─────────────────────────────────────────────
// Retry com correção
// ─────────────────────────────────────────────

/**
 * Faz uma segunda chamada pedindo à IA para corrigir o JSON com base nos erros.
 */
export async function retryAIWithCorrection<T>(
  badData: unknown,
  issues: z.ZodIssue[],
  schema: ZodSchema<T>,
  opts: CallAIOpts = {}
): Promise<T> {
  const fixPrompt = `O JSON abaixo está inválido ou fora do formato esperado.
Corrija e devolva SOMENTE o JSON válido (sem texto fora do JSON).

ERROS:
${safeStringify(issues)}

JSON PARA CORRIGIR:
${safeStringify(badData)}`;

  const raw = await callAI(
    [
      { role: "system", content: "Responda somente com JSON válido." },
      { role: "user", content: fixPrompt },
    ],
    { ...opts, temperature: 0.2 }
  );

  const parsed = parseJsonFirstObject(raw);
  return schema.parse(parsed);
}

// ─────────────────────────────────────────────
// Pipeline completo: call → parse → validate → retry
// ─────────────────────────────────────────────

/**
 * Orquestra o ciclo completo: chama a IA, parseia o JSON,
 * valida com o schema e, se falhar, tenta uma correção automática.
 */
export async function callAIWithRetry<T>(
  prompt: string,
  schema: ZodSchema<T>,
  opts: CallAIOpts = {}
): Promise<AICallResult<T>> {
  const raw = await callAI(
    [
      { role: "system", content: "Responda somente com JSON válido." },
      { role: "user", content: prompt },
    ],
    opts
  );

  const parsed = parseJsonFirstObject(raw);
  const validation = validateAI(parsed, schema);

  if (validation.ok === true) {
    return { data: validation.data, wasRetried: false };
  }

  const corrected = await retryAIWithCorrection(parsed, validation.issues, schema, opts);
  return { data: corrected, wasRetried: true };
}
