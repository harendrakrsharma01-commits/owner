/* Browser tests for the Anganwadi salary calculator. Run: php -S 127.0.0.1:8765 -t . & node tests/browser/anganwadi.browser.js */
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const SLUG = 'anganwadi-salary-calculator';
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('FAIL:', msg); } };

async function open(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 900 }, colorScheme: opts.scheme || 'light', locale: 'hi-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const page = await ctx.newPage();
  const errors = [], requests = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('request', (r) => requests.push(r.url()));
  await page.goto(`${BASE}/${SLUG}/`);
  return { ctx, page, errors, requests };
}
const text = (p, sel) => p.locator(sel).first().innerText();
async function type(p, sel, v) { await p.fill(sel, v); await p.dispatchEvent(sel, 'input'); }
async function clean(p, label) {
  const t = await p.locator('[data-awc-results]').innerText();
  ok(!/NaN|undefined|Infinity|null/.test(t), `${label}: bad token in results`);
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });

  // ---- layout: widths × themes, no overflow, no console errors, only same-origin requests
  for (const w of [320, 360, 390, 768, 1280]) for (const scheme of ['light', 'dark']) {
    const { ctx, page, errors, requests } = await open(browser, { viewport: { width: w, height: 800 }, scheme });
    await page.locator('[data-awc-arrear-wrap] summary').click();
    await page.waitForTimeout(50);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${w}px ${scheme}: horizontal overflow ${over}px`);
    ok(errors.length === 0, `${w}px ${scheme}: console errors ${errors}`);
    ok(requests.every((u) => u.startsWith(BASE)), `${w}px ${scheme}: external request ${requests.filter((u) => !u.startsWith(BASE))}`);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    ok(scheme === 'dark' ? bg === 'rgb(14, 18, 27)' : bg === 'rgb(246, 247, 251)', `${w}px ${scheme}: body bg ${bg}`);
    await ctx.close();
  }

  const { ctx, page, errors } = await open(browser);

  // ---- default: UP worker
  ok(await page.inputValue('#awc-monthly') === '12000', 'UP worker prefilled 12000');
  ok((await text(page, '[data-r="monthly"]')) === '₹12,000', 'UP monthly ₹12,000');
  ok((await text(page, '[data-r="sub"]')).includes('₹1,44,000'), 'UP yearly ₹1,44,000');
  ok((await text(page, '[data-r="cards"]')).includes('₹2,700'), 'UP centre share ₹2,700');
  ok((await text(page, '[data-r="cards"]')).includes('₹9,300'), 'UP state share ₹9,300');
  ok((await text(page, '[data-r="hike"]')).includes('+₹4,000') && (await text(page, '[data-r="hike"]')).includes('+50%'), 'UP hike +₹4,000 +50%');
  ok((await page.locator('[data-r="source"] a').count()) === 2, 'UP shows 2 source links');
  await clean(page, 'UP worker');

  // ---- incentive
  await page.check('[data-awc-pli]');
  ok((await text(page, '[data-r="monthly"]')) === '₹12,500', 'PLI adds ₹500');
  await page.uncheck('[data-awc-pli]');

  // ---- UP helper and arrear for Sept 2026
  await page.selectOption('#awc-post', 'helper');
  ok((await text(page, '[data-r="monthly"]')) === '₹6,000', 'UP helper ₹6,000');
  await page.locator('[data-awc-arrear-wrap] summary').click();
  ok(await page.inputValue('#awc-old') === '4000', 'old rate prefilled 4000');
  ok(await page.inputValue('#awc-from') === '2026-09', 'from month prefilled Sept 2026');
  ok((await text(page, '[data-r="arrearTotal"]')) === '₹2,000', 'UP helper arrear 1 month = ₹2,000');

  // ---- Bihar sevika, arrear Oct–Dec 2025
  await page.selectOption('#awc-state', 'bihar');
  await page.selectOption('#awc-post', 'worker');
  ok((await text(page, '[data-r="monthly"]')) === '₹9,000', 'Bihar sevika ₹9,000');
  await page.selectOption('#awc-to', '2025-12');
  ok((await text(page, '[data-r="arrearTotal"]')) === '₹6,000', 'Bihar arrear ₹6,000');
  ok((await text(page, '[data-r="arrear"]')).includes('3 महीने'), 'Bihar arrear 3 months');
  await clean(page, 'Bihar arrear');

  // ---- Haryana seniority checkbox
  await page.selectOption('#awc-state', 'haryana');
  ok(await page.locator('[data-awc-senior-wrap]').isVisible(), 'Haryana shows seniority option');
  ok((await text(page, '[data-r="monthly"]')) === '₹13,250', 'Haryana worker ₹13,250');
  await page.check('[data-awc-senior]');
  ok((await text(page, '[data-r="monthly"]')) === '₹14,750', 'Haryana senior ₹14,750');
  await page.selectOption('#awc-post', 'helper');
  ok(!(await page.locator('[data-awc-senior-wrap]').isVisible()), 'seniority hidden for helper');
  ok((await text(page, '[data-r="monthly"]')) === '₹7,900', 'Haryana helper ₹7,900');

  // ---- Rajasthan: no confirmed figure → asks for amount, then computes
  await page.selectOption('#awc-state', 'rajasthan');
  await page.selectOption('#awc-post', 'worker');
  ok(await page.inputValue('#awc-monthly') === '', 'Rajasthan not prefilled');
  ok(await page.locator('[data-awc-results]').isHidden(), 'Rajasthan results hidden until amount');
  ok(await page.locator('[data-awc-error]').isVisible(), 'Rajasthan shows info message');
  await type(page, '#awc-monthly', '8,250');
  ok((await text(page, '[data-r="monthly"]')) === '₹8,250', 'custom Rajasthan amount accepted with comma');
  ok(await page.locator('[data-r="hikeBox"]').isHidden(), 'no hike claim for a custom amount');
  ok((await page.locator('[data-r="source"] a').count()) === 0, 'no source claimed for a custom amount');

  // ---- other state with 90:10
  await page.selectOption('#awc-state', 'other');
  ok(await page.locator('[data-awc-sharing-wrap]').isVisible(), 'other shows sharing select');
  await type(page, '#awc-monthly', '10000');
  await page.selectOption('#awc-sharing', '90');
  ok((await text(page, '[data-r="cards"]')).includes('₹4,050'), 'other 90:10 centre share ₹4,050');

  // ---- invalid input
  await type(page, '#awc-monthly', '12abc');
  ok(await page.locator('[data-awc-error]').isVisible(), 'invalid amount shows error');
  ok(await page.getAttribute('#awc-monthly', 'aria-invalid') === 'true', 'invalid amount marked aria-invalid');
  ok(await page.locator('[data-awc-results]').isHidden(), 'invalid amount hides results');

  // ---- reset, copy, WhatsApp link
  await page.click('[data-awc-reset]');
  ok(await page.inputValue('#awc-state') === 'up' && await page.inputValue('#awc-monthly') === '12000', 'reset returns to UP worker');
  await page.click('[data-awc-copy]');
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  ok(clip.includes('₹12,000') && clip.includes('₹1,44,000'), 'copy text has monthly and yearly');
  const wa = await page.getAttribute('[data-awc-wa]', 'href');
  ok(wa.startsWith('https://wa.me/?text=') && decodeURIComponent(wa).includes('₹12,000'), 'WhatsApp link carries the result');

  // ---- page content
  ok((await page.locator('table').first().innerText()).includes('₹14,750'), 'state table rendered');
  ok((await page.locator('script[type="application/ld+json"]').count()) === 1, 'JSON-LD present');
  ok(await page.getAttribute('html', 'lang') === 'hi', 'lang=hi');
  ok(errors.length === 0, 'no console errors during interaction: ' + errors);
  await page.screenshot({ path: process.env.SHOT || '/tmp/awc.png', fullPage: false });
  await ctx.close();

  // ---- mobile screenshot
  const m = await open(browser, { viewport: { width: 390, height: 844 } });
  await m.page.screenshot({ path: (process.env.SHOT || '/tmp/awc.png').replace('.png', '-mobile.png'), fullPage: true });
  await m.ctx.close();

  await browser.close();
  console.log(`${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
