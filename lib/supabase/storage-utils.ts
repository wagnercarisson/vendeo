import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Gera uma URL assinada para um arquivo no bucket 'campaign-images'.
 * @param supabase Instância do cliente Supabase (Browser, Server ou Admin).
 * @param pathOrUrl O caminho relativo no bucket ou a URL pública antiga (será limpa).
 * @param expiresIn Tempo de expiração em segundos (padrão 3600).
 */
export async function getCampaignImageSignedUrl(
  supabase: SupabaseClient,
  pathOrUrl: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return "";

  // Se for uma URL completa legada, extraia apenas o que vem após o nome do bucket
  let cleanPath = pathOrUrl;
  const bucketMarker = "/campaign-images/";
  
  if (pathOrUrl.includes(bucketMarker)) {
    // Pega tudo após o marcador do bucket, removendo query params ou hash
    const parts = pathOrUrl.split(bucketMarker);
    cleanPath = parts[1].split("?")[0].split("#")[0];
  } else if (pathOrUrl.startsWith("http")) {
    // Se for URL de outro domínio ou bucket externo, retorna como está
    return pathOrUrl;
  }

  // Se o path estiver vazio após a limpeza, retorna vazio
  if (!cleanPath || cleanPath === "/") return "";

  const { data, error } = await supabase.storage
    .from("campaign-images")
    .createSignedUrl(cleanPath, expiresIn);

  if (error) {
    console.error(`[Storage] Erro ao gerar Signed URL para ${cleanPath}:`, error.message);
    // Retorna a URL original como fallback (pode não funcionar na UI, mas evita quebra total)
    return pathOrUrl; 
  }

  return data.signedUrl;
}
