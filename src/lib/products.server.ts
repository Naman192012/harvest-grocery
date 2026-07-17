// Hardcoded fallback product data - restore original working data
const productsData = [
  { id: '1', slug: 'heirloom-tomatoes', name: 'Heirloom Tomatoes', description: 'A rainbow mix of Brandywine, Cherokee Purple, and Green Zebra. Picked at peak ripeness.', price_cents: 650, unit_label: '500g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Heirloom_tomatoes.jpg/960px-Heirloom_tomatoes.jpg', vendor_slug: 'green-acre-farm', vendor_name: 'Green Acre Farm', category_slug: 'produce', featured: true },
  { id: '2', slug: 'strawberries', name: 'Strawberries', description: 'Small, intensely sweet berries. Grown without pesticides.', price_cents: 599, unit_label: '1 pint', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Strawberries.jpg/960px-Strawberries.jpg', vendor_slug: 'green-acre-farm', vendor_name: 'Green Acre Farm', category_slug: 'produce', featured: true },
  { id: '3', slug: 'sourdough-loaf', name: 'Country Sourdough', description: 'A classic 800g boule with a crackling crust and open crumb. Made with our 50-year-old starter.', price_cents: 750, unit_label: '800g loaf', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Home_made_sour_dough_bread.jpg/960px-Home_made_sour_dough_bread.jpg', vendor_slug: 'rossis-bakery', vendor_name: "Rossi's Bakery", category_slug: 'bakery', featured: true },
  { id: '4', slug: 'focaccia', name: 'Rosemary Focaccia', description: 'Olive-oil soaked focaccia with fresh rosemary and flaky salt.', price_cents: 850, unit_label: '400g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Focaccia_with_Crumb.jpg/960px-Focaccia_with_Crumb.jpg', vendor_slug: 'rossis-bakery', vendor_name: "Rossi's Bakery", category_slug: 'bakery', featured: true },
  { id: '5', slug: 'croissants', name: 'Butter Croissants', description: 'Laminated 27 times with French butter. Impossibly flaky.', price_cents: 1200, unit_label: '4 pack', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Croissant-Petr_Kratochvil.jpg/960px-Croissant-Petr_Kratochvil.jpg', vendor_slug: 'rossis-bakery', vendor_name: "Rossi's Bakery", category_slug: 'bakery', featured: true },
  { id: '6', slug: 'king-salmon', name: 'Wild King Salmon', description: 'Line-caught Pacific king salmon fillet. Rich, buttery, and sustainable.', price_cents: 2450, unit_label: '400g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Raw_salmon_fillets.jpg/960px-Raw_salmon_fillets.jpg', vendor_slug: 'blue-sea-fisheries', vendor_name: 'Blue Sea Fisheries', category_slug: 'meat', featured: true },
  { id: '7', slug: 'whole-milk', name: 'Organic Whole Milk', description: 'Non-homogenized cream-top whole milk in a returnable glass bottle.', price_cents: 675, unit_label: '1L', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Glass_of_Milk_%2833657535532%29.jpg/960px-Glass_of_Milk_%2833657535532%29.jpg', vendor_slug: 'meadow-dairy-co', vendor_name: 'Meadow Dairy Co.', category_slug: 'dairy', featured: true },
  { id: '8', slug: 'cultured-butter', name: 'Cultured Butter', description: 'Slow-cultured European-style butter with sea salt flakes.', price_cents: 899, unit_label: '250g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Homemade_butter.jpg/960px-Homemade_butter.jpg', vendor_slug: 'meadow-dairy-co', vendor_name: 'Meadow Dairy Co.', category_slug: 'dairy', featured: true },
  { id: '9', slug: 'fresh-eggs', name: 'Pasture-Raised Eggs', description: 'Golden yolks from hens roaming open pasture.', price_cents: 799, unit_label: '1 dozen', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/2020-05-05_19_27_12_An_open_carton_of_a_dozen_Large_Grade_A_Chicken_Eggs_from_Egg-land%27s_Best_in_the_Franklin_Farm_section_of_Oak_Hill%2C_Fairfax_County%2C_Virginia.jpg/960px-thumbnail.jpg', vendor_slug: 'meadow-dairy-co', vendor_name: 'Meadow Dairy Co.', category_slug: 'dairy', featured: true },
];

const vendorsData = [
  { id: 'green-acre-farm', slug: 'green-acre-farm', name: 'Green Acre Farm', tagline: 'Organic produce, picked yesterday', location: 'Sonoma County, CA' },
  { id: 'rossis-bakery', slug: 'rossis-bakery', name: "Rossi's Bakery", tagline: 'Sourdough since 1974', location: 'North Beach, SF' },
  { id: 'blue-sea-fisheries', slug: 'blue-sea-fisheries', name: 'Blue Sea Fisheries', tagline: 'Wild-caught, day-boat fresh', location: 'Half Moon Bay, CA' },
  { id: 'meadow-dairy-co', slug: 'meadow-dairy-co', name: 'Meadow Dairy Co.', tagline: 'Milk from happy cows', location: 'Nevada City, CA' },
  { id: 'valle-verde-pantry', slug: 'valle-verde-pantry', name: 'Valle Verde Pantry', tagline: 'Slow-cooked, small-batch', location: 'Berkeley, CA' },
  { id: 'kettle-and-cane', slug: 'kettle-and-cane', name: 'Kettle & Cane', tagline: 'Craft snacks & drinks', location: 'Oakland, CA' },
  { id: 'frost-and-field', slug: 'frost-and-field', name: 'Frost & Field', tagline: 'Freshly frozen at the peak', location: 'Portland, OR' },
];

const categoriesData = [
  { id: '1', slug: 'produce', name: 'Produce', emoji: '🥦' },
  { id: '2', slug: 'dairy', name: 'Dairy & Eggs', emoji: '🥛' },
  { id: '3', slug: 'bakery', name: 'Bakery', emoji: '🍞' },
  { id: '4', slug: 'meat', name: 'Meat & Seafood', emoji: '🥩' },
  { id: '5', slug: 'pantry', name: 'Pantry', emoji: '🥫' },
  { id: '6', slug: 'beverages', name: 'Beverages', emoji: '🥤' },
  { id: '7', slug: 'snacks', name: 'Snacks', emoji: '🍫' },
  { id: '8', slug: 'frozen', name: 'Frozen', emoji: '🧊' },
];

function shape(p: typeof productsData[number]) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price_cents: p.price_cents,
    unit_label: p.unit_label,
    image_url: p.image_url,
    category_slug: p.category_slug,
    vendor: { name: p.vendor_name, slug: p.vendor_slug },
  };
}

export function getCategories() {
  return categoriesData;
}

export function getCategoryBySlug(slug: string) {
  return categoriesData.find((c) => c.slug === slug) ?? null;
}

export function getFeaturedProducts() {
  return productsData.filter((p) => p.featured).slice(0, 8).map(shape);
}

export function getProductsByCategory(slug: string) {
  return productsData
    .filter((p) => p.category_slug === slug)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name))
    .map(shape);
}

export function searchProducts(q: string) {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  return productsData
    .filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.vendor_name.toLowerCase().includes(term)
    )
    .map(shape);
}

