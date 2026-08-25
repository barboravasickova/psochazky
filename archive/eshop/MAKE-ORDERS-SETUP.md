# Objedn├ívky e-shopu Ôćĺ Make.com Ôćĺ Google Tabulka

Web po odesl├ín├ş objedn├ívky po┼íle JSON na **Make webhook**. Make zap├ş┼íe ┼Ö├ídek do z├ílo┼żky **Objedn├ívky**.

---

## 1. Google Tabulka

Ujist─Ťte se, ┼że m├íte list **Objedn├ívky** s hlavi─Źkou v ┼Ö├ídku 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ─î├şslo objedn├ívky | Datum a ─Źas | Jm├ęno | E-mail | Telefon | Ulice | M─Ťsto | PS─î | Faktura = dod├ín├ş | Faktura ulice | Faktura m─Ťsto | Faktura PS─î | Polo┼żky | Doprava | Z├ísilkovna | ID v├Żdejny | Platba | Mezisou─Źet | Doprava K─Ź | Celkem | VS | Pozn├ímka | Stav |

---

## 2. Sc├ęn├í┼Ö v Make.com

1. **Create a new scenario**
2. Modul 1: **Webhooks Ôćĺ Custom webhook**
   - Create a webhook, pojmenujte nap┼Ö. `Psoch├ízky objedn├ívky`
   - Zkop├şrujte **Webhook URL** (vypad├í jako `https://hook.eu1.make.com/...` nebo `https://hook.make.com/...`)
3. Klikn─Ťte **Run once** (sc├ęn├í┼Ö naslouch├í)
4. Do─Źasn─Ť vlo┼żte testovac├ş URL do prohl├ş┼że─Źe nebo po┼ílete test z webu ÔÇö Make na─Źte strukturu dat
5. Modul 2: **Google Sheets Ôćĺ Add a row**
   - P┼Öipojte Google ├║─Źet
   - Vyberte tabulku a list **Objedn├ívky**
   - Mapujte sloupce podle pol├ş z webhooku:

| Sloupec v tabulce | Pole z webhooku (Make) |
|-------------------|------------------------|
| A ─î├şslo objedn├ívky | `orderNumber` |
| B Datum a ─Źas | `createdAt` |
| C Jm├ęno | `customerName` |
| D E-mail | `customerEmail` |
| E Telefon | `customerPhone` |
| F Ulice | `street` |
| G M─Ťsto | `city` |
| H PS─î | `zip` |
| I Faktura = dod├ín├ş | `billingSame` |
| J Faktura ulice | `billingStreet` |
| K Faktura m─Ťsto | `billingCity` |
| L Faktura PS─î | `billingZip` |
| M Polo┼żky | `items` |
| N Doprava | `shipping` |
| O Z├ísilkovna | `zasilkovnaPoint` |
| P ID v├Żdejny | `packetaId` |
| Q Platba | `payment` |
| R Mezisou─Źet | `subtotal` |
| S Doprava K─Ź | `shippingCost` |
| T Celkem | `total` |
| U VS | `variableSymbol` |
| V Pozn├ímka | `note` |
| W Stav | `status` |

6. **Save** sc├ęn├í┼Ö
7. Zapn─Ťte **Scheduling Ôćĺ ON** (sc├ęn├í┼Ö mus├ş b├Żt aktivn├ş)

---

## 3. Web ÔÇö vlo┼żit webhook URL

Do souboru `data/obchod-settings.json`:

```json
"orders": {
  "makeWebhookUrl": "https://hook.eu1.make.com/VAS_WEBHOOK_ID"
}
```

Pole `webAppUrl` (Apps Script) u┼ż nepou┼ż├şvejte ÔÇö nechte pr├ízdn├ę nebo ho odstra┼łte.

Commit + push na GitHub, aby se URL projevila i na psochazky.cz.

---

## 4. Test

1. Localhost: obnovte str├ínku objedn├ívky (Ctrl+F5)
2. Ode┼ílete testovac├ş objedn├ívku
3. M─Ťli byste skon─Źit na **obchod-dekujeme.html** s ─Ź├şslem objedn├ívky
4. V Make Ôćĺ **History** u sc├ęn├í┼Öe uvid├şte b─Ťh (zelen├Ż = OK)
5. V tabulce p┼Öibude nov├Ż ┼Ö├ídek

---

## ┼śe┼íen├ş probl├ęm┼»

| Probl├ęm | ┼śe┼íen├ş |
|---------|--------|
| ┼ś├ídek v tabulce chyb├ş | Make Ôćĺ History ÔÇö je b─Ťh ─Źerven├Ż? Zkontrolujte mapov├ín├ş sloupc┼» |
| Web hl├ís├ş chybu odesl├ín├ş | Zkontrolujte URL webhooku, sc├ęn├í┼Ö mus├ş b├Żt **ON** |
| Make nevid├ş data | Spus┼ąte **Run once**, po┼ílete testovac├ş objedn├ívku, pak dokon─Źete mapov├ín├ş |

---

## Credits

1 objedn├ívka Ôëł **2 credits** (webhook + Google Sheets). Free pl├ín 1 000 credits/m─Ťs├şc Ôëł 500 objedn├ívek.
