import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/**
 * Supabase is the Publisher's authentication and database authority.
 *
 * Free-tier limitation: Supabase Free does not expose max session lifetime,
 * inactivity timeout, or single-session enforcement. We intentionally do not
 * imitate those controls in the browser. After upgrading to Pro, enable the
 * approved values in Supabase Auth: 12h maximum lifetime, 30m inactivity
 * timeout, and single-session enforcement.
 */
export const supabase = url && publishableKey
  ? createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
  }
  return supabase;
}
