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

Decap CMS s backendem `github` potřebuje OAuth provider (proxy).
Bez něj nebude přihlášení fungovat.

Možnosti:

- Netlify OAuth (pokud by web běžel na Netlify)
- Vercel / vlastní serverless funkce jako OAuth proxy
- Externí OAuth proxy služba

## 4) Oprávnění pro klientku

1. Klientka má GitHub účet
2. Dostane `Write` přístup do repozitáře
3. Otevře `https://VAS-WEB/admin/`
4. Přihlásí se a může přidávat/mazat příspěvky sama

## 5) Jak klientka pracuje

1. Otevře `/admin`
2. V sekci **Texty webu** upraví stránku nebo v sekci **Blog příspěvky** otevře soubor **Příspěvky**
3. Přidá, upraví nebo smaže příspěvek
4. Klikne **Publish**

## Struktura jednoho příspěvku

- `slug` - unikátní URL identifikátor (např. `jak-se-pripravit-na-prochazku`)
- `title` - titulek
- `date` - datum
- `excerpt` - krátký perex do výpisu
- `image` - obrázek
- `content` - seznam odstavců
- `published` - zda se má článek zobrazit
