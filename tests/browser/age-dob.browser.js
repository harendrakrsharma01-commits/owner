/* Browser tests for the Age / DOB family. Run: php -S 127.0.0.1:8765 -t . & node tests/browser/age-dob.browser.js */
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const PAGES = ['date-of-birth-calculator', 'birthday-countdown-calculator', 'day-of-birth-calculator', 'age-milestone-calculator'];
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('FAIL:', msg); } };

async function open(browser, slug, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 900 }, colorScheme: opts.scheme || 'light', locale: opts.locale || 'en-US', timezoneId: 'America/New_York' });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const page = await ctx.newPage();
  const errors = [], requests = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('dialog', (d) => { errors.push('dialog:' + d.message()); d.dismiss(); });
  page.on('request', (r) => requests.push(r.url()));
  await page.goto(`${BASE}/${slug}/`);
  return { ctx, page, errors, requests };
}
const text = (p, sel) => p.locator(sel).first().innerText();
async function clean(p, label) {
  const t = await p.locator('[data-adob-results]').innerText();
  ok(!/NaN|undefined|Infinity|null/.test(t), `${label}: bad token in results → ${t.match(/NaN|undefined|Infinity|null/)}`);
}
async function type(p, sel, v) { await p.fill(sel, v); await p.dispatchEvent(sel, 'input'); }

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });

  // ---- layout: every page × widths × themes, no overflow, no console errors
  for (const slug of PAGES) for (const w of [320, 375, 390, 768, 1280]) for (const scheme of ['light', 'dark']) {
    const { ctx, page, errors } = await open(browser, slug, { viewport: { width: w, height: 800 }, scheme });
    await type(page, '#adob-dob', '09/24/2000');
    if (await page.locator('#adob-target').count()) await type(page, '#adob-target', '09/26/2026');
    await page.waitForTimeout(50);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${slug} ${w}px ${scheme}: horizontal overflow ${over}px`);
    ok(errors.length === 0, `${slug} ${w}px ${scheme}: console errors ${errors}`);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    ok(scheme === 'dark' ? bg === 'rgb(14, 18, 27)' : bg === 'rgb(246, 247, 251)', `${slug} ${scheme}: body bg ${bg}`);
    await clean(page, `${slug} ${w} ${scheme}`);
    if (w === 390 || w === 1280) await page.screenshot({ path: `${process.env.SHOTS || '/tmp'}/${slug}-${w}-${scheme}.png`, fullPage: false });
    await ctx.close();
  }

  // ---- main calculator: exact values & country formats
  {
    const { ctx, page, errors, requests } = await open(browser, 'date-of-birth-calculator');
    ok(await page.inputValue('#adob-format') === 'MDY', 'US default MDY');
    await type(page, '#adob-dob', '09/24/2000');
    await type(page, '#adob-target', '09/26/2026');
    ok((await text(page, '[data-r="age"]')) === '26 years, 0 months, 2 days', 'age 26/0/2');
    const totals = await text(page, '[data-r="totals"]');
    for (const v of ['312', '1,356', '9,498', '227,952', '13,677,120', '820,627,200']) ok(totals.includes(v), 'totals include ' + v);
    ok((await text(page, '[data-r="bday"]')).includes('Friday, September 24, 2027'), 'next birthday US long form');
    ok((await text(page, '[data-r="born"]')).includes('Sunday'), 'born Sunday');
    ok((await text(page, '[data-r="totalsNote"]')).includes('midnight to midnight'), 'date-only note');
    const iso = await page.inputValue('[data-adob-date="dob"] [data-adob-picker]');
    for (const [c, f, shown] of [['uk', 'DMY', '24/09/2000'], ['in', 'DMY', '24/09/2000'], ['ca', 'YMD', '2000-09-24'], ['au', 'DMY', '24/09/2000'], ['us', 'MDY', '09/24/2000']]) {
      await page.selectOption('#adob-country', c);
      ok(await page.inputValue('#adob-format') === f, `${c} format ${f}`);
      ok(await page.inputValue('#adob-dob') === shown, `${c} shows ${shown}`);
      ok(await page.inputValue('[data-adob-date="dob"] [data-adob-picker]') === iso, `${c} internal ISO unchanged`);
      ok((await text(page, '[data-r="age"]')) === '26 years, 0 months, 2 days', `${c} same age`);
    }
    await page.selectOption('#adob-country', 'in');
    ok((await text(page, '[data-adob-asof-label]')) === 'Age as on', 'India label');
    await type(page, '#adob-target', '26/09/2126');
    ok(/\d,\d\d,\d\d,\d{3}/.test(await text(page, '[data-r="totals"]')), 'India lakh grouping');
    // 04/05/2000 ambiguity
    await page.selectOption('#adob-country', 'uk'); await type(page, '#adob-dob', '04/05/2000');
    ok((await text(page, '#adob-dob-echo')).includes('4 May 2000'), 'UK 04/05/2000 = 4 May');
    await page.selectOption('#adob-country', 'us'); await type(page, '#adob-dob', '04/05/2000');
    ok((await text(page, '#adob-dob-echo')).includes('April 5, 2000'), 'US 04/05/2000 = April 5');
    await type(page, '#adob-dob', '04/05/00');
    ok((await text(page, '#adob-dob-echo')).includes('Not a valid date'), '2-digit year rejected');
    ok(!(await page.locator('[data-adob-error]').isHidden()), 'invalid → error shown');
    // before birth
    await type(page, '#adob-dob', '09/24/2000'); await type(page, '#adob-target', '09/23/2000');
    ok((await text(page, '[data-adob-error]')).includes('before the date of birth'), 'before-birth message');
    ok(await page.locator('[data-adob-results]').isHidden(), 'results hidden when before birth');
    // leap day and rule
    await type(page, '#adob-dob', '02/29/2004'); await type(page, '#adob-target', '02/28/2025');
    ok((await text(page, '[data-r="age"]')) === '21 years, 0 months, 0 days', 'leap clamp');
    await page.selectOption('#adob-rule', 'rollover');
    ok((await text(page, '[data-r="age"]')) === '20 years, 11 months, 30 days', 'leap rollover');
    ok((await text(page, '[data-r="bday"]')).includes('March 1, 2025'), 'rollover next birthday Mar 1');
    await page.selectOption('#adob-rule', 'clamp');
    await type(page, '#adob-target', '06/01/2026');
    ok((await text(page, '[data-r="bday"]')).includes('Leap-day note'), 'leap-day note shown');
    ok(await page.inputValue('#adob-dob') === '02/29/2004', 'DOB not altered');
    // time mode
    await type(page, '#adob-dob', '09/24/2000'); await type(page, '#adob-target', '09/26/2026');
    await page.click('[data-adob-time-wrap] summary');
    await page.check('[data-adob-time-on]');
    await page.selectOption('#adob-bzone', 'Asia/Kolkata'); await page.selectOption('#adob-tzone', 'Asia/Kolkata');
    await page.fill('#adob-btime', '14:30:00'); await page.fill('#adob-ttime', '09:00:00'); await page.dispatchEvent('#adob-ttime', 'input');
    ok((await text(page, '[data-r="timeAge"]')).includes('26 years, 0 months, 1 day, 18 hours, 30 minutes, 0 seconds'), 'time age');
    ok((await text(page, '[data-r="totals"]')).includes('227,946'), 'exact hours');
    await page.fill('#adob-ttime', '00:00:00'); await type(page, '#adob-target', '09/24/2000'); await page.dispatchEvent('#adob-ttime', 'input');
    ok((await text(page, '[data-r="timeAge"]')).includes('before the birth moment'), 'time before birth');
    await clean(page, 'time before birth');
    await page.uncheck('[data-adob-time-on]');
    // presets
    await type(page, '#adob-target', '09/26/2026');
    for (const id of ['today', 'yesterday', 'tomorrow', 'bday-year', 'next-bday', 'ex-1990', 'ex-2000', 'past', 'future', 'leap', 'newborn']) {
      await page.click(`[data-adob-preset="${id}"]`);
      ok(!(await page.locator('[data-adob-results]').isHidden()), `preset ${id} shows results`);
      await clean(page, 'preset ' + id);
    }
    await page.click('[data-adob-preset="ex-1990"]'); await type(page, '#adob-target', '09/26/2026');
    ok((await text(page, '[data-r="age"]')) === '36 years, 8 months, 11 days', 'ex-1990 value');
    await page.click('[data-adob-preset="leap"]'); ok(await page.inputValue('#adob-dob') === '02/29/2004', 'leap preset dob');
    await page.click('[data-adob-preset="newborn"]');
    ok((await text(page, '[data-r="age"]')) === '0 years, 0 months, 10 days', 'newborn 10 days');
    ok((await text(page, '[data-r="totals"]')).includes('+ 3 days'), 'newborn 1 week + 3 days');
    await page.click('[data-adob-preset="past"]');
    ok((await text(page, '[data-adob-error]')).includes('before the date of birth'), 'past target before newborn DOB → clear error');
    await page.click('[data-adob-preset="next-bday"]');
    ok((await text(page, '[data-r="age"]')).includes('0 months, 0 days'), 'next-bday → whole years');
    // copy without / with DOB
    await page.click('[data-adob-preset="ex-2000"]');
    await page.click('[data-adob-copy]');
    let clip = await page.evaluate(() => navigator.clipboard.readText());
    ok(clip.includes('years') && !clip.includes('2000') && !clip.includes('born'), 'copy excludes DOB by default: ' + clip);
    await page.check('[data-adob-share-dob]'); await page.click('[data-adob-copy]');
    clip = await page.evaluate(() => navigator.clipboard.readText());
    ok(clip.includes('September 24, 2000'), 'copy includes DOB when opted in');
    ok(!page.url().includes('?') && !page.url().includes('#20'), 'URL has no DOB');
    // storage opt-in
    ok(await page.evaluate(() => localStorage.getItem('ecs-agedob-v1')) === null, 'no storage by default');
    await page.check('[data-adob-remember]');
    ok((await page.evaluate(() => localStorage.getItem('ecs-agedob-v1'))).includes('2000-09-24'), 'stored when opted in');
    await page.reload();
    ok(await page.inputValue('#adob-dob') === '09/24/2000', 'restored after reload');
    await page.uncheck('[data-adob-remember]');
    ok(await page.evaluate(() => localStorage.getItem('ecs-agedob-v1')) === null, 'cleared when unticked');
    // print button (stub print)
    await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
    await page.click('[data-adob-print]'); ok(await page.evaluate(() => window.__printed) === 1, 'print called');
    // share fallback (no navigator.share in headless) copies
    await page.click('[data-adob-share]'); ok(true, 'share clicked');
    // XSS attempt
    await type(page, '#adob-dob', '<img src=x onerror=alert(1)>');
    ok(await page.locator('img[src="x"]').count() === 0, 'no injected element');
    // reset + keyboard
    await page.click('[data-adob-reset]');
    ok(await page.inputValue('#adob-dob') === '' && await page.locator('[data-adob-results]').isHidden(), 'reset clears');
    ok(await page.evaluate(() => document.activeElement.id) === 'adob-dob', 'focus to DOB after reset');
    await page.keyboard.type('01/15/1990'); await page.keyboard.press('Tab');
    ok(!(await page.locator('[data-adob-results]').isHidden()), 'keyboard entry works');
    // theme toggle
    await page.click('[data-adob-theme]');
    ok(await page.evaluate(() => document.documentElement.getAttribute('data-theme')) === 'dark', 'theme toggle');
    // no third-party / data-bearing requests
    const bad = requests.filter((u) => !u.startsWith(BASE) || /2000|1990|dob=/i.test(u));
    ok(bad.length === 0, 'no external or DOB-bearing requests: ' + bad);
    ok(errors.length === 0, 'main: no console errors ' + errors);
    // labels
    const unlabeled = await page.evaluate(() => [...document.querySelectorAll('.adob-calc input, .adob-calc select')].filter((i) => !(i.labels && i.labels.length) && !i.getAttribute('aria-label')).map((i) => i.outerHTML));
    ok(unlabeled.length === 0, 'all controls labelled ' + unlabeled);
    const h1 = await page.locator('h1').count(); ok(h1 === 1, 'single h1');
    const ld = await page.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'].map((g) => g['@type']));
    ok(['WebPage', 'SoftwareApplication', 'BreadcrumbList', 'FAQPage'].every((t) => ld.includes(t)), 'schema types ' + ld);
    await ctx.close();
  }

  // ---- birthday page
  {
    const { ctx, page, errors } = await open(browser, 'birthday-countdown-calculator', { locale: 'en-GB' });
    ok(await page.inputValue('#adob-country') === 'uk', 'en-GB browser → UK');
    await type(page, '#adob-dob', '24/09/2000'); await type(page, '#adob-target', '26/09/2026');
    const b = await text(page, '[data-r="bday"]');
    ok(b.includes('Friday, 24 September 2027') && b.includes('363') && b.includes('51 weeks + 6 days') && b.includes('27'), 'countdown values ' + b);
    const tbl = await text(page, '[data-r="bdayTable"]');
    ok(tbl.includes('Previous birthday') && tbl.includes('2 days ago') && tbl.includes('in 363 days'), 'bday table');
    await type(page, '#adob-target', '24/09/2026');
    ok((await text(page, '[data-r="bday"]')).includes('Today'), 'birthday today');
    ok((await page.locator('[data-r="ringL"]').textContent()) === 'today!', 'ring today');
    await type(page, '#adob-target', '23/09/2026');
    ok((await page.locator('[data-r="ringL"]').textContent()) === 'day to go', 'tomorrow singular');
    ok(errors.length === 0, 'birthday: no errors ' + errors);
    await ctx.close();
  }

  // ---- weekday page
  {
    const { ctx, page, errors } = await open(browser, 'day-of-birth-calculator', { locale: 'en-IN' });
    ok(await page.inputValue('#adob-country') === 'in', 'en-IN → India');
    await type(page, '#adob-dob', '31/12/2024');
    const f = await text(page, '[data-r="born"]');
    ok(f.includes('Tuesday') && f.includes('366 of 366') && f.includes('Week 1 of 2025'), 'weekday facts ' + f);
    ok(await page.locator('.adob-week li.is-on').innerText() === 'Tue', 'weekday strip');
    ok((await page.locator('[data-r="weekdayTable"] tbody tr').count()) === 10, '10 future birthdays');
    for (const id of ['ex-1990', 'ex-2000', 'leap', 'newborn']) { await page.click(`[data-adob-preset="${id}"]`); await clean(page, 'weekday preset ' + id); }
    ok(errors.length === 0, 'weekday: no errors ' + errors);
    await ctx.close();
  }

  // ---- milestone page
  {
    const { ctx, page, errors } = await open(browser, 'age-milestone-calculator');
    await type(page, '#adob-dob', '01/15/1990'); await type(page, '#adob-target', '09/26/2026');
    const t = await text(page, '[data-r="milestoneTable"]');
    ok(t.includes('Age 40') && t.includes('January 15, 2030') && t.includes('in 1,207 days') && t.includes('Reached'), 'milestone table');
    ok(t.includes('10,000 days old') && t.includes('June 2, 2017'), '10k days');
    await page.fill('#adob-custom', '35'); await page.dispatchEvent('#adob-custom', 'input');
    ok((await text(page, '[data-r="milestoneTable"]')).includes('Age 35 (custom)'), 'custom milestone');
    ok((await text(page, '[data-r="timeline"]')).includes('Age 35 (custom)'), 'custom in timeline');
    await page.fill('#adob-custom', '9999'); await page.dispatchEvent('#adob-custom', 'input'); await clean(page, 'custom out of range');
    ok(errors.length === 0, 'milestone: no errors ' + errors);
    await ctx.close();
  }

  await browser.close();
  console.log(`browser tests: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
