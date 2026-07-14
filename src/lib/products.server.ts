export const productsData = [
  // Green Acre Farm (produce)
  { id: '1', slug: 'heirloom-tomatoes', name: 'Heirloom Tomatoes', description: 'A rainbow mix of Brandywine, Cherokee Purple, and Green Zebra. Picked at peak ripeness.', price_cents: 650, unit_label: '500g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Heirloom_tomatoes.jpg/960px-Heirloom_tomatoes.jpg', vendor_slug: 'green-acre-farm', vendor_name: 'Green Acre Farm', category_slug: 'produce', featured: true },
  { id: '2', slug: 'rainbow-carrots', name: 'Rainbow Carrots', description: 'Purple, yellow, and orange carrots with tops on. Sweet and crunchy.', price_cents: 928.57, unit_label: 'bunch', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Carrots_of_many_colors.jpg/960px-Carrots_of_many_colors.jpg', vendor_slug: 'green-acre-farm', vendor_name: 'Green Acre Farm', category_slug: 'produce', featured: false },
  { id: '3', slug: 'baby-spinach', name: 'Baby Spinach', description: 'Tender, triple-washed baby spinach. Ready to eat.', price_cents: 550, unit_label: '200g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Spinach_leaves.jpg/960px-Spinach_leaves.jpg', vendor_slug: 'green-acre-farm', vendor_name: 'Green Acre Farm', category_slug: 'produce', featured: false },
  { id: '4', slug: 'avocados', name: 'Hass Avocados', description: 'Perfectly ripe Hass avocados. Ready for tonight\'s toast.', price_cents: 899, unit_label: '4 pack', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Avocado_Hass_-_single_and_halved.jpg/960px-Avocado_Hass_-_single_and_halved.jpg', vendor_slug: 'green-acre-farm', vendor_name: 'Green Acre Farm', category_slug: 'produce', featured: false },
  { id: '5', slug: 'kale-bunch', name: 'Lacinato Kale', description: 'Deep green, blistered leaves. Perfect for salads or sautéing.', price_cents: 857.14, unit_label: 'bunch', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Lacinato_kale.jpg/960px-Lacinato_kale.jpg', vendor_slug: 'green-acre-farm', vendor_name: 'Green Acre Farm', category_slug: 'produce', featured: false },
  { id: '6', slug: 'strawberries', name: 'Strawberries', description: 'Small, intensely sweet berries. Grown without pesticides.', price_cents: 599, unit_label: '1 pint', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Strawberries.jpg/960px-Strawberries.jpg', vendor_slug: 'green-acre-farm', vendor_name: 'Green Acre Farm', category_slug: 'produce', featured: true },
  { id: '7', slug: 'meyer-lemons', name: 'Meyer Lemons', description: 'Fragrant Meyer lemons. Sweeter and less acidic than regular lemons.', price_cents: 499, unit_label: '6 pack', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Meyer_Lemon.jpg/960px-Meyer_Lemon.jpg', vendor_slug: 'green-acre-farm', vendor_name: 'Green Acre Farm', category_slug: 'produce', featured: false },

  // Rossi's Bakery
  { id: '8', slug: 'sourdough-loaf', name: 'Country Sourdough', description: 'A classic 800g boule with a crackling crust and open crumb. Made with our 50-year-old starter.', price_cents: 750, unit_label: '800g loaf', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Home_made_sour_dough_bread.jpg/960px-Home_made_sour_dough_bread.jpg', vendor_slug: 'rossis-bakery', vendor_name: 'Rossi\'s Bakery', category_slug: 'bakery', featured: true },
  { id: '9', slug: 'baguette', name: 'Baguette', description: 'Hand-shaped baguette with a golden crust and airy interior.', price_cents: 714.29, unit_label: 'each', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Baguettes%2C_Paris%2C_France_-_panoramio.jpg/960px-Baguettes%2C_Paris%2C_France_-_panoramio.jpg', vendor_slug: 'rossis-bakery', vendor_name: 'Rossi\'s Bakery', category_slug: 'bakery', featured: false },
  { id: '10', slug: 'focaccia', name: 'Rosemary Focaccia', description: 'Olive-oil soaked focaccia with fresh rosemary and flaky salt.', price_cents: 850, unit_label: '400g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Focaccia_with_Crumb.jpg/960px-Focaccia_with_Crumb.jpg', vendor_slug: 'rossis-bakery', vendor_name: 'Rossi\'s Bakery', category_slug: 'bakery', featured: true },
  { id: '11', slug: 'croissants', name: 'Butter Croissants', description: 'Laminated 27 times with French butter. Impossibly flaky.', price_cents: 1200, unit_label: '4 pack', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Croissant-Petr_Kratochvil.jpg/960px-Croissant-Petr_Kratochvil.jpg', vendor_slug: 'rossis-bakery', vendor_name: 'Rossi\'s Bakery', category_slug: 'bakery', featured: true },
  { id: '12', slug: 'rye-loaf', name: 'Dark Rye', description: 'Dense, seed-topped rye with molasses and caraway.', price_cents: 825, unit_label: '700g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Market_Bread%2C_Riga%2C_Latvia.jpg/960px-Market_Bread%2C_Riga%2C_Latvia.jpg', vendor_slug: 'rossis-bakery', vendor_name: 'Rossi\'s Bakery', category_slug: 'bakery', featured: false },
  { id: '13', slug: 'cinnamon-buns', name: 'Cinnamon Buns', description: 'Warm brioche swirled with cinnamon sugar and topped with cream cheese glaze.', price_cents: 1450, unit_label: '6 pack', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Cinnamon_roll_in_Stockholm.jpg/960px-Cinnamon_roll_in_Stockholm.jpg', vendor_slug: 'rossis-bakery', vendor_name: 'Rossi\'s Bakery', category_slug: 'bakery', featured: false },

  // Blue Sea Fisheries
  { id: '14', slug: 'king-salmon', name: 'Wild King Salmon', description: 'Line-caught Pacific king salmon fillet. Rich, buttery, and sustainable.', price_cents: 2450, unit_label: '400g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Raw_salmon_fillets.jpg/960px-Raw_salmon_fillets.jpg', vendor_slug: 'blue-sea-fisheries', vendor_name: 'Blue Sea Fisheries', category_slug: 'meat', featured: true },
  { id: '15', slug: 'bay-scallops', name: 'Bay Scallops', description: 'Sweet, small bay scallops. Sear hot and fast.', price_cents: 1899, unit_label: '300g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Scallops.jpg/960px-Scallops.jpg', vendor_slug: 'blue-sea-fisheries', vendor_name: 'Blue Sea Fisheries', category_slug: 'meat', featured: false },
  { id: '16', slug: 'halibut', name: 'Pacific Halibut', description: 'Thick-cut halibut steaks. Firm, mild, and versatile.', price_cents: 2799, unit_label: '500g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Hippoglossus_hippoglossus.jpg/960px-Hippoglossus_hippoglossus.jpg', vendor_slug: 'blue-sea-fisheries', vendor_name: 'Blue Sea Fisheries', category_slug: 'meat', featured: false },
  { id: '17', slug: 'smoked-trout', name: 'Smoked Trout', description: 'Cold-smoked over applewood. Ready to serve.', price_cents: 1650, unit_label: '250g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Smoked_trout.jpg/960px-Smoked_trout.jpg', vendor_slug: 'blue-sea-fisheries', vendor_name: 'Blue Sea Fisheries', category_slug: 'meat', featured: false },

  // Meadow Dairy
  { id: '18', slug: 'whole-milk', name: 'Organic Whole Milk', description: 'Non-homogenized cream-top whole milk in a returnable glass bottle.', price_cents: 675, unit_label: '1L', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Glass_of_Milk_%2833657535532%29.jpg/960px-Glass_of_Milk_%2833657535532%29.jpg', vendor_slug: 'meadow-dairy-co', vendor_name: 'Meadow Dairy Co.', category_slug: 'dairy', featured: true },
  { id: '19', slug: 'cultured-butter', name: 'Cultured Butter', description: 'Slow-cultured European-style butter with sea salt flakes.', price_cents: 899, unit_label: '250g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Homemade_butter.jpg/960px-Homemade_butter.jpg', vendor_slug: 'meadow-dairy-co', vendor_name: 'Meadow Dairy Co.', category_slug: 'dairy', featured: true },
  { id: '20', slug: 'aged-cheddar', name: 'Aged Cheddar', description: 'Sharp two-year cheddar. Crystalline and complex.', price_cents: 1250, unit_label: '200g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Somerset-Cheddar.jpg', vendor_slug: 'meadow-dairy-co', vendor_name: 'Meadow Dairy Co.', category_slug: 'dairy', featured: false },
  { id: '21', slug: 'fresh-eggs', name: 'Pasture-Raised Eggs', description: 'Golden yolks from hens roaming open pasture.', price_cents: 799, unit_label: '1 dozen', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/2020-05-05_19_27_12_An_open_carton_of_a_dozen_Large_Grade_A_Chicken_Eggs_from_Egg-land%27s_Best_in_the_Franklin_Farm_section_of_Oak_Hill%2C_Fairfax_County%2C_Virginia.jpg/960px-thumbnail.jpg', vendor_slug: 'meadow-dairy-co', vendor_name: 'Meadow Dairy Co.', category_slug: 'dairy', featured: true },
  { id: '22', slug: 'greek-yogurt', name: 'Greek Yogurt', description: 'Thick, strained yogurt with 6% fat. Just milk and cultures.', price_cents: 599, unit_label: '500g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Joghurt.jpg/960px-Joghurt.jpg', vendor_slug: 'meadow-dairy-co', vendor_name: 'Meadow Dairy Co.', category_slug: 'dairy', featured: false },
  { id: '23', slug: 'mozzarella', name: 'Fresh Mozzarella', description: 'Hand-pulled cow\'s milk mozzarella. Milky and delicate.', price_cents: 750, unit_label: '200g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Mozzarella_di_bufala3.jpg/960px-Mozzarella_di_bufala3.jpg', vendor_slug: 'meadow-dairy-co', vendor_name: 'Meadow Dairy Co.', category_slug: 'dairy', featured: false },

  // Valle Verde Pantry
  { id: '24', slug: 'olive-oil', name: 'Extra Virgin Olive Oil', description: 'First cold-pressed Arbequina olives. Grassy and peppery.', price_cents: 1899, unit_label: '500ml', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Olive_oil_bottle_Bertolli_Riserva_Premium.jpg/960px-Olive_oil_bottle_Bertolli_Riserva_Premium.jpg', vendor_slug: 'valle-verde-pantry', vendor_name: 'Valle Verde Pantry', category_slug: 'pantry', featured: true },
  { id: '25', slug: 'tomato-sauce', name: 'San Marzano Sauce', description: 'Slow-simmered San Marzano tomatoes with basil and garlic.', price_cents: 899, unit_label: '650g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Fresh_Tomato_Sauce_%28Unsplash%29.jpg/960px-Fresh_Tomato_Sauce_%28Unsplash%29.jpg', vendor_slug: 'valle-verde-pantry', vendor_name: 'Valle Verde Pantry', category_slug: 'pantry', featured: true },
  { id: '26', slug: 'pasta-bronze', name: 'Bronze-Cut Rigatoni', description: 'Rough-textured pasta that holds sauce beautifully.', price_cents: 550, unit_label: '500g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Rigatoni.jpg/960px-Rigatoni.jpg', vendor_slug: 'valle-verde-pantry', vendor_name: 'Valle Verde Pantry', category_slug: 'pantry', featured: false },
  { id: '27', slug: 'flaky-salt', name: 'Flaky Sea Salt', description: 'Pyramid-shaped flakes hand-harvested from evaporated seawater.', price_cents: 725, unit_label: '100g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/FleurDeSel.JPG', vendor_slug: 'valle-verde-pantry', vendor_name: 'Valle Verde Pantry', category_slug: 'pantry', featured: false },
  { id: '28', slug: 'honey-jar', name: 'Wildflower Honey', description: 'Raw, unfiltered honey from meadow wildflowers.', price_cents: 1250, unit_label: '350g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Runny_hunny.jpg/960px-Runny_hunny.jpg', vendor_slug: 'valle-verde-pantry', vendor_name: 'Valle Verde Pantry', category_slug: 'pantry', featured: false },
  { id: '29', slug: 'aged-balsamic', name: 'Aged Balsamic', description: '12-year aged balsamic from Modena. Syrupy and complex.', price_cents: 2299, unit_label: '250ml', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Traditional_Balsamic_Vinegars_of_Modena_%28right%29_and_Reggio_Emilia_%28left%29.jpg/960px-Traditional_Balsamic_Vinegars_of_Modena_%28right%29_and_Reggio_Emilia_%28left%29.jpg', vendor_slug: 'valle-verde-pantry', vendor_name: 'Valle Verde Pantry', category_slug: 'pantry', featured: false },

  // Kettle & Cane
  { id: '30', slug: 'kombucha', name: 'Ginger Kombucha', description: 'Small-batch fermented tea with fresh ginger.', price_cents: 450, unit_label: '355ml', image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Kombucha_Mature.jpg', vendor_slug: 'kettle-and-cane', vendor_name: 'Kettle & Cane', category_slug: 'beverages', featured: true },
  { id: '31', slug: 'sparkling-water', name: 'Grapefruit Sparkling Water', description: 'Real grapefruit essence, zero sweeteners.', price_cents: 885.71, unit_label: '355ml', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Sparkling_Water_with_Mint_in_Glass_Cup.jpg/960px-Sparkling_Water_with_Mint_in_Glass_Cup.jpg', vendor_slug: 'kettle-and-cane', vendor_name: 'Kettle & Cane', category_slug: 'beverages', featured: false },
  { id: '32', slug: 'cold-brew', name: 'Cold Brew Coffee', description: '18-hour cold-brewed single-origin Ethiopian coffee.', price_cents: 525, unit_label: '473ml', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Iced_Coffee_in_Glass_-_Sunshine_Coffee_-_Laramie_Cafe_%2853838344552%29.jpg/960px-Iced_Coffee_in_Glass_-_Sunshine_Coffee_-_Laramie_Cafe_%2853838344552%29.jpg', vendor_slug: 'kettle-and-cane', vendor_name: 'Kettle & Cane', category_slug: 'beverages', featured: true },
  { id: '33', slug: 'dark-chocolate', name: 'Dark Chocolate 72%', description: 'Single-origin Peruvian cacao. Notes of cherry and cocoa.', price_cents: 725, unit_label: '80g bar', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Green_and_Black%27s_dark_chocolate_bar_2.jpg/960px-Green_and_Black%27s_dark_chocolate_bar_2.jpg', vendor_slug: 'kettle-and-cane', vendor_name: 'Kettle & Cane', category_slug: 'snacks', featured: true },
  { id: '34', slug: 'roasted-almonds', name: 'Rosemary Almonds', description: 'California almonds roasted with rosemary and olive oil.', price_cents: 899, unit_label: '200g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Heap_of_almonds.jpg/960px-Heap_of_almonds.jpg', vendor_slug: 'kettle-and-cane', vendor_name: 'Kettle & Cane', category_slug: 'snacks', featured: false },
  { id: '35', slug: 'sea-salt-chips', name: 'Kettle Chips', description: 'Thick-cut potatoes fried in avocado oil, dusted with sea salt.', price_cents: 550, unit_label: '150g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Potato_Chips.jpg/960px-Potato_Chips.jpg', vendor_slug: 'kettle-and-cane', vendor_name: 'Kettle & Cane', category_slug: 'snacks', featured: false },
  { id: '36', slug: 'granola', name: 'Maple Pecan Granola', description: 'Chunky oat granola with toasted pecans, sweetened with maple syrup.', price_cents: 1150, unit_label: '400g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Granola_with_soymilk_and_berries_flickr_user_rubbermaid_products.jpg/960px-Granola_with_soymilk_and_berries_flickr_user_rubbermaid_products.jpg', vendor_slug: 'kettle-and-cane', vendor_name: 'Kettle & Cane', category_slug: 'snacks', featured: false },
  { id: '37', slug: 'dark-chocolate-sea-salt', name: 'Sea Salt Chocolate', description: 'Dark chocolate finished with flaky sea salt.', price_cents: 750, unit_label: '80g bar', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/2020-02-23_02_24_15_A_Ghirardelli_Dark_Chocolate_Mint_Square_broken_into_two_pieces_in_the_Parkway_Village_section_of_Ewing_Township%2C_Mercer_County%2C_New_Jersey.jpg/960px-thumbnail.jpg', vendor_slug: 'kettle-and-cane', vendor_name: 'Kettle & Cane', category_slug: 'snacks', featured: false },

  // Frost & Field (frozen)
  { id: '38', slug: 'frozen-blueberries', name: 'Wild Blueberries', description: 'Flash-frozen wild blueberries picked at peak ripeness. Perfect for smoothies, oatmeal, and baking.', price_cents: 599, unit_label: '500g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Blueberries.jpg', vendor_slug: 'frost-and-field', vendor_name: 'Frost & Field', category_slug: 'frozen', featured: true },
  { id: '39', slug: 'garden-peas', name: 'Garden Peas', description: 'Sweet green peas frozen within hours of picking to lock in flavor and color.', price_cents: 1000, unit_label: '1kg', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Peas.jpg/960px-Peas.jpg', vendor_slug: 'frost-and-field', vendor_name: 'Frost & Field', category_slug: 'frozen', featured: false },
  { id: '40', slug: 'vanilla-ice-cream', name: 'Vanilla Bean Ice Cream', description: 'Slow-churned ice cream made with real Madagascar vanilla beans and fresh cream.', price_cents: 850, unit_label: '500ml', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Vanilla_ice_cream.jpg/960px-Vanilla_ice_cream.jpg', vendor_slug: 'frost-and-field', vendor_name: 'Frost & Field', category_slug: 'frozen', featured: true },
  { id: '41', slug: 'margherita-pizza', name: 'Margherita Pizza', description: 'Stone-baked thin-crust pizza with San Marzano tomatoes, mozzarella, and basil. Oven-ready.', price_cents: 1150, unit_label: 'each', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Frozen_pizza.jpg/960px-Frozen_pizza.jpg', vendor_slug: 'frost-and-field', vendor_name: 'Frost & Field', category_slug: 'frozen', featured: false },
  { id: '42', slug: 'pork-dumplings', name: 'Pork Dumplings', description: 'Hand-folded dumplings with seasoned pork and chives. Steam or pan-fry from frozen.', price_cents: 899, unit_label: '20 pack', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Jiaozi.jpg/960px-Jiaozi.jpg', vendor_slug: 'frost-and-field', vendor_name: 'Frost & Field', category_slug: 'frozen', featured: true },
  { id: '43', slug: 'sweet-potato-fries', name: 'Sweet Potato Fries', description: 'Crispy oven-baked sweet potato fries cut thick and lightly seasoned with sea salt.', price_cents: 550, unit_label: '600g', image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/83/French_Fries.JPG', vendor_slug: 'frost-and-field', vendor_name: 'Frost & Field', category_slug: 'frozen', featured: false }
];

export const vendorsData = [
  { id: 'green-acre-farm', slug: 'green-acre-farm', name: 'Green Acre Farm', tagline: 'Organic produce, picked yesterday', description: 'A family-run farm growing heirloom vegetables and stone fruit on 40 acres just outside the city.', location: 'Sonoma County, CA', hero_color: '#1F5F3F' },
  { id: 'rossis-bakery', slug: 'rossis-bakery', name: "Rossi's Bakery", tagline: 'Sourdough since 1974', description: 'Old-world breads and pastries baked in a wood-fired oven every morning at 4am.', location: 'North Beach, SF', hero_color: '#B8621B' },
  { id: 'blue-sea-fisheries', slug: 'blue-sea-fisheries', name: 'Blue Sea Fisheries', tagline: 'Wild-caught, day-boat fresh', description: 'Sustainable seafood sourced from small Pacific day boats. Never farmed, never frozen.', location: 'Half Moon Bay, CA', hero_color: '#1E5F80' },
  { id: 'meadow-dairy-co', slug: 'meadow-dairy-co', name: 'Meadow Dairy Co.', tagline: 'Milk from happy cows', description: 'Small-herd dairy producing organic milk, butter, and aged cheeses in the Sierra foothills.', location: 'Nevada City, CA', hero_color: '#8B5E34' },
  { id: 'valle-verde-pantry', slug: 'valle-verde-pantry', name: 'Valle Verde Pantry', tagline: 'Slow-cooked, small-batch', description: 'Handmade sauces, oils, and preserves inspired by Mediterranean family recipes.', location: 'Berkeley, CA', hero_color: '#6B8E23' },
  { id: 'kettle-and-cane', slug: 'kettle-and-cane', name: 'Kettle & Cane', tagline: 'Craft snacks & drinks', description: 'Small-batch chocolate, kombucha, and roasted nuts from independent makers.', location: 'Oakland, CA', hero_color: '#4A2C2A' },
  { id: 'frost-and-field', slug: 'frost-and-field', name: 'Frost & Field', tagline: 'Freshly frozen at the peak', description: 'Flash-frozen fruit, vegetables, and prepared meals locked in at peak freshness.', location: 'Portland, OR', hero_color: '#2E6E9E' },
];

const categoriesData = [
  { id: '1', slug: 'produce', name: 'Produce', emoji: '🥦', sort_order: 1 },
  { id: '2', slug: 'dairy', name: 'Dairy & Eggs', emoji: '🥛', sort_order: 2 },
  { id: '3', slug: 'bakery', name: 'Bakery', emoji: '🍞', sort_order: 3 },
  { id: '4', slug: 'meat', name: 'Meat & Seafood', emoji: '🥩', sort_order: 4 },
  { id: '5', slug: 'pantry', name: 'Pantry', emoji: '🥫', sort_order: 5 },
  { id: '6', slug: 'beverages', name: 'Beverages', emoji: '🥤', sort_order: 6 },
  { id: '7', slug: 'snacks', name: 'Snacks', emoji: '🍫', sort_order: 7 },
  { id: '8', slug: 'frozen', name: 'Frozen', emoji: '🧊', sort_order: 8 },
];

// Shape a raw product into the form the UI components expect (nested vendor).
function shape(p: (typeof productsData)[number]) {
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
  return categoriesData.find(c => c.slug === slug) ?? null;
}

export function getFeaturedProducts() {
  return productsData.filter(p => p.featured).slice(0, 8).map(shape);
}

export function getProductsByCategory(slug: string) {
  return productsData
    .filter(p => p.category_slug === slug)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name))
    .map(shape);
}

export function searchProducts(q: string) {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  return productsData
    .filter(p =>
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
  return vendorsData.find(v => v.slug === slug) ?? null;
}

export function getProductsByVendor(slug: string) {
  return productsData.filter(p => p.vendor_slug === slug).map(shape);
}

export function getProductBySlug(slug: string) {
  const p = productsData.find(pr => pr.slug === slug);
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
    .filter(p => p.category_slug === categorySlug && p.slug !== excludeSlug)
    .slice(0, 4)
    .map(shape);
}
