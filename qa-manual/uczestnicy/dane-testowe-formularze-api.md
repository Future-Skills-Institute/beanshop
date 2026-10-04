# Dane testowe: rejestracja, logowanie, zamówienie (koszyk) i API

Źródła: formularze `public/register.html`, `public/login.html`, `public/cart.html`; walidacja `src/routes/auth.ts`, `src/domain/password.ts`; produkty i konta `src/store.ts`; reguły `docs/wymagania.md` (BR-01..BR-09), `docs/api.md`.
Wszystkie adresy w domenie `@beanshop.test`. Dane w pamięci wracają do stanu początkowego po restarcie aplikacji.

## 1. Rejestracja (BR-01) — pola: Imię i nazwisko, E-mail, Hasło

Walidacja nazwy w kodzie: 2–60 znaków.

| ID | Technika | Imię i nazwisko | E-mail | Hasło | Oczekiwany wynik |
|----|----------|-----------------|--------|-------|------------------|
| R-01 | poprawne dane | Ewa Testowa | ewa.test@beanshop.test | Kawa1234 | 201, konto utworzone |
| R-02 | brzeg: min. długość | Ola Brzeg | ola.min@beanshop.test | Abcdef1g (8 zn.) | 201 |
| R-03 | brzeg: poniżej min. | Ola Brzeg | ola.7@beanshop.test | Abcdef1 (7 zn.) | 400, „co najmniej 8 znaków” |
| R-04 | brzeg: max. długość | Max Brzeg | max.64@beanshop.test | `A1` + 62 × `a` (64 zn.) | 201 |
| R-05 | brzeg: powyżej max. | Max Brzeg | max.65@beanshop.test | `A1` + 63 × `a` (65 zn.) | 400 (BR-01). **MOŻLIWY BŁĄD (BR-01):** `validatePassword` nie sprawdza górnego limitu |
| R-06 | brak wielkiej litery | Ewa Testowa | r06@beanshop.test | kawa1234 | 400, „wielką literę” |
| R-07 | brak cyfry | Ewa Testowa | r07@beanshop.test | KawaKawa | 400, „cyfrę” |
| R-08 | wiele błędów naraz | Ewa Testowa | r08@beanshop.test | kawa | 400, 3 komunikaty (długość, wielka litera, cyfra) |
| R-09 | duplikat e-mail | Anna Druga | anna@beanshop.test | Kawa1234 | 409 |
| R-10 | duplikat, inna wielkość liter | Anna Druga | ANNA@Beanshop.test | Kawa1234 | 409 (BR-01: unikalność bez względu na wielkość liter) |
| R-11 | imię: min. | Al | r11@beanshop.test | Kawa1234 | 201 |
| R-12 | imię: za krótkie | A | r12@beanshop.test | Kawa1234 | 400 |
| R-13 | imię: 60 znaków | 60 × `a` | r13@beanshop.test | Kawa1234 | 201 |
| R-14 | imię: 61 znaków | 61 × `a` | r14@beanshop.test | Kawa1234 | 400 |
| R-15 | e-mail bez `@` | Ewa Testowa | ewa.beanshop.test | Kawa1234 | 400 / walidacja pola |
| R-16 | puste pola | (puste) | (puste) | (puste) | pola wymagane, formularz nie wysyła |
| R-17 | znaki specjalne w imieniu | Zażółć Gęślą-Jaźń | r17@beanshop.test | Kawa1234 | 201, polskie znaki zachowane |
| R-18 | wstrzyknięcie HTML | `<b>Test</b>` | r18@beanshop.test | Kawa1234 | 201; imię wyświetlane jako tekst, nie jako HTML (zgadywanie błędów) |
| R-19 | spacje w e-mailu | Ewa Testowa | ` r19@beanshop.test ` | Kawa1234 | do ustalenia (pytanie do PO: czy przycinać spacje?) |

## 2. Logowanie (BR-02) — pola: E-mail, Hasło

| ID | Konto | Hasło | Oczekiwany wynik |
|----|-------|-------|------------------|
| L-01 | anna@beanshop.test | Kawa1234! | 200, token i dane użytkownika (rola `customer`) |
| L-02 | jan@beanshop.test | Espresso99 | 200, `customer` |
| L-03 | admin@beanshop.test | Admin1234! | 200, rola `admin` |
| L-04 | ANNA@beanshop.test | Kawa1234! | 200 (e-mail bez rozróżniania wielkości liter) |
| L-05 | anna@beanshop.test | kawa1234! | 401 (hasło rozróżnia wielkość liter) |
| L-06 | nieistniejacy@beanshop.test | Kawa1234! | 401 |
| L-07 | anna@beanshop.test | (puste) | 400 / pole wymagane |
| L-08 | (puste) | Kawa1234! | 400 / pole wymagane |
| L-09 | anna.beanshop.test | Kawa1234! | 400 (niepoprawny e-mail) |

