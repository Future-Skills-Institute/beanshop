# Przepływ: od dodania produktu do złożenia zamówienia

Diagram przedstawia rzeczywisty przepływ API dla zalogowanego klienta. Logowanie
jest pokazane jako warunek wejścia, ponieważ wszystkie endpointy koszyka i
zamówień wymagają autoryzacji.

```mermaid
flowchart TD
    A[Klient loguje się<br/>POST /api/auth/login] --> B{Logowanie poprawne?}
    B -- Nie --> B1[401 / 423<br/>brak dostępu do koszyka]
    B -- Tak --> C[Lista produktów<br/>GET /api/products]
    C --> D[Klient wybiera produkt<br/>POST /api/cart/items<br/>{ productId, quantity }]
    D --> E{Produkt istnieje,<br/>ilość 1-10 i stan wystarcza?}
    E -- Nie --> E1[400 / 404 / 409<br/>koszyk pozostaje bez zmiany]
    E -- Tak --> F[Koszyk zapisany<br/>201 + cartView]
    F --> G{Zmiana ilości?}
    G -- Tak --> G1[PATCH /api/cart/items/:productId<br/>ponowna walidacja ilości i stanu]
    G1 --> G2{Zmiana poprawna?}
    G2 -- Nie --> G3[400 / 404 / 409]
    G2 -- Tak --> H
    G -- Nie --> H{Kod rabatowy?}
    H -- Tak --> I[POST /api/cart/discount<br/>sprawdzenie kodu, minimum i daty]
    I --> I1{Kod zaakceptowany?}
    I1 -- Nie --> I2[422 / 409<br/>kod nie zostaje zastosowany]
    I1 -- Tak --> H2
    H -- Nie --> H2{Wybór dostawy?}
    H2 -- Tak --> J[PUT /api/cart/shipping<br/>STANDARD albo EXPRESS]
    J --> J1{Metoda poprawna?}
    J1 -- Nie --> J2[400<br/>dostawa bez zmiany]
    J1 -- Tak --> K
    H2 -- Nie --> K[GET /api/cart lub odpowiedź cartView]
    K --> L[priceCart wylicza summary:<br/>subtotal, discount, shipping, total]
    L --> M{Koszyk zawiera produkt<br/>i stan nadal wystarcza?}
    M -- Nie --> M1[400 EMPTY_CART<br/>lub 409 OUT_OF_STOCK]
    M -- Tak --> N[POST /api/orders]
    N --> O[Utworzenie zamówienia NEW]
    O --> P[Zmniejszenie stanu magazynowego]
    P --> Q[Usunięcie koszyka]
    Q --> R[201 + zamówienie<br/>summary i allowedNext]
```

## Uzupełnienie dla testera

- `POST /api/cart/items`, `PATCH /api/cart/items/:productId`,
  `POST /api/cart/discount` i `PUT /api/cart/shipping` zwracają widok koszyka
  z ponownie wyliczonym `summary`.
- Złożenie zamówienia (`POST /api/orders`) nie przyjmuje danych produktu ani
  dostawy w body; pobiera je z koszyka zalogowanego użytkownika.
- Po utworzeniu zamówienie ma status `NEW`, towar jest zdejmowany ze stanu,
  a koszyk jest usuwany. Dalsze przejścia są wykonywane osobno przez
  `POST /api/orders/:id/pay`, `POST /api/orders/:id/cancel` lub administracyjne
  `PATCH /api/orders/:id/status`.

## Możliwe błędy względem `docs/wymagania.md`

- **MOŻLIWY BŁĄD (BR-04):** `shippingCost` daje bezpłatną dostawę standardową
  dopiero powyżej `200,00 zł` (`afterDiscount > 200`), a wymaganie mówi
  „od `200,00 zł`”, czyli powinno obejmować także dokładnie `200,00 zł`.
- **MOŻLIWY BŁĄD (BR-05):** endpoint `POST /api/cart/discount` dopisuje kod do
  listy i odrzuca drugi kod, zamiast zastępować poprzedni jednym nowym kodem.
- **MOŻLIWY BŁĄD (BR-07):** przy zmianie koszyka nie znaleziono w
  `src/routes/cart.ts` automatycznego usuwania kodu, gdy przestaje być spełnione
  minimum wartości.

## Źródła

- `docs/architektura.md`
- `docs/wymagania.md`
- `src/routes/auth.ts`: `authRouter.post('/login')`
- `src/routes/products.ts`: `productsRouter.get('/')`
- `src/routes/cart.ts`: `cartView`, endpointy `/items`, `/discount`,
  `/shipping`
- `src/routes/orders.ts`: `ordersRouter.post('/')`
- `src/domain/pricing.ts`: `priceCart`, `shippingCost`
