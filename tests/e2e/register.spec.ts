import { expect, test } from './fixtures';

test.describe('Rejestracja', () => {
  test('rejestruje nowego klienta i pozwala mu sie zalogowac (BR-01)', async ({
    page,
    registerPage,
    loginPage,
  }) => {
    await registerPage.goto();
    await registerPage.register(
      'Ewa Testowa',
      'ewa.e2e@beanshop.test',
      'Kawa1234',
    );

    await expect(registerPage.success).toContainText('Konto utworzone');
    await expect(registerPage.success.getByRole('link', { name: 'Zaloguj się' })).toBeVisible();

    await loginPage.goto();
    await loginPage.login('ewa.e2e@beanshop.test', 'Kawa1234');

    await expect(page.getByTestId('user-name')).toHaveText('Ewa Testowa');
  });
});