### Scenariusze blokady konta (używaj świeżego konta jan@beanshop.test, restart danych między scenariuszami)

| ID | Kroki | Oczekiwany wynik |
|----|-------|------------------|
| L-10 | 4 × błędne hasło `Zle12345`, potem poprawne `Espresso99` | 4 × 401, potem 200 |
| L-11 | 5 × błędne hasło `Zle12345` | 5 × 401 i konto zablokowane |
| L-12 | po L-11 logowanie poprawnym `Espresso99` | 423 `ACCOUNT_LOCKED` |
| L-13 | 4 × błąd, 1 × poprawne (zerowanie licznika), 4 × błąd, poprawne | wszystkie poprawne logowania 200; konto niezablokowane (BR-02: „kolejnych”) |
| L-14 | 4 × błąd, 1 × poprawne, 1 × błąd, 4 × błąd (łącznie 5 po zerowaniu) | konto zablokowane dopiero po 5. kolejnej porażce |

## 3. Zamówienie: koszyk, kod rabatowy, dostawa (BR-03..BR-09)

Zaloguj jako `anna@beanshop.test`. Produkty (`src/store.ts`):

| ID | Produkt | Cena | Stan |
|----|---------|------|------|
| 1 | Etiopia Yirgacheffe 250 g | 44,99 | 12 |
| 2 | Kolumbia Supremo 250 g | 39,99 | 5 |
| 3 | Brazylia Santos 1 kg | 89,99 | 3 |
| 4 | Espresso Blend 500 g | 54,99 | 20 |
| 5 | Drip Kenia 10 szt. | 29,99 | **0** |
| 6 | Młynek ręczny Stalowy | 159,00 | 4 |
| 7 | Drip V60 ceramiczny | 99,00 | 7 |
| 8 | Dzbanek do przelewów 600 ml | 100,00 | 6 |
| 9 | Filtry papierowe 100 szt. | 19,99 | 50 |

### 3a. Ilość w koszyku (BR-03)

| ID | Produkt, ilość | Oczekiwany wynik |
|----|----------------|------------------|
| K-01 | 1 (id 4), ilość 1 | dodano |
| K-02 | id 4, ilość 10 | dodano (max) |
| K-03 | id 4, ilość 11 | błąd 400/409 (max 10) |
| K-04 | id 4, ilość 0 | błąd 400 |
| K-05 | id 4, ilość -1 | błąd 400 |
| K-06 | id 4, ilość 1,5 | błąd 400 |
| K-07 | id 3 (stan 3), ilość 3 | dodano (równo stan) |
| K-08 | id 3, ilość 4 | błąd 409 (ponad stan) |
| K-09 | id 5 (stan 0), ilość 1 | błąd 409, przycisk „Dodaj do koszyka” nieaktywny |
| K-10 | id 2 (stan 5), 3 + 3 w dwóch dodaniach | drugie dodanie: błąd 409 (suma 6 > stan 5) |
| K-11 | id 999, ilość 1 | 404 |
| K-12 | id 4, ilość `abc` | błąd 400 |

### 3b. Kwoty: dostawa i rabaty (BR-04..BR-08)

Oczekiwane wartości policzone ręcznie z reguł (nie z kodu). Dostawa standard 14,99; express 24,99 (10,00 przy darmowej dostawie).

