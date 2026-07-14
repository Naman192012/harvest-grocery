import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { auth, googleProvider } from "@/integrations/firebase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { toast } from "sonner";

const searchSchema = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — Harvest" }] }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "phone";

function AuthPage() {
  const router = useRouter();
  const { next } = Route.useSearch();
  const nextPath = next && next.startsWith("/") ? next : "/";
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  // Phone flow state
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.navigate({ to: nextPath as any });
    });
    return unsub;
  }, [router, nextPath]);

  const goNext = () => router.navigate({ to: nextPath as any });

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
        toast.success("Account created — you're signed in");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      goNext();
    } catch (err: any) {
      toast.error(err?.message ?? "Auth failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      goNext();
    } catch (err: any) {
      toast.error(err?.message ?? "Google sign-in failed");
      setBusy(false);
    }
  };

  const getRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
    return recaptchaRef.current;
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await signInWithPhoneNumber(auth, phone, getRecaptcha());
      setConfirmation(result);
      toast.success("Code sent — check your messages");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not send code");
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmation) return;
    setBusy(true);
    try {
      await confirmation.confirm(code);
      goNext();
    } catch (err: any) {
      toast.error(err?.message ?? "Invalid code");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/60";
  const primaryBtn =
    "inline-flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-14 md:px-6">
        <div className="rounded-3xl border border-border/60 bg-card p-8">
          <h1 className="font-display text-3xl">
            {mode === "signup"
              ? "Create your account"
              : mode === "phone"
                ? "Sign in with phone"
                : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "It takes 20 seconds and your cart survives."
              : mode === "phone"
                ? "We'll text you a one-time code."
                : "Sign in to see your cart and order history."}
          </p>

          {mode !== "phone" && (
            <>
              <button
                type="button"
                onClick={google}
                disabled={busy}
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-input bg-background text-sm font-medium hover:bg-muted disabled:opacity-60"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                or with email
                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={submitEmail} className="space-y-3">
                {mode === "signup" && (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    autoComplete="name"
                    className={inputCls}
                  />
                )}
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className={inputCls}
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className={inputCls}
                />
                <button type="submit" disabled={busy} className={primaryBtn}>
                  {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setMode("phone")}
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full border border-input bg-background text-sm font-medium hover:bg-muted"
              >
                Use a phone number instead
              </button>
            </>
          )}

          {mode === "phone" && (
            <div className="mt-6 space-y-3">
              {!confirmation ? (
                <form onSubmit={sendCode} className="space-y-3">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 123 4567"
                    autoComplete="tel"
                    className={inputCls}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include the country code, e.g. +1 for the US.
                  </p>
                  <button type="submit" disabled={busy} className={primaryBtn}>
                    {busy ? "Sending…" : "Send code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyCode} className="space-y-3">
                  <input
                    inputMode="numeric"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit code"
                    autoComplete="one-time-code"
                    className={inputCls}
                  />
                  <button type="submit" disabled={busy} className={primaryBtn}>
                    {busy ? "Verifying…" : "Verify code"}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setConfirmation(null);
                  setCode("");
                }}
                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-input bg-background text-sm font-medium hover:bg-muted"
              >
                Back to email sign-in
              </button>
            </div>
          )}

          {/* Invisible reCAPTCHA anchor for phone auth */}
          <div id="recaptcha-container" />

          {mode !== "phone" && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New to Harvest?" : "Already have an account?"}{" "}
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-medium text-primary hover:underline"
              >
                {mode === "signin" ? "Create account" : "Sign in"}
              </button>
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
