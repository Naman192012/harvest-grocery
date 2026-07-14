import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./client";

/**
 * Resolves the current Firebase auth state once on mount and keeps it in sync.
 * `loading` is true until the first onAuthStateChanged callback fires, so callers
 * can avoid redirecting before Firebase has restored a persisted session.
 */
export function useFirebaseUser() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading };
}

/** Promise that resolves with the current user (or null) once auth state is known. */
export function waitForAuth(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u);
    });
  });
}
