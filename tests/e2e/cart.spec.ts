import { PRODUCTS } from '../support/data';
import { expect, test } from './fixtures';

test.describe('Koszyk', () => {
  test('niezalogowany klient dodajacy do koszyka trafia na logowanie', async ({ page, api, catalog, loginPage }) => {
    await catalog.goto();
    await catalog.addToCart('Etiopia Yirgacheffe');
    await expect(page).toHaveURL(/\/login(\?|$)/);
    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.submit).toBeVisible();
  });

  test('licznik koszyka rosnie po dodaniu produktu', async ({ loggedInPage, catalog }) => {
    await catalog.goto();
    await catalog.addToCart('Etiopia Yirgacheffe');
    await loggedInPage.waitForTimeout(500);
    expect(await catalog.cartCount.textContent()).toBe('1');
  });

  test('pokazuje podsumowanie z dostawa', async ({ loggedInPage, api, cartPage }) => {
    await loggedInPage.request.post('/api/cart/items', { data: { productId: PRODUCTS.v60.id, quantity: 1 } });
    await cartPage.goto();
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
