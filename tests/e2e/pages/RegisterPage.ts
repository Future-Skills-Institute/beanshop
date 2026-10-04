import type { Locator, Page } from '@playwright/test';

export class RegisterPage {
  readonly name: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly success: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByLabel('Imię i nazwisko');
    this.email = page.getByLabel('E-mail');
    this.password = page.getByLabel('Hasło');
    this.submit = page.getByRole('button', { name: 'Załóż konto' });
    this.success = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register(name: string, email: string, password: string) {
    await this.name.fill(name);
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
