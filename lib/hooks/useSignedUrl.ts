"use client";

import { useState, useEffect } from "react";
import { resolveImageUrl } from "@/lib/supabase/storage";

/**
 * Hook para resolver uma URL de imagem (pública ou privada/assinada).
 * @param initialUrl URL original (pública ou path)
 */
export function useSignedUrl(initialUrl: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(initialUrl || null);
  const [loading, setLoading] = useState(!!initialUrl);

  useEffect(() => {
    if (!initialUrl) {
      setUrl(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function load() {
      setLoading(true);
      try {
        const resolved = await resolveImageUrl(initialUrl!);
        if (isMounted) {
          setUrl(resolved);
        }
      } catch (err) {
        console.error("Erro ao resolver URL assinada:", err);
      } finally {
        if (isMounted) {
            setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [initialUrl]);

  return { url, loading };
}
