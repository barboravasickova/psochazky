# Objednávky e-shopu → Notion (bez Tally pro zákazníka)

Zákazník vyplní **jen formulář na webu** (včetně mapy Zásilkovny). Po odeslání web pošle data na malou službu na **Vercelu**, která vytvoří řádek v Notion databázi **`objednavky-psochazky`**.

Tally zákazník **nevidí** — můžete ho nechat jako zálohu pro ruční zadání, nebo vypnout.

---

## 1. Notion integrace

1. Otevřete [notion.so/my-integrations](https://www.notion.so/my-integrations) → **New integration**
2. Název např. `Psocházky objednávky`
3. Zkopírujte **Internal Integration Secret** (`secret_…`) → bude `NOTION_TOKEN` na Vercelu
4. V Notion u databáze **`objednavky-psochazky`** → **⋯** → **Connections** → připojte integraci

### ID databáze

Otevřete databázi v prohlížeči. URL vypadá např.:

`https://www.notion.so/vasejmeno/abc123def456...?v=...`

32 znaků před `?` (bez pomlček) = **Database ID** → `NOTION_ORDERS_DATABASE_ID`

---

## 2. Vercel — proměnné prostředí

Projekt **`cms-oauth`** (např. `psochazky-cms-oauth.vercel.app`) → **Settings → Environment Variables**:

| Název | Hodnota |
|-------|---------|
| `NOTION_TOKEN` | `secret_…` z Notion |
| `NOTION_ORDERS_DATABASE_ID` | ID databáze (32 znaků) |

**Redeploy** projektu po uložení proměnných.

Endpoint: `https://psochazky-cms-oauth.vercel.app/api/orders`

---

## 3. Web — URL odeslání

V `data/obchod-settings.json`:

```json
"orders": {
  "submitUrl": "https://psochazky-cms-oauth.vercel.app/api/orders"
}
```

Commit + push na GitHub.

---

## 4. Notion — hodnoty Select sloupců

Musí **přesně** sedět s webem (včetně velkých písmen):

| Sloupec | Možnosti |
|---------|----------|
| **Faktura stejná** | `Ano`, `Ne` |
| **Doprava** | `Osobní odběr (Brno)`, `Zásilkovna` |
| **Platba** | `Platba převodem`, `Hotově při převzetí` |
| **Stav** | `Nová` (výchozí stav nové objednávky) |

---

## 5. Test

1. Localhost: `http://localhost:8080/obchod.html` (Ctrl+F5)
2. Košík → objednávka → vyplnit → **Odeslat objednávku**
3. Měli byste skončit na **obchod-dekujeme.html** (bez Tally)
4. V Notion přibude nový řádek

---

## Řešení problémů

| Problém | Řešení |
|---------|--------|
| Chyba o CORS | Origin musí být localhost nebo psochazky.cz |
| `Chybí NOTION_TOKEN…` | Env proměnné na Vercelu + redeploy |
| Notion: property does not exist | Název sloupce v Notion musí sedět s mapováním v `cms-oauth/lib/notion-orders.ts` |
| Select option invalid | Doplňte chybějící možnost v Notion Select sloupci |
