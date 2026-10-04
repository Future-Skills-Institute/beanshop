# Notatka z testu eksploracyjnego: koszyk

**Data:** 03.10.2026  
**Obszar:** koszyk, kod rabatowy i dostawa  
**Charter:** Eksploruj koszyk, używając produktu, kodu `KAWA10` i sposobów dostawy, aby sprawdzić prezentację oraz przeliczanie kwoty zamówienia.

- Timebox: nieznany
- Tester: nieznany
- Heurystyki: SFDIPOT, spójność kwot i komunikatów z wymaganiami

## Działania widoczne na dostępnym zrzucie

1. Użytkownik `Jan Kowalski` jest zalogowany.
2. Koszyk zawiera jedną sztukę produktu „Etiopia Yirgacheffe 250 g”.
3. Widoczne są cena jednostkowa `44,99 zł`, ilość `1` i wartość pozycji `44,99 zł`.
4. W polu kodu rabatowego wpisano `KAWA10`; pod polem wyświetla się komunikat „Kod został zastosowany”.
5. Wybrano dostawę standardową za `14,99 zł`. Opcja ekspresowa za `24,99 zł` jest dostępna, ale nie jest zaznaczona.
6. Podsumowanie pokazuje:
   - wartość produktów: `44,99 zł`,
   - rabat `KAWA10`: `-4,50 zł`,
   - dostawa: `14,99 zł`,
   - do zapłaty: `55,48 zł`.
7. Dostępne są akcje usunięcia produktu, usunięcia kodu oraz złożenia zamówienia.

## Ocena obserwacji

- Obliczenie rabatu jest zgodne z BR-06: 10% z `44,99 zł` po zaokrągleniu half-up daje `4,50 zł`.
- Suma jest arytmetycznie spójna: `44,99 - 4,50 + 14,99 = 55,48 zł` (BR-08).
- Kwota produktów po rabacie wynosi `40,49 zł`, więc bezpłatna dostawa nie powinna przysługiwać według BR-04. Standardowa opłata `14,99 zł` jest oczekiwana.
- Na podstawie jednego zrzutu nie można potwierdzić działania przy zmianie ilości, usunięciu produktu, zamianie kodu ani przełączeniu na dostawę ekspresową.

## Pokrycie

**Sprawdzono wizualnie:**

- prezentację produktu, ceny, ilości i wartości,
- zastosowanie kodu `KAWA10`,
- wybór dostawy standardowej,
- wyliczenie rabatu, dostawy i sumy,
- dostępność akcji „Złóż zamówienie”.

**Nie można potwierdzić:**

- czy ilość była zmieniana oraz czy respektowane są limity BR-03,
- czy usunięcie produktu i kodu działa poprawnie,
- czy nowy kod zastępuje poprzedni (BR-05),
- zachowania dla progu darmowej dostawy `200,00 zł` (BR-04),
- zachowania dostawy ekspresowej przy darmowej dostawie,
- wyniku kliknięcia „Złóż zamówienie”.

## Drugi zrzut

Drugi zrzut nie jest dostępny do odczytu, dlatego jego przebiegu i wyników nie oznaczam jako zaliczonych ani niezaliczonych. Status: **zablokowane — brak materiału testowego**.

## Pytania do PO

1. Jakie działania i wartości przedstawia drugi zrzut?
2. Czy sesja miała określony timebox i dane wejściowe poza widocznym ekranem?
3. Czy oczekiwano wykonania kliknięcia „Złóż zamówienie”, czy tylko sprawdzenia podsumowania?

## Źródła

- `docs/wymagania.md`: BR-03, BR-04, BR-05, BR-06, BR-08.
- `docs/architektura.md`: przepływ „złóż zamówienie”.
- `qa-manual/szablony/charter.md`: struktura notatki sesji eksploracyjnej.
- Dostępny zrzut ekranu koszyka z zadania.
