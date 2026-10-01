/* Browser tests for the Fraction Calculator (all languages). Run: php tools/build-static.php; php -S 127.0.0.1:8765 -t public & node tests/browser/fraction.browser.js */
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const SITE = 'https://easycalculatorsmart.com';
const LANGS = { en: '', hi: 'hi/', ur: 'ur/', ja: 'ja/', ru: 'ru/' };
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('FAIL:', msg); } };

async function open(browser, lang, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 900 }, colorScheme: opts.scheme || 'light' });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const page = await ctx.newPage();
  const errors = [], requests = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('dialog', (d) => { errors.push('dialog'); d.dismiss(); });
  page.on('request', (r) => requests.push(r.url()));
  await page.goto(`${BASE}/${LANGS[lang]}fraction-calculator/`);
  return { ctx, page, errors, requests };
}
const txt = (p, sel) => p.locator(sel).first().innerText();
const mainText = async (p) => (await txt(p, '[data-fr-main]')).replace(/\s+/g, ' ').trim();
async function setFrac(p, id, w, n, d) {
  const g = p.locator(`[data-fr-frac="${id}"]`);
  if (await g.locator('[data-part="w"]').count()) await g.locator('[data-part="w"]').fill(w);
  await g.locator('[data-part="n"]').fill(n);
  await g.locator('[data-part="d"]').fill(d);
}
async function tab(p, mode) { await p.click(`[data-fr-tab="${mode}"]`); }
async function calc(p, mode) { await p.locator(`[data-fr-panel="${mode}"] button[type="submit"]`).click(); }
async function noBadTokens(p, label) {
  const t = await p.locator('.fr-out').innerText();
  ok(!/NaN|undefined|Infinity|null|\{\w+\}|st_\w+|e_[a-z]/.test(t), `${label}: bad token in output → ${(t.match(/NaN|undefined|Infinity|null|\{\w+\}|st_\w+|e_[a-z]\S*/) || [])[0]}`);
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });

  // ---- every language: SEO head, layout at all widths/themes, no errors, no external requests
  for (const lang of Object.keys(LANGS)) {
    for (const w of [320, 375, 768, 1280]) for (const scheme of ['light', 'dark']) {
      const { ctx, page, errors, requests } = await open(browser, lang, { viewport: { width: w, height: 900 }, scheme });
      for (const mode of ['calc', 'multi', 'order', 'equiv']) { await tab(page, mode); await calc(page, mode); }
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      ok(over <= 0, `${lang} ${w}px ${scheme}: horizontal overflow ${over}px`);
      ok(errors.length === 0, `${lang} ${w}px ${scheme}: console errors ${errors}`);
      ok(requests.every((u) => u.startsWith(BASE)), `${lang} ${w}px: external request`);
      await ctx.close();
    }
    const { ctx, page } = await open(browser, lang);
    const head = await page.evaluate(() => ({
      lang: document.documentElement.lang, dir: document.documentElement.dir,
      canonical: document.querySelector('link[rel=canonical]').href,
      alts: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => [l.hreflang, l.href]),
      title: document.title, desc: document.querySelector('meta[name=description]').content,
      h1: document.querySelectorAll('h1').length, robots: document.querySelector('meta[name=robots]').content,
      ids: [...document.querySelectorAll('[id]')].map((e) => e.id),
      unlabeled: [...document.querySelectorAll('input:not([type=radio]), select')].filter((i) => !i.labels.length && !i.getAttribute('aria-label')).length,
      ld: JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent),
    }));
    const self = `${SITE}/${LANGS[lang]}fraction-calculator/`;
    ok(head.canonical === self, `${lang}: self canonical ${head.canonical}`);
    ok(head.alts.length === 6, `${lang}: 5 hreflang + x-default`);
    for (const [l, p] of Object.entries(LANGS)) ok(head.alts.some(([h, u]) => h === l && u === `${SITE}/${p}fraction-calculator/`), `${lang}: hreflang ${l}`);
    ok(head.alts.some(([h, u]) => h === 'x-default' && u === `${SITE}/fraction-calculator/`), `${lang}: x-default`);
    ok(head.lang === lang && head.dir === (lang === 'ur' ? 'rtl' : 'ltr'), `${lang}: html lang/dir ${head.lang}/${head.dir}`);
    ok(head.h1 === 1 && head.title.length > 10 && head.desc.length > 50, `${lang}: title/desc/h1`);
    ok(head.robots.startsWith('index'), `${lang}: indexable`);
    ok(new Set(head.ids).size === head.ids.length, `${lang}: duplicate ids ${head.ids.filter((x, i) => head.ids.indexOf(x) !== i)}`);
    ok(head.unlabeled === 0, `${lang}: ${head.unlabeled} unlabeled inputs`);
    const types = head.ld['@graph'].map((g) => g['@type']);
    ok(['WebPage', 'WebApplication', 'BreadcrumbList', 'FAQPage'].every((t) => types.includes(t)), `${lang}: schema types ${types}`);
    ok(!JSON.stringify(head.ld).match(/aggregateRating|review/i), `${lang}: no ratings in schema`);
    ok(head.ld['@graph'].find((g) => g['@type'] === 'FAQPage').mainEntity.length === 12, `${lang}: 12 FAQ in schema`);
    const visibleFaq = await page.locator('.fr-faq details').count();
    ok(visibleFaq === 12, `${lang}: FAQ visible on page`);
    // language switcher links resolve
    const links = await page.locator('.fr-langs a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    for (const href of links) { const r = await page.request.get(BASE + href); ok(r.status() === 200, `${lang}: switcher link ${href} → ${r.status()}`); }
    const rel = await page.locator('.fr-related a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    for (const href of rel) { const r = await page.request.get(BASE + href); ok(r.status() === 200, `${lang}: related link ${href} → ${r.status()}`); }
    // default result + localized steps render without template leftovers
    ok((await mainText(page)) === '5 6', `${lang}: default 1/2 + 1/3 = 5/6 (${await mainText(page)})`);
    ok((await page.locator('[data-fr-steps] > li').count()) === 5, `${lang}: 5 steps for 1/2 + 1/3`);
    await noBadTokens(page, lang);
    // every mode renders in every language
    for (const mode of ['calc', 'multi', 'simplify', 'mixed', 'decimal', 'percent', 'compare', 'order', 'of', 'what', 'equiv']) {
      await tab(page, mode); await calc(page, mode);
      ok(await page.locator('[data-fr-error]').isHidden(), `${lang} ${mode}: default input errors`);
      ok((await page.locator('[data-fr-steps] > li').count()) > 0, `${lang} ${mode}: steps shown`);
      await noBadTokens(page, `${lang} ${mode}`);
    }
    if (lang === 'ru') {
      await tab(page, 'decimal'); await page.check('input[name="fr-decimal-dir"][value="toFrac"]');
      ok(await page.inputValue('[data-fr-text="dec"]') === '0,75', 'ru: decimal field uses comma');
      await calc(page, 'decimal');
      ok((await mainText(page)) === '3 4', 'ru: 0,75 → 3/4');
      ok((await txt(page, '[data-fr-forms]')).includes('0,75'), 'ru: decimal shown with comma');
    }
    await ctx.close();
  }

  // ---- English: every mode against verified values
  const { ctx, page, errors } = await open(browser, 'en');
  const cases = [
    ['calc', async () => { await setFrac(page, 'calc-a', '', '3', '4'); await setFrac(page, 'calc-b', '', '1', '6'); await page.check('input[name="fr-calc-op"][value="-"]'); }, '7 12'],
    ['calc', async () => { await setFrac(page, 'calc-a', '', '2', '3'); await setFrac(page, 'calc-b', '', '3', '4'); await page.check('input[name="fr-calc-op"][value="*"]'); }, '1 2'],
    ['calc', async () => { await setFrac(page, 'calc-a', '', '2', '3'); await setFrac(page, 'calc-b', '', '4', '5'); await page.check('input[name="fr-calc-op"][value="/"]'); }, '5 6'],
    ['calc', async () => { await setFrac(page, 'calc-a', '1', '1', '2'); await setFrac(page, 'calc-b', '2', '2', '3'); await page.check('input[name="fr-calc-op"][value="+"]'); }, '25 6 = 4 1 6'],
    ['calc', async () => { await setFrac(page, 'calc-a', '', '1', '4'); await setFrac(page, 'calc-b', '', '3', '4'); await page.check('input[name="fr-calc-op"][value="-"]'); }, '− 1 2'],
    ['simplify', async () => { await setFrac(page, 'simplify-a', '', '24', '36'); }, '2 3'],
    ['mixed', async () => { await page.check('input[name="fr-mixed-dir"][value="toMixed"]'); await setFrac(page, 'mixed-a', '', '7', '3'); }, '7 3 = 2 1 3'],
    ['of', async () => { await setFrac(page, 'of-a', '', '3', '4'); await page.fill('[data-fr-text="ofx"]', '80'); }, '60'],
    ['what', async () => { await page.fill('[data-fr-text="wx"]', '15'); await page.fill('[data-fr-text="wy"]', '60'); }, '1 4'],
  ];
  for (const [mode, fill, expect] of cases) {
    await tab(page, mode); await fill(); await calc(page, mode);
    ok((await mainText(page)) === expect, `en ${mode}: expected "${expect}" got "${await mainText(page)}"`);
  }
  await tab(page, 'decimal'); await page.check('input[name="fr-decimal-dir"][value="toFrac"]'); await page.fill('[data-fr-text="dec"]', '0.125'); await calc(page, 'decimal');
  ok((await mainText(page)) === '1 8', 'en: 0.125 → 1/8');
  await page.fill('[data-fr-text="dec"]', '0.333...'); await calc(page, 'decimal');
  ok((await txt(page, '[data-fr-error]')).includes('brackets'), 'en: ellipsis decimal rejected with guidance');
  await page.fill('[data-fr-text="dec"]', '0.(3)'); await calc(page, 'decimal');
  ok((await mainText(page)) === '1 3', 'en: 0.(3) → 1/3');
  await tab(page, 'percent'); await setFrac(page, 'percent-a', '', '3', '4'); await calc(page, 'percent');
  ok((await txt(page, '[data-fr-forms]')).includes('75%'), 'en: 3/4 = 75%');
  await page.check('input[name="fr-percent-dir"][value="toFrac"]'); await page.fill('[data-fr-text="pct"]', '12.5'); await calc(page, 'percent');
  ok((await mainText(page)) === '1 8', 'en: 12.5% → 1/8');
  await tab(page, 'compare'); await setFrac(page, 'compare-a', '', '2', '3'); await setFrac(page, 'compare-b', '', '3', '5'); await calc(page, 'compare');
  ok((await mainText(page)) === '2 3 > 3 5', 'en: 2/3 > 3/5');
  ok((await txt(page, '[data-fr-extra]')).includes('larger'), 'en: compare verdict');
  await tab(page, 'order'); await calc(page, 'order');
  ok((await txt(page, '[data-fr-extra]')).replace(/\s+/g, ' ').includes('5 8 < 2 3 < 3 4'), 'en: order ascending 5/8 < 2/3 < 3/4');
  await tab(page, 'equiv'); await calc(page, 'equiv');
  ok((await page.locator('.fr-equiv li').count()) === 10, 'en: 10 equivalent fractions');
  await tab(page, 'multi'); await calc(page, 'multi');
  ok((await mainText(page)) === '25 24 = 1 1 24', 'en: 1/2 + 1/3 − 1/6 + 3/8 = 25/24');
  await page.click('[data-fr-add="multi"]');
  ok((await page.locator('[data-fr-rows="multi"] > li').count()) === 5, 'en: add row');
  await page.locator('[data-fr-rows="multi"] > li').last().locator('.fr-row-rm').click();
  ok((await page.locator('[data-fr-rows="multi"] > li').count()) === 4, 'en: remove row');

  // ---- errors
  await tab(page, 'calc');
  await setFrac(page, 'calc-a', '', '1', '0'); await calc(page, 'calc');
  ok((await txt(page, '[data-fr-error]')).includes('can’t be 0'), 'en: zero denominator blocked');
  await setFrac(page, 'calc-a', '', '1', '2'); await setFrac(page, 'calc-b', '', '0', '5'); await page.check('input[name="fr-calc-op"][value="/"]'); await calc(page, 'calc');
  ok((await txt(page, '[data-fr-error]')).includes('divide by zero'), 'en: division by zero blocked');
  await setFrac(page, 'calc-b', '', '1x', '5'); await calc(page, 'calc');
  ok(await page.locator('[data-fr-error]').isVisible(), 'en: invalid characters rejected');
  ok(await page.locator('[data-fr-frac="calc-b"] [data-part="n"]').getAttribute('aria-invalid') === 'true', 'en: invalid input marked aria-invalid');
  await setFrac(page, 'calc-b', '', '', ''); await setFrac(page, 'calc-a', '', '', ''); await calc(page, 'calc');
  ok((await txt(page, '[data-fr-error]')).includes('Enter a fraction'), 'en: empty input message');

  // ---- keyboard: Enter calculates, arrows move between tabs
  await setFrac(page, 'calc-a', '', '1', '2'); await setFrac(page, 'calc-b', '', '1', '4'); await page.check('input[name="fr-calc-op"][value="+"]');
  await page.locator('[data-fr-frac="calc-b"] [data-part="d"]').press('Enter');
  ok((await mainText(page)) === '3 4', 'en: Enter key calculates');
  await page.focus('[data-fr-tab="calc"]'); await page.keyboard.press('ArrowRight');
  ok(await page.evaluate(() => document.activeElement.getAttribute('data-fr-tab')) === 'multi', 'en: ArrowRight moves to next tab');
  ok(await page.locator('#fr-panel-multi').isVisible(), 'en: keyboard tab shows panel');

  // ---- examples, copy, digits
  await page.click('.fr-chip >> text=Simplify 12/18');
  ok((await mainText(page)) === '2 3', 'en: example Simplify 12/18');
  await page.click('.fr-chip >> text=0.75 to a fraction');
  ok((await mainText(page)) === '3 4', 'en: example 0.75');
  await page.click('.fr-chip >> text=3/4 of 80');
  ok((await mainText(page)) === '60', 'en: example 3/4 of 80');
  await page.click('[data-fr-copy]');
  ok((await page.evaluate(() => navigator.clipboard.readText())).includes('60'), 'en: copy result');
  await page.click('[data-fr-copy-steps]');
  ok((await page.evaluate(() => navigator.clipboard.readText())).startsWith('1. '), 'en: copy steps');
  await tab(page, 'decimal'); await page.check('input[name="fr-decimal-dir"][value="toDec"]'); await setFrac(page, 'decimal-a', '', '1', '3');
  await page.selectOption('[data-fr-digits]', '2'); await calc(page, 'decimal');
  ok((await txt(page, '[data-fr-forms]')).includes('0.33') && (await txt(page, '[data-fr-forms]')).includes('0.(3)'), 'en: 2 digits + repeating notation');
  await page.selectOption('[data-fr-digits]', '12');
  ok((await txt(page, '[data-fr-forms]')).includes('0.333333333333'), 'en: 12 digits on change');
  // big numbers stay exact
  await tab(page, 'calc'); await setFrac(page, 'calc-a', '', '123456789012345678901234567890', '7'); await setFrac(page, 'calc-b', '', '7', '123456789012345678901234567890');
  await page.check('input[name="fr-calc-op"][value="*"]'); await calc(page, 'calc');
  ok((await mainText(page)) === '1', 'en: huge integers exact');
  // visual
  await setFrac(page, 'calc-a', '', '1', '2'); await setFrac(page, 'calc-b', '', '1', '4'); await page.check('input[name="fr-calc-op"][value="+"]'); await calc(page, 'calc');
  ok((await page.locator('.fr-bar span.on').count()) === 3 && (await txt(page, '[data-fr-vcap]')).includes('3 of 4'), 'en: visual 3 of 4');
  ok(errors.length === 0, 'en: no console errors: ' + errors);
  await ctx.close();

  // ---- reduced motion + keyboard-only reachability on mobile
  const m = await open(browser, 'en', { viewport: { width: 375, height: 800 } });
  let reached = false;
  for (let i = 0; i < 40 && !reached; i++) { await m.page.keyboard.press('Tab'); reached = await m.page.evaluate(() => document.activeElement && document.activeElement.matches('[data-fr-panel="calc"] button[type="submit"]')); }
  ok(reached, '375px: Calculate reachable by keyboard');
  await m.ctx.close();

  // ---- sitemap
  const sm = await (await browser.newContext()).request.get(BASE + '/sitemap.xml');
  const xml = await sm.text();
  ok(sm.status() === 200 && Object.values(LANGS).every((p) => xml.includes(`<loc>${SITE}/${p}fraction-calculator/</loc>`)), 'sitemap lists all 5 fraction URLs');
  ok((xml.match(/hreflang="x-default"/g) || []).length === 5, 'sitemap has x-default alternates');

  await browser.close();
  console.log(`${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
