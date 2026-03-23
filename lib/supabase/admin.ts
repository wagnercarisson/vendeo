import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`MISSING_ENV:${name}`);
  return value;
}

let adminClient: SupabaseClient | null = null;

/**
 * Client Supabase com service-role key.
 * Use apenas em server-side (route handlers, server actions).
 * NUNCA exponha no client.
 */
export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  adminClient = createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );

  return adminClient;
}