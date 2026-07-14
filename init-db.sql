-- Initialize auth schema (basic setup for Supabase auth compatibility)
CREATE SCHEMA auth;

-- Create users table in auth schema
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMPTZ,
  raw_user_meta_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create a simple function to get the current user ID (auth.uid())
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::jsonb->>'sub'::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now run all the migrations
-- Migration 1: Main schema
-- ============ VENDORS ============
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  location TEXT,
  hero_color TEXT DEFAULT '#1F5F3F',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vendors TO postgres;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors_public_read" ON public.vendors FOR SELECT USING (true);

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT,
  sort_order INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.categories TO postgres;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL,
  unit_label TEXT,
  image_url TEXT,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  dietary_tags TEXT[] NOT NULL DEFAULT '{}',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products(category_id);
CREATE INDEX products_vendor_idx ON public.products(vendor_id);
CREATE INDEX products_search_idx ON public.products USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));
GRANT SELECT ON public.products TO postgres;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (true);

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO postgres;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_upsert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CARTS ============
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
CREATE INDEX cart_items_user_idx ON public.cart_items(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO postgres;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_items_own" ON public.cart_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_cents INT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_user_idx ON public.orders(user_id);
GRANT SELECT, INSERT ON public.orders TO postgres;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_own_select" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_own_insert" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  price_cents INT NOT NULL,
  quantity INT NOT NULL
);
CREATE INDEX order_items_order_idx ON public.order_items(order_id);
GRANT SELECT, INSERT ON public.order_items TO postgres;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_own_select" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "order_items_own_insert" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- ============ SEED DATA ============
INSERT INTO public.categories (slug, name, emoji, sort_order) VALUES
  ('produce', 'Produce', '🥦', 1),
  ('dairy', 'Dairy & Eggs', '🥛', 2),
  ('bakery', 'Bakery', '🍞', 3),
  ('meat', 'Meat & Seafood', '🥩', 4),
  ('pantry', 'Pantry', '🥫', 5),
  ('beverages', 'Beverages', '🥤', 6),
  ('snacks', 'Snacks', '🍫', 7),
  ('frozen', 'Frozen', '🧊', 8);

INSERT INTO public.vendors (slug, name, tagline, description, location, hero_color) VALUES
  ('green-acre-farm', 'Green Acre Farm', 'Organic produce, picked yesterday', 'A family-run farm growing heirloom vegetables and stone fruit on 40 acres just outside the city.', 'Sonoma County, CA', '#1F5F3F'),
  ('rossis-bakery', 'Rossi''s Bakery', 'Sourdough since 1974', 'Old-world breads and pastries baked in a wood-fired oven every morning at 4am.', 'North Beach, SF', '#B8621B'),
  ('blue-sea-fisheries', 'Blue Sea Fisheries', 'Wild-caught, day-boat fresh', 'Sustainable seafood sourced from small Pacific day boats. Never farmed, never frozen.', 'Half Moon Bay, CA', '#1E5F80'),
  ('meadow-dairy-co', 'Meadow Dairy Co.', 'Milk from happy cows', 'Small-herd dairy producing organic milk, butter, and aged cheeses in the Sierra foothills.', 'Nevada City, CA', '#8B5E34'),
  ('valle-verde-pantry', 'Valle Verde Pantry', 'Slow-cooked, small-batch', 'Handmade sauces, oils, and preserves inspired by Mediterranean family recipes.', 'Berkeley, CA', '#6B8E23'),
  ('kettle-and-cane', 'Kettle & Cane', 'Craft snacks & drinks', 'Small-batch chocolate, kombucha, and roasted nuts from independent makers.', 'Oakland, CA', '#4A2C2A');

-- Products seed with Wikipedia Commons images
WITH v AS (SELECT id, slug FROM public.vendors), c AS (SELECT id, slug FROM public.categories)
INSERT INTO public.products (slug, name, description, price_cents, unit_label, image_url, vendor_id, category_id, dietary_tags, featured)
SELECT p.slug, p.name, p.description, p.price_cents, p.unit_label, p.image_url,
  (SELECT id FROM v WHERE slug = p.vendor_slug),
  (SELECT id FROM c WHERE slug = p.category_slug),
  p.dietary_tags, p.featured
