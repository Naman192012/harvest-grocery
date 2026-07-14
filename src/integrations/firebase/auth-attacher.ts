import { createMiddleware } from "@tanstack/react-start";
import { auth } from "./client";

/**
 * Global function middleware. On the client it reads the current Firebase user's
 * ID token and forwards it to the server; on the server it exposes that token in
 * the middleware context so downstream middleware (requireFirebaseAuth) can
 * authenticate the request.
 */
export const attachFirebaseAuth = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
    return next({ sendContext: { firebaseIdToken: token } });
  })
  .server(async ({ next, context }) => {
    const firebaseIdToken =
      (context as { firebaseIdToken?: string | null }).firebaseIdToken ?? null;
    return next({ context: { firebaseIdToken } });
  });
