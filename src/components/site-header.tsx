import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag, User, Search } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { getCart } from "@/lib/cart.functions";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

export function SiteHeader() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const cartFn = useServerFn(getCart);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });
    return unsub;
  }, []);

  const { data: cartCount = 0 } = useQuery({
    queryKey: ["cart-count", userId],
    queryFn: async () => {
      if (!userId) return 0;
      try {
        const items = await cartFn();
        return Array.isArray(items) ? items.length : 0;
      } catch {
        return 0;
      }
    },
    enabled: !!userId,
    refetchInterval: 4000,
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.navigate({ to: "/search", search: { q: q.trim() } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground">
            H
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">Harvest</span>
        </Link>

        <nav className="ml-6 hidden gap-6 text-sm font-medium text-foreground/80 md:flex">
          <Link to="/" className="hover:text-foreground [&.active]:text-primary">
            Shop
          </Link>
          <Link to="/vendors" className="hover:text-foreground [&.active]:text-primary">
            Vendors
          </Link>
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden max-w-sm flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sourdough, tomatoes, kombucha…"
              aria-label="Search products"
              className="w-full rounded-full border border-input bg-card py-2 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/60"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            to="/account"
            aria-label="Account"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-foreground">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
