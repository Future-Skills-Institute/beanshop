import { expect, test } from './fixtures';

test.describe('Katalog', () => {
  // Plan BR-10: fixture API resetuje dane; przez UI wyszukujemy „kol”, „KOL”, „k” i „xyz”;
  // sprawdzamy konkretny produkt, komunikat „Wpisz co najmniej 2 znaki” oraz brak wyników.
  test('pokazuje wszystkie produkty', async ({ api, catalog }) => {
    await catalog.goto();
    await expect(catalog.products).toHaveCount(9);
  });

  test('wyszukuje produkt po nazwie', async ({ api, catalog }) => {
    await catalog.goto();
    await catalog.searchFor('Kolumbia');
    await expect(catalog.products).toHaveCount(1);
  });

  test('wyszukiwanie nie rozróżnia wielkości liter (BR-10)', async ({ api, catalog }) => {
    test.fail(); // BUG: wyszukiwanie rozróżnia wielkość liter, BR-10
    await catalog.goto();

    await catalog.searchFor('kol');
    await expect(catalog.product('Kolumbia Supremo 250 g')).toHaveCount(1);

    await catalog.searchFor('KOL');
    await expect(catalog.product('Kolumbia Supremo 250 g')).toHaveCount(1);
  });

  test('odrzuca wyszukiwanie krótsze niż 2 znaki (BR-10)', async ({ api, catalog }) => {
    await catalog.goto();
    await catalog.searchFor('k');
    await expect(catalog.searchError).toHaveText('Wpisz co najmniej 2 znaki');
  });

  test('pokazuje brak wyników dla niepasującej nazwy (BR-10)', async ({ api, catalog }) => {
    await catalog.goto();
    await catalog.searchFor('xyz');
    await expect(catalog.products).toHaveCount(0);
    await expect(catalog.noResults).toHaveText('Brak produktów spełniających kryteria.');
  });

  test('produkt bez stanu ma nieaktywny przycisk', async ({ api, catalog }) => {
    await catalog.goto();
    await expect(catalog.product('Drip Kenia').getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
  });
});
