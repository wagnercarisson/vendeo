import { supabase } from "@/lib/supabase";

/**
 * Extrai o path relativo do bucket a partir de uma URL pública do Supabase.
 * Ex: https://.../storage/v1/object/public/campaign-images/uploads/user/file.png
 * -> uploads/user/file.png
 */
export function getPathFromUrl(url: string, bucket: string = "campaign-images") {
  if (!url) return null;
  const part = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(part);
  if (index === -1) {
    // Tenta formato alternativo se necessário ou retorna a própria URL se não for do Supabase
    if (url.includes(bucket)) {
        return url.split(`${bucket}/`)[1];
    }
    return null;
  }
  return url.substring(index + part.length);
}

/**
 * Gera uma URL assinada para um recurso privado.
 * @param path Caminho relativo no bucket
 * @param bucket Nome do bucket (padrão: campaign-images)
 * @param expiresIn Segundos de validade (padrão: 1 hora)
 */
export async function getSignedUrl(
  path: string, 
  bucket: string = "campaign-images",
  expiresIn: number = 3600
) {
  if (!path) return null;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data) {
    console.error("Erro ao gerar Signed URL:", error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Resolve uma URL (seja ela pública ou privada) para uma URL utilizável.
 * Se a URL for do Supabase e o bucket for privado, tenta assinar.
 */
export async function resolveImageUrl(url: string | null) {
    if (!url) return null;
    
    // Se não for do nosso Supabase, retorna como está (ex: links externos)
    if (!url.includes("storage/v1/object/public")) {
        return url;
    }

    const bucket = url.includes("campaign-images") ? "campaign-images" : "product-images";
    const path = getPathFromUrl(url, bucket);
    
    if (!path) return url;

    const signed = await getSignedUrl(path, bucket);
    return signed || url;
}
