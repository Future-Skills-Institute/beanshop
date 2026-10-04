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

  const wyszukiwanieBezWielkosciLiter = [
    { zapytanie: 'KOL', blad: true },
    { zapytanie: 'kol', blad: true },
  ];

  for (const { zapytanie, blad } of wyszukiwanieBezWielkosciLiter) {
    test(`wyszukiwanie ${zapytanie} zwraca Kolumbia Supremo 250 g`, async ({ api, catalog }) => {
      if (blad) {
        // BUG: wyszukiwanie rozróżnia wielkość liter, BR-10
        test.fail();
      }

      await catalog.goto();
      await catalog.searchFor(zapytanie);
      await expect(catalog.products).toHaveCount(1);
      await expect(catalog.product('Kolumbia Supremo 250 g')).toHaveCount(1);
    });
  }

  test('odrzuca wyszukiwanie jednoliterowe komunikatem walidacji', async ({ api, catalog }) => {
    await catalog.goto();
    await catalog.searchFor('k');
    await expect(catalog.searchError).toHaveText('Wpisz co najmniej 2 znaki');
  });

  test('pokazuje komunikat braku wyników dla nieistniejącej frazy', async ({ api, catalog }) => {
    await catalog.goto();
    await catalog.searchFor('Nieistniejąca kawa');
    await expect(catalog.noResults).toHaveText('Brak produktów spełniających kryteria.');
  });

  test('produkt bez stanu ma nieaktywny przycisk', async ({ api, catalog }) => {
    await catalog.goto();
    await expect(catalog.product('Drip Kenia').getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
  });
});
