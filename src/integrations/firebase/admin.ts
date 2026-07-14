import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * Server-only Firebase Admin initialization. Reads the service-account JSON from
 * the FIREBASE_SERVICE_ACCOUNT env var (a single-line JSON string). Used by the
 * requireFirebaseAuth middleware to verify ID tokens forwarded from the client.
 */
function initAdmin(): App {
  const existing = getApps();
  if (existing.length) return existing[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is not set. Add the service-account JSON to your .env to enable server-side auth."
    );
  }

  let serviceAccount: Record<string, unknown>;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid JSON.");
  }

  return initializeApp({ credential: cert(serviceAccount as never) });
}

export const adminApp = initAdmin();
export const adminAuth = getAuth(adminApp);
