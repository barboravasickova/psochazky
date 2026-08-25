# Objedn├ívky e-shopu Ôćĺ Notion (bez Tally pro z├íkazn├şka)

Z├íkazn├şk vypln├ş **jen formul├í┼Ö na webu** (v─Źetn─Ť mapy Z├ísilkovny). Po odesl├ín├ş web po┼íle data na malou slu┼żbu na **Vercelu**, kter├í vytvo┼Ö├ş ┼Ö├ídek v Notion datab├ízi **`objednavky-psochazky`**.

Tally z├íkazn├şk **nevid├ş** ÔÇö m┼»┼żete ho nechat jako z├ílohu pro ru─Źn├ş zad├ín├ş, nebo vypnout.

---

## 1. Notion integrace

1. Otev┼Öete [notion.so/my-integrations](https://www.notion.so/my-integrations) Ôćĺ **New integration**
2. N├ízev nap┼Ö. `Psoch├ízky objedn├ívky`
3. Zkop├şrujte **Internal Integration Secret** (`secret_ÔÇŽ`) Ôćĺ bude `NOTION_TOKEN` na Vercelu
4. V Notion u datab├íze **`objednavky-psochazky`** Ôćĺ **Ôő»** Ôćĺ **Connections** Ôćĺ p┼Öipojte integraci

### ID datab├íze

Otev┼Öete datab├ízi v prohl├ş┼że─Źi. URL vypad├í nap┼Ö.:

`https://www.notion.so/vasejmeno/abc123def456...?v=...`

32 znak┼» p┼Öed `?` (bez poml─Źek) = **Database ID** Ôćĺ `NOTION_ORDERS_DATABASE_ID`

---

## 2. Vercel ÔÇö prom─Ťnn├ę prost┼Öed├ş

Projekt **`cms-oauth`** (nap┼Ö. `psochazky-cms-oauth.vercel.app`) Ôćĺ **Settings Ôćĺ Environment Variables**:

| N├ízev | Hodnota |
|-------|---------|
| `NOTION_TOKEN` | `secret_ÔÇŽ` z Notion |
| `NOTION_ORDERS_DATABASE_ID` | ID datab├íze (32 znak┼») |

**Redeploy** projektu po ulo┼żen├ş prom─Ťnn├Żch.

Endpoint: `https://psochazky-cms-oauth.vercel.app/api/orders`

---

## 3. Web ÔÇö URL odesl├ín├ş

V `data/obchod-settings.json`:

```json
"orders": {
  "submitUrl": "https://psochazky-cms-oauth.vercel.app/api/orders"
}
```

Commit + push na GitHub.

---

## 4. Notion ÔÇö hodnoty Select sloupc┼»

Mus├ş **p┼Öesn─Ť** sed─Ťt s webem (v─Źetn─Ť velk├Żch p├şsmen):

| Sloupec | Mo┼żnosti |
|---------|----------|
| **Faktura stejn├í** | `Ano`, `Ne` |
| **Doprava** | `Osobn├ş odb─Ťr (Brno)`, `Z├ísilkovna` |
| **Platba** | `Platba p┼Öevodem`, `Hotov─Ť p┼Öi p┼Öevzet├ş` |
| **Stav** | `Nov├í` (v├Żchoz├ş stav nov├ę objedn├ívky) |

---

## 5. Test

1. Localhost: `http://localhost:8080/obchod.html` (Ctrl+F5)
2. Ko┼í├şk Ôćĺ objedn├ívka Ôćĺ vyplnit Ôćĺ **Odeslat objedn├ívku**
3. M─Ťli byste skon─Źit na **obchod-dekujeme.html** (bez Tally)
4. V Notion p┼Öibude nov├Ż ┼Ö├ídek

---

## ┼śe┼íen├ş probl├ęm┼»

| Probl├ęm | ┼śe┼íen├ş |
|---------|--------|
| Chyba o CORS | Origin mus├ş b├Żt localhost nebo psochazky.cz |
| `Chyb├ş NOTION_TOKENÔÇŽ` | Env prom─Ťnn├ę na Vercelu + redeploy |
| Notion: property does not exist | N├ízev sloupce v Notion mus├ş sed─Ťt s mapov├ín├şm v `cms-oauth/lib/notion-orders.ts` |
| Select option invalid | Dopl┼łte chyb─Ťj├şc├ş mo┼żnost v Notion Select sloupci |
