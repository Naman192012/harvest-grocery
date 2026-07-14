import { createMiddleware } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

/**
 * Server function middleware that requires an authenticated Supabase user.
 * It reads the access token forwarded by attachSupabaseAuth, verifies it, and
 * provides a user-scoped Supabase client plus the userId on the context.
 */
export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next, context }) => {
    const token = (context as { supabaseAccessToken?: string | null }).supabaseAccessToken;
    if (!token) {
      throw new Error("You must be signed in to do that.");
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new Error("You must be signed in to do that.");
    }

    return next({ context: { supabase, userId: data.user.id } });
  },
);
