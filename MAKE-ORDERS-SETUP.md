# Objednávky e-shopu → Make.com → Google Tabulka

Web po odeslání objednávky pošle JSON na **Make webhook**. Make zapíše řádek do záložky **Objednávky**.

---

## 1. Google Tabulka

Ujistěte se, že máte list **Objednávky** s hlavičkou v řádku 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Číslo objednávky | Datum a čas | Jméno | E-mail | Telefon | Ulice | Město | PSČ | Faktura = dodání | Faktura ulice | Faktura město | Faktura PSČ | Položky | Doprava | Zásilkovna | ID výdejny | Platba | Mezisoučet | Doprava Kč | Celkem | VS | Poznámka | Stav |

---

## 2. Scénář v Make.com

1. **Create a new scenario**
2. Modul 1: **Webhooks → Custom webhook**
   - Create a webhook, pojmenujte např. `Psocházky objednávky`
   - Zkopírujte **Webhook URL** (vypadá jako `https://hook.eu1.make.com/...` nebo `https://hook.make.com/...`)
3. Klikněte **Run once** (scénář naslouchá)
4. Dočasně vložte testovací URL do prohlížeče nebo pošlete test z webu — Make načte strukturu dat
5. Modul 2: **Google Sheets → Add a row**
   - Připojte Google účet
   - Vyberte tabulku a list **Objednávky**
   - Mapujte sloupce podle polí z webhooku:

| Sloupec v tabulce | Pole z webhooku (Make) |
|-------------------|------------------------|
| A Číslo objednávky | `orderNumber` |
| B Datum a čas | `createdAt` |
| C Jméno | `customerName` |
| D E-mail | `customerEmail` |
| E Telefon | `customerPhone` |
| F Ulice | `street` |
| G Město | `city` |
| H PSČ | `zip` |
| I Faktura = dodání | `billingSame` |
| J Faktura ulice | `billingStreet` |
| K Faktura město | `billingCity` |
| L Faktura PSČ | `billingZip` |
| M Položky | `items` |
| N Doprava | `shipping` |
| O Zásilkovna | `zasilkovnaPoint` |
| P ID výdejny | `packetaId` |
| Q Platba | `payment` |
| R Mezisoučet | `subtotal` |
| S Doprava Kč | `shippingCost` |
| T Celkem | `total` |
| U VS | `variableSymbol` |
| V Poznámka | `note` |
| W Stav | `status` |

6. **Save** scénář
7. Zapněte **Scheduling → ON** (scénář musí být aktivní)

---

## 3. Web — vložit webhook URL

Do souboru `data/obchod-settings.json`:

```json
"orders": {
  "makeWebhookUrl": "https://hook.eu1.make.com/VAS_WEBHOOK_ID"
}
```

Pole `webAppUrl` (Apps Script) už nepoužívejte — nechte prázdné nebo ho odstraňte.

Commit + push na GitHub, aby se URL projevila i na psochazky.cz.

---

## 4. Test

1. Localhost: obnovte stránku objednávky (Ctrl+F5)
2. Odešlete testovací objednávku
3. Měli byste skončit na **obchod-dekujeme.html** s číslem objednávky
4. V Make → **History** u scénáře uvidíte běh (zelený = OK)
5. V tabulce přibude nový řádek

---

## Řešení problémů

| Problém | Řešení |
|---------|--------|
| Řádek v tabulce chybí | Make → History — je běh červený? Zkontrolujte mapování sloupců |
| Web hlásí chybu odeslání | Zkontrolujte URL webhooku, scénář musí být **ON** |
| Make nevidí data | Spusťte **Run once**, pošlete testovací objednávku, pak dokončete mapování |

---

## Credits

1 objednávka ≈ **2 credits** (webhook + Google Sheets). Free plán 1 000 credits/měsíc ≈ 500 objednávek.
