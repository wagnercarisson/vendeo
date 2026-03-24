"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCampaignImageSignedUrl } from "@/lib/supabase/storage-utils";

interface SecureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
}

/**
 * Componente para exibir imagens de buckets privados do Supabase.
 * Resolve a Signed URL de forma assíncrona.
 */
export function SecureImage({ src, alt, ...props }: SecureImageProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function resolve() {
      if (!src) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      try {
        const supabase = createSupabaseBrowserClient();
        const url = await getCampaignImageSignedUrl(supabase, src);
        if (isMounted) {
          setResolvedUrl(url);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[SecureImage] Erro ao resolver URL:", err);
        if (isMounted) {
          setResolvedUrl(src); // Fallback
          setIsLoading(false);
        }
      }
    }

    resolve();

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (isLoading) {
    return (
      <div 
        className={`animate-pulse bg-zinc-100 ${props.className || ""}`} 
        style={props.style} 
      />
    );
  }

  if (!resolvedUrl) return null;

  // Usamos img nativo para garantir compatibilidade total com os estilos CSS existentes
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img 
      src={resolvedUrl} 
      alt={alt || ""} 
      {...props} 
    />
  );
}
