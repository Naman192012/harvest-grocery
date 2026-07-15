import { createMiddleware } from "@tanstack/react-start";

/**
 * Server function middleware that requires an authenticated user.
 * It reads the userId forwarded by attachSupabaseAuth and ensures it exists.
 */
export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next, context }) => {
    const userId = (context as { userId?: string | null }).userId;
    if (!userId) {
      throw new Error("You must be signed in to do that.");
    }

    return next({ context: { userId } });
  },
);
