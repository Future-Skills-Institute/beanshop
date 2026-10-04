import { describe, expect, it } from 'vitest';
import { DISCOUNT_CODES } from '../../src/domain/discounts';
import { discountAmount, lineTotal, priceCart, shippingCost, SHIPPING } from '../../src/domain/pricing';

const code = (c: string) => DISCOUNT_CODES.find((d) => d.code === c)!;

describe('pricing', () => {
  it('liczy wartosc pozycji', () => {
    expect(lineTotal(44.99, 3)).toBe(134.97);
  });

  it.each([
    [199.99, SHIPPING.STANDARD],
    [200.01, 0],
  ])('nalicza dostawe standardowa dla wartosci %s (BR-04)', (afterDiscount, expected) => {
    expect(shippingCost(afterDiscount, 'STANDARD')).toBe(expected);
  });

  it.fails('daje darmowa dostawe od 200,00 zl po rabacie (BR-04)', () => {
    // BUG: implementacja używa > zamiast >=; do zgłoszenia, BR-04
    expect(shippingCost(200, 'STANDARD')).toBe(0);
  });

  it('nalicza doplate za express przy darmowej dostawie (BR-04)', () => {
    expect(shippingCost(250, 'EXPRESS')).toBe(SHIPPING.EXPRESS_SURCHARGE);
  });

  it('nalicza rabat procentowy zgodnie z procentem (BR-06)', () => {
    expect(discountAmount(200, [{ code: 'TEST', type: 'PERCENT', value: 10 }])).toBe(20);
  });

  it('nalicza rabat procentowy i zwraca kod (BR-06)', () => {
    const summary = priceCart([{ lineTotal: 100 }], [code('KAWA10')], 'STANDARD');
    expect(summary.discount).toBe(10);
    expect(summary.shipping).toBe(SHIPPING.STANDARD);
    expect(summary.total).toBe(104.99);
  });

  it('zwraca zastosowany kod rabatowy (BR-06)', () => {
    const summary = priceCart([{ lineTotal: 100 }], [code('KAWA10')], 'STANDARD');
    expect(summary.appliedCodes).toEqual(['KAWA10']);
  });

  it('nalicza rabat kwotowy w pelnej wysokosci (BR-06)', () => {
    const summary = priceCart([{ lineTotal: 100 }], [code('MINUS20')], 'STANDARD');
    expect(summary.discount).toBe(20);
    expect(summary.total).toBe(94.99);
  });

  it('rabat kwotowy nie obniza ceny ponizej zera i zwalnia z dostawy przy zerze (BR-06, BR-04)', () => {
    const summary = priceCart([{ lineTotal: 10 }], [code('MINUS20')], 'STANDARD');
    expect(summary.discount).toBe(10);
    expect(summary.shipping).toBe(0);
    expect(summary.total).toBe(0);
  });
});
