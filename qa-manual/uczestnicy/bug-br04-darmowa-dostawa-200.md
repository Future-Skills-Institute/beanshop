# [BUG] Darmowa dostawa nie działa dla wartości dokładnie 200,00 zł

## Grupa szkoleniowa

- grupa-M (testerzy manualni)

## Podsumowanie

Dla wartości produktów po rabacie równej dokładnie 200,00 zł system nalicza standardową opłatę za dostawę zamiast darmowej dostawy.

## Naruszona reguła / historyjka

BR-04 / US-06

## Ważność

Wysoka

## Kroki do odtworzenia

1. Zaloguj się jako klient.
2. Przygotuj koszyk, którego wartość produktów po rabacie wynosi dokładnie 200,00 zł.
3. Wybierz metodę dostawy `STANDARD`.
4. Wyświetl podsumowanie koszyka.

## Oczekiwany wynik

Zgodnie z BR-04 dostawa standardowa od wartości 200,00 zł wynosi 0,00 zł.

## Rzeczywisty wynik

Dla wartości dokładnie 200,00 zł dostawa standardowa wynosi 14,99 zł.

## Kontekst techniczny

W `src/domain/pricing.ts:48-52`, funkcja `shippingCost()` wyznacza darmową dostawę warunkiem `afterDiscount > SHIPPING.FREE_THRESHOLD`. Powinien obowiązywać próg włącznie, czyli `afterDiscount >= 200`.

## Środowisko

BeanShop, środowisko testowe
