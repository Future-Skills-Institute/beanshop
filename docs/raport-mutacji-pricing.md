# Raport testów mutacyjnych `pricing.ts`

## Komenda

```bash
npm run test:mutation -- --mutate src/domain/pricing.ts --testFiles tests/unit/pricing.test.ts
```

## Wynik końcowy

- mutacje: 33
- zabite: 33
- przetrwałe: 0
- błędy: 0
- time-outy: 0
- mutation score: 100,00%

Testy jednostkowe: 17 zaliczonych oraz 1 oczekiwana porażka (`it.fails`).
Oczekiwana porażka dokumentuje niezgodność implementacji z BR-04: kod używa
warunku `> 200`, a wymaganie mówi „darmowy od 200,00 zł”, czyli `>= 200`.

## Podstawa oczekiwanych wartości

- BR-04: standardowa dostawa kosztuje 14,99 zł, jest darmowa od 200,00 zł,
  a express przy darmowej dostawie kosztuje 10,00 zł.
- BR-06: `KAWA10` daje rabat 10%.
- BR-08: kwoty są zwracane z dokładnością do 0,01 zł.
