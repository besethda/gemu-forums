import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

/**
 * Supabase client with the secret key. Bypasses row level security, so use it
 * only for trusted server-side work (generating sign-in links, rate limits).
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Set SUPABASE_SECRET_KEY in .env.local (server only, never NEXT_PUBLIC_).");
  }
  return createClient<Database>(supabaseEnv().url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
