import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Auth is backed by Airtable, but Airtable credentials only exist inside the
// Supabase Edge Function (Lovable injects secrets there, not into this SSR
// runtime). So these server functions are thin proxies to the `airtable-auth`
// Edge Function. See supabase/functions/airtable-auth/index.ts.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

async function callAuthFunction(payload: Record<string, unknown>) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).");
  }
  const res = await fetch(`${SUPABASE_URL}/functions/v1/airtable-auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as {
    userId?: string;
    userName?: string;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data?.error ?? `Auth request failed (${res.status})`);
  }
  return { userId: data.userId as string, userName: data.userName as string };
}

export const signUp = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(6).max(200),
        name: z.string().min(1).max(200),
      })
      .parse(d)
  )
  .handler(async ({ data }) =>
    callAuthFunction({
      action: "signUp",
      email: data.email,
      password: data.password,
      name: data.name,
    })
  );

export const signIn = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(1).max(200),
      })
      .parse(d)
  )
  .handler(async ({ data }) =>
    callAuthFunction({ action: "signIn", email: data.email, password: data.password })
  );
