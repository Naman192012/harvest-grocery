
# Grocery Marketplace — Blueprint + MVP Build Plan

Two-phase delivery: (1) a focused blueprint document you can download and share, (2) a working v1 MVP built on top of it.

---

## Phase A — Blueprint Artifact

Written as a single Markdown file to `/mnt/documents/grocery-marketplace-blueprint.md` and surfaced as a downloadable artifact. Kept sharp (~20–30 pages equivalent), not a 300-page dump.

Sections included:

1. **Executive summary** — vision, positioning, why-we-win vs Instacart / BigBasket / Zepto / Amazon Fresh.
2. **Competitor pattern library** — a distilled matrix of ~20 leading platforms (grouped: Western supermarkets, quick-commerce, marketplaces, warehouse clubs) covering homepage, PDP, cart, checkout, vendor tooling, loyalty. Patterns to adopt vs avoid — not screenshots, not copied copy.
3. **Personas & journeys** — 4 personas (busy parent, health-conscious, budget shopper, vendor/seller) with journey maps.
4. **Information architecture** — sitemap, mega-menu structure, URL scheme, SEO taxonomy.
5. **Feature matrix (MVP → v2 → v3)** — customer, vendor, admin, delivery, AI columns; each row tagged with priority.
6. **Brand & design system** — palette (fresh-produce-inspired: deep green primary, warm cream base, tomato accent), typography pair, spacing scale, elevation, motion principles, component list mapped to shadcn primitives.
7. **Page-by-page wireframes** — ASCII wireframes for: home, category, search results, PDP, cart, checkout, order confirmation, vendor storefront, vendor dashboard, admin.
8. **Data model** — ER diagram (ASCII) covering users, roles, vendors, stores, products, variants, inventory, orders, order_items, addresses, carts, reviews, coupons, payouts.
9. **API surface** — endpoint list grouped by domain, auth model, RLS strategy.
10. **Tech stack decisions** — TanStack Start + Lovable Cloud (Postgres + Auth + Storage), Stripe Connect for multi-vendor payouts, Lovable AI Gateway for AI features, Algolia-style search via Postgres FTS in MVP.
11. **Security, SEO, performance, accessibility checklists** — actionable, one page each.
12. **Roadmap** — MVP (this build) → v2 (vendor onboarding, payouts, reviews) → v3 (AI recipes, quick-commerce zones, loyalty).

Delivered as `<presentation-artifact>` so you can download and share before code lands.

---

## Phase B — v1 MVP Build

Scope locked to what you selected: **browse + search + cart + checkout**, multi-vendor storefront.

### What ships

- **Home** — hero, category grid, featured vendors, trending products, deals row.
- **Category / listing page** — filter (vendor, price, dietary tags), sort, grid of product cards.
- **Search** — Postgres full-text search over product name + description + brand, with vendor facet.
- **Product detail page (PDP)** — gallery, variants (size/weight), price, vendor badge (links to vendor storefront), qty stepper, add to cart, related products.
- **Vendor storefront** — public page listing a single vendor's products.
- **Cart** — persistent (Cloud), grouped by vendor, per-vendor subtotals, delivery fee estimate, promo code field (UI only in v1).
- **Guest checkout + logged-in checkout** — address, delivery slot, order summary, Stripe payment (test mode). Order split per vendor.
- **Order confirmation** — order number, per-vendor breakdown, email placeholder.
- **Auth** — Lovable Cloud email/password + Google (defaults). Basic profile page with order history.
- **Seed data** — 6 vendors, ~60 products across produce, dairy, bakery, pantry, beverages, snacks, so the app feels real on first load.

### Design direction (locked from blueprint)

- Palette: deep grocery green `#1F5F3F` primary, warm cream `#FBF7EE` background, tomato `#E24E1B` accent, charcoal `#1A1A1A` text. Semantic tokens in `src/styles.css` (oklch).
- Type: **Fraunces** (display, for hero + section headers) + **Inter** (UI/body). Installed via `@fontsource`.
- Feel: editorial-market energy, generous whitespace, produce photography, subtle motion on card hover and add-to-cart.
- No purple gradients, no generic SaaS look.

### Tech

- TanStack Start (existing template), file-based routes under `src/routes/`.
- Lovable Cloud (enabled in this phase) — Postgres tables for `vendors`, `products`, `product_images`, `categories`, `product_categories`, `carts`, `cart_items`, `orders`, `order_items`, `addresses`, `profiles`, `user_roles`. RLS on every table; `has_role()` security-definer function per platform conventions.
- Stripe test-mode payments via a TanStack server function (`createCheckoutSession`).
- Product images: mix of generated hero art + Unsplash-style placeholders for seed catalog.

### Out of scope for v1 (called out in blueprint roadmap)

Vendor self-onboarding, real payouts / Stripe Connect, live delivery tracking, reviews & ratings, wishlist, loyalty, AI recipes, quick-commerce zones, admin panel, mobile app. All scoped in the blueprint for v2/v3.

---

## Order of operations

1. Write blueprint markdown → surface artifact.
2. Enable Lovable Cloud, create schema + RLS + seed migration.
3. Build design tokens, fonts, shared layout, header/footer.
4. Build routes: home → category → PDP → vendor → cart → checkout → confirmation → auth → profile/orders.
5. Wire Stripe test checkout.
6. QA pass: run the flow end-to-end, verify screenshots, fix issues, then hand off.

Blueprint lands first so you can react to direction before I commit code.
