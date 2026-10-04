import { expect, test } from './fixtures';

test.describe('Katalog', () => {
  test('pokazuje wszystkie produkty', async ({ api, catalog }) => {
    await catalog.goto();
    await expect(catalog.products).toHaveCount(9);
  });

  test('wyszukuje produkt po nazwie', async ({ api, catalog }) => {
    await catalog.goto();
    await catalog.searchFor('Kolumbia');
    await expect(catalog.products).toHaveCount(1);
  });

  const wyszukiwanie = [
    { nazwa: 'nie rozróżnia wielkości liter', fraza: 'kolumbia', liczbaProduktów: 1 },
    { nazwa: 'wymaga co najmniej 2 znaków', fraza: 'K', komunikat: 'Wpisz co najmniej 2 znaki' },
    { nazwa: 'pokazuje brak wyników', fraza: 'Robusta', komunikat: 'Brak produktów spełniających kryteria.' },
  ] as const;

  for (const przypadek of wyszukiwanie) {
    test(`BR-10: ${przypadek.nazwa}`, async ({ api, catalog }) => {
      if (przypadek.fraza === 'kolumbia') {
        // BUG: wyszukiwanie rozróżnia wielkość liter, BR-10
        test.fail();
      }

      await catalog.goto();
      await catalog.searchFor(przypadek.fraza);

      if ('liczbaProduktów' in przypadek) {
        await expect(catalog.products).toHaveCount(przypadek.liczbaProduktów);
      } else if (przypadek.fraza === 'K') {
        await expect(catalog.searchError).toHaveText(przypadek.komunikat);
      } else {
        await expect(catalog.noResults).toHaveText(przypadek.komunikat);
      }
    });
  }

  test('produkt bez stanu ma nieaktywny przycisk', async ({ api, catalog }) => {
    await catalog.goto();
    await expect(catalog.product('Drip Kenia').getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
  });
});
