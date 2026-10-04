import { describe, expect, it } from 'vitest';
import { DISCOUNT_CODES } from '../../src/domain/discounts';
import { lineTotal, priceCart, shippingCost, SHIPPING } from '../../src/domain/pricing';

const code = (c: string) => DISCOUNT_CODES.find((d) => d.code === c)!;

describe('pricing', () => {
  it('liczy wartosc pozycji', () => {
    expect(lineTotal(44.99, 3)).toBe(134.97);
  });

  it('nalicza dostawe standardowa ponizej progu BR-04', () => {
    expect(shippingCost(199.99, 'STANDARD')).toBe(SHIPPING.STANDARD);
  });

  it('daje darmowa dostawe od 200,00 zl BR-04', () => {
    expect(shippingCost(200, 'STANDARD')).toBe(0);
  });

  it('nalicza doplate express od progu darmowej dostawy BR-04', () => {
    expect(shippingCost(200, 'EXPRESS')).toBe(SHIPPING.EXPRESS_SURCHARGE);
  });

  it('nie nalicza dostawy dla pustego koszyka BR-04', () => {
    expect(shippingCost(0, 'STANDARD')).toBe(0);
  });

  it('dokladnie nalicza rabat procentowy i sume BR-06 BR-08', () => {
    const summary = priceCart([{ lineTotal: 150 }], [code('KAWA10')], 'STANDARD');
    expect(summary.subtotal).toBe(150);
    expect(summary.discount).toBe(15);
    expect(summary.shipping).toBe(SHIPPING.STANDARD);
    expect(summary.total).toBe(149.99);
    expect(summary.appliedCodes).toEqual(['KAWA10']);
  });

  it('dokladnie nalicza rabat kwotowy BR-06', () => {
    const summary = priceCart([{ lineTotal: 150 }], [code('MINUS20')], 'STANDARD');
    expect(summary.discount).toBe(20);
    expect(summary.total).toBe(144.99);
  });

  it('nie obniza ceny ponizej zera rabatem BR-06', () => {
    const summary = priceCart([{ lineTotal: 10 }], [code('MINUS20')], 'STANDARD');
    expect(summary.discount).toBe(10);
    expect(summary.total).toBe(0);
  });
});