| ID | Koszyk | Kod | Dostawa | Subtotal | Rabat | Dostawa zł | Razem |
|----|--------|-----|---------|----------|-------|------------|-------|
| Z-01 | 4 × id 1 (179,96) | — | STANDARD | 179,96 | 0,00 | 14,99 | 194,95 |
| Z-02 | id 8 + id 4 + id 1 (199,98) | — | STANDARD | 199,98 | 0,00 | 14,99 | 214,97 |
| Z-03 | 2 × id 8 (200,00) | — | STANDARD | 200,00 | 0,00 | 0,00 | 200,00 |
| Z-04 | 2 × id 8 (200,00) | — | EXPRESS | 200,00 | 0,00 | 10,00 | 210,00 |
| Z-05 | 4 × id 1 (179,96) | — | EXPRESS | 179,96 | 0,00 | 24,99 | 204,95 |
| Z-06 | 2 × id 8 (200,00) | KAWA10 | STANDARD | 200,00 | 20,00 | 14,99 (po rabacie 180,00 < 200) | 194,99 |
| Z-07 | 1 × id 1 (44,99) | KAWA10 | STANDARD | 44,99 | 4,50 (4,499 half-up) | 14,99 | 55,48 |
| Z-08 | 1 × id 2 (39,99) | KAWA10 | STANDARD | 39,99 | 4,00 (3,999) | 14,99 | 50,98 |
| Z-09 | 1 × id 8 (100,00) | MINUS20 | STANDARD | 100,00 | 20,00 | 14,99 | 94,99 |
| Z-10 | 1 × id 7 (99,00) | MINUS20 | STANDARD | 99,00 | 0,00 | 14,99 | 113,99 — kod odrzucony (422), min. 100,00 |
| Z-11 | 2 × id 6 (318,00) | JESIEN15 | STANDARD | 318,00 | 47,70 | 0,00 (270,30 ≥ 200) | 270,30 |
| Z-12 | 2 × id 6 (318,00) | MINUS20 | STANDARD | 318,00 | 20,00 | 0,00 (298,00 ≥ 200) | 298,00 |

### 3c. Kody rabatowe (BR-05..BR-07)

| ID | Kod / krok | Oczekiwany wynik |
|----|-----------|------------------|
| D-01 | `kawa10`, `Kawa10`, `KAWA10` | każdy akceptowany (wielkość liter bez znaczenia) |
| D-02 | `KAWA10`, potem `MINUS20` (koszyk ≥ 100,00) | tylko `MINUS20` aktywny — nowy kod zastępuje poprzedni |
| D-03 | `LATO25` | odrzucony 422 (wygasł 31.08.2026) |
| D-04 | `JESIEN15` przy dacie systemowej 30.11.2026 | zaakceptowany (włącznie) |
| D-05 | `JESIEN15` przy dacie 01.12.2026 | odrzucony 422 |
| D-06 | `NIEISTNIEJACY`, pusty ciąg, `KAWA 10` | odrzucony 422 / 400 |
| D-07 | koszyk 2 × id 8, kod `MINUS20`, usuń 1 × id 8 (zostaje 100,00 → nadal OK) | kod nadal aktywny |
| D-08 | koszyk id 8 + id 9 (119,99), `MINUS20`, usuń id 8 (zostaje 19,99) | kod usunięty, komunikat dla klienta (BR-07) |

> Daty D-04/D-05 wymagają sterowania czasem. W repozytorium nie znalazłem endpointu testowego do ustawiania zegara w `src/routes/` (pole `db.fixedNow` istnieje w `src/store.ts`). Pytanie do PO/zespołu: jak ustawiać datę w testach?

### 3d. Składanie zamówienia i statusy (BR-09)

| ID | Scenariusz | Oczekiwany wynik |
|----|-----------|------------------|
| O-01 | złóż zamówienie z pustym koszykiem | 400 `EMPTY_CART` |
| O-02 | złóż z 2 × id 3, sprawdź stan id 3 | zamówienie `NEW` (id od 1001); stan id 3 = 1 |
| O-03 | O-02, potem `cancel` | `CANCELLED`; stan id 3 wraca do 3 |
| O-04 | `NEW` → `pay` | `PAID` |
| O-05 | `PAID` → `pay` ponownie | 409 `INVALID_TRANSITION` |
| O-06 | `PAID` → `cancel` | `CANCELLED`, towar zwrócony |
| O-07 | admin: `NEW` → `SHIPPED` (pominięcie PAID) | 409 |
| O-08 | admin: `PAID` → `SHIPPED` → `DELIVERED` | 200 po każdym kroku |
| O-09 | `SHIPPED` → `cancel` | wg BR-09: 409. **MOŻLIWY BŁĄD (BR-09):** `TRANSITIONS.SHIPPED` zawiera `CANCELLED` (`src/domain/orderStatus.ts`) |
| O-10 | `DELIVERED` → `cancel`; `CANCELLED` → `pay` | 409 |
| O-11 | Jan próbuje opłacić/anulować zamówienie Anny | 404 |
| O-12 | Anna: `PATCH /api/orders/:id/status` | 403 |

## 4. API: żądania (Content-Type: application/json)

Baza: `http://113.30.190.159/api` (adres z otwartej karty). Autoryzacja: `Authorization: Bearer <token>` z odpowiedzi logowania lub cookie `sid`.

