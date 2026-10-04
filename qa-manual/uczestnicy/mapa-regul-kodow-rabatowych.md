# Mapa reguł kodów rabatowych

Kwota w przykładach oznacza **wartość produktów po rabacie, przed doliczeniem dostawy**. Stan początkowy danych należy przywrócić przed każdym przykładem.

| BR-05: jeden kod i zastępowanie | BR-06: działanie oraz ważność kodów | BR-07: ponowna weryfikacja po zmianie koszyka |
|---|---|---|
| **Przykład 1 — jeden kod:** koszyk: 2 × Etiopia Yirgacheffe 250 g (2 × 44,99 zł = 89,98 zł); kod: `kAwA10`; oczekiwana kwota: **80,98 zł** (rabat 8,99 zł). Wielkość liter nie zmienia działania kodu. | **Przykład 1 — KAWA10:** koszyk: 2 × Etiopia Yirgacheffe 250 g (89,98 zł); kod: `KAWA10`; oczekiwana kwota: **80,98 zł**. | **Przykład 1 — kod usunięty po zejściu poniżej minimum:** koszyk: 1 × Dzbanek do przelewów 600 ml (100,00 zł); kod: `MINUS20`; oczekiwana kwota: **80,00 zł**. Po usunięciu dzbanka i pozostawieniu 1 × Filtry papierowe 100 szt. (19,99 zł) kod zostaje usunięty, pojawia się komunikat, a oczekiwana kwota wynosi **19,99 zł**. |
| **Przykład 2 — zastąpienie kodu:** koszyk: 1 × Młynek ręczny Stalowy + 1 × Dzbanek do przelewów 600 ml (259,00 zł); najpierw `KAWA10` → **233,10 zł**, następnie `MINUS20` → **239,00 zł**. Drugi kod zastępuje pierwszy. | **Przykład 2 — MINUS20 od minimum:** koszyk: 1 × Młynek ręczny Stalowy (159,00 zł); kod: `MINUS20`; oczekiwana kwota: **139,00 zł**. | **Przykład 2 — zmiana ilości poniżej minimum:** koszyk: 1 × Dzbanek do przelewów 600 ml + 1 × Filtry papierowe 100 szt. (119,99 zł); kod: `MINUS20`; oczekiwana kwota: **99,99 zł**. Po usunięciu dzbanka pozostaje 19,99 zł, więc kod jest usunięty, pojawia się komunikat, a oczekiwana kwota wynosi **19,99 zł**. |
| **Przykład 3 — kolejna zamiana:** ten sam koszyk o wartości 259,00 zł; po `MINUS20` zastosuj `JESIEN15`; oczekiwana kwota: **220,15 zł**. Aktywny pozostaje tylko ostatni kod. | **Przykład 3 — JESIEN15:** koszyk: 1 × Dzbanek do przelewów 600 ml (100,00 zł); kod: `JESIEN15`; oczekiwana kwota: **85,00 zł**, gdy test wykonano najpóźniej 30.11.2026. | **Przykład 3 — warunek nadal spełniony:** koszyk: 1 × Młynek ręczny Stalowy + 1 × Filtry papierowe 100 szt. (178,99 zł); kod: `MINUS20`; oczekiwana kwota: **158,99 zł**. Po usunięciu filtrów wartość wynosi 159,00 zł, więc kod nadal pozostaje zastosowany, a oczekiwana kwota wynosi **139,00 zł**. |
|  | **Przykład 4 — LATO25 wygasł:** koszyk: 1 × Młynek ręczny Stalowy (159,00 zł); kod: `LATO25`; kod nie zostaje zastosowany, oczekiwana kwota: **159,00 zł**. |  |

## Pytania do PO

1. Czy „oczekiwana kwota” w materiałach testowych ma obejmować także dostawę, czy tylko wartość produktów po rabacie?
2. Czy zastosowanie niepoprawnego lub wygasłego nowego kodu ma pozostawić wcześniej aktywny kod, czy zawsze go usuwać?
3. Jaka jest dokładna treść i miejsce wyświetlenia komunikatu po usunięciu kodu zgodnie z BR-07?
4. Czy granica ważności `JESIEN15` (30.11.2026 do końca dnia) jest liczona według strefy czasowej sklepu?

## Źródła

- `docs/wymagania.md`: BR-05, BR-06 i BR-07.
- `src/store.ts`: ceny produktów użyte w przykładach.
