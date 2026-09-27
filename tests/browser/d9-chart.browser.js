/* Browser tests for the D9 / Navamsa calculator.
 * Run: php -S 127.0.0.1:8765 -t . &  node tests/browser/d9-chart.browser.js
 * (PLAYWRIGHT_PATH=/path/to/playwright CHROME=/path/to/chromium if not on the default paths) */
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const URL = `${BASE}/d9-chart-calculator/`;
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('FAIL:', msg); } };

async function open(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 900 }, colorScheme: opts.scheme || 'light', timezoneId: 'America/New_York' });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const page = await ctx.newPage();
  const errors = [], requests = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('dialog', (d) => { errors.push('dialog:' + d.message()); d.dismiss(); });
  page.on('request', (r) => requests.push(r.url()));
  await page.goto(URL);
  return { ctx, page, errors, requests };
}
async function fill(page, { date, time, place, acc }) {
  if (date !== undefined) await page.fill('#d9-date', date);
  if (time !== undefined) await page.fill('#d9-time', time);
  if (place !== undefined) await page.fill('#d9-place', place);
  if (acc) await page.check(`input[name="d9-acc"][value="${acc}"]`);
}
const submit = (page) => page.click('button[type="submit"]');
const errText = (page) => page.locator('[data-d9-error]').innerText();
async function clean(page, label) {
  const t = await page.locator('[data-d9-results]').innerText();
  ok(!/NaN|undefined|Infinity|null/.test(t), `${label}: bad token ${t.match(/NaN|undefined|Infinity|null/)}`);
}
async function overlaps(page) {
  return page.evaluate(() => {
    const boxes = [...document.querySelectorAll('.d9-chart text')].map((t) => t.getBBox());
    let n = 0;
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.x < b.x + b.width - 1 && b.x < a.x + a.width - 1 && a.y < b.y + b.height - 1 && b.y < a.y + a.height - 1) n++;
    }
    return n;
  });
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });

  /* ---- SEO / structure ---- */
  {
    const { ctx, page, errors, requests } = await open(browser);
    ok(await page.locator('h1').count() === 1, 'one H1');
    ok((await page.title()).startsWith('D9 Chart Calculator (Navamsa)'), 'title');
    ok(await page.getAttribute('link[rel=canonical]', 'href') === 'https://easycalculatorsmart.com/d9-chart-calculator/', 'canonical');
    ok(/index, follow/.test(await page.getAttribute('meta[name=robots]', 'content')), 'robots');
    const meta = await page.getAttribute('meta[name=description]', 'content');
    ok(meta.length >= 120 && meta.length <= 200, `meta length ${meta.length}`);
    const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    const types = ld['@graph'].map((g) => g['@type']);
    ok(['WebPage', 'SoftwareApplication', 'BreadcrumbList', 'FAQPage'].every((t) => types.includes(t)), 'schema types');
    ok(!JSON.stringify(ld).includes('aggregateRating') && !JSON.stringify(ld).includes('review'), 'no fake ratings');
    const faqSchema = ld['@graph'].find((g) => g['@type'] === 'FAQPage').mainEntity.length;
    ok(faqSchema === await page.locator('.d9-faq details').count() && faqSchema >= 19, `FAQ schema = visible (${faqSchema})`);
    ok(await page.locator('[data-d9-results]').isHidden(), 'no prefilled chart on load');
    const hs = await page.$$eval('h2, h3', (n) => n.length); ok(hs > 20, 'semantic headings');
    await page.waitForTimeout(200);
    ok(errors.length === 0, 'no console errors on load: ' + errors);
    ok(requests.every((u) => u.startsWith(BASE)), 'no third-party requests: ' + requests.filter((u) => !u.startsWith(BASE)));
    await ctx.close();
  }

  /* ---- layout × widths × themes × chart styles ---- */
  for (const w of [320, 375, 390, 768, 1280]) for (const scheme of ['light', 'dark']) {
    const { ctx, page, errors } = await open(browser, { viewport: { width: w, height: 850 }, scheme });
    await page.click('[data-d9-example]');
    await page.waitForSelector('.d9-chart');
    for (const style of ['north', 'south']) for (const which of ['d9', 'd1']) {
      await page.click(`[data-d9-style="${style}"]`); await page.click(`[data-d9-which="${which}"]`);
      ok(await page.locator('.d9-chart text.d9-pl').count() >= 10, `${w} ${scheme} ${style} ${which}: planet labels`);
      const ov = await overlaps(page);
      ok(ov === 0, `${w} ${scheme} ${style} ${which}: ${ov} overlapping labels`);
    }
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${w}px ${scheme}: horizontal overflow ${over}px`);
    const svgW = await page.locator('.d9-chart').evaluate((s) => s.getBoundingClientRect().width);
    ok(svgW > 250 && svgW <= Math.min(w, 460), `${w}: chart width ${svgW}`);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    ok(scheme === 'dark' ? bg === 'rgb(14, 18, 27)' : bg === 'rgb(246, 247, 251)', `${scheme} body bg ${bg}`);
    const fillC = await page.locator('.d9-chart .d9-pl').first().evaluate((t) => getComputedStyle(t).fill);
    ok(scheme === 'dark' ? fillC === 'rgb(232, 236, 244)' : fillC === 'rgb(23, 32, 51)', `${scheme} chart text colour ${fillC}`);
    await clean(page, `${w} ${scheme}`);
    ok(errors.length === 0, `${w} ${scheme}: console errors ${errors}`);
    await page.click('[data-d9-style="north"]'); await page.click('[data-d9-which="d9"]');
    if (w === 390 || w === 1280) await page.screenshot({ path: `${process.env.SHOTS || '/tmp'}/d9-${w}-${scheme}.png`, fullPage: false, clip: undefined });
    await ctx.close();
  }

  /* ---- example chart = engine output, table/diagram agree ---- */
  {
    const { ctx, page, errors } = await open(browser);
    await page.click('[data-d9-example]');
    ok(await page.locator('[data-d9-example-tag]').isVisible(), 'example chart labelled');
    const eng = await page.evaluate(() => {
      const u = D9Navamsa.localToUtc({ y: 2000, m: 1, d: 1, h: 12, mi: 0, s: 0 }, 'Asia/Kolkata').utcMs;
      return D9Navamsa.calculateChart({ utcMs: u, lat: 28.61, lon: 77.21 });
    });
    ok((await page.locator('[data-r="d9lagna"]').innerText()) === eng.d9Lagna.name, 'D9 lagna matches engine');
    const rows = await page.$$eval('[data-r="table"] tbody tr', (trs) => trs.map((tr) => [...tr.children].map((c) => c.textContent)));
    ok(rows.length === 10, 'table has Ascendant + 9 grahas');
    [eng.lagna, ...eng.planets].forEach((p, i) => {
      ok(rows[i][1] === p.d1SignName && rows[i][5].startsWith(p.d9SignName) && rows[i][7] === String(p.d9House), `row ${p.key} matches engine`);
    });
    const prov = await page.locator('[data-r="prov"]').innerText();
    ok(/2000-01-01 06:30:00 UTC/.test(prov) && /Asia\/Kolkata/.test(prov) && /UTC\+05:30/.test(prov) && /d9-1\.0\.0/.test(prov) && /Lahiri/.test(prov), 'provenance');
    ok(/28\.6100° N/.test(prov) && /77\.2100° E/.test(prov), 'provenance coordinates');
    // screen-reader text alternative lists all 12 houses
    const sr = await page.locator('[data-r="chartText"]').textContent();
    ok((sr.match(/house/g) || []).length === 12, 'chart text alternative');
    ok(await page.locator('.d9-chart[role="img"][aria-label]').count() === 1, 'svg labelled');
    // filter
    const all = await page.locator('[data-r="cmp"] tbody tr').count();
    await page.click('[data-d9-filter="varg"]');
    const vg = await page.locator('[data-r="cmp"] tbody tr').count();
    ok(all === 10 && vg === eng.vargottama.length, `vargottama filter ${vg} vs ${eng.vargottama.length}`);
    ok(/tradition|Traditional/.test(await page.locator('[data-r="interp"]').innerText()), 'interpretation framed as tradition');
    ok(!/you will|will definitely|guarantee/i.test(await page.locator('[data-r="interp"]').innerText()), 'no deterministic predictions');
    // copy — default excludes birth data
    await page.click('[data-d9-copy="summary"]');
    let clip = await page.evaluate(() => navigator.clipboard.readText());
    ok(/D9 Ascendant/.test(clip) && !/2000-01-01/.test(clip) && !/12:00/.test(clip) && !/New Delhi/.test(clip), 'summary copy excludes birth data');
    await page.check('[data-d9-share-birth]'); await page.click('[data-d9-copy="table"]');
    clip = await page.evaluate(() => navigator.clipboard.readText());
    ok(/Planet\tD1 sign/.test(clip) && /2000-01-01 12:00/.test(clip), 'table copy with opt-in birth data');
    ok(page.url() === URL, 'URL never carries birth data');
    // print
    await page.emulateMedia({ media: 'print' });
    ok(await page.locator('.d9-form').isHidden() && await page.locator('.d9-chart').isVisible(), 'print view');
    await page.emulateMedia({ media: 'screen' });
    // reset
    await page.click('[data-d9-reset]');
    ok(await page.locator('[data-d9-results]').isHidden() && (await page.inputValue('#d9-date')) === '', 'reset');
    ok(errors.length === 0, 'example: console errors ' + errors);
    await ctx.close();
  }

  /* ---- validation & edge cases ---- */
  {
    const { ctx, page, errors } = await open(browser);
    await submit(page);
    ok(/valid date/.test(await errText(page)), 'missing DOB');
    ok(await page.getAttribute('#d9-date', 'aria-invalid') === 'true', 'aria-invalid on DOB');
    await fill(page, { date: '1990-06-15' }); await submit(page);
    ok(/HH:MM/.test(await errText(page)), 'missing time');
    await fill(page, { time: '10:30' }); await submit(page);
    ok(/birthplace/i.test(await errText(page)), 'missing place');
    await fill(page, { place: 'Atlantis' }); await submit(page);
    ok(/birthplace/i.test(await errText(page)), 'unknown place');
    await fill(page, { place: 'Hyderabad' }); await submit(page);
    const amb = await errText(page);
    ok(/Several places/.test(amb) && /Telangana/.test(amb) && /Sindh/.test(amb), 'ambiguous place lists regions');
    await fill(page, { place: 'Hyderabad, Telangana, India' }); await submit(page);
    ok(await page.locator('[data-d9-results]').isVisible() && (await errText(page)) === '', 'resolved place calculates');
    await clean(page, 'hyderabad');
    await fill(page, { date: '2099-01-01' }); await submit(page);
    ok(/future/.test(await errText(page)), 'future DOB');
    await fill(page, { date: '1750-01-01' }); await submit(page);
    ok(/1800/.test(await errText(page)), 'unsupported year');
    // DST gap and overlap (New York)
    await fill(page, { date: '2024-03-10', time: '02:30', place: 'New York, New York, United States' }); await submit(page);
    ok(/did not exist/.test(await errText(page)), 'DST gap rejected');
    await fill(page, { date: '2023-11-05', time: '01:30' }); await submit(page);
    ok(await page.locator('[data-d9-ambig]').isVisible() && await page.locator('[data-d9-ambig-btns] button').count() === 2, 'DST overlap asks');
    const p1 = await page.locator('[data-r="prov"]').innerText();
    await page.locator('[data-d9-ambig-btns] button').nth(1).click();
    const p2 = await page.locator('[data-r="prov"]').innerText();
    ok(/05:30:00 UTC/.test(p1) && /06:30:00 UTC/.test(p2), 'overlap choice changes UTC');
    // leap day, midnight, 23:59
    for (const [d, t] of [['2024-02-29', '00:00'], ['2000-02-29', '23:59'], ['1947-08-15', '00:00'], ['1900-01-01', '12:00']]) {
      await fill(page, { date: d, time: t, place: 'Chennai, Tamil Nadu, India' }); await submit(page);
      ok(await page.locator('[data-d9-results]').isVisible() && (await errText(page)) === '', `calc ${d} ${t}`);
      await clean(page, d);
    }
    // approximate → caution; ±5 min sensitivity note always present
    await page.check('input[name="d9-acc"][value="approx"]'); await submit(page);
    ok(/approximate/i.test(await page.locator('[data-r="accWarn"]').innerText()), 'approximate caution');
    // unknown → no D9 lagna, whole-day table
    await page.check('input[name="d9-acc"][value="unknown"]'); await page.fill('#d9-time', ''); await submit(page);
    ok(await page.locator('[data-d9-results]').isHidden() && await page.locator('[data-d9-partial]').isVisible(), 'unknown time → partial only');
    ok(await page.locator('[data-r="partial"] tbody tr').count() === 9, 'partial rows');
    ok(!/Ascendant/.test(await page.locator('[data-r="partial"]').innerText()), 'no ascendant without time');
    // manual coordinates: polar, fixed offset
    await page.check('input[name="d9-acc"][value="exact"]'); await page.fill('#d9-time', '08:00');
    await page.click('.d9-adv summary'); await page.check('[data-d9-manual]');
    await page.fill('#d9-lat', '70'); await page.fill('#d9-lon', '20'); await submit(page);
    ok(/66/.test(await errText(page)), 'polar latitude rejected');
    await page.fill('#d9-lat', '22.5'); await page.fill('#d9-lon', '88.36');
    await page.selectOption('#d9-tz', 'UTC+05:30'); await submit(page);
    const fx = await page.locator('[data-r="prov"]').innerText();
    ok(/02:30:00 UTC/.test(fx) && /UTC\+05:30/.test(fx), 'fixed +05:30 conversion');
    ok(errors.length === 0, 'validation: console errors ' + errors);
    await ctx.close();
  }

  /* ---- crowded chart (Feb 1962 multi-planet conjunction): no label overlap in any view ---- */
  for (const w of [320, 1280]) {
    const { ctx, page, errors } = await open(browser, { viewport: { width: w, height: 900 } });
    await fill(page, { date: '1962-02-05', time: '06:00', place: 'New Delhi, Delhi, India' }); await submit(page);
    await page.waitForSelector('.d9-chart');
    const crowd = await page.evaluate(() => Math.max(...[...document.querySelectorAll('[data-r="table"] tbody tr')].slice(1).map((r) => r.children[1].textContent).reduce((m, s) => (m[s] = (m[s] || 0) + 1, m), {}) && Object.values([...document.querySelectorAll('[data-r="table"] tbody tr')].slice(1).map((r) => r.children[1].textContent).reduce((m, s) => (m[s] = (m[s] || 0) + 1, m), {}))));
    ok(crowd >= 5, `stellium present (${crowd} in one D1 sign)`);
    for (const style of ['north', 'south']) for (const which of ['d1', 'd9']) {
      await page.click(`[data-d9-style="${style}"]`); await page.click(`[data-d9-which="${which}"]`);
      const ov = await overlaps(page);
      ok(ov === 0, `crowded ${w} ${style} ${which}: ${ov} overlaps`);
      const outside = await page.evaluate(() => [...document.querySelectorAll('.d9-chart text')].filter((t) => { const b = t.getBBox(); return b.x < 0 || b.y < 0 || b.x + b.width > 400 || b.y + b.height > 400; }).length);
      ok(outside === 0, `crowded ${w} ${style} ${which}: ${outside} labels outside chart`);
    }
    ok(errors.length === 0, 'crowded: errors ' + errors);
    await ctx.close();
  }

  /* ---- XSS-safe name, keyboard ---- */
  {
    const { ctx, page, errors } = await open(browser);
    await page.fill('#d9-name', '<img src=x onerror=alert(1)>');
    await fill(page, { date: '1995-05-05', time: '05:05', place: 'Mumbai' });
    await page.focus('#d9-place'); await page.keyboard.press('Enter');
    await page.waitForSelector('[data-d9-results]:not([hidden])');
    ok((await page.locator('[data-r="who"]').textContent()).includes('<img'), 'name rendered as text');
    ok(await page.locator('[data-d9-results] img').count() === 0, 'no injected element');
    // keyboard reachability of toggles
    await page.focus('[data-d9-style="south"]'); await page.keyboard.press('Enter');
    ok(await page.getAttribute('[data-d9-style="south"]', 'aria-pressed') === 'true', 'toggle by keyboard');
    const focusable = await page.$$eval('.d9-table-wrap[tabindex="0"]', (n) => n.length);
    ok(focusable >= 2, 'scrollable tables focusable');
    await page.waitForTimeout(100);
    ok(errors.length === 0, 'xss: no dialogs/errors ' + errors);
    await ctx.close();
  }

  await browser.close();
  console.log(`${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
