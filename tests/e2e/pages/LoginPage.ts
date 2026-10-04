import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.email = page.getByLabel('E-mail');
    this.password = page.getByLabel('Hasło');
    this.submit = page.getByRole('button', { name: 'Zaloguj się' });
    this.error = page.locator('#login-error');
    this.heading = page.getByRole('heading', { name: 'Logowanie' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
