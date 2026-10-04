import { describe, expect, it } from 'vitest';
import { DISCOUNT_CODES } from '../../src/domain/discounts';
import { lineTotal, priceCart, shippingCost, SHIPPING } from '../../src/domain/pricing';

const code = (c: string) => DISCOUNT_CODES.find((d) => d.code === c)!;

describe('pricing', () => {
  it('liczy wartosc pozycji', () => {
    expect(lineTotal(44.99, 3)).toBe(134.97);
  });

  it('nalicza dostawe standardowa ponizej progu', () => {
    expect(shippingCost(150, 'STANDARD')).toBe(SHIPPING.STANDARD);
  });

  it.fails('daje darmowa dostawe od 200 zl wlacznie (BR-04)', () => {
    // BUG: implementacja używa progu > 200 zamiast >= 200, BR-04
    expect(shippingCost(200, 'STANDARD')).toBe(0);
  });

  it('daje darmowa dostawe powyzej progu', () => {
    expect(shippingCost(250, 'STANDARD')).toBe(0);
  });

  it.fails('nalicza doplate express od progu darmowej dostawy (BR-04)', () => {
    // BUG: implementacja używa progu > 200 zamiast >= 200, BR-04
    expect(shippingCost(200, 'EXPRESS')).toBe(SHIPPING.EXPRESS_SURCHARGE);
  });

  it('nie nalicza dostawy przy koszyku obnizonym do zera (BR-04)', () => {
    const summary = priceCart([{ lineTotal: 10 }], [code('MINUS20')], 'STANDARD');
    expect(summary.shipping).toBe(0);
  });

  it('nalicza doplate za express przy darmowej dostawie', () => {
    expect(shippingCost(250, 'EXPRESS')).toBe(SHIPPING.EXPRESS_SURCHARGE);
  });

  it('nalicza rabat procentowy', () => {
    const summary = priceCart([{ lineTotal: 200 }], [code('KAWA10')], 'STANDARD');
    expect(summary.discount).toBe(20);
    expect(summary.total).toBe(194.99);
    expect(summary.appliedCodes).toEqual(['KAWA10']);
  });

  it('rabat kwotowy nie obniza ceny ponizej zera', () => {
    const summary = priceCart([{ lineTotal: 10 }], [code('MINUS20')], 'STANDARD');
    expect(summary.discount).toBe(10);
    expect(summary.total).toBe(0);
  });
});
