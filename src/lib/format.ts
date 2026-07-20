// Pricing rules (applied at display time; stored data is untouched):
//   - stored price integers are treated directly as Indian rupees (750 -> ₹750)
//   - a store-wide 30% discount applies to everything
//   - a further flat ₹300 is deducted from every item's unit price (floored at ₹0)
const DISCOUNT_RATE = 0.3;
const FLAT_ITEM_OFF = 300;

/** Effective per-unit item price in rupees: 30% off, then flat ₹300 off, floored at ₹0. */
export function itemPrice(amount: number): number {
  return Math.max(0, amount * (1 - DISCOUNT_RATE) - FLAT_ITEM_OFF);
}

// Delivery pricing: ₹30 per distinct product in the cart, waived once the
// raw (undiscounted) order subtotal exceeds ₹250.
export const DELIVERY_FEE_PER_PRODUCT = 30;
export const FREE_DELIVERY_THRESHOLD = 250;

/** Delivery fee in rupees given the raw order subtotal and distinct product count. */
export function deliveryFee(rawSubtotal: number, distinctProductCount: number): number {
  if (distinctProductCount === 0) return 0;
  if (rawSubtotal > FREE_DELIVERY_THRESHOLD) return 0;
  return distinctProductCount * DELIVERY_FEE_PER_PRODUCT;
}

/** Format a rupee amount as INR. */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}
