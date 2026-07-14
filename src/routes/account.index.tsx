import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/account/")({
  head: () => ({ meta: [{ title: "Your account — Harvest" }] }),
  component: AccountPage,
});

function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.navigate({ to: "/auth", search: { next: "/account" } });
        return;
      }
      setEmail(user.email ?? user.phoneNumber ?? null);
      setLoading(false);
    });
    return unsub;
  }, [router]);

  const signOut = async () => {
    await fbSignOut(auth);
    router.navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-6">
        <h1 className="font-display text-4xl md:text-5xl">Your account</h1>
        {loading ? (
          <p className="mt-6 text-muted-foreground">Loading…</p>
        ) : (
          <div className="mt-8 space-y-6">
            <section className="rounded-2xl border border-border/60 bg-card p-6">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="mt-1 font-medium">{email}</p>
            </section>
            <section className="rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="font-display text-xl">Orders</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                See past orders and reorder favourites.
              </p>
              <Link
                to="/account/orders"
                className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                View orders
              </Link>
            </section>
            <button
              onClick={signOut}
              className="rounded-full border border-input px-5 py-2.5 text-sm font-medium hover:bg-muted"
            >
              Sign out
            </button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
