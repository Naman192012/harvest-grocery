import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground">
                H
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">Harvest</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A grocery market from many local vendors. One cart, one delivery.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Shop</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/c/$slug" params={{ slug: "produce" }} className="hover:text-foreground">
                  Produce
                </Link>
              </li>
              <li>
                <Link to="/c/$slug" params={{ slug: "bakery" }} className="hover:text-foreground">
                  Bakery
                </Link>
              </li>
              <li>
                <Link to="/c/$slug" params={{ slug: "dairy" }} className="hover:text-foreground">
                  Dairy
                </Link>
              </li>
              <li>
                <Link to="/vendors" className="hover:text-foreground">
                  All vendors
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/account" className="hover:text-foreground">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/account/orders" className="hover:text-foreground">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-foreground">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">About</h4>
            <p className="mt-3 text-sm text-muted-foreground">
              Harvest is a demo multi-vendor grocery marketplace. Vendor storefronts, unified cart,
              real inventory.
            </p>
          </div>
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Harvest Market. Built as a Lovable blueprint.
        </p>
      </div>
    </footer>
  );
}
