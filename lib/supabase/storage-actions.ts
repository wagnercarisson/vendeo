"use server";

import { getSignedImageUrl } from "./storage-server";

/**
 * Server Action para obter uma URL assinada. 
 * Útil para componentes client-side que precisam exibir imagens de buckets privados.
 */
export async function getSignedUrlAction(path: string | null | undefined) {
  if (!path) return null;
  return await getSignedImageUrl(path);
}

/**
 * Server Action para obter múltiplas URLs assinadas em uma única requisição.
 */
export async function getSignedUrlsAction(paths: (string | null | undefined)[]) {
  if (!paths || paths.length === 0) return [];
  
  const results = await Promise.all(
    paths.map(p => p ? getSignedImageUrl(p) : null)
  );
  
  return results;
}
