/*!
 * EasyCalculatorSmart — Age / DOB calculator UI.
 * All maths lives in assets/js/lib/age-dob.js (window.AgeDob).
 * Privacy: nothing is sent over the network; the DOB is never written to the URL;
 * localStorage is used only after the visitor ticks "Remember on this device".
 * All output is written with textContent / createElement (no innerHTML with data).
 */
(function () {
  'use strict';
  var A = window.AgeDob;
  var root = document.querySelector('.adob');
  var cfgEl = document.getElementById('adob-config');
  if (!A || !root || !cfgEl) return;

  var C = JSON.parse(cfgEl.textContent);
  var L = C.labels;
  var mode = root.getAttribute('data-mode');
  var $ = function (sel, ctx) { return (ctx || root).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); };
  var R = function (name) { return $('[data-r="' + name + '"]'); };

  var els = {
    country: $('[data-adob-country]'), format: $('[data-adob-format]'), rule: $('[data-adob-rule]'),
    results: $('[data-adob-results]'), error: $('[data-adob-error]'), announce: $('[data-adob-announce]'),
    remember: $('[data-adob-remember]'), shareDob: $('[data-adob-share-dob]'), custom: $('[data-adob-custom]'),
    timeOn: $('[data-adob-time-on]'), btime: $('[data-adob-btime]'), ttime: $('[data-adob-ttime]'),
    bzone: $('[data-adob-bzone]'), tzone: $('[data-adob-tzone]')
  };

  /* ---------- helpers ---------- */

  function todayLocal() { var n = new Date(); return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }; }
  function country() { return C.countries[els.country.value] || C.countries[C.defaultCountry]; }
  function fmt() { return els.format.value; }
  function rule() { return els.rule.value === 'rollover' ? 'rollover' : 'clamp'; }
  function num(n) { return Number(n).toLocaleString(country().locale || 'en-US'); }
  function long(dt, wd) { return A.formatLong(dt, country().monthFirst, wd); }
  function plural(n, one, many) { return num(n) + ' ' + (n === 1 ? one : many); }
  function ymd(a) { return plural(a.years, L.year, L.years) + ', ' + plural(a.months, L.month, L.months) + ', ' + plural(a.days, L.day, L.days); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); return node; }
  function facts(dl, rows) {
    clear(dl);
    rows.forEach(function (r) { if (!r) return; dl.appendChild(el('dt', null, r[0])); dl.appendChild(el('dd', null, r[1])); });
  }
  function daysPhrase(n) { return n === 0 ? 'today' : n > 0 ? 'in ' + plural(n, L.day, L.days) : plural(-n, L.day, L.days) + ' ago'; }

  /* ---------- date fields (text + native picker, one ISO truth) ---------- */

  var fields = {};
  $$('[data-adob-date]').forEach(function (wrap) {
    var key = wrap.getAttribute('data-adob-date');
    var f = { wrap: wrap, text: $('[data-adob-text]', wrap), picker: $('[data-adob-picker]', wrap), echo: $('[data-adob-echo]', wrap), value: null };
    fields[key] = f;
    f.text.addEventListener('input', function () { setFromText(f); run(); });
    f.text.addEventListener('blur', function () { if (f.value) f.text.value = A.formatShort(f.value, fmt()); });
    f.picker.addEventListener('change', function () { setDate(f, A.parseDate(f.picker.value, 'YMD')); run(); });
    f.picker.parentNode.addEventListener('click', function () { try { f.picker.showPicker(); } catch (e) { f.picker.focus(); } });
  });

  function setFromText(f) {
    var raw = f.text.value.trim();
    f.value = raw ? A.parseDate(raw, fmt()) : null;
    f.text.setAttribute('aria-invalid', raw && !f.value ? 'true' : 'false');
    f.picker.value = f.value ? A.toISO(f.value) : '';
    echo(f, raw);
  }
  function setDate(f, dt) {
    f.value = dt;
    f.text.value = dt ? A.formatShort(dt, fmt()) : '';
    f.picker.value = dt ? A.toISO(dt) : '';
    f.text.setAttribute('aria-invalid', 'false');
    echo(f, f.text.value);
  }
  function echo(f, raw) {
    f.echo.textContent = f.value ? 'Reads as ' + long(f.value, true) : raw ? 'Not a valid date in ' + C.formats[fmt()].label + ' format' : '';
    f.echo.classList.toggle('is-bad', !!raw && !f.value);
  }
  function applyDisplay() {
    Object.keys(fields).forEach(function (k) {
      var f = fields[k];
      f.text.placeholder = C.formats[fmt()].placeholder;
      if (f.value) f.text.value = A.formatShort(f.value, fmt());
      echo(f, f.text.value);
    });
    var asOf = $('[data-adob-asof-label]');
    if (asOf) asOf.textContent = country().asOf;
  }

  /* ---------- time zones ---------- */

  var localZone = 'UTC';
  try { localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) {}

  function fillZones() {
    if (!els.bzone) return;
    var local = localZone;
    var zones = C.timeZones.slice();
    if (zones.indexOf(local) < 0) zones.unshift(local);
    [els.bzone, els.tzone].forEach(function (s) {
      zones.forEach(function (z) { var o = el('option', null, z === local ? z + ' (this device)' : z); o.value = z; s.appendChild(o); });
      s.value = local;
    });
  }

  /* ---------- presets ---------- */

  function resolveSpec(spec, dob) {
    if (!spec) return null;
    var t = todayLocal(), m;
    if (spec === 'today') return t;
    if (spec === 'yesterday') return A.addDays(t, -1);
    if (spec === 'tomorrow') return A.addDays(t, 1);
    if ((m = /^today([+-])(\d+)([dy])$/.exec(spec))) {
      var n = +m[2] * (m[1] === '-' ? -1 : 1);
      return m[3] === 'd' ? A.addDays(t, n) : A.addYears(t, n, rule());
    }
    if (spec === 'birthday-this-year' || spec === 'next-birthday') {
      if (!dob) return null;
      if (spec === 'birthday-this-year') return t.y > dob.y ? A.addYears(dob, t.y - dob.y, rule()) : dob;
      var nb = A.calculateNextBirthday(dob, t, rule());
      return nb ? (nb.isToday ? t : nb.next) : null;
    }
    return A.parseDate(spec, 'YMD');
  }

  $$('[data-adob-preset]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = C.presets.filter(function (x) { return x.id === b.getAttribute('data-adob-preset'); })[0];
      if (!p) return;
      if (p.dob) setDate(fields.dob, resolveSpec(p.dob));
      if (p.target && fields.target) {
        var t = resolveSpec(p.target, fields.dob.value);
        if (t) setDate(fields.target, t);
        else showError('Enter a date of birth first to use “' + p.label + '”.');
      }
      run();
    });
  });

  /* ---------- rendering ---------- */

  var last = null;

  function showError(msg) { els.error.textContent = msg; els.error.hidden = !msg; }

  function run() {
    showError('');
    var dob = fields.dob.value;
    var target = fields.target ? fields.target.value : todayLocal();
    save();
    if (!dob || (fields.target && !target)) {
      els.results.hidden = true; last = null;
      if ((fields.dob.text.value && !dob) || (fields.target && fields.target.text.value && !target)) showError(L.errInvalid);
      return;
    }
    var ages = C.milestoneAges.slice();
    var custom = els.custom ? parseInt(els.custom.value, 10) : NaN;
    if (custom >= 1 && custom <= 150 && ages.indexOf(custom) < 0) ages.push(custom);

    if (mode === 'weekday') {
      last = { dob: dob, target: todayLocal(), born: A.calculateBirthWeekday(dob) };
      renderBorn(last); renderWeekdayTable(last); renderWork(last);
    } else {
      var r = A.calculateAgeAtDate(dob, target, { rule: rule(), milestoneAges: ages, dayMilestones: C.dayMilestones });
      if (!r.ok) { els.results.hidden = true; last = null; showError(r.error === 'before-birth' ? L.errBefore : L.errInvalid); return; }
      r.dob = dob; r.target = target; r.custom = custom;
      if (mode === 'full') r.time = timeResult(dob, target);
      last = r;
      if (mode === 'full') { renderAge(r); renderTotals(r); renderBorn(r); }
      if (mode === 'full' || mode === 'birthday') renderBirthday(r);
      if (mode === 'birthday') renderBirthdayTable(r);
      if (mode === 'full' || mode === 'milestone') renderTimeline(r);
      if (mode === 'milestone') renderMilestoneTable(r);
      renderWork(r);
    }
    els.results.hidden = false;
    els.announce.textContent = summary(false);
  }

  function timeResult(dob, target) {
    if (!els.timeOn || !els.timeOn.checked) return null;
    var bt = A.parseTime(els.btime.value), tt = A.parseTime(els.ttime.value);
    if (!bt || !tt) return { ok: false, error: 'invalid-time' };
    return A.calculateExactDurationWithTime(dob, bt, target, tt, els.bzone.value, els.tzone.value, rule());
  }

  function renderAge(r) {
    var a = r.age;
    R('age').textContent = ymd(a);
    R('ageLine').textContent = 'Born ' + long(r.dob, true) + ' · ' + country().asOf.toLowerCase() + ' ' + long(r.target, true);
    var ta = R('timeAge');
    if (r.time && r.time.ok) {
      ta.hidden = false;
      ta.textContent = 'With birth time: ' + ymd(r.time) + ', ' + plural(r.time.hours, 'hour', L.hours) + ', ' +
        plural(r.time.minutes, 'minute', L.minutes) + ', ' + plural(r.time.seconds, 'second', L.seconds);
    } else if (r.time && !r.time.ok) {
      ta.hidden = false; ta.textContent = r.time.error === 'before-birth' ? 'With birth time: the as-of moment is before the birth moment.' : L.errTime;
    } else ta.hidden = true;
  }

  function renderTotals(r) {
    var t = r.totals, tm = r.time && r.time.ok ? r.time : null, g = clear(R('totals'));
    var cards = [
      [L.totalMonths, num(t.months), t.monthsRemDays ? '+ ' + plural(t.monthsRemDays, L.day, L.days) : 'exact calendar months'],
      [L.totalWeeks, num(tm ? tm.totalWeeks : t.weeks), tm ? 'from exact birth time' : (t.weeksRemDays ? '+ ' + plural(t.weeksRemDays, L.day, L.days) : 'exact weeks')],
      [L.totalDays, num(tm ? tm.totalDays : t.days), tm ? 'complete 24-hour days' : 'calendar days'],
      [L.totalHours, num(tm ? tm.totalHours : t.hours), tm ? 'exact' : 'whole days × 24'],
      [L.totalMinutes, num(tm ? tm.totalMinutes : t.minutes), tm ? 'exact' : 'whole days × 1,440'],
      [L.totalSeconds, num(tm ? tm.totalSeconds : t.seconds), tm ? 'exact' : 'whole days × 86,400']
    ];
    cards.forEach(function (c) {
      var d = el('div', 'adob-card');
      d.appendChild(el('span', 'adob-card-l', c[0])); d.appendChild(el('strong', 'adob-card-n', c[1])); d.appendChild(el('small', null, c[2]));
      g.appendChild(d);
    });
    R('totalsNote').textContent = tm ? L.timeNote : L.dateOnlyNote;
  }

  function renderBirthday(r) {
    var b = r.birthday;
    if (!b) return;
    var fg = R('ringFg');
    fg.setAttribute('stroke-dasharray', (b.isToday ? 100 : Math.round(b.yearProgress * 1000) / 10) + ' 100');
    R('ringN').textContent = b.isToday ? '🎂' : num(b.daysUntil);
    R('ringL').textContent = b.isToday ? 'today!' : (b.daysUntil === 1 ? 'day to go' : 'days to go');
    R('ring').setAttribute('aria-label', b.isToday ? 'Birthday is on the selected date' :
      plural(b.daysUntil, L.day, L.days) + ' until the next birthday; ' + Math.round(b.yearProgress * 100) + '% of the birthday year has passed');
    var rows = [];
    if (b.isToday) rows.push(['Birthday', 'Today — ' + long(r.target, true) + ' (turned ' + num(b.turning - 1) + ')']);
    rows.push([L.nextBirthday, long(b.next, true)]);
    rows.push([L.turning, num(b.turning)]);
    rows.push([L.daysUntil, num(b.daysUntil)]);
    rows.push(['Weeks + days', plural(b.weeksUntil.weeks, L.week, L.weeks) + ' + ' + plural(b.weeksUntil.days, L.day, L.days)]);
    rows.push(['Weekday', b.weekday]);
    if (b.previous) rows.push(['Previous birthday', long(b.previous, true)]);
    if (b.observed) rows.push(['Leap-day note', 'Born on 29 February: in ' + b.next.y + ' (not a leap year) the birthday is shown on ' + long(b.next) + ' under the selected rule. The date of birth stays 29 February.']);
    facts(R('bday'), rows);
  }

  function renderBirthdayTable(r) {
    var tbl = R('bdayTable'); clearTable(tbl);
    var head = ['', 'Date', 'Weekday', 'Age turned', 'Days from ' + long(r.target)];
    var b = r.birthday, rows = [];
    function row(name, dt) {
      if (!dt) return;
      var diff = A.toDayNumber(dt) - A.toDayNumber(r.target);
      rows.push([name, long(dt), A.WEEKDAYS[A.weekdayIndex(dt)], num(dt.y - r.dob.y), daysPhrase(diff)]);
    }
    row('Previous birthday', b.previous);
    row('Birthday in ' + r.target.y, b.thisYear);
    row('Next birthday', b.next);
    row('Birthday in ' + (r.target.y + 1), b.nextYear);
    table(tbl, head, rows);
  }

  function renderBorn(r) {
    var bw = r.born, week = clear(R('week'));
    var order = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return (i + C.weekdayStart) % 7; });
    order.forEach(function (i) {
      var li = el('li', i === bw.index ? 'is-on' : null, A.WEEKDAYS[i].slice(0, 3));
      li.setAttribute('aria-label', A.WEEKDAYS[i] + (i === bw.index ? ' (born)' : ''));
      if (i === bw.index) li.setAttribute('aria-current', 'true');
      week.appendChild(li);
    });
    facts(R('born'), [
      [L.bornOn, bw.name + ', ' + long(r.dob)],
      ['Day of the year', num(bw.dayOfYear) + ' of ' + num(bw.daysInYear)],
      ['ISO week', 'Week ' + bw.isoWeek + (bw.isoWeekYear !== r.dob.y ? ' of ' + bw.isoWeekYear : '')],
      ['Leap year', bw.leapYear ? 'Yes — ' + r.dob.y + ' had 366 days' : 'No — ' + r.dob.y + ' had 365 days'],
      bw.leapDay ? ['Leap-day birthday', 'Yes — 29 February comes round only in leap years'] : null
    ]);
  }

  function renderWeekdayTable(r) {
    var tbl = R('weekdayTable'); clearTable(tbl);
    var t = r.target, rows = [];
    var startY = Math.max(t.y, r.dob.y + 1);
    for (var y = startY; rows.length < 10 && y <= A.MAX_YEAR; y++) {
      var d = A.addYears(r.dob, y - r.dob.y, rule());
      if (A.compareDates(d, t) < 0) continue;
      var wi = A.weekdayIndex(d);
      rows.push([long(d), A.WEEKDAYS[wi], num(y - r.dob.y)]);
    }
    table(tbl, ['Birthday', 'Weekday', 'Age'], rows);
  }

  function renderTimeline(r) {
    var ol = clear(R('timeline')), b = r.birthday, items = [];
    items.push({ date: r.dob, title: 'Birth', text: long(r.dob, true), cls: 'is-birth' });
    if (mode === 'milestone') {
      r.milestones.list.forEach(function (m) {
        if (m.kind === 'days' && m.value !== 10000) return;
        items.push({ date: m.date, title: m.kind === 'age' ? 'Age ' + m.value + (m.value === r.custom ? ' (custom)' : '') : num(m.value) + ' days old',
          text: long(m.date, true) + ' · ' + daysPhrase(m.days), cls: 'is-' + m.status });
      });
      items.push({ date: r.target, title: 'Selected date', text: long(r.target, true) + ' · ' + ymd(r.age), cls: 'is-now' });
    } else {
      if (b && b.previous) items.push({ date: b.previous, title: 'Last birthday', text: long(b.previous, true) + ' · turned ' + num(b.previous.y - r.dob.y), cls: 'is-past' });
      items.push({ date: r.target, title: 'Current age', text: ymd(r.age) + ' on ' + long(r.target), cls: 'is-now' });
      if (b) items.push({ date: b.next, title: 'Next birthday', text: long(b.next, true) + ' · turning ' + num(b.turning) + ' · ' + daysPhrase(b.daysUntil), cls: 'is-upcoming' });
      var nm = r.milestones && r.milestones.next;
      if (nm && (!b || A.compareDates(nm.date, b.next) !== 0 || nm.kind === 'days'))
        items.push({ date: nm.date, title: L.nextMilestone + ': ' + (nm.kind === 'age' ? 'age ' + nm.value : num(nm.value) + ' days old'), text: long(nm.date, true) + ' · ' + daysPhrase(nm.days), cls: 'is-upcoming' });
    }
    items.sort(function (x, y) { return A.compareDates(x.date, y.date) || (x.cls === 'is-now' ? 1 : -1); });
    items.forEach(function (it) {
      var li = el('li', it.cls); li.appendChild(el('strong', null, it.title)); li.appendChild(el('span', null, it.text)); ol.appendChild(li);
    });
  }

  function renderMilestoneTable(r) {
    var tbl = R('milestoneTable'); clearTable(tbl);
    var rows = r.milestones.list.map(function (m) {
      return [m.kind === 'age' ? 'Age ' + m.value + (m.value === r.custom ? ' (custom)' : '') : num(m.value) + ' days old',
        long(m.date), A.WEEKDAYS[A.weekdayIndex(m.date)], daysPhrase(m.days),
        m.status === 'past' ? 'Reached' : m.status === 'today' ? 'Today' : 'Upcoming'];
    });
    table(tbl, ['Milestone', 'Date', 'Weekday', 'From ' + long(r.target), 'Status'], rows);
  }

  function renderWork(r) {
    var ol = clear(R('work')), steps = [];
    if (mode === 'weekday') {
      steps.push('Convert ' + long(r.dob) + ' into a day count from a fixed reference date (1 January 1970, a Thursday): ' + num(A.toDayNumber(r.dob)) + '.');
      steps.push('Weekdays repeat every 7 days, so the remainder after dividing by 7 gives the weekday: ' + r.born.name + '.');
      steps.push('Day of year = days since 1 January ' + r.dob.y + ' + 1 = ' + r.born.dayOfYear + '.');
      steps.push('ISO week: find the Thursday of the same Monday-to-Sunday week; its week of the year is ' + r.born.isoWeek + '.');
    } else {
      var a = r.age, lastBday = A.addYears(r.dob, a.years, r.rule);
      steps.push('Completed years: from ' + long(r.dob) + ' to ' + long(lastBday) + ' = ' + plural(a.years, L.year, L.years) + '.');
      steps.push('Completed months: from ' + long(lastBday) + ' to ' + long(a.anchor) + ' = ' + plural(a.months, L.month, L.months) + ' (each month counted on the calendar, not as 30 days).');
      steps.push('Remaining days: from ' + long(a.anchor) + ' to ' + long(r.target) + ' = ' + plural(a.days, L.day, L.days) + '.');
      steps.push('Totals are counted separately: ' + num(r.totals.days) + ' calendar days between the two dates, which includes every 29 February in between.');
      if (r.dob.d > 28) steps.push('Month-end rule “' + (r.rule === 'clamp' ? 'last day of month' : 'next day') + '”: when day ' + r.dob.d + ' does not exist in a month, the anniversary falls on ' + (r.rule === 'clamp' ? 'that month’s last day' : 'the 1st of the following month') + '.');
    }
    steps.forEach(function (s) { ol.appendChild(el('li', null, s)); });
  }

  function clearTable(t) { $$('thead, tbody', t).forEach(function (n) { t.removeChild(n); }); }
  function table(t, head, rows) {
    var th = el('thead'), tr = el('tr');
    head.forEach(function (h) { var c = el('th', null, h); c.scope = 'col'; tr.appendChild(c); });
    th.appendChild(tr); t.appendChild(th);
    var tb = el('tbody');
    rows.forEach(function (row) {
      var r = el('tr');
      row.forEach(function (v, i) { var c = el(i === 0 ? 'th' : 'td', null, v); if (i === 0) c.scope = 'row'; r.appendChild(c); });
      tb.appendChild(r);
    });
    t.appendChild(tb);
  }

  /* ---------- copy / share / print ---------- */

  function summary(includeDob) {
    if (!last) return '';
    var lines = [], dobTxt = includeDob ? ' (born ' + long(last.dob) + ')' : '';
    if (mode === 'weekday') {
      lines.push('Day of birth' + dobTxt + ': ' + last.born.name + '.');
      lines.push('Day ' + last.born.dayOfYear + ' of the year, ISO week ' + last.born.isoWeek + '.');
    } else {
      lines.push(country().asOf + ' ' + long(last.target) + dobTxt + ': ' + ymd(last.age) + '.');
      if (mode === 'full') lines.push('Total: ' + num(last.totals.days) + ' days · ' + num(last.totals.weeks) + ' weeks · ' + num(last.totals.months) + ' months.');
      if (last.birthday) lines.push('Next birthday: ' + long(last.birthday.next, true) + ' (turning ' + num(last.birthday.turning) + ', in ' + plural(last.birthday.daysUntil, L.day, L.days) + ').');
      if (mode === 'milestone' && last.milestones.next) lines.push('Next milestone: ' + (last.milestones.next.kind === 'age' ? 'age ' + last.milestones.next.value : num(last.milestones.next.value) + ' days old') + ' on ' + long(last.milestones.next.date) + '.');
    }
    return lines.join('\n');
  }

  function pageUrl() { return location.origin + location.pathname; } // never includes the DOB

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = el('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } finally { document.body.removeChild(ta); }
    });
  }
  function flash(msg) { els.announce.textContent = msg; var b = $('[data-adob-copy]'); var o = b.textContent; b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = o; }, 1600); }

  $('[data-adob-copy]').addEventListener('click', function () {
    copy(summary(els.shareDob.checked) + '\n' + pageUrl()).then(function () { flash(L.copied); }, function () { showError('Copy failed — select the result text and copy it manually.'); });
  });
  $('[data-adob-share]').addEventListener('click', function () {
    var text = summary(els.shareDob.checked);
    if (navigator.share) navigator.share({ title: document.title, text: text, url: pageUrl() }).catch(function () {});
    else copy(text + '\n' + pageUrl()).then(function () { flash(L.copied); });
  });
  $('[data-adob-print]').addEventListener('click', function () { $$('details', els.results).forEach(function (d) { d.open = true; }); window.print(); });

  /* ---------- storage (opt-in only) ---------- */

  function save() {
    if (!els.remember || !els.remember.checked) return;
    try {
      localStorage.setItem(C.storageKey, JSON.stringify({
        dob: fields.dob.value ? A.toISO(fields.dob.value) : '', country: els.country.value, format: fmt(), rule: rule()
      }));
    } catch (e) {}
  }
  function restore() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(C.storageKey) || 'null'); } catch (e) {}
    if (!s || typeof s !== 'object') return;
    els.remember.checked = true;
    if (C.countries[s.country]) els.country.value = s.country;
    if (C.formats[s.format]) els.format.value = s.format;
    if (s.rule === 'clamp' || s.rule === 'rollover') els.rule.value = s.rule;
    var d = A.parseDate(String(s.dob || ''), 'YMD');
    if (d) fields.dob.value = d;
  }
  els.remember.addEventListener('change', function () {
    if (els.remember.checked) save();
    else try { localStorage.removeItem(C.storageKey); } catch (e) {}
  });

  /* ---------- wiring ---------- */

  els.country.addEventListener('change', function () { els.format.value = country().format; applyDisplay(); run(); });
  els.format.addEventListener('change', function () { applyDisplay(); run(); });
  els.rule.addEventListener('change', run);
  [els.timeOn, els.btime, els.ttime, els.bzone, els.tzone, els.custom].forEach(function (x) { if (x) x.addEventListener('input', run); if (x) x.addEventListener('change', run); });
  if (els.timeOn) els.timeOn.addEventListener('change', function () { if (els.timeOn.checked) $('[data-adob-time-wrap]').open = true; });
  var nowBtn = $('[data-adob-now]');
  if (nowBtn) nowBtn.addEventListener('click', function () {
    var n = new Date(); els.ttime.value = [n.getHours(), n.getMinutes(), n.getSeconds()].map(function (v) { return (v < 10 ? '0' : '') + v; }).join(':');
    els.tzone.value = localZone;
    if (fields.target) setDate(fields.target, todayLocal());
    run();
  });
  $('[data-adob-reset]').addEventListener('click', function () {
    els.country.value = C.defaultCountry; els.format.value = country().format; els.rule.value = C.defaultRule;
    setDate(fields.dob, null); if (fields.target) setDate(fields.target, todayLocal());
    if (els.timeOn) { els.timeOn.checked = false; els.btime.value = '00:00:00'; els.ttime.value = '12:00:00'; }
    if (els.custom) els.custom.value = '';
    els.shareDob.checked = false;
    applyDisplay(); run(); fields.dob.text.focus();
  });
  $('[data-adob-form]').addEventListener('submit', function (e) { e.preventDefault(); run(); });

  // theme toggle (shared site key)
  var tb = document.querySelector('[data-adob-theme]');
  if (tb) tb.addEventListener('click', function () {
    var h = document.documentElement, cur = h.getAttribute('data-theme') ||
      (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    h.setAttribute('data-theme', next);
    try { localStorage.setItem('ecs-theme', next); } catch (e) {}
  });

  // Initial state: country guessed from the browser language only (no network lookup).
  (function guessCountry() {
    var lang = (navigator.language || '').toLowerCase(), map = { 'en-us': 'us', 'en-gb': 'uk', 'en-ca': 'ca', 'fr-ca': 'ca', 'en-in': 'in', 'hi-in': 'in', 'hi': 'in', 'en-au': 'au', 'en-nz': 'nz' };
    if (map[lang] && C.countries[map[lang]]) { els.country.value = map[lang]; els.format.value = country().format; }
  })();
  fillZones();
  restore();
  if (fields.target) setDate(fields.target, todayLocal());
  if (fields.dob.value) setDate(fields.dob, fields.dob.value);
  applyDisplay();
  run();
})();
