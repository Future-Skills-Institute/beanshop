# Raport testów mutacyjnych `pricing.ts`

## Komenda

```bash
npm run test:mutation -- --mutate src/domain/pricing.ts --testFiles tests/unit/pricing.test.ts
```

## Wynik końcowy

- data uruchomienia: 2026-10-04
- Stryker: 10.0.0
- commit testów: 9ca65e5
- mutacje: 33
- zabite: 33
- przetrwałe: 0
- błędy: 0
- time-outy: 0
- mutation score: 100,00%

Cały suite testów jednostkowych: 24 zaliczone oraz 3 oczekiwane porażki
(`it.fails`); `pricing.test.ts` zawiera 19 przypadków po rozwinięciu tabeli
`it.each`. Oczekiwane porażki dokumentują niezgodności BR-04 (próg 200 zł)
i BR-08 (brak zaokrąglenia sumy końcowej).

## Podstawa oczekiwanych wartości

- BR-04: standardowa dostawa kosztuje 14,99 zł, jest darmowa od 200,00 zł,
  a express przy darmowej dostawie kosztuje 10,00 zł.
- BR-06: `KAWA10` daje rabat 10%.
- BR-08: kwoty są zwracane z dokładnością do 0,01 zł.
