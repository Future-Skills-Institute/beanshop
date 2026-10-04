import { test as base, type Page } from '@playwright/test';
import { BeanShopApi } from '../support/api-client';
import { PRODUCTS, USERS } from '../support/data';
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { LoginPage } from './pages/LoginPage';

type Fixtures = {
  api: BeanShopApi;
  loggedInPage: Page;
  loginPage: LoginPage;
  catalog: CatalogPage;
  cartPage: CartPage;
  cartWith: (items: { product: keyof typeof PRODUCTS; qty: number }[]) => Promise<CartPage>;
};

export const test = base.extend<Fixtures>({
  // Kazdy test startuje od czystych danych.
  api: async ({ request }, use) => {
    const api = new BeanShopApi(request);
    await api.reset();
    await use(api);
  },
  // Logowanie przez API (szybciej i stabilniej niz przez formularz). Cookie trafia do kontekstu przegladarki.
  loggedInPage: async ({ page, api }, use) => {
    await page.request.post('/api/auth/login', { data: { email: USERS.anna.email, password: USERS.anna.password } });
    await use(page);
  },
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  catalog: async ({ page }, use) => use(new CatalogPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  // Koszyk zalogowanej Anny przygotowany przez API; zwraca otwarty CartPage.
  cartWith: async ({ loggedInPage, cartPage }, use) => {
    await use(async (items) => {
      for (const { product, qty } of items) {
        const res = await loggedInPage.request.post('/api/cart/items', { data: { productId: PRODUCTS[product].id, quantity: qty } });
        if (!res.ok()) throw new Error(`Nie udalo sie dodac ${product} do koszyka: ${res.status()}`);
      }
      await cartPage.goto();
      return cartPage;
    });
  },
});

export { expect } from '@playwright/test';
