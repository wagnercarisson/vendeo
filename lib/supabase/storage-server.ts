import { getSupabaseAdmin } from "./admin";

/**
 * Gera uma URL assinada para um arquivo no bucket 'campaign-images'.
 * @param path O caminho do arquivo dentro do bucket (ex: 'uploads/user_id/file.png')
 * @param expiresIn Tempo de expiração em segundos (padrão 1 hora)
 */
export async function getSignedImageUrl(path: string, expiresIn = 3600) {
  if (!path) return null;
  
  // Se a URL já for externa (contém http e não é do nosso storage), retorna ela mesma
  if (path.startsWith("http") && !path.includes("supabase.co")) {
    return path;
  }

  // Extrair o path relativo se for uma URL completa do Supabase
  let relativePath = path;
  if (path.includes("/storage/v1/object/public/campaign-images/")) {
    relativePath = path.split("/storage/v1/object/public/campaign-images/")[1];
  } else if (path.includes("/storage/v1/object/sign/campaign-images/")) {
    relativePath = path.split("/storage/v1/object/sign/campaign-images/")[1].split("?")[0];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from("campaign-images")
    .createSignedUrl(relativePath, expiresIn);

  if (error) {
    console.error(`[storage-server] Error creating signed URL for ${relativePath}:`, error.message);
    return path; // Fallback para a URL original em caso de erro
  }

  return data.signedUrl;
}
