import { createMiddleware } from "@tanstack/react-start";
import { adminAuth } from "./admin";

/**
 * Server function middleware that requires an authenticated Firebase user.
 * It reads the ID token forwarded by attachFirebaseAuth, verifies it with the
 * Firebase Admin SDK, and provides the user's uid on the context.
 * Mirrors the shape of the previous requireSupabaseAuth so downstream handlers
 * (which only read context.userId) are unchanged.
 */
export const requireFirebaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next, context }) => {
    const token = (context as { firebaseIdToken?: string | null }).firebaseIdToken;
    if (!token) {
      throw new Error("You must be signed in to do that.");
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch {
      throw new Error("You must be signed in to do that.");
    }

    return next({ context: { userId: decoded.uid } });
  },
);
