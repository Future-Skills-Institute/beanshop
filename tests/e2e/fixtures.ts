import { test as base, type Page } from '@playwright/test';
import { BeanShopApi } from '../support/api-client';
import { PRODUCTS, USERS } from '../support/data';
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { LoginPage } from './pages/LoginPage';

type CartItem = {
  product: keyof typeof PRODUCTS;
  qty: number;
};

type Fixtures = {
  api: BeanShopApi;
  loggedInPage: Page;
  loginPage: LoginPage;
  catalog: CatalogPage;
  cartPage: CartPage;
  cartWith: (items: CartItem[]) => Promise<CartPage>;
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
  cartWith: async ({ api, loggedInPage, cartPage }, use) => {
    await api.login(USERS.anna.email, USERS.anna.password);

    await use(async (items: CartItem[]) => {
      for (const { product, qty } of items) {
        await api.addToCart(PRODUCTS[product].id, qty);
      }

      await cartPage.goto();
      return cartPage;
    });
  },
});

export { expect } from '@playwright/test';
