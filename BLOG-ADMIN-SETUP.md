# Decap CMS - další kroky

## Co je už připraveno

- `admin/index.html` + `admin/config.yml` - Decap CMS admin
- Datové soubory v `data/` pro jednotlivé sekce webu
- Blog (`blog.html`, `blog-detail.html`, `data/blog-posts.json`)
- CMS načítání textů přes skripty v `js/cms-*.js`

## 1) Doplňte hodnoty v `admin/config.yml`

Nahradit placeholdery:

- `REPLACE_WITH_YOUR_GITHUB_REPO` → `uzivatel/repozitar`
- `REPLACE_WITH_OAUTH_PROVIDER_URL` → URL OAuth proxy služby
- `REPLACE_WITH_PUBLIC_WEBSITE_URL` → veřejná adresa webu (např. `https://psochazky.cz`)

## 2) Zapněte GitHub Pages

1. GitHub → `Settings` → `Pages`
2. Source: `Deploy from a branch`
3. Branch: `main` + `/ (root)`
4. Uložit

## 3) OAuth pro přihlášení do `/admin`

Decap CMS s backendem `github` potřebuje OAuth proxy (Vercel).  
**Podrobný návod:** viz [`CMS-OAUTH-SETUP.md`](CMS-OAUTH-SETUP.md).

Stručně:

1. Nasadit složku `cms-oauth/` na Vercel
2. Vytvořit GitHub OAuth App s callback `https://psochazky-cms-oauth.vercel.app/callback`
3. Do Vercel nastavit `OAUTH_GITHUB_CLIENT_ID` a `OAUTH_GITHUB_CLIENT_SECRET`
4. V `admin/config.yml` je `base_url` nastaveno na vlastní proxy (ne starou `…-bay.vercel.app`)

## 4) Oprávnění pro klientku

1. Klientka má GitHub účet
2. Dostane `Write` přístup do repozitáře
3. Otevře `https://VAS-WEB/admin/`
4. Přihlásí se a může přidávat/mazat příspěvky sama

## 5) Jak klientka pracuje

1. Otevře `/admin` → **Texty webu** (CMS)
2. V levém menu vybere **Stránky webu** (všechny stránky včetně úvodu) nebo **Blog**
3. Upraví obsah
4. Klikne **Publikovat na web** – změna se uloží a web se během 1–2 minut aktualizuje

### Koncepty u blogu

- U nového článku nechte **Zobrazit na webu** vypnuté → článek se uloží, ale na webu se neukáže
- Až bude hotový, zapněte **Zobrazit na webu** a znovu **Publikovat na web**

## Struktura jednoho příspěvku

- `slug` - unikátní URL identifikátor (např. `jak-se-pripravit-na-prochazku`)
- `title` - titulek
- `date` - datum
- `excerpt` - krátký perex do výpisu
- `image` - obrázek
- `content` - seznam odstavců
- `published` - zapnuto = článek je vidět na webu; vypnuto = koncept
