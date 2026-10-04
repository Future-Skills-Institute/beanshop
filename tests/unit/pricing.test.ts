import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { DISCOUNT_CODES } from '../../src/domain/discounts';
import { discountAmount, lineTotal, priceCart, shippingCost, SHIPPING } from '../../src/domain/pricing';

const code = (c: string) => DISCOUNT_CODES.find((d) => d.code === c)!;
const amountArb = fc.integer({ min: 0, max: 100000 }).map((cents) => cents / 100);

describe('pricing', () => {
  it('liczy wartość pozycji // BR-08', () => {
    expect(lineTotal(44.99, 3)).toBe(134.97);
  });

  it('nalicza dostawę standardową poniżej progu // BR-04', () => {
    expect(shippingCost(150, 'STANDARD')).toBe(SHIPPING.STANDARD);
  });

  it('daje darmową dostawę powyżej progu // BR-04', () => {
    expect(shippingCost(250, 'STANDARD')).toBe(0);
  });

  it.fails('daje darmową dostawę od 200 zł włącznie // BR-04', () => {
    // BUG: implementacja używa > zamiast >=, BR-04; zgłosić jako błąd naliczania progu dostawy.
    expect(shippingCost(200, 'STANDARD')).toBe(0);
  });

  it.each([
    [199.99, SHIPPING.STANDARD],
    [200.01, 0],
  ])('nalicza dostawę zgodnie z progiem dla kwoty %s // BR-04', (afterDiscount, expected) => {
    expect(shippingCost(afterDiscount, 'STANDARD')).toBe(expected);
  });

  it('nie nalicza dostawy standardowej dla pustego koszyka // BR-04', () => {
    expect(shippingCost(0, 'STANDARD')).toBe(0);
  });

  it('nie nalicza dostawy express dla pustego koszyka // BR-04', () => {
    expect(shippingCost(0, 'EXPRESS')).toBe(0);
  });

  it('nalicza dopłatę za express przy darmowej dostawie // BR-04', () => {
    expect(shippingCost(250, 'EXPRESS')).toBe(SHIPPING.EXPRESS_SURCHARGE);
  });

  it('nalicza rabat procentowy // BR-06', () => {
    const summary = priceCart([{ lineTotal: 100 }], [code('KAWA10')], 'STANDARD');
    expect(summary.discount).toBe(10);
  });

  it('nalicza standardową dostawę po rabacie // BR-04', () => {
    const summary = priceCart([{ lineTotal: 100 }], [code('KAWA10')], 'STANDARD');
    expect(summary.shipping).toBe(SHIPPING.STANDARD);
  });

  it('dodaje rabat i dostawę do sumy // BR-04, BR-06, BR-08', () => {
    const summary = priceCart([{ lineTotal: 100 }], [code('KAWA10')], 'STANDARD');
    expect(summary.total).toBe(104.99);
  });

  it('zwraca zastosowane kody rabatowe // BR-06', () => {
    const summary = priceCart([{ lineTotal: 100 }], [code('KAWA10')], 'STANDARD');
    expect(summary.appliedCodes).toEqual(['KAWA10']);
  });

  it('rabat kwotowy nie obniża ceny poniżej zera // BR-06', () => {
    const summary = priceCart([{ lineTotal: 10 }], [code('MINUS20')], 'STANDARD');
    expect(summary.discount).toBe(10);
  });

  it('nalicza rabat procentowy dokładnie według wartości kodu // BR-06', () => {
    expect(discountAmount(250, [code('KAWA10')])).toBe(25);
  });

  it('nalicza sumę bez rabatu z dostawą standardową // BR-04, BR-08', () => {
    const summary = priceCart([{ lineTotal: 100 }], [], 'STANDARD');
    expect(summary.discount).toBe(0);
    expect(summary.total).toBe(114.99);
  });

  it('nie zwraca ujemnej sumy koszyka // BR-08', () => {
    fc.assert(
      fc.property(amountArb, (subtotal) => {
        const summary = priceCart([{ lineTotal: subtotal }], [code('MINUS20')], 'STANDARD');
        expect(summary.total).toBeGreaterThanOrEqual(0);
      }),
    );
  });

  it.fails('zaokrągla każdą sumę koszyka do maksymalnie 2 miejsc // BR-08', () => {
    // BUG: suma końcowa może zawierać więcej niż dwa miejsca po przecinku, BR-08.
    fc.assert(
      fc.property(amountArb, (subtotal) => {
        const summary = priceCart([{ lineTotal: subtotal }], [code('KAWA10')], 'STANDARD');
        expect(summary.total).toBe(Number(summary.total.toFixed(2)));
      }),
    );
  });
});
