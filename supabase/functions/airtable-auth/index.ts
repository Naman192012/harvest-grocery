// Supabase Edge Function: airtable-auth
// Performs Airtable-backed authentication (sign in / sign up).
//
// WHY THIS EXISTS: Lovable injects secrets (Cloud > Secrets) into Edge Functions
// ONLY, not into the app's SSR/server-function runtime. So all Airtable access
// that needs AIRTABLE_BASE_ID / AIRTABLE_API_TOKEN must happen here, where
// Deno.env can read them. The app's server functions call this over HTTP.
//
// Password hashing intentionally mirrors src/lib/password.server.ts (Node
// scrypt, "saltHex:hashHex", default cost params) so existing accounts created
// by the old SSR code still verify unchanged.

import { Buffer } from "node:buffer";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const USERS_TABLE = "Users";
const BLOCKED_STATUSES = new Set(["Suspended", "Disabled", "Deactivated"]);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function airtableConfig() {
  const baseId = Deno.env.get("AIRTABLE_BASE_ID") ?? "";
  const apiToken = Deno.env.get("AIRTABLE_API_TOKEN") ?? "";
  if (!baseId || !apiToken) {
    throw new Error(
      "Airtable is not configured: AIRTABLE_BASE_ID or AIRTABLE_API_TOKEN is missing in Edge Function secrets.",
    );
  }
  return { baseId, apiToken };
}

async function airtableFetch(path: string, options: RequestInit = {}) {
  const { baseId, apiToken } = airtableConfig();
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable API error ${res.status}: ${text}`);
  }
  return res.json();
}

function escapeFormula(v: string) {
  return v.replace(/'/g, "\\'");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const storedHash = Buffer.from(hashHex, "hex");
  const derived = await scrypt(password, salt, KEY_LENGTH);
  if (derived.length !== storedHash.length) return false;
  return timingSafeEqual(derived, storedHash);
}

async function findUserByEmail(email: string) {
  const formula = `{Email} = '${escapeFormula(email)}'`;
  const data = await airtableFetch(
    `${encodeURIComponent(USERS_TABLE)}?filterByFormula=${encodeURIComponent(formula)}`,
  );
  return data.records?.[0] ?? null;
}

async function doSignIn(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new HttpError(401, "No account found with that email.");

  const status = user.fields["Account Status"];
  if (status && BLOCKED_STATUSES.has(status)) {
    throw new HttpError(
      403,
      `This account is ${String(status).toLowerCase()}. Contact support for help.`,
    );
  }

  const passwordHash = user.fields["Password Hash"];
  const valid = typeof passwordHash === "string" && (await verifyPassword(password, passwordHash));
  if (!valid) throw new HttpError(401, "Incorrect password.");

  await airtableFetch(`${encodeURIComponent(USERS_TABLE)}/${user.id}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: { "Last Login": new Date().toISOString() } }),
  });

  return { userId: email, userName: user.fields["Name"] ?? email };
}

async function doSignUp(email: string, password: string, name: string) {
  const existing = await findUserByEmail(email);
  if (existing) throw new HttpError(409, "An account with this email already exists.");

  const passwordHash = await hashPassword(password);
  await airtableFetch(encodeURIComponent(USERS_TABLE), {
    method: "POST",
    body: JSON.stringify({
      fields: {
        Email: email,
        "Password Hash": passwordHash,
        Name: name,
        Role: "User",
        "Account Status": "Active",
        "Last Login": new Date().toISOString(),
      },
    }),
  });

  return { userId: email, userName: name };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const email = normalizeEmail(String(body?.email ?? ""));
    const password = String(body?.password ?? "");

    if (!email || !password) throw new HttpError(400, "Email and password are required.");

    if (action === "signIn") {
      return json(await doSignIn(email, password));
    }
    if (action === "signUp") {
      const name = String(body?.name ?? "").trim();
      if (!name) throw new HttpError(400, "Please enter your name.");
      return json(await doSignUp(email, password, name));
    }
    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    return json({ error: err instanceof Error ? err.message : "Server error" }, status);
  }
});
