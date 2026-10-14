// NEXT_PUBLIC_ values are inlined at build time, so they must be read with
// literal `process.env.NAME` access rather than a dynamic lookup.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function supabaseEnv() {
  if (!url || !key) {
    throw new Error(
      "Supabase isn't configured. Copy .env.example to .env.local and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return { url, key };
}
