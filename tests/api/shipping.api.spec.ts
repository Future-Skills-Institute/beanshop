import { PRODUCTS } from '../support/data';
import { expect, test } from './fixtures';

type Metoda = 'STANDARD' | 'EXPRESS';

interface Przypadek {
  opis: string;
  koszyk: { produkt: keyof typeof PRODUCTS; ilosc: number }[];
  /** Kody stosowane po kolei (BR-05: nowy kod zastępuje poprzedni). */
  kod: string | string[] | null;
  metoda: Metoda;
  oczekiwanaDostawa: number;
  oczekiwanaSuma: number;
  /** Jeśli ustawione: znany błąd aplikacji, oczekiwane wartości pochodzą z wymagań, nie z kodu. */
  blad?: string;
}

// Oczekiwane kwoty policzone ręcznie na podstawie docs/wymagania.md (BR-04, BR-05, BR-06, BR-08).
// Ceny: etiopia 44,99; brazylia 89,99; espresso 54,99; mlynek 159,00; v60 99,00; dzbanek 100,00.
const przypadki: Przypadek[] = [
  {
    opis: 'standard poniżej progu, bez kodu: 44,99 + 14,99',
    koszyk: [{ produkt: 'etiopia', ilosc: 1 }],
    kod: null,
    metoda: 'STANDARD',
    oczekiwanaDostawa: 14.99,
    oczekiwanaSuma: 59.98,
  },
  {
    opis: 'standard tuż pod progiem (199,00 zł): płatna dostawa',
    koszyk: [
      { produkt: 'dzbanek', ilosc: 1 },
      { produkt: 'v60', ilosc: 1 },
    ],
    kod: null,
    metoda: 'STANDARD',
    oczekiwanaDostawa: 14.99,
    oczekiwanaSuma: 213.99,
  },
  {
    opis: 'standard 199,97 zł: płatna dostawa',
    koszyk: [
      { produkt: 'brazylia', ilosc: 1 },
      { produkt: 'espresso', ilosc: 2 },
    ],
    kod: null,
    metoda: 'STANDARD',
    oczekiwanaDostawa: 14.99,
    oczekiwanaSuma: 214.96,
  },
  {
    opis: 'standard dokładnie 200,00 zł: darmowa dostawa ("od 200,00 zł")',
    koszyk: [{ produkt: 'dzbanek', ilosc: 2 }],
    kod: null,
    metoda: 'STANDARD',
    oczekiwanaDostawa: 0,
    oczekiwanaSuma: 200,
    blad: 'BR-04: pricing.ts używa ">" zamiast ">=" dla progu 200,00 zł',
  },
  {
    opis: 'standard powyżej progu (259,00 zł): darmowa dostawa',
    koszyk: [
      { produkt: 'mlynek', ilosc: 1 },
      { produkt: 'dzbanek', ilosc: 1 },
    ],
    kod: null,
    metoda: 'STANDARD',
    oczekiwanaDostawa: 0,
    oczekiwanaSuma: 259,
  },
  {
    opis: '200,00 zł z KAWA10: po rabacie 180,00 zł, więc dostawa płatna',
    koszyk: [{ produkt: 'dzbanek', ilosc: 2 }],
    kod: 'KAWA10',
    metoda: 'STANDARD',
    oczekiwanaDostawa: 14.99,
    oczekiwanaSuma: 194.99,
  },
  {
    opis: '200,00 zł z MINUS20: po rabacie 180,00 zł, więc dostawa płatna',
    koszyk: [{ produkt: 'dzbanek', ilosc: 2 }],
    kod: 'MINUS20',
    metoda: 'STANDARD',
    oczekiwanaDostawa: 14.99,
    oczekiwanaSuma: 194.99,
  },
  {
    opis: '259,00 zł z MINUS20: po rabacie 239,00 zł, darmowa dostawa',
    koszyk: [
      { produkt: 'mlynek', ilosc: 1 },
      { produkt: 'dzbanek', ilosc: 1 },
    ],
    kod: 'MINUS20',
    metoda: 'STANDARD',
    oczekiwanaDostawa: 0,
    oczekiwanaSuma: 239,
  },
  {
    opis: 'express poniżej progu: 44,99 + 24,99',
    koszyk: [{ produkt: 'etiopia', ilosc: 1 }],
    kod: null,
    metoda: 'EXPRESS',
    oczekiwanaDostawa: 24.99,
    oczekiwanaSuma: 69.98,
  },
  {
    opis: 'express przy darmowej dostawie (259,00 zł): dopłata 10,00 zł',
    koszyk: [
      { produkt: 'mlynek', ilosc: 1 },
      { produkt: 'dzbanek', ilosc: 1 },
    ],
    kod: null,
    metoda: 'EXPRESS',
    oczekiwanaDostawa: 10,
    oczekiwanaSuma: 269,
  },
  {
    opis: 'express dokładnie 200,00 zł: dopłata 10,00 zł (darmowa dostawa przysługuje)',
    koszyk: [{ produkt: 'dzbanek', ilosc: 2 }],
    kod: null,
    metoda: 'EXPRESS',
    oczekiwanaDostawa: 10,
    oczekiwanaSuma: 210,
    blad: 'BR-04: pricing.ts używa ">" zamiast ">=" dla progu 200,00 zł',
  },
  {
    opis: 'express 200,00 zł z KAWA10: po rabacie 180,00 zł, pełne 24,99',
    koszyk: [{ produkt: 'dzbanek', ilosc: 2 }],
    kod: 'KAWA10',
    metoda: 'EXPRESS',
    oczekiwanaDostawa: 24.99,
    oczekiwanaSuma: 204.99,
  },
  {
    opis: 'KAWA10 na V60 (99,00): rabat 9,90',
    koszyk: [{ produkt: 'v60', ilosc: 1 }],
    kod: 'KAWA10',
    metoda: 'STANDARD',
    oczekiwanaDostawa: 14.99,
    oczekiwanaSuma: 104.09,
  },
  {
    opis: 'wielkość liter w kodzie nie ma znaczenia: kawa10',
    koszyk: [{ produkt: 'v60', ilosc: 1 }],
    kod: 'kawa10',
    metoda: 'STANDARD',
    oczekiwanaDostawa: 14.99,
    oczekiwanaSuma: 104.09,
  },
  {
    opis: 'zaokrąglanie half-up (BR-08): KAWA10 na 44,99 daje rabat 4,50',
    koszyk: [{ produkt: 'etiopia', ilosc: 1 }],
    kod: 'KAWA10',
    metoda: 'STANDARD',
    oczekiwanaDostawa: 14.99,
    oczekiwanaSuma: 55.48,
  },
  {
    opis: 'MINUS20 dokładnie przy 100,00 zł: 80,00 + 14,99',
    koszyk: [{ produkt: 'dzbanek', ilosc: 1 }],
    kod: 'MINUS20',
    metoda: 'STANDARD',
    oczekiwanaDostawa: 14.99,
    oczekiwanaSuma: 94.99,
  },
  {
    opis: 'dwa kody po kolei (MINUS20, potem KAWA10) na 259,00 zł: obowiązuje tylko ostatni',
    koszyk: [
      { produkt: 'mlynek', ilosc: 1 },
      { produkt: 'dzbanek', ilosc: 1 },
    ],
    kod: ['MINUS20', 'KAWA10'],
    metoda: 'STANDARD',
    oczekiwanaDostawa: 0,
    oczekiwanaSuma: 233.1,
    blad: 'BR-05: cart.ts odrzuca nowy kod zamiast zastąpić poprzedni',
  },
  {
    opis: 'dwa kody po kolei (KAWA10, potem MINUS20) na 259,00 zł: obowiązuje tylko ostatni',
    koszyk: [
      { produkt: 'mlynek', ilosc: 1 },
      { produkt: 'dzbanek', ilosc: 1 },
    ],
    kod: ['KAWA10', 'MINUS20'],
    metoda: 'STANDARD',
    oczekiwanaDostawa: 0,
    oczekiwanaSuma: 239,
    blad: 'BR-05: cart.ts odrzuca nowy kod zamiast zastąpić poprzedni',
  },
];

test.describe('Dostawa i kody rabatowe: BR-04..BR-06', () => {
  for (const p of przypadki) {
    test(p.opis, async ({ customer }) => {
      if (p.blad) test.fail(true, p.blad);

      for (const { produkt, ilosc } of p.koszyk) {
        const res = await customer.addToCart(PRODUCTS[produkt].id, ilosc);
        expect(res.status()).toBe(201);
      }

      const kody = p.kod === null ? [] : Array.isArray(p.kod) ? p.kod : [p.kod];
      for (const kod of kody) {
        const res = await customer.applyCode(kod);
        expect(res.status(), `kod ${kod}`).toBe(200);
      }

      const shipping = await customer.setShipping(p.metoda);
      expect(shipping.ok()).toBeTruthy();

      const { summary } = await (await customer.cart()).json();
      expect(summary.shipping).toBe(p.oczekiwanaDostawa);
      expect(summary.total).toBe(p.oczekiwanaSuma);
    });
  }
});
