# Local Database Migration Guide

You've chosen to keep **Supabase Auth** while using a **local PostgreSQL database** for data.

## What Changed

- ✅ **Supabase Auth**: Still using cloud Supabase for authentication
- ✅ **Local PostgreSQL**: Using Docker PostgreSQL for all data queries
- 📝 **Code Changes**: Routes need to be updated to use direct database queries

## Step 1: Install PostgreSQL Client

```bash
npm install pg
```

This installs the PostgreSQL client library for Node.js.

## Step 2: Verify Docker Database is Running

```bash
docker-compose up -d
docker exec -i grocery_db psql -U postgres -d grocery < init-db.sql
```

## Step 3: Update Your Routes

The app now uses:
- **`supabase` client** for authentication only
- **`queryAll()`, `queryOne()` from `src/lib/db.ts`** for database queries

### Example: Updating the Home Page

**Before** (using Supabase for queries):
```typescript
const { data: categories } = useQuery({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return data;
  },
});
```

**After** (using direct PostgreSQL):
```typescript
const { data: categories } = useQuery({
  queryKey: ["categories"],
  queryFn: async () => {
    const response = await fetch("/api/categories");
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
  },
});
```

And create an API route handler (`src/routes/api/categories.ts`):
```typescript
import { queryAll } from "@/lib/db";

export async function GET() {
  const categories = await queryAll(
    "SELECT * FROM public.categories ORDER BY sort_order"
  );
  return new Response(JSON.stringify(categories), {
    headers: { "Content-Type": "application/json" },
  });
}
```

## Step 4: Migration Strategy

### Option A: Gradual Migration (Recommended)
1. Create API routes for each data query
2. Update routes one at a time
3. Test each change

### Option B: Direct Database Queries (for server-side components)
For server components, you can import `queryAll()` directly:

```typescript
import { queryAll } from "@/lib/db";

// In a server component or loader
const categories = await queryAll(
  "SELECT * FROM public.categories ORDER BY sort_order"
);
```

## API Routes to Create

Based on your current queries, create these API routes:

- `GET /api/categories` - All categories
- `GET /api/vendors` - All vendors  
- `GET /api/vendors/:slug` - Single vendor
- `GET /api/products/featured` - Featured products
- `GET /api/products/category/:slug` - Products by category
- `GET /api/products/vendor/:slug` - Products by vendor
- `GET /api/products/search` - Search products
- `GET /api/cart` - User's cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/:id` - Remove from cart
- `GET /api/orders` - User's orders
- `POST /api/orders` - Create order

## Database Query Examples

### Simple SELECT
```typescript
import { queryAll } from "@/lib/db";

const products = await queryAll(
  "SELECT * FROM public.products WHERE featured = true LIMIT 8"
);
```

### SELECT with JOIN
```typescript
const products = await queryAll(
  `SELECT 
    p.id, p.slug, p.name, p.price_cents, p.unit_label, p.image_url,
    v.slug as vendor_slug, v.name as vendor_name
  FROM public.products p
  JOIN public.vendors v ON p.vendor_id = v.id
  WHERE p.featured = true
  LIMIT 8`
);
```

### SELECT with WHERE
```typescript
const product = await queryOne(
  "SELECT * FROM public.products WHERE slug = $1",
  [slug]
);
```

### INSERT (with authentication check)
```typescript
import { queryOne } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";

// Get current user from Supabase auth
const { data: { user } } = await supabase.auth.getUser();

// Insert into database
const result = await queryOne(
  `INSERT INTO public.cart_items (user_id, product_id, quantity)
   VALUES ($1, $2, $3)
   RETURNING *`,
  [user.id, productId, quantity]
);
```

## Authentication with Local Database

The local PostgreSQL has an `auth.users` table that mirrors Supabase's structure:

```sql
INSERT INTO auth.users (email, raw_user_meta_data) 
VALUES ('test@example.com', '{"full_name": "Test User"}');
```

This will automatically create a corresponding `profiles` record due to the trigger.

## Troubleshooting

### "pg module not found"
Run `npm install pg` to install the PostgreSQL client.

### Database connection refused
Make sure Docker is running:
```bash
docker-compose ps
```

You should see the `postgres` container with status "Up".

### Port 5432 in use
If port 5432 is already in use, edit `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Change host port
```

Then update `.env`:
```
DB_PORT="5433"
```

## Environment Variables

These should be in your `.env`:

```
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="grocery"

# Keep Supabase Auth endpoints
VITE_SUPABASE_URL="https://dsvganthrnvcnpkzztxe.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_fpYvUnShWoNHSwlT8nS5Ow_lQ4j3ZBF"
```

## Next Steps

1. ✅ Docker PostgreSQL is set up
2. ⏳ Run `npm install pg`
3. ⏳ Create API routes for your queries
4. ⏳ Update routes to use API endpoints
5. ⏳ Test authentication and data access
6. ⏳ Remove Supabase query code

## Support

If you get stuck:
- Check Docker is running: `docker-compose ps`
- Check database initialized: `docker exec -it grocery_db psql -U postgres -d grocery -c "SELECT COUNT(*) FROM public.products;"`
- Review `src/lib/db.ts` for the database API
- Check `.env` has correct DB credentials
