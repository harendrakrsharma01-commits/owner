/*!
 * EasyCalculatorSmart — Age / Date-of-Birth engine.
 * Pure, dependency-free calendar arithmetic. No DOM, no network.
 * Dates are plain objects {y, m, d} (m = 1..12) interpreted on the
 * proleptic Gregorian calendar; they never pass through local-time Date
 * objects, so daylight-saving changes cannot shift a date-only result.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AgeDob = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MIN_YEAR = 1, MAX_YEAR = 9999;
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  /* ---------- primitives ---------- */

  function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }

  function daysInMonth(y, m) {
    return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  }

  function isInt(n) { return typeof n === 'number' && isFinite(n) && Math.floor(n) === n; }

  function isValidDate(dt) {
    return !!dt && isInt(dt.y) && isInt(dt.m) && isInt(dt.d) &&
      dt.y >= MIN_YEAR && dt.y <= MAX_YEAR && dt.m >= 1 && dt.m <= 12 &&
      dt.d >= 1 && dt.d <= daysInMonth(dt.y, dt.m);
  }

  /** Days since 1970-01-01 (Hinnant's days_from_civil). Exact for any Gregorian date. */
  function toDayNumber(dt) {
    var y = dt.m <= 2 ? dt.y - 1 : dt.y;
    var era = Math.floor(y / 400);
    var yoe = y - era * 400;
    var mp = (dt.m + 9) % 12;
    var doy = Math.floor((153 * mp + 2) / 5) + dt.d - 1;
    var doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
    return era * 146097 + doe - 719468;
  }

  function fromDayNumber(z) {
    z += 719468;
    var era = Math.floor(z / 146097);
    var doe = z - era * 146097;
    var yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
    var doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
    var mp = Math.floor((5 * doy + 2) / 153);
    var d = doy - Math.floor((153 * mp + 2) / 5) + 1;
    var m = mp < 10 ? mp + 3 : mp - 9;
    return { y: era * 400 + yoe + (m <= 2 ? 1 : 0), m: m, d: d };
  }

  function compareDates(a, b) { return toDayNumber(a) - toDayNumber(b); }
  function addDays(dt, n) { return fromDayNumber(toDayNumber(dt) + n); }

  /**
   * Add whole calendar months to an ORIGINAL date.
   * When the day does not exist in the target month (31st, 30th, 29 Feb):
   *   rule 'clamp'    → last day of that month (Jan 31 + 1 month = Feb 28/29)
   *   rule 'rollover' → first day of the following month (Jan 31 + 1 month = Mar 1)
   */
  function addMonths(dt, n, rule) {
    var idx = dt.y * 12 + (dt.m - 1) + n;
    var y = Math.floor(idx / 12), m = idx - y * 12 + 1;
    var dim = daysInMonth(y, m);
    if (dt.d <= dim) return { y: y, m: m, d: dt.d };
    if (rule === 'rollover') return addDays({ y: y, m: m, d: dim }, 1);
    return { y: y, m: m, d: dim };
  }

  function addYears(dt, n, rule) { return addMonths(dt, n * 12, rule); }

  function weekdayIndex(dt) { return ((toDayNumber(dt) % 7) + 7 + 4) % 7; } // 1970-01-01 = Thursday
  function dayOfYear(dt) { return toDayNumber(dt) - toDayNumber({ y: dt.y, m: 1, d: 1 }) + 1; }

  /** ISO-8601 week number and week-year (weeks start Monday; week 1 contains 4 January). */
  function isoWeek(dt) {
    var wd = weekdayIndex(dt) || 7;
    var thursday = addDays(dt, 4 - wd);
    return { week: Math.floor((dayOfYear(thursday) - 1) / 7) + 1, year: thursday.y };
  }

  /* ---------- parsing & formatting ---------- */

  function pad(n, w) { var s = String(Math.abs(n)); while (s.length < w) s = '0' + s; return s; }
  function toISO(dt) { return pad(dt.y, 4) + '-' + pad(dt.m, 2) + '-' + pad(dt.d, 2); }

  /**
   * Strict parser. `format` is 'YMD' | 'DMY' | 'MDY'. ISO (YYYY-MM-DD) is always accepted
   * because it is unambiguous. Separators: / - . or space. Year must have 4 digits so
   * "04/05/00" can never be silently guessed. Returns null when invalid.
   */
  function parseDate(str, format) {
    if (typeof str !== 'string') return null;
    var s = str.trim();
    var iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
    var parts, dt;
    if (iso) dt = { y: +iso[1], m: +iso[2], d: +iso[3] };
    else {
      parts = s.split(/[\/\-. ]+/);
      if (parts.length !== 3 || !parts.every(function (p) { return /^\d+$/.test(p); })) return null;
      if (format === 'DMY') dt = { d: +parts[0], m: +parts[1], y: parts[2] };
      else if (format === 'MDY') dt = { m: +parts[0], d: +parts[1], y: parts[2] };
      else dt = { y: parts[0], m: +parts[1], d: +parts[2] };
      if (!/^\d{4}$/.test(dt.y)) return null;
      dt.y = +dt.y;
    }
    return isValidDate(dt) ? dt : null;
  }

  function formatShort(dt, format) {
    var y = pad(dt.y, 4), m = pad(dt.m, 2), d = pad(dt.d, 2);
    if (format === 'DMY') return d + '/' + m + '/' + y;
    if (format === 'MDY') return m + '/' + d + '/' + y;
    return y + '-' + m + '-' + d;
  }

  /** Unambiguous long form: "September 24, 2000" (monthFirst) or "24 September 2000". */
  function formatLong(dt, monthFirst, withWeekday) {
    var base = monthFirst ? MONTHS[dt.m - 1] + ' ' + dt.d + ', ' + dt.y
      : dt.d + ' ' + MONTHS[dt.m - 1] + ' ' + dt.y;
    return withWeekday ? WEEKDAYS[weekdayIndex(dt)] + ', ' + base : base;
  }

  /* ---------- calendar age ---------- */

  function fail(code) { return { ok: false, error: code }; }

  /**
   * Completed years, then completed months, then remaining days.
   * Each step is measured from the ORIGINAL birth date (never chained),
   * so month-end dates cannot drift and nothing is ever negative.
   */
  function calculateCalendarAge(birth, target, rule) {
    if (!isValidDate(birth) || !isValidDate(target)) return fail('invalid');
    var tn = toDayNumber(target);
    if (tn < toDayNumber(birth)) return fail('before-birth');
    var months = (target.y - birth.y) * 12 + (target.m - birth.m);
    while (months > 0 && toDayNumber(addMonths(birth, months, rule)) > tn) months--;
    var anchor = addMonths(birth, months, rule);
    return {
      ok: true,
      years: Math.floor(months / 12),
      months: months % 12,
      days: tn - toDayNumber(anchor),
      totalMonths: months,
      anchor: anchor
    };
  }

  function calculateTotalDays(birth, target) {
    if (!isValidDate(birth) || !isValidDate(target)) return null;
    var n = toDayNumber(target) - toDayNumber(birth);
    return n < 0 ? null : n;
  }

  function calculateTotalWeeks(birth, target) {
    var n = calculateTotalDays(birth, target);
    return n === null ? null : { weeks: Math.floor(n / 7), days: n % 7 };
  }

  function calculateTotalMonths(birth, target, rule) {
    var a = calculateCalendarAge(birth, target, rule);
    return a.ok ? { months: a.totalMonths, days: a.days } : null;
  }

  /** Date-only totals assume midnight-to-midnight, i.e. whole days × 86 400 s. */
  function calculateTotalHours(birth, target) { var n = calculateTotalDays(birth, target); return n === null ? null : n * 24; }
  function calculateTotalMinutes(birth, target) { var n = calculateTotalDays(birth, target); return n === null ? null : n * 1440; }
  function calculateTotalSeconds(birth, target) { var n = calculateTotalDays(birth, target); return n === null ? null : n * 86400; }

  /* ---------- birthdays ---------- */

  function birthdayInYear(birth, year, rule) { return addYears(birth, year - birth.y, rule); }

  function calculateNextBirthday(birth, target, rule) {
    if (!isValidDate(birth) || !isValidDate(target)) return null;
    if (compareDates(target, birth) < 0) return null;
    var tn = toDayNumber(target);
    var thisYear = birthdayInYear(birth, target.y, rule);
    var isToday = toDayNumber(thisYear) === tn;
    var next = toDayNumber(thisYear) > tn ? thisYear : birthdayInYear(birth, target.y + 1, rule);
    if (next.y > MAX_YEAR) return null;
    var prevYear = toDayNumber(thisYear) <= tn ? target.y : target.y - 1;
    var previous = prevYear > birth.y ? birthdayInYear(birth, prevYear, rule) : null;
    var daysUntil = toDayNumber(next) - tn;
    return {
      isToday: isToday,
      next: next,
      turning: next.y - birth.y,
      daysUntil: daysUntil,
      weeksUntil: { weeks: Math.floor(daysUntil / 7), days: daysUntil % 7 },
      weekday: WEEKDAYS[weekdayIndex(next)],
      previous: previous,
      thisYear: thisYear.y > birth.y ? thisYear : null,
      nextYear: target.y + 1 <= MAX_YEAR ? birthdayInYear(birth, target.y + 1, rule) : null,
      observed: birth.m === 2 && birth.d === 29 && !isLeapYear(next.y),
      // share of the current birthday year already elapsed (0..1) for the progress ring
      yearProgress: (function () {
        var start = isToday ? tn : (previous ? toDayNumber(previous) : toDayNumber(birth));
        var span = toDayNumber(next) - start;
        return span > 0 ? (tn - start) / span : 0;
      })()
    };
  }

  function calculateBirthWeekday(birth) {
    if (!isValidDate(birth)) return null;
    var w = isoWeek(birth);
    return {
      index: weekdayIndex(birth),
      name: WEEKDAYS[weekdayIndex(birth)],
      dayOfYear: dayOfYear(birth),
      daysInYear: isLeapYear(birth.y) ? 366 : 365,
      isoWeek: w.week,
      isoWeekYear: w.year,
      leapYear: isLeapYear(birth.y),
      leapDay: birth.m === 2 && birth.d === 29
    };
  }

  /**
   * Milestone birthdays (ages) and day-count milestones, relative to `target`.
   * status: 'past' | 'today' | 'upcoming'. Dates beyond year 9999 are dropped.
   */
  function calculateMilestones(birth, target, ages, dayCounts, rule) {
    if (!isValidDate(birth) || !isValidDate(target)) return null;
    var tn = toDayNumber(target), out = [];
    (ages || []).forEach(function (age) {
      if (!isInt(age) || age < 1 || birth.y + age > MAX_YEAR) return;
      var date = addYears(birth, age, rule), diff = toDayNumber(date) - tn;
      out.push({ kind: 'age', value: age, date: date, days: diff, status: diff > 0 ? 'upcoming' : diff === 0 ? 'today' : 'past' });
    });
    (dayCounts || []).forEach(function (n) {
      if (!isInt(n) || n < 1) return;
      var date = addDays(birth, n);
      if (date.y > MAX_YEAR) return;
      var diff = toDayNumber(date) - tn;
      out.push({ kind: 'days', value: n, date: date, days: diff, status: diff > 0 ? 'upcoming' : diff === 0 ? 'today' : 'past' });
    });
    out.sort(function (a, b) { return toDayNumber(a.date) - toDayNumber(b.date); });
    var next = null, prev = null;
    out.forEach(function (m) {
      if (m.status !== 'past' && !next) next = m;
      if (m.status !== 'upcoming') prev = m;
    });
    return { list: out, next: next, previous: prev };
  }

  /** Everything the main calculator shows, in one call. */
  function calculateAgeAtDate(birth, target, opts) {
    opts = opts || {};
    var rule = opts.rule === 'rollover' ? 'rollover' : 'clamp';
    var age = calculateCalendarAge(birth, target, rule);
    if (!age.ok) return age;
    var days = calculateTotalDays(birth, target);
    return {
      ok: true,
      rule: rule,
      age: age,
      totals: {
        months: age.totalMonths, monthsRemDays: age.days,
        weeks: Math.floor(days / 7), weeksRemDays: days % 7,
        days: days, hours: days * 24, minutes: days * 1440, seconds: days * 86400
      },
      birthday: calculateNextBirthday(birth, target, rule),
      born: calculateBirthWeekday(birth),
      milestones: calculateMilestones(birth, target, opts.milestoneAges, opts.dayMilestones, rule)
    };
  }

  /* ---------- time of birth ---------- */

  function validTime(t) {
    return !!t && isInt(t.h) && isInt(t.mi) && isInt(t.s || 0) &&
      t.h >= 0 && t.h <= 23 && t.mi >= 0 && t.mi <= 59 && (t.s || 0) >= 0 && (t.s || 0) <= 59;
  }

  function parseTime(str) {
    var m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(String(str || '').trim());
    if (!m) return null;
    var t = { h: +m[1], mi: +m[2], s: m[3] ? +m[3] : 0 };
    return validTime(t) ? t : null;
  }

  /** Offset (minutes, east of UTC) of an IANA zone at a UTC instant. 'UTC' or '' → 0. */
  function zoneOffsetMinutes(zone, utcMs) {
    if (!zone || zone === 'UTC') return 0;
    var f = new Intl.DateTimeFormat('en-US', {
      timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric', era: 'short'
    });
    var p = {};
    f.formatToParts(new Date(utcMs)).forEach(function (x) { p[x.type] = x.value; });
    var y = +p.year; if (p.era === 'BC' || p.era === 'B') y = 1 - y;
    var wall = toDayNumber({ y: y, m: +p.month, d: +p.day }) * 86400000 +
      ((+p.hour % 24) * 3600 + +p.minute * 60 + +p.second) * 1000;
    return Math.round((wall - Math.floor(utcMs / 1000) * 1000) / 60000);
  }

  /**
   * Convert a wall-clock time in `zone` to a UTC instant (ms).
   * Times skipped by a DST jump resolve forward; repeated times take the earlier instant.
   */
  function zonedToUtc(dt, t, zone) {
    var wall = toDayNumber(dt) * 86400000 + (t.h * 3600 + t.mi * 60 + (t.s || 0)) * 1000;
    var before = zoneOffsetMinutes(zone, wall - 86400000), after = zoneOffsetMinutes(zone, wall + 86400000);
    var valid = [before, after].map(function (o) { return wall - o * 60000; })
      .filter(function (c) { return wall - zoneOffsetMinutes(zone, c) * 60000 === c; });
    if (valid.length) return Math.min.apply(null, valid);      // repeated hour → earlier instant
    return wall - before * 60000;                               // skipped hour → shift forward
  }

  /**
   * Exact duration from a birth date+time to a target date+time.
   * Calendar part (Y/M/D + h:m:s) is measured on the wall clock of each place;
   * elapsed totals use real UTC instants, so DST and zone differences are included.
   */
  function calculateExactDurationWithTime(birth, birthTime, target, targetTime, birthZone, targetZone, rule) {
    if (!isValidDate(birth) || !isValidDate(target)) return fail('invalid');
    if (!validTime(birthTime) || !validTime(targetTime)) return fail('invalid-time');
    var b = zonedToUtc(birth, birthTime, birthZone), t = zonedToUtc(target, targetTime, targetZone);
    if (!isFinite(b) || !isFinite(t)) return fail('invalid');
    if (t < b) return fail('before-birth');
    var bSec = birthTime.h * 3600 + birthTime.mi * 60 + (birthTime.s || 0);
    var tSec = targetTime.h * 3600 + targetTime.mi * 60 + (targetTime.s || 0);
    var dayTarget = target, rem = tSec - bSec;
    if (rem < 0) { dayTarget = addDays(target, -1); rem += 86400; }
    var cal = compareDates(dayTarget, birth) >= 0 ? calculateCalendarAge(birth, dayTarget, rule) : { ok: true, years: 0, months: 0, days: 0 };
    var secs = Math.floor((t - b) / 1000);
    return {
      ok: true,
      years: cal.years, months: cal.months, days: cal.days,
      hours: Math.floor(rem / 3600), minutes: Math.floor(rem % 3600 / 60), seconds: rem % 60,
      totalSeconds: secs,
      totalMinutes: Math.floor(secs / 60),
      totalHours: Math.floor(secs / 3600),
      totalDays: Math.floor(secs / 86400),
      totalWeeks: Math.floor(secs / 604800)
    };
  }

  return {
    MIN_YEAR: MIN_YEAR, MAX_YEAR: MAX_YEAR, WEEKDAYS: WEEKDAYS, MONTHS: MONTHS,
    isLeapYear: isLeapYear, daysInMonth: daysInMonth, isValidDate: isValidDate,
    toDayNumber: toDayNumber, fromDayNumber: fromDayNumber, compareDates: compareDates,
    addDays: addDays, addMonths: addMonths, addYears: addYears,
    weekdayIndex: weekdayIndex, dayOfYear: dayOfYear, isoWeek: isoWeek,
    parseDate: parseDate, parseTime: parseTime, toISO: toISO, formatShort: formatShort, formatLong: formatLong,
    calculateCalendarAge: calculateCalendarAge,
    calculateTotalDays: calculateTotalDays, calculateTotalWeeks: calculateTotalWeeks,
    calculateTotalMonths: calculateTotalMonths, calculateTotalHours: calculateTotalHours,
    calculateTotalMinutes: calculateTotalMinutes, calculateTotalSeconds: calculateTotalSeconds,
    calculateNextBirthday: calculateNextBirthday, calculateBirthWeekday: calculateBirthWeekday,
    calculateMilestones: calculateMilestones, calculateAgeAtDate: calculateAgeAtDate,
    calculateExactDurationWithTime: calculateExactDurationWithTime,
    zonedToUtc: zonedToUtc, zoneOffsetMinutes: zoneOffsetMinutes
  };
});