FROM (VALUES
  -- Green Acre Farm (produce)
  ('heirloom-tomatoes', 'Heirloom Tomatoes', 'A rainbow mix of Brandywine, Cherokee Purple, and Green Zebra. Picked at peak ripeness.', 650, '500g', 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Ranunculus_acris_001.JPG', 'green-acre-farm', 'produce', ARRAY['organic','vegan'], true),
  ('rainbow-carrots', 'Rainbow Carrots', 'Purple, yellow, and orange carrots with tops on. Sweet and crunchy.', 425, 'bunch', 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Carrots_of_many_colors.jpg', 'green-acre-farm', 'produce', ARRAY['organic','vegan','gluten-free'], false),
  ('baby-spinach', 'Baby Spinach', 'Tender, triple-washed baby spinach. Ready to eat.', 550, '200g', 'https://upload.wikimedia.org/wikipedia/commons/4/41/Spinacia_oleracea_002.jpg', 'green-acre-farm', 'produce', ARRAY['organic','vegan'], false),
  ('avocados', 'Hass Avocados', 'Perfectly ripe Hass avocados. Ready for tonight''s toast.', 899, '4 pack', 'https://upload.wikimedia.org/wikipedia/commons/5/54/Avocado.jpg', 'green-acre-farm', 'produce', ARRAY['organic','vegan','keto'], false),
  ('kale-bunch', 'Lacinato Kale', 'Deep green, blistered leaves. Perfect for salads or sautéing.', 375, 'bunch', 'https://upload.wikimedia.org/wikipedia/commons/9/93/Kale_-_Lacinato.jpg', 'green-acre-farm', 'produce', ARRAY['organic','vegan','keto'], false),
  ('strawberries', 'Strawberries', 'Small, intensely sweet berries. Grown without pesticides.', 599, '1 pint', 'https://upload.wikimedia.org/wikipedia/commons/2/29/Fragaria_x_ananassa_Deutsch_Gaertner.jpg', 'green-acre-farm', 'produce', ARRAY['organic','vegan'], true),
  ('meyer-lemons', 'Meyer Lemons', 'Fragrant Meyer lemons. Sweeter and less acidic than regular lemons.', 499, '6 pack', 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Lemon_-_whole_-_exterior.jpg', 'green-acre-farm', 'produce', ARRAY['organic','vegan'], false),

  -- Rossi's Bakery
  ('sourdough-loaf', 'Country Sourdough', 'A classic 800g boule with a crackling crust and open crumb. Made with our 50-year-old starter.', 750, '800g loaf', 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Sourdough_ww.jpg', 'rossis-bakery', 'bakery', ARRAY['vegan'], true),
  ('baguette', 'Baguette', 'Hand-shaped baguette with a golden crust and airy interior.', 425, 'each', 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Baguette_de_Montignac.jpg', 'rossis-bakery', 'bakery', ARRAY['vegan'], false),
  ('focaccia', 'Rosemary Focaccia', 'Olive-oil soaked focaccia with fresh rosemary and flaky salt.', 850, '400g', 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Pissaladiere.jpg', 'rossis-bakery', 'bakery', ARRAY['vegan'], true),
  ('croissants', 'Butter Croissants', 'Laminated 27 times with French butter. Impossibly flaky.', 1200, '4 pack', 'https://upload.wikimedia.org/wikipedia/commons/2/27/Croissant_de_oro.jpg', 'rossis-bakery', 'bakery', ARRAY['vegetarian'], true),
  ('rye-loaf', 'Dark Rye', 'Dense, seed-topped rye with molasses and caraway.', 825, '700g', 'https://upload.wikimedia.org/wikipedia/commons/9/95/Rye_bread.jpg', 'rossis-bakery', 'bakery', ARRAY['vegan'], false),
  ('cinnamon-buns', 'Cinnamon Buns', 'Warm brioche swirled with cinnamon sugar and topped with cream cheese glaze.', 1450, '6 pack', 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Cinnamon_rolls.jpg', 'rossis-bakery', 'bakery', ARRAY['vegetarian'], false),

  -- Blue Sea Fisheries
  ('king-salmon', 'Wild King Salmon', 'Line-caught Pacific king salmon fillet. Rich, buttery, and sustainable.', 2450, '400g', 'https://upload.wikimedia.org/wikipedia/commons/2/25/Salmon_sashimi.jpg', 'blue-sea-fisheries', 'meat', ARRAY['gluten-free','keto'], true),
  ('bay-scallops', 'Bay Scallops', 'Sweet, small bay scallops. Sear hot and fast.', 1899, '300g', 'https://upload.wikimedia.org/wikipedia/commons/6/62/Scallops_in_a_saucepan.jpg', 'blue-sea-fisheries', 'meat', ARRAY['gluten-free','keto'], false),
  ('halibut', 'Pacific Halibut', 'Thick-cut halibut steaks. Firm, mild, and versatile.', 2799, '500g', 'https://upload.wikimedia.org/wikipedia/commons/5/50/Hippoglossus_stenolepis1.jpg', 'blue-sea-fisheries', 'meat', ARRAY['gluten-free','keto'], false),
  ('smoked-trout', 'Smoked Trout', 'Cold-smoked over applewood. Ready to serve.', 1650, '250g', 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Fish_Trout.jpg', 'blue-sea-fisheries', 'meat', ARRAY['gluten-free','keto'], false),

  -- Meadow Dairy
  ('whole-milk', 'Organic Whole Milk', 'Non-homogenized cream-top whole milk in a returnable glass bottle.', 675, '1L', 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Milk_glass.jpg', 'meadow-dairy-co', 'dairy', ARRAY['organic','vegetarian'], true),
  ('cultured-butter', 'Cultured Butter', 'Slow-cultured European-style butter with sea salt flakes.', 899, '250g', 'https://upload.wikimedia.org/wikipedia/commons/4/45/Butter.jpg', 'meadow-dairy-co', 'dairy', ARRAY['vegetarian','keto','gluten-free'], true),
  ('aged-cheddar', 'Aged Cheddar', 'Sharp two-year cheddar. Crystalline and complex.', 1250, '200g', 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Camembert_de_Normandie_P1020308.jpg', 'meadow-dairy-co', 'dairy', ARRAY['vegetarian','gluten-free','keto'], false),
  ('fresh-eggs', 'Pasture-Raised Eggs', 'Golden yolks from hens roaming open pasture.', 799, '1 dozen', 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Brown_eggs.jpg', 'meadow-dairy-co', 'dairy', ARRAY['vegetarian','gluten-free','keto'], true),
  ('greek-yogurt', 'Greek Yogurt', 'Thick, strained yogurt with 6% fat. Just milk and cultures.', 599, '500g', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Yogurt.jpg', 'meadow-dairy-co', 'dairy', ARRAY['vegetarian','gluten-free'], false),
  ('mozzarella', 'Fresh Mozzarella', 'Hand-pulled cow''s milk mozzarella. Milky and delicate.', 750, '200g', 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Fresh_mozzarella.jpg', 'meadow-dairy-co', 'dairy', ARRAY['vegetarian','gluten-free'], false),

  -- Valle Verde Pantry
  ('olive-oil', 'Extra Virgin Olive Oil', 'First cold-pressed Arbequina olives. Grassy and peppery.', 1899, '500ml', 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg', 'valle-verde-pantry', 'pantry', ARRAY['organic','vegan','gluten-free'], true),
  ('tomato-sauce', 'San Marzano Sauce', 'Slow-simmered San Marzano tomatoes with basil and garlic.', 899, '650g', 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Tomato_je.jpg', 'valle-verde-pantry', 'pantry', ARRAY['vegan','gluten-free'], true),
  ('pasta-bronze', 'Bronze-Cut Rigatoni', 'Rough-textured pasta that holds sauce beautifully.', 550, '500g', 'https://upload.wikimedia.org/wikipedia/commons/6/66/Pasta_by_Zureks.jpg', 'valle-verde-pantry', 'pantry', ARRAY['vegan','vegetarian'], false),
  ('flaky-salt', 'Flaky Sea Salt', 'Pyramid-shaped flakes hand-harvested from evaporated seawater.', 725, '100g', 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Table_salt_on_white_background.jpg', 'valle-verde-pantry', 'pantry', ARRAY['vegan','gluten-free','keto'], false),
  ('honey-jar', 'Wildflower Honey', 'Raw, unfiltered honey from meadow wildflowers.', 1250, '350g', 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Honey_in_a_bowl.jpg', 'valle-verde-pantry', 'pantry', ARRAY['vegetarian','gluten-free'], false),
  ('aged-balsamic', 'Aged Balsamic', '12-year aged balsamic from Modena. Syrupy and complex.', 2299, '250ml', 'https://upload.wikimedia.org/wikipedia/commons/3/39/Balsamic_vinegar.jpg', 'valle-verde-pantry', 'pantry', ARRAY['vegan','gluten-free'], false),

  -- Kettle & Cane
  ('kombucha', 'Ginger Kombucha', 'Small-batch fermented tea with fresh ginger.', 450, '355ml', 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Kombucha_bottles_fresh.jpg', 'kettle-and-cane', 'beverages', ARRAY['vegan','gluten-free'], true),
  ('sparkling-water', 'Grapefruit Sparkling Water', 'Real grapefruit essence, zero sweeteners.', 275, '355ml', 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Grapefruit_and_cross_section.jpg', 'kettle-and-cane', 'beverages', ARRAY['vegan','gluten-free','keto'], false),
  ('cold-brew', 'Cold Brew Coffee', '18-hour cold-brewed single-origin Ethiopian coffee.', 525, '473ml', 'https://upload.wikimedia.org/wikipedia/commons/4/45/A_small_cup_of_coffee.JPG', 'kettle-and-cane', 'beverages', ARRAY['vegan','gluten-free'], true),
  ('dark-chocolate', 'Dark Chocolate 72%', 'Single-origin Peruvian cacao. Notes of cherry and cocoa.', 725, '80g bar', 'https://upload.wikimedia.org/wikipedia/commons/3/35/Cocoa_pods_and_chocolate.jpg', 'kettle-and-cane', 'snacks', ARRAY['vegan','gluten-free'], true),
  ('roasted-almonds', 'Rosemary Almonds', 'California almonds roasted with rosemary and olive oil.', 899, '200g', 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Almonds.jpg', 'kettle-and-cane', 'snacks', ARRAY['vegan','gluten-free','keto'], false),
  ('sea-salt-chips', 'Kettle Chips', 'Thick-cut potatoes fried in avocado oil, dusted with sea salt.', 550, '150g', 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Potato_chips.jpg', 'kettle-and-cane', 'snacks', ARRAY['vegan','gluten-free'], false),
  ('granola', 'Maple Pecan Granola', 'Chunky oat granola with toasted pecans, sweetened with maple syrup.', 1150, '400g', 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Granola.jpg', 'kettle-and-cane', 'snacks', ARRAY['vegan'], false),
  ('dark-chocolate-sea-salt', 'Sea Salt Chocolate', 'Dark chocolate finished with flaky sea salt.', 750, '80g bar', 'https://upload.wikimedia.org/wikipedia/commons/0/07/Chocolate_04.jpg', 'kettle-and-cane', 'snacks', ARRAY['vegan','gluten-free'], false)
) AS p(slug, name, description, price_cents, unit_label, image_url, vendor_slug, category_slug, dietary_tags, featured);

-- Delete White Peaches placeholder product
DELETE FROM public.products WHERE slug = 'white-peaches';