| ID | Metoda i ścieżka | Ciało / dane | Oczekiwany kod |
|----|------------------|--------------|----------------|
| A-01 | GET /health | — | 200 |
| A-02 | POST /auth/register | `{"email":"api1@beanshop.test","password":"Kawa1234","name":"Api Tester"}` | 201 |
| A-03 | POST /auth/register | to samo ponownie | 409 |
| A-04 | POST /auth/register | `{"email":"api2@beanshop.test","password":"kawa","name":"Api Tester"}` | 400 |
| A-05 | POST /auth/register | `{"email":"api3@beanshop.test"}` (brak pól) | 400 |
| A-06 | POST /auth/login | `{"email":"anna@beanshop.test","password":"Kawa1234!"}` | 200, `token`, `user` |
| A-07 | POST /auth/login | `{"email":"anna@beanshop.test","password":"Zle12345"}` | 401 |
| A-08 | POST /auth/login | `{"email":"nie-email","password":"x"}` | 400 |
| A-09 | POST /auth/login | konto zablokowane (L-11) | 423 |
| A-10 | GET /auth/me | bez tokenu | 401 |
| A-11 | GET /auth/me | token Anny | 200, `anna@beanshop.test` |
| A-12 | POST /auth/logout | token | 204; potem `GET /auth/me` → 401 |
| A-13 | GET /products?q=kol | — | 200, „Kolumbia Supremo 250 g” |
| A-14 | GET /products?q=KOL | — | 200, ten sam wynik (BR-10) |
| A-15 | GET /products?q=k | — | 400 (min. 2 znaki, BR-10) |
| A-16 | GET /products?category=akcesoria | — | 200, produkty 6–9 |
| A-17 | GET /products/1 | — | 200, Etiopia 44,99 |
| A-18 | GET /products/999 | — | 404 |
| A-19 | GET /cart | bez tokenu | 401 |
| A-20 | POST /cart/items | `{"productId":4,"quantity":1}` | 201 |
| A-21 | POST /cart/items | `{"productId":4,"quantity":11}` | 400/409 |
| A-22 | POST /cart/items | `{"productId":5,"quantity":1}` | 409 (stan 0) |
| A-23 | POST /cart/items | `{"productId":999,"quantity":1}` | 404 |
| A-24 | POST /cart/items | `{"productId":"abc","quantity":1}` | 400 |
| A-25 | PATCH /cart/items/4 | `{"quantity":3}` | 200 |
| A-26 | PATCH /cart/items/4 | `{"quantity":0}` | 400 |
| A-27 | DELETE /cart/items/4 | — | 200 |
| A-28 | POST /cart/discount | `{"code":"kawa10"}` | 200 |
| A-29 | POST /cart/discount | `{"code":"LATO25"}` | 422 |
| A-30 | DELETE /cart/discount | — | 200, `appliedCodes` puste |
| A-31 | PUT /cart/shipping | `{"method":"EXPRESS"}` | 200 |
| A-32 | PUT /cart/shipping | `{"method":"DRON"}` | 400 |
| A-33 | POST /orders | pusty koszyk | 400 |
| A-34 | POST /orders | koszyk z pozycją | 201, status `NEW`, `allowedNext` = `["PAID","CANCELLED"]` |
| A-35 | POST /orders/1001/pay | właściciel | 200 |
| A-36 | POST /orders/9999/pay | — | 404 |
| A-37 | PATCH /orders/1001/status | token admina, `{"status":"SHIPPED"}` | 200 |
| A-38 | PATCH /orders/1001/status | token admina, `{"status":"WYSLANE"}` | 400 |
| A-39 | PATCH /orders/1001/status | token klienta | 403 |
| A-40 | PATCH /orders/1001/status | token admina, `{"status":"NEW"}` z `SHIPPED` | 409 |

Kształt `summary` (BR-08): kwoty z dokładnością do 0,01, np. `{"subtotal":200.00,"discount":20.00,"shipping":14.99,"total":194.99,"appliedCodes":["KAWA10"]}`.

## Pytania do PO

1. Czy hasło o długości 65+ znaków ma być odrzucane z komunikatem (BR-01)? Kod tego nie sprawdza.
2. Czy anulowanie zamówienia `SHIPPED` jest dozwolone (BR-09 mówi: tylko `NEW`/`PAID`)?
3. Czy spacje wokół e-maila mają być przycinane przy rejestracji i logowaniu?
4. Jaki kod HTTP dla ilości > 10 oraz ilości nieprawidłowego typu (400 czy 409)? `docs/api.md` dopuszcza oba.
5. Jak ustawiać datę systemową w testach kodu `JESIEN15`?
