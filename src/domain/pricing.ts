import type { DiscountCode } from './discounts.js';
import { round2 } from './money.js';

export type ShippingMethod = 'STANDARD' | 'EXPRESS';

export const SHIPPING = {
  STANDARD: 14.99,
  EXPRESS: 24.99,
  /** Doplata za express, gdy dostawa standardowa jest darmowa. */
  EXPRESS_SURCHARGE: 10,
  FREE_THRESHOLD: 200,
} as const;

export interface PricedLine {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface PriceSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  appliedCodes: string[];
}

export function lineTotal(unitPrice: number, quantity: number): number {
  return round2(unitPrice * quantity);
}

export function subtotalOf(lines: Pick<PricedLine, 'lineTotal'>[]): number {
  return round2(lines.reduce((sum, l) => sum + l.lineTotal, 0));
}

export function discountAmount(subtotal: number, codes: DiscountCode[]): number {
  let amount = 0;
  for (const code of codes) {
    if (code.type === 'PERCENT') amount += (subtotal * code.value) / 100;
    else amount += code.value;
  }
  return Math.min(amount, subtotal);
}

/** BR-04: darmowa dostawa standardowa od 200,00 zl wartosci produktow po rabacie. */
export function shippingCost(afterDiscount: number, method: ShippingMethod): number {
  if (afterDiscount === 0) return 0;
  const free = afterDiscount >= SHIPPING.FREE_THRESHOLD;
  if (method === 'EXPRESS') return free ? SHIPPING.EXPRESS_SURCHARGE : SHIPPING.EXPRESS;
  return free ? 0 : SHIPPING.STANDARD;
}

export function priceCart(
  lines: Pick<PricedLine, 'lineTotal'>[],
  codes: DiscountCode[],
  method: ShippingMethod,
): PriceSummary {
  const subtotal = subtotalOf(lines);
  const discount = discountAmount(subtotal, codes);
  const afterDiscount = subtotal - discount;
  const shipping = shippingCost(afterDiscount, method);
  return {
    subtotal,
    discount,
    shipping,
    total: afterDiscount + shipping,
    appliedCodes: codes.map((c) => c.code),
  };
}
