import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const HAS_SUPABASE = SUPABASE_URL?.startsWith("http") && SUPABASE_KEY?.length > 0;

export function createClient() {
  if (!HAS_SUPABASE) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
