export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!res.ok) {
  let msg = text;

  // se veio HTML, retorna uma mensagem curta
  if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
    msg = "Erro no servidor (resposta HTML). Verifique logs do terminal.";
  } else {
    try {
      const parsed = JSON.parse(text);
      msg = parsed?.error || parsed?.message || msg;
    } catch {}
  }

  throw new Error(`HTTP ${res.status}: ${msg}`);
}

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Resposta não é JSON (content-type: ${contentType}). Primeiros caracteres: ${text.slice(0, 80)}`
    );
  }

  return JSON.parse(text) as T;
}