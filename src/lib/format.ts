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

/** Fees (e.g. delivery): 30% off, no flat deduction. */
export function feePrice(amount: number): number {
  return amount * (1 - DISCOUNT_RATE);
}

/** Format a rupee amount as INR. */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}
