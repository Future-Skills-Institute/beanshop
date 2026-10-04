import { PRODUCTS } from '../support/data';
import { SummarySchema } from '../support/schemas';
import { expect, test } from './fixtures';

type Metoda = 'STANDARD' | 'EXPRESS';
type Pozycja = { produkt: keyof typeof PRODUCTS; ilosc: number };

interface Przypadek {
  opis: string;
  koszyk: Pozycja[];
  /** Kody stosowane po kolei (null = brak kodu). */
  kod: string | string[] | null;
  metoda: Metoda;
  oczekiwanaDostawa: number;
  oczekiwanaSuma: number;
}

// Oczekiwane kwoty wyliczone ręcznie z docs/wymagania.md (BR-04..BR-06, BR-08), NIE z kodu aplikacji.
// BR-04: standard 14,99 (darmowy OD 200,00 po rabacie); express 24,99 (10,00 przy darmowej dostawie).
const dzbanek2: Pozycja[] = [{ produkt: 'dzbanek', ilosc: 2 }]; // 200,00
const dzbanek1: Pozycja[] = [{ produkt: 'dzbanek', ilosc: 1 }]; // 100,00
const v60: Pozycja[] = [{ produkt: 'v60', ilosc: 1 }]; // 99,00

const przypadki: Przypadek[] = [
  // --- BR-04: dostawa bez kodu ---
  { opis: 'BR-04: 99,00 zł, standard płatny', koszyk: v60, kod: null, metoda: 'STANDARD', oczekiwanaDostawa: 14.99, oczekiwanaSuma: 113.99 },
  { opis: 'BR-04: 99,00 zł, express płatny', koszyk: v60, kod: null, metoda: 'EXPRESS', oczekiwanaDostawa: 24.99, oczekiwanaSuma: 123.99 },
  {
    opis: 'BR-04: 199,00 zł (tuż pod progiem), standard płatny',
    koszyk: [{ produkt: 'dzbanek', ilosc: 1 }, { produkt: 'v60', ilosc: 1 }],
    kod: null, metoda: 'STANDARD', oczekiwanaDostawa: 14.99, oczekiwanaSuma: 213.99,
  },
  {
    opis: 'BR-04: 199,00 zł (tuż pod progiem), express płatny',
    koszyk: [{ produkt: 'dzbanek', ilosc: 1 }, { produkt: 'v60', ilosc: 1 }],
    kod: null, metoda: 'EXPRESS', oczekiwanaDostawa: 24.99, oczekiwanaSuma: 223.99,
  },
  { opis: 'BR-04: dokładnie 200,00 zł, standard darmowy ("od 200,00")', koszyk: dzbanek2, kod: null, metoda: 'STANDARD', oczekiwanaDostawa: 0, oczekiwanaSuma: 200 },
  { opis: 'BR-04: dokładnie 200,00 zł, express przy darmowej dostawie = dopłata 10,00', koszyk: dzbanek2, kod: null, metoda: 'EXPRESS', oczekiwanaDostawa: 10, oczekiwanaSuma: 210 },

  // --- BR-04 + BR-06: próg liczony po rabacie ---
  { opis: 'BR-04/06: 200,00 zł z KAWA10 (180,00 po rabacie), dostawa płatna', koszyk: dzbanek2, kod: 'KAWA10', metoda: 'STANDARD', oczekiwanaDostawa: 14.99, oczekiwanaSuma: 194.99 },
  { opis: 'BR-04/06: 200,00 zł z MINUS20 (180,00 po rabacie), dostawa płatna', koszyk: dzbanek2, kod: 'MINUS20', metoda: 'STANDARD', oczekiwanaDostawa: 14.99, oczekiwanaSuma: 194.99 },
  {
    opis: 'BR-04/06: 219,99 zł z MINUS20 = 199,99 po rabacie, dostawa płatna',
    koszyk: [{ produkt: 'dzbanek', ilosc: 2 }, { produkt: 'filtry', ilosc: 1 }],
    kod: 'MINUS20', metoda: 'STANDARD', oczekiwanaDostawa: 14.99, oczekiwanaSuma: 214.98,
  },
  {
    opis: 'BR-04/06: 258,00 zł z KAWA10 (232,20 po rabacie), standard darmowy',
    koszyk: [{ produkt: 'mlynek', ilosc: 1 }, { produkt: 'v60', ilosc: 1 }],
    kod: 'KAWA10', metoda: 'STANDARD', oczekiwanaDostawa: 0, oczekiwanaSuma: 232.2,
  },
  {
    opis: 'BR-04/06: 258,00 zł z KAWA10 (232,20 po rabacie), express = dopłata 10,00',
    koszyk: [{ produkt: 'mlynek', ilosc: 1 }, { produkt: 'v60', ilosc: 1 }],
    kod: 'KAWA10', metoda: 'EXPRESS', oczekiwanaDostawa: 10, oczekiwanaSuma: 242.2,
  },
  {
    opis: 'BR-04/06: 259,00 zł z MINUS20 (239,00), standard darmowy',
    koszyk: [{ produkt: 'mlynek', ilosc: 1 }, { produkt: 'dzbanek', ilosc: 1 }],
    kod: 'MINUS20', metoda: 'STANDARD', oczekiwanaDostawa: 0, oczekiwanaSuma: 239,
  },

  // --- BR-06: warunki kodów ---
  { opis: 'BR-06: KAWA10 na 44,99 zł (rabat 4,50 half-up), standard', koszyk: [{ produkt: 'etiopia', ilosc: 1 }], kod: 'KAWA10', metoda: 'STANDARD', oczekiwanaDostawa: 14.99, oczekiwanaSuma: 55.48 },
  { opis: 'BR-06/05: wielkość liter w kodzie bez znaczenia (kawa10)', koszyk: dzbanek1, kod: 'kawa10', metoda: 'STANDARD', oczekiwanaDostawa: 14.99, oczekiwanaSuma: 104.99 },
  { opis: 'BR-06: MINUS20 przy dokładnie 100,00 zł (próg włącznie)', koszyk: dzbanek1, kod: 'MINUS20', metoda: 'STANDARD', oczekiwanaDostawa: 14.99, oczekiwanaSuma: 94.99 },
  { opis: 'BR-06: MINUS20 przy 99,00 zł odrzucony, koszyk bez zmian', koszyk: v60, kod: 'MINUS20', metoda: 'STANDARD', oczekiwanaDostawa: 14.99, oczekiwanaSuma: 113.99 },
  { opis: 'BR-06: JESIEN15 (ważny, 15.10.2026) na 100,00 zł', koszyk: dzbanek1, kod: 'JESIEN15', metoda: 'STANDARD', oczekiwanaDostawa: 14.99, oczekiwanaSuma: 99.99 },
  { opis: 'BR-06: LATO25 wygasły, odrzucony, koszyk bez zmian', koszyk: [{ produkt: 'mlynek', ilosc: 1 }], kod: 'LATO25', metoda: 'STANDARD', oczekiwanaDostawa: 14.99, oczekiwanaSuma: 173.99 },

  // --- BR-05: jeden kod, nowy zastępuje poprzedni ---
  { opis: 'BR-05: MINUS20 potem JESIEN15 - aktywny tylko JESIEN15 (170,00)', koszyk: dzbanek2, kod: ['MINUS20', 'JESIEN15'], metoda: 'STANDARD', oczekiwanaDostawa: 14.99, oczekiwanaSuma: 184.99 },
  {
    opis: 'BR-05: KAWA10 potem MINUS20 - aktywny tylko MINUS20 (239,00), kody się nie sumują',
    koszyk: [{ produkt: 'mlynek', ilosc: 1 }, { produkt: 'dzbanek', ilosc: 1 }],
    kod: ['KAWA10', 'MINUS20'], metoda: 'STANDARD', oczekiwanaDostawa: 0, oczekiwanaSuma: 239,
  },
];

test.describe('Dostawa i kody rabatowe (BR-04..BR-06)', () => {
  test.beforeEach(async ({ api }) => {
    // Stały czas (czas polski), żeby ważność JESIEN15 nie zależała od daty uruchomienia.
    await api.setClock('2026-10-15T12:00:00+02:00');
  });

  test.afterEach(async ({ api }) => {
    await api.setClock(null);
  });

  for (const p of przypadki) {
    test(p.opis, async ({ customer }) => {
      for (const { produkt, ilosc } of p.koszyk) {
        const res = await customer.addToCart(PRODUCTS[produkt].id, ilosc);
        expect(res.status()).toBe(201);
      }

      const kody = p.kod === null ? [] : Array.isArray(p.kod) ? p.kod : [p.kod];
      for (const kod of kody) await customer.applyCode(kod); // odrzucenie kodu (422) jest częścią scenariusza

      expect((await customer.setShipping(p.metoda)).status()).toBe(200);

      const cart = await customer.cart();
      expect(cart.status()).toBe(200);
      const summary = SummarySchema.parse((await cart.json()).summary);

      expect(summary.shipping).toBe(p.oczekiwanaDostawa);
      expect(summary.total).toBe(p.oczekiwanaSuma);
    });
  }
});
