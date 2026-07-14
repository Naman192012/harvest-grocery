# Local Docker Database Setup

This guide will help you migrate from Supabase to a local PostgreSQL database running in Docker.

## Prerequisites

- Docker Desktop installed on your machine
- Windows, Mac, or Linux

## Step 1: Start the Docker Container

Run the PostgreSQL container with docker-compose:

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL 16 container
- Expose it on `localhost:5432`
- Create a database named `grocery`
- Create a persistent volume for data

Verify it's running:
```bash
docker-compose ps
```

You should see the `postgres` container with status "Up".

## Step 2: Initialize the Database

Initialize the database with the schema and seed data:

```bash
docker exec -i grocery_db psql -U postgres -d grocery < init-db.sql
```

Or if you're using WSL/bash:

```bash
cat init-db.sql | docker exec -i grocery_db psql -U postgres -d grocery
```

This will:
- Create the auth schema and users table
- Create all public tables (vendors, categories, products, etc.)
- Apply row-level security policies
- Seed the database with initial data

## Step 3: Verify the Setup

Connect to the database to verify everything is set up:

```bash
docker exec -it grocery_db psql -U postgres -d grocery -c "SELECT COUNT(*) FROM public.products;"
```

You should see `35` (the number of products seeded).

## Step 4: Update Your Application

Your `.env` file has been updated to point to the local database:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/grocery"
```

### For Supabase Client

If you're using the Supabase JS client, you'll need to:

1. **Option A: Use direct PostgreSQL connection** (recommended)
   - Update your Supabase client to use direct database connection
   - Modify `src/integrations/supabase/client.ts` to connect via PostgreSQL

2. **Option B: Keep using Supabase client with local auth**
   - The Supabase client can work with local auth
   - You'll need to set up authentication differently (no Supabase auth)
   - Consider using a JWT-based auth solution instead

## Common Commands

### View the database:
```bash
docker exec -it grocery_db psql -U postgres -d grocery
```

### Stop the container:
```bash
docker-compose down
```

### Stop and remove data (full reset):
```bash
docker-compose down -v
```

### View logs:
```bash
docker-compose logs -f postgres
```

### Restart the container:
```bash
docker-compose restart
```

## Authentication Considerations

The `handle_new_user()` trigger is configured to automatically create profiles when new auth.users records are inserted. 

When you need to create test users, insert them directly:

```sql
INSERT INTO auth.users (email, raw_user_meta_data) VALUES 
  ('test@example.com', '{"full_name": "Test User"}');
```

This will automatically create a corresponding profile.

## Migrating Data from Supabase (Optional)

If you have existing data in Supabase that you want to migrate:

1. Export data from Supabase
2. Import into your local PostgreSQL
3. Ensure the schema matches

For detailed export/import instructions, see `MIGRATION_GUIDE.md` (coming soon).

## Troubleshooting

### Port 5432 already in use

If port 5432 is already in use, edit `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Use 5433 on host, 5432 in container
```

Update `DATABASE_URL` accordingly:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/grocery"
```

### Connection refused

Wait for the container to be healthy:

```bash
docker exec grocery_db pg_isready -U postgres
```

Keep trying until you see "accepting connections".

### Cannot connect from application

Make sure:
1. Docker container is running: `docker-compose ps`
2. The correct host/port are in your connection string
3. The container name is `grocery_db`

## Next Steps

1. Update your app's Supabase client setup
2. Test database connections from your app
3. Run your dev server to verify everything works
4. Consider setting up a backup strategy for your local data
