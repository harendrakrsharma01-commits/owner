/* Browser tests for the Garage Sale Pricing Calculator. Run: php -S 127.0.0.1:8765 -t . & node tests/browser/garage-sale.browser.js */
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const SLUG = 'garage-sale-pricing-calculator';
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('FAIL:', msg); } };

async function open(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 900 }, colorScheme: opts.scheme || 'light', locale: 'en-US', acceptDownloads: true });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const page = await ctx.newPage();
  const errors = [], requests = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('dialog', (d) => { errors.push('dialog:' + d.message()); d.dismiss(); });
  page.on('request', (r) => requests.push(r.url()));
  await page.goto(`${BASE}/${SLUG}/`);
  return { ctx, page, errors, requests };
}
const text = (p, sel) => p.locator(sel).first().innerText();
async function type(p, sel, v) { await p.fill(sel, v); await p.dispatchEvent(sel, 'input'); }

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });

  // ---- layout at every width/theme with a result and a list showing
  for (const w of [320, 375, 390, 768, 1280]) for (const scheme of ['light', 'dark']) {
    const { ctx, page, errors, requests } = await open(browser, { viewport: { width: w, height: 800 }, scheme });
    await page.click('text=Solid wood dresser $800');
    await page.click('[data-gs-add]');
    await page.waitForTimeout(50);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${w}px ${scheme}: horizontal overflow ${over}px`);
    ok(errors.length === 0, `${w}px ${scheme}: console errors ${errors}`);
    ok(requests.every((u) => u.startsWith(BASE)), `${w}px ${scheme}: external request`);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    ok(scheme === 'dark' ? bg === 'rgb(14, 18, 27)' : bg === 'rgb(246, 247, 251)', `${w}px ${scheme}: body bg ${bg}`);
    await ctx.close();
  }

  const { ctx, page, errors } = await open(browser);
  ok(await page.locator('[data-gs-results]').isHidden(), 'no result before input');
  ok((await text(page, '[data-gs-empty]')).includes('empty'), 'empty list message');

  // ---- basic price
  await type(page, '#gs-original', '50');
  ok((await text(page, '[data-r="sticker"]')) === '$5', 'jeans $50 → $5');
  ok((await text(page, '[data-r="floor"]')) === '$3.50', 'jeans floor $3.50');
  ok((await text(page, '[data-r="share"]')).includes('10%'), 'share 10%');
  ok((await text(page, '[data-r="typical"]')).includes('$2–$5'), 'typical range shown');

  // ---- options move the price
  await page.selectOption('#gs-condition', 'like-new');
  ok((await text(page, '[data-r="sticker"]')) === '$7', 'like new → $7 ($6.65 rounded to the dollar)');
  await page.check('input[data-gs-goal][value="fast"]');
  ok((await text(page, '[data-r="sticker"]')) === '$5', 'like new + fast → $5');
  await page.check('input[data-gs-goal][value="balanced"]');
  await page.selectOption('#gs-condition', 'good');

  // ---- warnings
  await page.selectOption('#gs-category', 'baby-gear');
  ok(await page.locator('[data-r="warn"]').isVisible() && (await text(page, '[data-r="warn"]')).includes('cpsc.gov'), 'baby gear recall warning');
  await page.selectOption('#gs-category', 'toys');
  ok(await page.locator('[data-r="warn"]').isHidden(), 'warning hidden for toys');

  // ---- examples
  await page.click('text=TV $500');
  ok((await text(page, '[data-r="sticker"]')) === '$90', 'TV example → $90');
  ok(await page.inputValue('#gs-name') === 'TV', 'example fills item name');
  await page.click('text=How was this calculated?');
  ok((await page.locator('[data-r="work"] li').count()) >= 7, 'working steps listed');

  // ---- invalid input
  await type(page, '#gs-original', 'forty');
  ok(await page.locator('[data-gs-error]').isVisible(), 'invalid price error');
  ok(await page.getAttribute('#gs-original', 'aria-invalid') === 'true', 'aria-invalid set');
  ok(await page.locator('[data-gs-results]').isHidden(), 'results hidden on invalid');

  // ---- price list
  await page.click('text=Jeans $50');
  await page.fill('#gs-qty', '3');
  await page.click('[data-gs-add]');
  await page.click('text=Drill $120');
  await page.click('[data-gs-add]');
  ok((await page.locator('[data-gs-rows] tr').count()) === 2, 'two rows in list');
  ok((await text(page, '[data-gs-count]')) === '4', 'count 4');
  const stickerTotal = await text(page, '[data-gs-total-sticker]');
  ok(stickerTotal === '$65', 'sticker total $65 (3×$5 + $50) got ' + stickerTotal);
  ok((await text(page, '[data-gs-summary]')).includes('4 items'), 'summary line');
  await page.fill('#gs-qty', '0');
  await page.click('[data-gs-add]');
  ok(await page.locator('[data-gs-error]').isVisible(), 'qty 0 rejected');
  await page.fill('#gs-qty', '1');

  // ---- persistence across reload
  await page.reload();
  ok((await page.locator('[data-gs-rows] tr').count()) === 2, 'list survives reload');

  // ---- copy, CSV
  await page.click('[data-gs-copy]');
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  ok(clip.includes('Jeans ×3 — $5') && clip.includes('Total:'), 'copy list text');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-gs-csv]')]);
  ok(dl.suggestedFilename() === 'garage-sale-price-list.csv', 'CSV filename');
  const csv = require('fs').readFileSync(await dl.path(), 'utf8');
  ok(csv.includes('"Jeans"') && csv.includes('"15.00"'), 'CSV content');

  // ---- print tags: one tag per unit
  await page.evaluate(() => { window.print = () => {}; });
  await page.click('[data-gs-print-tags]');
  ok((await page.locator('.gs-tags .gs-tag').count()) === 4, 'four price tags (3 jeans + 1 drill)');
  await page.emulateMedia({ media: 'print' });
  ok(await page.locator('.gs-tags').isVisible(), 'tag sheet visible in print');
  ok(await page.locator('.gs-calc').isHidden(), 'calculator hidden when printing tags');
  await page.emulateMedia({ media: 'screen' });
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  ok(await page.locator('.gs-tags').isHidden(), 'tag sheet hidden on screen');

  // ---- remove and two-step clear
  await page.click('[data-gs-rows] tr:first-child .gs-x');
  ok((await page.locator('[data-gs-rows] tr').count()) === 1, 'row removed');
  await page.click('[data-gs-clear]');
  ok((await page.locator('[data-gs-rows] tr').count()) === 1, 'first clear tap only arms');
  await page.click('[data-gs-clear]');
  ok((await page.locator('[data-gs-rows] tr').count()) === 0, 'second tap clears');
  ok(await page.locator('[data-gs-table-wrap]').isHidden(), 'table hidden when empty');

  // ---- page content
  ok((await page.locator('.gs-article table tbody tr').count()) === 17, 'category table has 17 rows');
  ok((await page.locator('script[type="application/ld+json"]').count()) === 1, 'JSON-LD present');
  ok(errors.length === 0, 'no console errors: ' + errors);
  await ctx.close();

  // ---- storage blocked: page still works
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  const bp = await blocked.newPage();
  const berr = [];
  bp.on('pageerror', (e) => berr.push(String(e)));
  await bp.goto(`${BASE}/${SLUG}/`);
  await bp.fill('#gs-original', '50'); await bp.dispatchEvent('#gs-original', 'input');
  await bp.click('[data-gs-add]');
  ok((await bp.locator('[data-gs-rows] tr').count()) === 1 && berr.length === 0, 'works with storage blocked ' + berr);
  await blocked.close();

  await browser.close();
  console.log(`${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
