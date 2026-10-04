import { test as base, type Page } from '@playwright/test';
import { BeanShopApi } from '../support/api-client';
import { USERS } from '../support/data';
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

type Fixtures = {
  api: BeanShopApi;
  loggedInPage: Page;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  catalog: CatalogPage;
  cartPage: CartPage;
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
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  catalog: async ({ page }, use) => use(new CatalogPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
});

export { expect } from '@playwright/test';
