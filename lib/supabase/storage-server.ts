import { getSupabaseAdmin } from "./admin";

/**
 * Gera uma URL assinada para um arquivo no bucket 'campaign-images'.
 * @param path O caminho do arquivo dentro do bucket (ex: 'uploads/user_id/file.png')
 * @param expiresIn Tempo de expiração em segundos (padrão 1 hora)
 */
export async function getSignedImageUrl(path: string, expiresIn = 3600) {
  if (!path) return null;
  
  // Heurística de segurança: se o "caminho" já for uma URL completa do nosso storage, 
  // tenta extrair o path puro para re-gerar a assinatura (Healing)
  const isSupabaseUrl = path.includes("supabase.co") && (path.includes("/object/public/") || path.includes("/object/sign/"));
  
  if (path.startsWith("http") && !isSupabaseUrl) {
    return path;
  }

  // Detectar o bucket da URL ou usar o padrão 'campaign-images'
  let bucket = "campaign-images";
  let relativePath = path;

  // Cura Automática: Se o caminho contém "logos/USER_ID/logos/...", remove o "logos/" duplicado
  if (relativePath.includes("logos/") && relativePath.split("logos/").length > 2) {
      // Ex: logos/ID/logos/file.png -> logos/ID/file.png
      const parts = relativePath.split("/");
      if (parts[0] === "logos" && parts[2] === "logos") {
          relativePath = [parts[0], parts[1], ...parts.slice(3)].join("/");
      }
  }

  // Padrão Supabase: /storage/v1/object/[public|sign]/[bucket]/[path]
  const storagePatterns = [
    "/storage/v1/object/public/",
    "/storage/v1/object/sign/"
  ];

  for (const pattern of storagePatterns) {
    if (path.includes(pattern)) {
      const parts = path.split(pattern)[1].split("/");
      bucket = parts[0];
      relativePath = parts.slice(1).join("/").split("?")[0];
      break;
    }
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(relativePath, expiresIn);

  if (error) {
    console.error(`[storage-server] Error creating signed URL for bucket ${bucket}, path ${relativePath}:`, error.message);
    return path; // Fallback para a URL original em caso de erro
  }

  return data.signedUrl;
}
