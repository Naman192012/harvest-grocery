# API Routes Implementation Summary

All your database queries have been migrated from Supabase to local PostgreSQL via API routes and direct database access.

## Changes Made

### 1. Database Module Created
- **File**: `src/lib/db.ts`
- **Exports**: `query()`, `queryOne()`, `queryAll()`, `closePool()`
- **Purpose**: Direct PostgreSQL connection using `pg` package

### 2. API Routes Created

#### Public Routes (no auth required)

- `GET /api/categories` - All categories
- `GET /api/vendors` - All vendors
- `GET /api/vendors/$slug` - Single vendor by slug
- `GET /api/products/featured` - 8 featured products
- `GET /api/products/category/$slug` - Products by category
- `GET /api/products/vendor/$slug` - Products by vendor
- `GET /api/products/search?q=query` - Search products

**Files**:
```
src/routes/api/categories.tsx
src/routes/api/vendors.tsx
src/routes/api/vendors_/$slug.tsx
src/routes/api/products/featured.tsx
src/routes/api/products/category/$slug.tsx
src/routes/api/products/vendor/$slug.tsx
src/routes/api/products/search.tsx
```

### 3. React Components Updated

**Pages updated to use API routes**:
- `src/routes/index.tsx` - Home page
- `src/routes/c.$slug.tsx` - Category page
- `src/routes/v.$slug.tsx` - Vendor page
- `src/routes/search.tsx` - Search page

**Server functions updated to use database module**:
- `src/lib/cart.functions.ts` - Cart operations (getCart, addToCart, updateCartItem, placeOrder)

### 4. Supabase Client

**Current Role**: Authentication only
- Login/Signup still uses Supabase Auth
- Database queries now use local PostgreSQL
- No changes needed to `src/integrations/supabase/client.ts` (already updated to note auth-only use)

## Database Connection

The app connects to local PostgreSQL using credentials from `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=grocery
```

Connection is pooled in `src/lib/db.ts` for efficiency.

## Before You Run

### 1. Install PostgreSQL Client
```bash
npm install pg
```

### 2. Ensure Docker Database is Running
```bash
docker-compose up -d
docker exec -i grocery_db psql -U postgres -d grocery < init-db.sql
```

### 3. Test Database Connection
```bash
docker exec -it grocery_db psql -U postgres -d grocery -c "SELECT COUNT(*) FROM public.products;"
```

Should return `35`.

## API Response Format

All API routes return JSON:

**Success (200)**:
```json
[
  { "id": "uuid", "name": "Category Name", ... }
]
```

**Error (404/500)**:
```json
{ "error": "Error message" }
```

## Feature Coverage

- ✅ Browse products by category
- ✅ Browse products by vendor
- ✅ View featured products
- ✅ Search products
- ✅ Manage cart (requires auth)
- ✅ Place orders (requires auth)
- ✅ Supabase authentication

## Auth Implementation

Authentication still uses Supabase Cloud:

```typescript
import { supabase } from "@/integrations/supabase/client";

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password",
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

The `userId` from Supabase auth is used in database queries to scope data (e.g., cart, orders).

## Troubleshooting

### "Module not found: pg"
```bash
npm install pg
```

### "connect ECONNREFUSED 127.0.0.1:5432"
Docker PostgreSQL is not running:
```bash
docker-compose ps
docker-compose up -d
```

### "relation ... does not exist"
Database schema not initialized:
```bash
docker exec -i grocery_db psql -U postgres -d grocery < init-db.sql
```

### API route returns 500 error
Check Docker logs:
```bash
docker-compose logs postgres
```

## Next Steps

1. Run `npm install pg`
2. Verify Docker: `docker-compose ps`
3. Start dev server: `npm run dev`
4. Test routes in browser:
   - http://localhost:5173 (should load)
   - http://localhost:5173/api/categories (should show categories JSON)
5. Test auth and cart functionality

## File Structure

```
src/
├── lib/
│   ├── db.ts                    # Database module
│   └── cart.functions.ts        # Updated with db queries
├── routes/
│   ├── index.tsx                # Updated
│   ├── c.$slug.tsx              # Updated
│   ├── v.$slug.tsx              # Updated
│   ├── search.tsx               # Updated
│   └── api/
│       ├── categories.tsx
│       ├── vendors.tsx
│       ├── vendors_/
│       │   └── $slug.tsx
│       └── products/
│           ├── featured.tsx
│           ├── category/
│           │   └── $slug.tsx
│           ├── vendor/
│           │   └── $slug.tsx
│           └── search.tsx
└── integrations/
    └── supabase/
        └── client.ts            # Auth only (no changes needed)
```

## Environment

```env
# Local Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/grocery"
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="grocery"

# Supabase Auth (cloud)
VITE_SUPABASE_URL="https://dsvganthrnvcnpkzztxe.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_fpYvUnShWoNHSwlT8nS5Ow_lQ4j3ZBF"
```
