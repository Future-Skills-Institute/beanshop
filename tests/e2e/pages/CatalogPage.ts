import type { Locator, Page } from '@playwright/test';

export class CatalogPage {
  readonly search: Locator;
  readonly category: Locator;
  readonly products: Locator;
  readonly noResults: Locator;
  readonly searchError: Locator;
  readonly cartCount: Locator;

  constructor(private readonly page: Page) {
    this.search = page.getByRole('searchbox', { name: 'Szukaj produktu' });
    this.category = page.getByLabel('Kategoria');
    this.products = page.getByTestId('product-card');
    this.noResults = page.getByTestId('no-results');
    this.searchError = page.getByRole('alert');
    this.cartCount = page.getByTestId('cart-count');
  }

  async goto() {
    await this.page.goto('/');
  }

  product(name: string): Locator {
    return this.products.filter({ hasText: name });
  }

  async searchFor(text: string) {
    await this.search.fill(text);
    await this.page.getByRole('button', { name: 'Szukaj' }).click();
  }

  async addToCart(name: string) {
    await this.product(name).getByRole('button', { name: 'Dodaj do koszyka' }).click();
  }
}
