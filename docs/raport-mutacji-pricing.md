# Raport testów mutacyjnych

## Uruchomienie

Konfigurację Strykera sprawdzono w `package.json` i `stryker.config.json`.
Testy uruchomiono poleceniem:

```bash
npm run test:mutation -- --force --mutate src/domain/pricing.ts
```

`--force` wymusza uruchomienie wszystkich mutantów, a `--mutate` ogranicza
zakres do `src/domain/pricing.ts`.

## Wynik początkowy

- testy: 6 uruchomionych, zakończone poprawnie;
- mutanty: 33;
- zabite: 24;
- przeżyte: 9;
- timeouty/błędy: 0;
- mutation score: **72,73%**.

Przeżyły mutanty dotyczące:

- naliczania rabatu procentowego (`pricing.ts:41`);
- darmowej dostawy dla wartości dokładnie 200,00 zł (`pricing.ts:49-50`);
- odejmowania rabatu i dodawania dostawy do sumy (`pricing.ts:62, 68`);
- zwracania zastosowanych kodów (`pricing.ts:69`).

## Wzmocnienie testów

Testy w `tests/unit/pricing.test.ts` sprawdzają teraz konkretne wartości
rabatu, dostawy, sumy i `appliedCodes`, a także granicę 200,00 zł zgodnie
z BR-04 i BR-06 w `docs/wymagania.md`.

## Wynik po wzmocnieniu

Ponowiono uruchomienie tą samą komendą:

```bash
npm run test:mutation -- --force --mutate src/domain/pricing.ts
```

- Stryker uruchomił 13 przypadków testowych z `pricing.test.ts` (w tym
  przypadki rozwinięte przez `it.each` i dwa `test.fails`);
- mutanty: 33;
- zabite: 33;
- przeżyte: 0;
- timeouty/błędy: 0;
- mutation score: **100,00%**.

W całym zestawie unit uruchomiono 21 przypadków: 19 zaliczonych i 2
oczekiwane niepowodzenia (`test.fails`):

- BR-04: próg 200,00 zł używa w implementacji `>` zamiast wymaganego `>=`;
- BR-08: rabat 9,999 zł nie jest zaokrąglany do 10,00 zł.
