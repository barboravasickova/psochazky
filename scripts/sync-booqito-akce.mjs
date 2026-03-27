/**
 * Stáhne výpis akcí z psochazky.booqito.com a zapíše data/booqito-akce.json
 * Spusť před nasazením: node scripts/sync-booqito-akce.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "data", "booqito-akce.json");
const BASE = "https://psochazky.booqito.com/";

const res = await fetch(BASE, {
  headers: { "User-Agent": "Psochazky-sync/1.0 (akce; +https://psochazky.cz)" },
});
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const html = await res.text();

const items = [];
const anchorRe = /<a class="-at" href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
let m;
while ((m = anchorRe.exec(html)) !== null) {
  const hrefRaw = m[1];
  const inner = m[2];

  let url;
  if (hrefRaw.startsWith("javascript:")) {
    url = BASE;
  } else if (hrefRaw.startsWith("http")) {
    url = hrefRaw;
  } else {
    url = `${BASE.replace(/\/$/, "")}/${hrefRaw.replace(/^\//, "")}`;
  }

  const nameMatch = inner.match(/<div class="name">([^<]*)<\/div>/);
  const title = nameMatch ? nameMatch[1].trim() : "";

  const cityMatch = inner.match(/<div class="city">\s*([^<]*?)\s*<\/div>/);
  const city = cityMatch ? cityMatch[1].trim() : "";

  const priceMatch = inner.match(/od <strong>([\d\s]+)<\/strong>\s*Kč/i);
  const price = priceMatch
    ? `od ${priceMatch[1].replace(/\s/g, " ").trim()} Kč`
    : "";

  const imgMatch = inner.match(/<img[^>]+src="([^"]+)"/i);
  let image = imgMatch ? imgMatch[1] : null;
  if (image && !image.startsWith("http")) {
    image = `${BASE.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
  }

  const badgeMatches = [...inner.matchAll(/<div class="-au ([^"]+)">([^<]*)<\/div>/g)];
  const badges = [];
  let status = "neutral";
  for (const bm of badgeMatches) {
    const cls = bm[1];
    const text = bm[2].trim();
    if (!text) continue;
    badges.push(text);
    if (cls.includes("red")) status = "unavailable";
    else if (cls.includes("green") || cls.includes("gray")) {
      if (text.toUpperCase().includes("NEDOSTUPN")) status = "unavailable";
      else if (text.toUpperCase().includes("DOSTUPN")) status = "available";
    }
  }

  if (!title) continue;

  items.push({
    title,
    url,
    image,
    price,
    city,
    badges,
    status,
    isWidgetLink: hrefRaw.startsWith("javascript:"),
  });
}

const payload = {
  source: BASE,
  syncedAt: new Date().toISOString(),
  items,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");
console.log(`OK: ${items.length} položek → ${OUT}`);
