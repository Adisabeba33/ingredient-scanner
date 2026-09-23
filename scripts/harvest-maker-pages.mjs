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
 * sites' bot protection where a real browser context does not. If Chromium
 * fails with ERR_CERT_AUTHORITY_INVALID, the agent proxy has rotated its CA
 * since ~/.pki/nssdb was written: import the CCR CAs from
 * /root/.ccr/ca-bundle.crt with certutil (libnss3-tools). Never switch TLS
 * verification off instead. Playwright is
 * not a dependency of this repository, so it is loaded from the global npm
 * root the cloud environment provides.
 *
 *   node scripts/harvest-maker-pages.mjs https://www.cesar.com /tmp/cesar [seeds.json]
 *
 * Writes <out>/manifest.json (one entry per page, with a `sizes` array: one
 * entry per size, each with its barcode and its own panel image files),
 * <out>/<slug>.html and <out>/img/<image file name>.
 * Nothing here goes into the repository: images are large and are evidence
 * to read, not data to store.
 */
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

// Everything is fetched by navigating the browser, not with ctx.request: the
// Mars sites answer a bare API request with 403 (seen on temptationstreats.com
// 2026-09-23) while the same URL loads in the page.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function fetchViaPage(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    const res = await page.goto(url, { timeout: 45000, waitUntil: "domcontentloaded" }).catch(() => null);
    if (res && res.status() === 200) return { status: 200, body: await res.body() };
    if (res && res.status() === 403 && i === tries - 1) return { status: 403, body: null };
    await sleep(4000 * (i + 1));
  }
  return { status: 0, body: null };
}
const sitemapRes = await fetchViaPage(new URL("/sitemap.xml", origin).href);
const sitemap = sitemapRes.body ? sitemapRes.body.toString("utf8") : "";
let urls = [...sitemap.matchAll(/<loc>([^<]+\/products\/[^<]+)<\/loc>/g)].map((m) => m[1]);
console.error(`${urls.length} product URLs in the sitemap`);

// No sitemap (temptationstreats.com started answering 403 for it, and for
// /products, while every product page still loaded): crawl instead. Seeds are
// the home page's navigation plus any URLs in an optional third argument, a
// JSON file holding an array of URLs or of objects with `source_url`. Each
// product page links its siblings ("pets may also like"), so a breadth-first
// walk reaches the range.
const productLinks = () =>
  page.evaluate(() => [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.href))]);
const isProduct = (u) => { try { const x = new URL(u); return x.origin === new URL(origin).origin && /^\/products\/[^/]+\/[^/?#]+/.test(x.pathname); } catch { return false; } };
const clean = (u) => { const x = new URL(u); x.hash = ""; x.search = ""; return x.href; };
if (urls.length === 0) {
  const seeds = new Set();
  const seedFile = process.argv[4];
  if (seedFile) {
    for (const s of JSON.parse(readFileSync(seedFile, "utf8"))) seeds.add(typeof s === "string" ? s : s.source_url);
  }
  const hubs = [origin];
  for (const hub of hubs) {
    await fetchViaPage(hub, 1);
    for (const l of await productLinks().catch(() => [])) {
      if (isProduct(l)) seeds.add(clean(l));
      else if (l.startsWith(origin) && /treat|food|product|line|flavor/i.test(l) && hubs.length < 40 && !hubs.includes(l)) hubs.push(l);
    }
    await sleep(1500);
  }
  const seen = new Set(), queue = [...seeds].filter(isProduct);
  while (queue.length) {
    const u = queue.shift();
    if (seen.has(u)) continue;
    seen.add(u);
    const r = await fetchViaPage(u, 2);
    if (r.body) for (const l of await productLinks().catch(() => [])) if (isProduct(l) && !seen.has(clean(l))) queue.push(clean(l));
    await sleep(1500);
  }
  urls = [...seen];
  console.error(`${urls.length} product URLs by crawling`);
}

const manifest = [];
const downloaded = new Map();
for (const url of urls) {
  const slug = url.split("/").slice(-2).join("__");
  const rec = { url, slug };
  try {
    const res = await fetchViaPage(url);
    rec.status = res.status;
    if (!res.body) throw new Error(`page status ${res.status}`);
    const html = res.body.toString("utf8");
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
    // One page, several sizes, and each size is its OWN section of the page
    // (data-pdp-size-id) with its own barcode ("Buy Now" data-mm-ids) and its
    // own label images. The JSON-LD sku is only the size the page opens on,
    // and the label images differ between sizes: temptationstreats.com's Tasty
    // Chicken page has 8 sizes, 8 guaranteed-analysis images and 3 different
    // ingredient images. So nothing is read page-wide — every size carries its
    // own barcode and its own panel images, and a panel is only ever attached
    // to the barcode whose section showed it.
    const sizeById = Object.fromEntries(
      [...html.matchAll(/data-size-id="(\d+)"\s+data-size-selected="\w+"\s+href="#"\s+title="([^"]+)"/g)].map((m) => [m[1], m[2]])
    );
    const starts = [...html.matchAll(/data-pdp-size-id=(\d+)/g)].map((m) => [m.index, m[1]]);
    rec.sizes = starts.map(([at, id], i) => {
      const sec = html.slice(at, i + 1 < starts.length ? starts[i + 1][0] : html.length);
      const img = (word) =>
        [...sec.matchAll(new RegExp(`src="([^"]+)"[^>]*?alt="([^"]*?${word}[^"]*)"`, "g"))].map((m) => m[1])[0] ?? null;
      return {
        size_id: id,
        size: sizeById[id] ?? null,
        gtin: (sec.match(/data-mm-ids="(\d+)"/) ?? [])[1] ?? null,
        ga_src: img("guaranteed analysis"),
        ing_src: img("ingredients"),
      };
    });
    // Download each distinct panel image once, named by its own file name, so
    // two sizes that share an image share a file and a transcription.
    for (const sz of rec.sizes) {
      for (const key of ["ga_src", "ing_src"]) {
        const src = sz[key];
        if (!src) continue;
        const file = join(out, "img", src.split("/").pop());
        sz[key.replace("_src", "_file")] = file;
        if (downloaded.has(file)) continue;
        const img = await fetchViaPage(new URL(src, origin).href, 2);
        // A 403 here is usually the maker's own broken link, not a block: in
        // batch 042 the same URLs failed from inside the rendered page too.
        downloaded.set(file, img.status);
        if (img.body) writeFileSync(file, img.body);
        else sz[key.replace("_src", "_file")] = null;
      }
    }
  } catch (e) {
    rec.error = String(e).slice(0, 200);
  }
  manifest.push(rec);
  writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 1));
  console.error(rec.status, rec.sku, rec.name);
}
await browser.close();
