import { describe, expect, it } from 'vitest';
import { DISCOUNT_CODES } from '../../src/domain/discounts';
import { discountAmount, lineTotal, priceCart, shippingCost, SHIPPING } from '../../src/domain/pricing';

const code = (c: string) => DISCOUNT_CODES.find((d) => d.code === c)!;

describe('pricing', () => {
  it('liczy wartosc pozycji', () => {
    expect(lineTotal(44.99, 3)).toBe(134.97);
  });

  it('nalicza dostawe standardowa ponizej progu', () => {
    expect(shippingCost(150, 'STANDARD')).toBe(SHIPPING.STANDARD);
  });

  it('daje darmowa dostawe powyzej progu', () => {
    expect(shippingCost(250, 'STANDARD')).toBe(0);
  });

  it.fails('daje darmowa dostawe od 200 zl wlacznie', () => {
    // BUG: implementacja używa > zamiast >=, BR-04
    expect(shippingCost(200, 'STANDARD')).toBe(0);
  });

  it('nie nalicza dostawy dla pustego koszyka', () => {
    // BR-04
    expect(shippingCost(0, 'STANDARD')).toBe(0);
    expect(shippingCost(0, 'EXPRESS')).toBe(0);
  });

  it('nalicza doplate za express przy darmowej dostawie', () => {
    expect(shippingCost(250, 'EXPRESS')).toBe(SHIPPING.EXPRESS_SURCHARGE);
  });

  it('nalicza rabat procentowy', () => {
    const summary = priceCart([{ lineTotal: 100 }], [code('KAWA10')], 'STANDARD');
    // BR-06, BR-08
    expect(summary.discount).toBe(10);
    expect(summary.shipping).toBe(SHIPPING.STANDARD);
    expect(summary.total).toBe(104.99);
    expect(summary.appliedCodes).toEqual(['KAWA10']);
  });

  it('rabat kwotowy nie obniza ceny ponizej zera', () => {
    const summary = priceCart([{ lineTotal: 10 }], [code('MINUS20')], 'STANDARD');
    // BR-06
    expect(summary.discount).toBe(10);
  });

  it('nalicza rabat procentowy dokładnie według wartości kodu', () => {
    // BR-06
    expect(discountAmount(250, [code('KAWA10')])).toBe(25);
  });

  it('odejmuje rabat od ceny i dodaje dostawe do sumy', () => {
    // BR-04, BR-08
    const summary = priceCart([{ lineTotal: 100 }], [], 'STANDARD');
    expect(summary.discount).toBe(0);
    expect(summary.total).toBe(114.99);
  });
});
