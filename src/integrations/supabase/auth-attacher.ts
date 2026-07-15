import { createMiddleware } from "@tanstack/react-start";

/**
 * Global function middleware. On the client it reads the current session
 * (localStorage-based) and forwards the userId to the server; on the server
 * it exposes that userId in the middleware context so downstream middleware
 * can authenticate the request.
 */
export const attachSupabaseAuth = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;
    return next({
      sendContext: { userId: userId ?? null },
    });
  })
  .server(async ({ next, context }) => {
    const userId = (context as { userId?: string | null }).userId ?? null;
    return next({ context: { userId } });
  });
