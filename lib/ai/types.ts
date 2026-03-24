import { ZodIssue } from "zod";

/** Resultado genérico de uma chamada de IA com parse e validação. */
export interface AICallResult<T> {
  data: T;
  /** true se o resultado veio de uma segunda tentativa de correção */
  wasRetried: boolean;
}

/** Erros de parse/validação vindos da IA */
export interface ParsedAIResponse {
  raw: string;
  parsed: unknown;
  issues?: ZodIssue[];
}
