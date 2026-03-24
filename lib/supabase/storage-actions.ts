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
