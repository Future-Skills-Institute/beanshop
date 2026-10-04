import { PRODUCTS } from '../support/data';
import { expect, test } from './fixtures';

test.describe('Koszyk', () => {
  test('licznik koszyka rosnie po dodaniu produktu', async ({ loggedInPage, catalog }) => {
    await catalog.goto();
    await catalog.addToCart('Etiopia Yirgacheffe');
    await loggedInPage.waitForTimeout(500);
    expect(await catalog.cartCount.textContent()).toBe('1');
  });

  test('pokazuje podsumowanie z dostawa', async ({ cartWith }) => {
    const cartPage = await cartWith([{ product: 'v60', qty: 1 }]);
    await expect(cartPage.subtotal).toHaveText('99,00 zł');
    await expect(cartPage.shipping).toHaveText('14,99 zł');
    await expect(cartPage.total).toHaveText('113,99 zł');
  });

  test('stosuje kod rabatowy', async ({ loggedInPage, cartPage }) => {
    await loggedInPage.request.post('/api/cart/items', { data: { productId: PRODUCTS.v60.id, quantity: 1 } });
    await cartPage.goto();
    await cartPage.useCode('KAWA10');
    await expect(cartPage.discountMessage).toHaveText('Kod został zastosowany');
    await expect(cartPage.discount).toHaveText('-9,90 zł');
  });
});
