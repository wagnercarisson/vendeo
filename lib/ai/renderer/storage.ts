import { createClient } from "@supabase/supabase-js";

import { RENDERER_OUTPUT_BUCKET } from "./contracts";

export type RendererUploader = (args: {
  path: string;
  buffer: Buffer;
  contentType: "image/png";
}) => Promise<string>;

function createRendererStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase storage credentials are not configured for renderer uploads");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function uploadRenderedArt(args: {
  path: string;
  buffer: Buffer;
  uploader?: RendererUploader;
}): Promise<string> {
  if (args.uploader) {
    return args.uploader({
      path: args.path,
      buffer: args.buffer,
      contentType: "image/png",
    });
  }

  const client = createRendererStorageClient();
  const { error } = await client.storage.from(RENDERER_OUTPUT_BUCKET).upload(args.path, args.buffer, {
    contentType: "image/png",
    upsert: true,
  });

  if (error) {
    throw error;
  }

  return args.path;
}