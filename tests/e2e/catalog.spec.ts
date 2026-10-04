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

  test('wyszukuje bez rozróżniania wielkości liter (BR-10)', async ({ api, catalog }) => {
    // BUG: wyszukiwanie wielkimi literami nie zwraca produktu, BR-10
    test.fail(true, 'BUG: wyszukiwanie nie jest niewrażliwe na wielkość liter, BR-10');
    await catalog.goto();
    await catalog.searchFor('kol');
    await expect(catalog.products).toHaveCount(1);
    await expect(catalog.product('Kolumbia Supremo 250 g')).toHaveCount(1);

    await catalog.searchFor('KOL');
    await expect(catalog.products).toHaveCount(1);
    await expect(catalog.product('Kolumbia Supremo 250 g')).toHaveCount(1);
  });

  test('odrzuca zapytanie krótsze niż 2 znaki (BR-10)', async ({ api, catalog }) => {
    await catalog.goto();
    await catalog.searchFor('k');
    await expect(catalog.searchError).toHaveText('Wpisz co najmniej 2 znaki');
  });

  test('pokazuje brak wyników dla nieistniejącego produktu (BR-10)', async ({ api, catalog }) => {
    await catalog.goto();
    await catalog.searchFor('Nieistniejąca kawa');
    await expect(catalog.noResults).toHaveText('Brak produktów spełniających kryteria.');
  });

  test('produkt bez stanu ma nieaktywny przycisk', async ({ api, catalog }) => {
    await catalog.goto();
    await expect(catalog.product('Drip Kenia').getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
  });
});
