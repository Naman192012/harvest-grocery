import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

/**
 * Global function middleware. On the client it reads the current Supabase
 * session and forwards the access token to the server; on the server it exposes
 * that token in the middleware context so downstream middleware (e.g.
 * requireSupabaseAuth) can authenticate the request.
 */
export const attachSupabaseAuth = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    return next({
      sendContext: { supabaseAccessToken: data.session?.access_token ?? null },
    });
  })
  .server(async ({ next, context }) => {
    const supabaseAccessToken =
      (context as { supabaseAccessToken?: string | null }).supabaseAccessToken ?? null;
    return next({ context: { supabaseAccessToken } });
  });
