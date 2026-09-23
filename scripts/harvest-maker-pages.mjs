#!/usr/bin/env node
/**
 * Harvest a pet-food maker's own product pages: barcode, size, range and the
 * label-panel images — the raw material for a route-A campaign.
 *
 * Written for cesar.com (batch 042) and meant for the other Mars brand sites,
 * which run the same Drupal build: every product page carries
 *
 *   - Product structured data (JSON-LD) whose `sku` is the UPC. A number-typed
 *     field drops the leading zero of a 023100 code; the ledger builder
 *     restores it ONLY when the check digit then validates, and says so.
 *   - a `dataLayer` taxonomy: "Sub brand" (the range), "Format", "Product
 *     size", "Lifestage", "Food Type" — the maker's own words for all of them.
 *   - <img alt="… guaranteed analysis image"> and "… ingredients image": the
 *     printed panel as a picture. It is NOT text anywhere on the page. The two
 *     alt texts are unreliable about which one holds the panel; keep both.
 *
 * The images must then be READ — transcribed twice, independently, and only
 * kept where the two readings match. See research/BRIEF-CESAR.md §2.
 *
 * Needs outbound web access and Chromium; plain curl gets a 403 from the
 * sites' bot protection where a real browser context does not. Playwright is
 * not a dependency of this repository, so it is loaded from the global npm
 * root the cloud environment provides.
 *
 *   node scripts/harvest-maker-pages.mjs https://www.cesar.com /tmp/cesar
 *
 * Writes <out>/manifest.json, <out>/<slug>.html and <out>/img/<slug>__ga|ing.*
 * Nothing here goes into the repository: images are large and are evidence
 * to read, not data to store.
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [origin, out] = process.argv.slice(2);
if (!origin || !out) {
  console.error("usage: node scripts/harvest-maker-pages.mjs <https://www.maker.com> <outdir>");
  process.exit(2);
}
const globalRoot = execSync("npm root -g").toString().trim();
const { chromium } = await import(join(globalRoot, "playwright", "index.mjs"));
mkdirSync(join(out, "img"), { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
  proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
});
const ctx = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
});
const page = await ctx.newPage();
await page.goto(origin, { timeout: 45000 }).catch(() => {});

const sitemap = await (await ctx.request.get(new URL("/sitemap.xml", origin).href)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+\/products\/[^<]+)<\/loc>/g)].map((m) => m[1]);
console.error(`${urls.length} product URLs in the sitemap`);

const unescape = (s) => s.replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"');
const manifest = [];
for (const url of urls) {
  const slug = url.split("/").slice(-2).join("__");
  const rec = { url, slug, images: {} };
  try {
    let res = await ctx.request.get(url);
    let html = await res.text();
    rec.status = res.status();
    if (res.status() !== 200) {
      await page.goto(url, { timeout: 45000, waitUntil: "domcontentloaded" });
      html = await page.content();
      rec.status = "rendered";
    }
    writeFileSync(join(out, `${slug}.html`), html);
    const lds = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } })
      .filter(Boolean);
    const product = lds.find((x) => x["@type"] === "Product") ?? {};
    rec.name = product.name ?? null;
    rec.sku = product.sku ?? null;
    const taxonomy = html.match(/"taxonomy":"((?:[^"\\]|\\.)*)"/);
    if (taxonomy) { try { rec.taxonomy = JSON.parse(JSON.parse(`"${taxonomy[1]}"`)); } catch {} }
    rec.hero_sizes = [...html.matchAll(/class="pdp-hero__list-item--link"[^>]*title="([^"]+)"/g)].map((m) => m[1]);
    for (const m of html.matchAll(/<img[^>]*?src="([^"]+)"[^>]*?alt="([^"]*(?:guaranteed analysis|ingredients)[^"]*)"/gi)) {
      rec.images[unescape(m[2])] = m[1];
    }
    for (const [alt, src] of Object.entries(rec.images)) {
      const kind = /guaranteed/i.test(alt) ? "ga" : "ing";
      const ext = (src.match(/\.(png|jpe?g|webp)/i) ?? ["", "png"])[1];
      const file = join(out, "img", `${slug}__${kind}.${ext}`);
      const img = await ctx.request.get(new URL(src, origin).href);
      // A 403 here is usually the maker's own broken link, not a block: in
      // batch 042 the same URLs failed from inside the rendered page too.
      rec[`${kind}_status`] = img.status();
      if (img.status() === 200) writeFileSync(file, await img.body());
      rec[`${kind}_file`] = img.status() === 200 ? file : null;
    }
  } catch (e) {
    rec.error = String(e).slice(0, 200);
  }
  manifest.push(rec);
  writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 1));
  console.error(rec.status, rec.sku, rec.name);
}
await browser.close();
