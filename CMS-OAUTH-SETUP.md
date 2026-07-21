# Vlastní OAuth proxy pro Decap CMS (Psocházky)

Decap CMS na GitHub Pages potřebuje malou službu, která obstará přihlášení přes GitHub.  
Kód je ve složce **`cms-oauth/`** – nasadíte ho **samostatně na Vercel** (ne na GitHub Pages).

Doporučená URL po deployi: **`https://psochazky-cms-oauth.vercel.app`**

---

## Co uděláte vy (checklist)

### 1. Push kódu na GitHub

Commitněte a pushněte celý repozitář včetně složky `cms-oauth/`.

### 2. GitHub OAuth App

1. Otevřete [GitHub → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. **New OAuth App** (nebo upravte existující „Psochazky Decap CMS“)

| Pole | Hodnota |
|------|---------|
| Application name | `Psochazky Decap CMS` |
| Homepage URL | `https://psochazky.cz` |
| Authorization callback URL | `https://psochazky-cms-oauth.vercel.app/callback` |

3. Uložte si **Client ID** a vygenerujte **Client Secret**

> Pokud Vercel přiřadí jinou URL než `psochazky-cms-oauth.vercel.app`, callback i `base_url` v `admin/config.yml` upravte na skutečnou adresu.

### 3. Deploy na Vercel

1. Přihlaste se na [vercel.com](https://vercel.com)
2. **Add New → Project** → import repozitáře `barboravasickova/psochazky`
3. **Root Directory:** nastavte na **`cms-oauth`**
4. Framework: nechte **Other** (bez build commandu, nebo prázdný)
5. Deploy

Po deployi zkopírujte produkční URL (např. `https://psochazky-cms-oauth.vercel.app`).

### 4. Environment variables ve Vercel

V projektu na Vercel: **Settings → Environment Variables**

| Název | Hodnota |
|-------|---------|
| `OAUTH_GITHUB_CLIENT_ID` | Client ID z GitHub OAuth App |
| `OAUTH_GITHUB_CLIENT_SECRET` | Client Secret z GitHub OAuth App |

Uložte pro **Production** (a volitelně Preview). Potom **Redeploy** projektu.

### 5. Sladit URL v projektu (pokud je potřeba)

Pokud Vercel URL **není** `https://psochazky-cms-oauth.vercel.app`:

1. V GitHub OAuth App upravte callback na `https://VASE-URL.vercel.app/callback`
2. V souboru `admin/config.yml` změňte `backend.base_url` na `https://VASE-URL.vercel.app`
3. Commit + push na `main`

V repozitáři je už přednastaveno `base_url: https://psochazky-cms-oauth.vercel.app` – funguje, pokud Vercel projekt pojmenujete stejně.

### 6. Ověření

1. Otevřete `https://psochazky-cms-oauth.vercel.app` – měla by se zobrazit info stránka
2. Otevřete `https://psochazky.cz/admin/cms.html`
3. **Login with GitHub** → popup na **vaši** Vercel URL → GitHub → návrat do CMS
4. V Avastu případně povolte doménu `psochazky-cms-oauth.vercel.app`

### 7. Přístup klientky k repozitáři

GitHub → `barboravasickova/psochazky` → **Settings → Collaborators** → přidat účet klientky s rolí **Write**.

---

## Lokální vývoj bez GitHub loginu (volitelné)

Do `admin/config.yml` dočasně přidejte:

```yaml
local_backend: true
```

V kořeni repozitáře spusťte:

```bash
npx decap-server
```

A paralelně Go Live. Přihlášení přes GitHub nepotřebujete; změny se zapisují jen lokálně.

---

## Řešení problémů

| Problém | Řešení |
|---------|--------|
| Avast blokuje popup | Výjimka pro vaši Vercel OAuth URL |
| `ERR_CONNECTION_RESET` | Zkontrolujte deploy na Vercel a env variables |
| Callback error | Callback URL v GitHub musí přesně sedět s `/callback` |
| CMS neukládá | Účet musí mít Write přístup k repu |

---

## Soubory

- `cms-oauth/api/auth.ts` – přesměrování na GitHub
- `cms-oauth/api/callback.ts` – návrat tokenu do CMS
- `admin/config.yml` → `backend.base_url`

Založeno na [daresaydigital/decap-cms-oauth](https://github.com/daresaydigital/decap-cms-oauth).