export function getAllVendors() {
  return vendorsData;
}

export function getVendorBySlug(slug: string) {
  return vendorsData.find((v) => v.slug === slug) ?? null;
}

export function getProductsByVendor(slug: string) {
  return productsData.filter((p) => p.vendor_slug === slug).map(shape);
}

export function getProductById(id: string) {
  const p = productsData.find((pr) => pr.id === id);
  return p ? shape(p) : null;
}

export function getProductBySlug(slug: string) {
  const p = productsData.find((pr) => pr.slug === slug);
  if (!p) return null;
  const vendor = getVendorBySlug(p.vendor_slug);
  const category = getCategoryBySlug(p.category_slug);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price_cents: p.price_cents,
    unit_label: p.unit_label,
    image_url: p.image_url,
    category_id: p.category_slug,
    dietary_tags: [] as string[],
    vendor: {
      id: vendor?.id ?? p.vendor_slug,
      slug: p.vendor_slug,
      name: p.vendor_name,
      tagline: vendor?.tagline ?? '',
      location: vendor?.location ?? '',
    },
    category: { slug: p.category_slug, name: category?.name ?? p.category_slug },
  };
}

export function getRelatedProducts(categorySlug: string, excludeSlug: string) {
  return productsData
    .filter((p) => p.category_slug === categorySlug && p.slug !== excludeSlug)
    .slice(0, 4)
    .map(shape);
}
