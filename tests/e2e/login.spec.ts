import { USERS } from '../support/data';
import { expect, test } from './fixtures';

test.describe('Logowanie', () => {
  test('klient loguje sie i widzi swoje imie', async ({ api, page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.anna.email, USERS.anna.password);
    await expect(page.getByTestId('user-name')).toHaveText(USERS.anna.name);
  });

  test('bledne haslo pokazuje komunikat', async ({ api, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.anna.email, 'zle-haslo');
    await expect(loginPage.error).toHaveText('Niepoprawny e-mail lub hasło');
  });

  test('niezalogowany klient jest przekierowany z zamówień do logowania', async ({ page }) => {
    await page.goto('/orders');

    await expect(page).toHaveURL(/\/login\?next=\/orders$/);
  });
});
