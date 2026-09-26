'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const A = require('../assets/js/lib/age-dob.js');

const D = (s) => { const [y, m, d] = s.split('-').map(Number); return { y, m, d }; };
const age = (b, t, rule) => { const r = A.calculateCalendarAge(D(b), D(t), rule); return r.ok ? [r.years, r.months, r.days] : r.error; };
const T = (s) => A.parseTime(s);

test('same DOB and target → 0/0/0 and zero totals', () => {
  assert.deepEqual(age('2000-09-24', '2000-09-24'), [0, 0, 0]);
  const r = A.calculateAgeAtDate(D('2000-09-24'), D('2000-09-24'));
  assert.equal(r.totals.days, 0); assert.equal(r.totals.seconds, 0);
});
test('one day old', () => assert.deepEqual(age('2026-09-25', '2026-09-26'), [0, 0, 1]));
test('one month old', () => assert.deepEqual(age('2026-08-26', '2026-09-26'), [0, 1, 0]));
test('one year old', () => assert.deepEqual(age('2025-09-26', '2026-09-26'), [1, 0, 0]));
test('birthday today / tomorrow / yesterday', () => {
  assert.deepEqual(age('1990-09-26', '2026-09-26'), [36, 0, 0]);
  assert.deepEqual(age('1990-09-27', '2026-09-26'), [35, 11, 30]);
  assert.deepEqual(age('1990-09-25', '2026-09-26'), [36, 0, 1]);
  const nb = A.calculateNextBirthday(D('1990-09-26'), D('2026-09-26'));
  assert.equal(nb.isToday, true); assert.equal(A.toISO(nb.next), '2027-09-26'); assert.equal(nb.daysUntil, 365);
  const tm = A.calculateNextBirthday(D('1990-09-27'), D('2026-09-26'));
  assert.equal(tm.daysUntil, 1); assert.equal(tm.turning, 36); assert.equal(tm.isToday, false);
  const yd = A.calculateNextBirthday(D('1990-09-25'), D('2026-09-26'));
  assert.equal(yd.daysUntil, 364); assert.equal(A.toISO(yd.previous), '2026-09-25');
});
test('common reference ages', () => {
  assert.deepEqual(age('2000-09-24', '2026-09-26'), [26, 0, 2]);
  assert.deepEqual(age('1990-01-15', '2026-09-26'), [36, 8, 11]);
  assert.deepEqual(age('1985-12-31', '2026-01-01'), [40, 0, 1]);
});
test('leap-year awareness in totals', () => {
  assert.equal(A.calculateTotalDays(D('2024-01-01'), D('2025-01-01')), 366);
  assert.equal(A.calculateTotalDays(D('2023-01-01'), D('2024-01-01')), 365);
  assert.equal(A.calculateTotalDays(D('1900-01-01'), D('2000-01-01')), 36524); // 1900 not leap, 2000 leap
  assert.equal(A.isLeapYear(1900), false); assert.equal(A.isLeapYear(2000), true); assert.equal(A.isLeapYear(2100), false);
});
test('Feb 29 DOB, non-leap target: default clamp → Feb 28', () => {
  assert.deepEqual(age('2004-02-29', '2025-02-28'), [21, 0, 0]);
  assert.deepEqual(age('2004-02-29', '2025-02-27'), [20, 11, 29]);
  assert.deepEqual(age('2004-02-29', '2025-03-01'), [21, 0, 1]);
  assert.deepEqual(age('2004-02-29', '2028-02-29'), [24, 0, 0]);
  const nb = A.calculateNextBirthday(D('2004-02-29'), D('2026-09-26'));
  assert.equal(A.toISO(nb.next), '2027-02-28'); assert.equal(nb.observed, true); assert.equal(nb.turning, 23);
});
test('Feb 29 DOB, rollover convention → Mar 1', () => {
  assert.deepEqual(age('2004-02-29', '2025-02-28', 'rollover'), [20, 11, 30]);
  assert.deepEqual(age('2004-02-29', '2025-03-01', 'rollover'), [21, 0, 0]);
  const nb = A.calculateNextBirthday(D('2004-02-29'), D('2026-09-26'), 'rollover');
  assert.equal(A.toISO(nb.next), '2027-03-01');
  const lp = A.calculateNextBirthday(D('2004-02-29'), D('2027-06-01'), 'rollover');
  assert.equal(A.toISO(lp.next), '2028-02-29'); assert.equal(lp.observed, false);
});
test('the DOB object is never mutated', () => {
  const b = D('2004-02-29'); A.calculateAgeAtDate(b, D('2026-09-26'));
  assert.deepEqual(b, { y: 2004, m: 2, d: 29 });
});
test('month-end: Jan 31 → Feb/Mar', () => {
  assert.deepEqual(age('2025-01-31', '2025-02-27'), [0, 0, 27]);
  assert.deepEqual(age('2025-01-31', '2025-02-28'), [0, 1, 0]);
  assert.deepEqual(age('2025-01-31', '2025-03-01'), [0, 1, 1]);
  assert.deepEqual(age('2025-01-31', '2025-03-30'), [0, 1, 30]);
  assert.deepEqual(age('2025-01-31', '2025-03-31'), [0, 2, 0]);
  assert.deepEqual(age('2024-01-31', '2024-02-29'), [0, 1, 0]);
  assert.deepEqual(age('2025-01-31', '2025-02-28', 'rollover'), [0, 0, 28]);
  assert.deepEqual(age('2025-01-31', '2025-03-01', 'rollover'), [0, 1, 0]);
});
test('month-end: Feb 28 / Feb 29 → Mar', () => {
  assert.deepEqual(age('2025-02-28', '2025-03-28'), [0, 1, 0]);
  assert.deepEqual(age('2025-02-28', '2025-03-31'), [0, 1, 3]);
  assert.deepEqual(age('2024-02-29', '2024-03-29'), [0, 1, 0]);
  assert.deepEqual(age('2024-02-29', '2024-03-28'), [0, 0, 28]);
});
test('month-end: Apr 30 → May 31, 30-day months, May 31 → Jun', () => {
  assert.deepEqual(age('2025-04-30', '2025-05-30'), [0, 1, 0]);
  assert.deepEqual(age('2025-04-30', '2025-05-31'), [0, 1, 1]);
  assert.deepEqual(age('2025-06-30', '2025-07-31'), [0, 1, 1]);
  assert.deepEqual(age('2025-09-30', '2025-10-30'), [0, 1, 0]);
  assert.deepEqual(age('2025-11-30', '2026-02-28'), [0, 3, 0]);
  assert.deepEqual(age('2025-05-31', '2025-06-30'), [0, 1, 0]);
  assert.deepEqual(age('2025-05-31', '2025-07-01'), [0, 1, 1]);
  assert.deepEqual(age('2025-05-31', '2025-07-31'), [0, 2, 0]);
});
test('exhaustive: never negative, anchor + days = target, monotone totals', () => {
  const start = A.toDayNumber(D('2023-12-01'));
  for (let i = 0; i < 500; i++) {
    const b = A.fromDayNumber(start + i);
    for (let j = 0; j < 800; j += 7) {
      const t = A.fromDayNumber(start + i + j);
      for (const rule of ['clamp', 'rollover']) {
        const r = A.calculateCalendarAge(b, t, rule);
        assert.ok(r.ok && r.years >= 0 && r.months >= 0 && r.months < 12 && r.days >= 0 && r.days < 31, JSON.stringify([b, t, r]));
        assert.equal(A.toDayNumber(r.anchor) + r.days, A.toDayNumber(t));
      }
    }
  }
});
test('future and past target dates', () => {
  assert.deepEqual(age('2000-09-24', '2040-01-01'), [39, 3, 8]);
  assert.deepEqual(age('1950-06-15', '1969-07-20'), [19, 1, 5]);
});
test('invalid dates and target before DOB are rejected (no NaN)', () => {
  assert.equal(age('2025-02-29', '2026-01-01'), 'invalid');
  assert.equal(age('2025-04-31', '2026-01-01'), 'invalid');
  assert.equal(age('2025-13-01', '2026-01-01'), 'invalid');
  assert.equal(age('2026-09-27', '2026-09-26'), 'before-birth');
  assert.equal(A.calculateTotalDays(D('2026-09-27'), D('2026-09-26')), null);
  assert.equal(A.calculateAgeAtDate(D('2026-09-27'), D('2026-09-26')).ok, false);
  assert.equal(A.calculateNextBirthday(D('2026-09-27'), D('2026-09-26')), null);
});
test('supported year range 0001–9999', () => {
  assert.deepEqual(age('0001-01-01', '9999-12-31'), [9998, 11, 30]);
  assert.equal(A.calculateTotalDays(D('0001-01-01'), D('9999-12-31')), 3652058);
  assert.equal(A.isValidDate(D('0000-12-31')), false);
  assert.equal(A.isValidDate({ y: 10000, m: 1, d: 1 }), false);
  // the next birthday would fall after 9999-12-31, so none is reported
  assert.equal(A.calculateNextBirthday(D('9990-12-31'), D('9999-12-31')), null);
  assert.equal(A.calculateNextBirthday(D('9990-06-01'), D('9999-12-31')), null);
});
test('day-number round trip', () => {
  for (let z = -719162; z < 2932897; z += 997) assert.equal(A.toDayNumber(A.fromDayNumber(z)), z);
  assert.equal(A.toDayNumber(D('1970-01-01')), 0);
});
test('totals: days, weeks, months, hours, minutes, seconds', () => {
  const b = D('2000-09-24'), t = D('2026-09-26');
  assert.equal(A.calculateTotalDays(b, t), 9498);
  assert.deepEqual(A.calculateTotalWeeks(b, t), { weeks: 1356, days: 6 });
  assert.deepEqual(A.calculateTotalMonths(b, t), { months: 312, days: 2 });
  assert.equal(A.calculateTotalHours(b, t), 227952);
  assert.equal(A.calculateTotalMinutes(b, t), 13677120);
  assert.equal(A.calculateTotalSeconds(b, t), 820627200);
  assert.deepEqual(A.calculateTotalWeeks(D('2026-09-20'), D('2026-09-26')), { weeks: 0, days: 6 });
  assert.deepEqual(A.calculateTotalMonths(D('2025-01-31'), D('2025-02-27')), { months: 0, days: 27 });
});
test('weekday, day of year, ISO week', () => {
  assert.equal(A.calculateBirthWeekday(D('2000-09-24')).name, 'Sunday');
  assert.equal(A.calculateBirthWeekday(D('1969-07-20')).name, 'Sunday');
  assert.equal(A.calculateBirthWeekday(D('2024-02-29')).name, 'Thursday');
  assert.equal(A.calculateBirthWeekday(D('0001-01-01')).name, 'Monday');
  const b = A.calculateBirthWeekday(D('2024-12-31'));
  assert.equal(b.dayOfYear, 366); assert.equal(b.isoWeek, 1); assert.equal(b.isoWeekYear, 2025);
  const c = A.calculateBirthWeekday(D('2021-01-03'));
  assert.equal(c.isoWeek, 53); assert.equal(c.isoWeekYear, 2020);
  assert.equal(A.calculateBirthWeekday(D('2026-09-26')).isoWeek, 39);
});
test('milestones', () => {
  const m = A.calculateMilestones(D('2000-09-24'), D('2026-09-26'), [18, 21, 25, 30, 40, 65, 100], [10000], 'clamp');
  assert.equal(m.next.kind, 'days'); assert.equal(A.toISO(m.next.date), '2028-02-10'); assert.equal(m.next.days, 502);
  assert.equal(m.previous.value, 25);
  const ld = A.calculateMilestones(D('2008-02-29'), D('2026-01-01'), [18], [], 'clamp');
  assert.equal(A.toISO(ld.list[0].date), '2026-02-28');
  const ldr = A.calculateMilestones(D('2008-02-29'), D('2026-01-01'), [18], [], 'rollover');
  assert.equal(A.toISO(ldr.list[0].date), '2026-03-01');
  const today = A.calculateMilestones(D('2008-09-26'), D('2026-09-26'), [18], [], 'clamp');
  assert.equal(today.list[0].status, 'today'); assert.equal(today.next.value, 18);
  assert.equal(A.calculateMilestones(D('9990-01-01'), D('9995-01-01'), [18], [], 'clamp').list.length, 0);
});
test('parsing is format-strict and never guesses 04/05/2000', () => {
  assert.equal(A.toISO(A.parseDate('04/05/2000', 'DMY')), '2000-05-04');
  assert.equal(A.toISO(A.parseDate('04/05/2000', 'MDY')), '2000-04-05');
  assert.equal(A.toISO(A.parseDate('2000-05-04', 'MDY')), '2000-05-04');
  assert.equal(A.toISO(A.parseDate('2000/05/04', 'YMD')), '2000-05-04');
  assert.equal(A.parseDate('04/05/00', 'DMY'), null);
  assert.equal(A.parseDate('31/04/2000', 'DMY'), null);
  assert.equal(A.parseDate('13/13/2000', 'MDY'), null);
  assert.equal(A.parseDate('<script>', 'DMY'), null);
  assert.equal(A.parseDate('', 'DMY'), null);
  assert.equal(A.formatShort(D('2000-05-04'), 'DMY'), '04/05/2000');
  assert.equal(A.formatShort(D('2000-05-04'), 'MDY'), '05/04/2000');
  assert.equal(A.formatLong(D('2000-09-24'), true), 'September 24, 2000');
  assert.equal(A.formatLong(D('2000-09-24'), false, true), 'Sunday, 24 September 2000');
});
test('time: parse and validate', () => {
  assert.deepEqual(T('00:00'), { h: 0, mi: 0, s: 0 });
  assert.deepEqual(T('23:59:59'), { h: 23, mi: 59, s: 59 });
  assert.equal(T('24:00'), null); assert.equal(T('12:60'), null); assert.equal(T('noon'), null);
});
test('time: midnight, noon, 23:59:59, same day (UTC)', () => {
  const r = A.calculateExactDurationWithTime(D('2000-01-01'), T('00:00'), D('2000-01-01'), T('12:00'), 'UTC', 'UTC');
  assert.equal(r.totalSeconds, 43200); assert.equal(r.hours, 12); assert.equal(r.days, 0);
  const s = A.calculateExactDurationWithTime(D('2000-01-01'), T('12:00'), D('2000-01-02'), T('11:59:59'), 'UTC', 'UTC');
  assert.equal(s.days, 0); assert.equal(s.hours, 23); assert.equal(s.minutes, 59); assert.equal(s.seconds, 59);
  const e = A.calculateExactDurationWithTime(D('2000-01-01'), T('23:59:59'), D('2001-01-01'), T('23:59:59'), 'UTC', 'UTC');
  assert.equal(e.years, 1); assert.equal(e.totalDays, 366); assert.equal(e.totalSeconds, 366 * 86400);
});
test('time: target before birth time is rejected', () => {
  const r = A.calculateExactDurationWithTime(D('2000-01-01'), T('12:00'), D('2000-01-01'), T('11:59:59'), 'UTC', 'UTC');
  assert.equal(r.ok, false); assert.equal(r.error, 'before-birth');
  assert.equal(A.calculateExactDurationWithTime(D('2000-01-01'), null, D('2001-01-01'), T('00:00'), 'UTC', 'UTC').ok, false);
});
test('time: leap day and future target', () => {
  const r = A.calculateExactDurationWithTime(D('2024-02-29'), T('06:30'), D('2030-01-01'), T('06:30'), 'UTC', 'UTC');
  assert.equal(r.years, 5); assert.equal(r.months, 10); assert.equal(r.days, 3); assert.equal(r.hours, 0);
  assert.equal(r.totalDays, A.calculateTotalDays(D('2024-02-29'), D('2030-01-01')));
});
test('time: DST transitions (America/New_York, Europe/London)', () => {
  // US spring-forward 2026-03-08: 01:00 → 03:00 is only 1 real hour.
  const ny = A.calculateExactDurationWithTime(D('2026-03-08'), T('01:00'), D('2026-03-08'), T('03:00'), 'America/New_York', 'America/New_York');
  assert.equal(ny.totalSeconds, 3600); assert.equal(ny.hours, 2);
  // UK fall-back 2026-10-25: midnight → midnight is 25 real hours.
  const uk = A.calculateExactDurationWithTime(D('2026-10-25'), T('00:00'), D('2026-10-26'), T('00:00'), 'Europe/London', 'Europe/London');
  assert.equal(uk.totalHours, 25); assert.equal(uk.days, 1);
  // skipped wall time 02:30 resolves forward, never NaN
  const gap = A.zonedToUtc(D('2026-03-08'), T('02:30'), 'America/New_York');
  assert.ok(Number.isFinite(gap));
  // different zones: born 10:00 in Kolkata = 04:30 UTC
  assert.equal(A.zonedToUtc(D('2000-01-01'), T('10:00'), 'Asia/Kolkata'), Date.UTC(2000, 0, 1, 4, 30));
  const cross = A.calculateExactDurationWithTime(D('2000-01-01'), T('10:00'), D('2000-01-01'), T('00:00'), 'Asia/Kolkata', 'UTC');
  assert.equal(cross.ok, false); // 00:00 UTC is before 04:30 UTC
});
test('article month-end table stays true under both rules', () => {
  const rows = [
    ['2025-01-31', '2025-02-28', [0, 1, 0], [0, 0, 28]],
    ['2025-01-31', '2025-03-01', [0, 1, 1], [0, 1, 0]],
    ['2025-01-31', '2025-03-31', [0, 2, 0], [0, 2, 0]],
    ['2025-04-30', '2025-05-31', [0, 1, 1], [0, 1, 1]],
    ['2025-05-31', '2025-06-30', [0, 1, 0], [0, 0, 30]],
    ['2025-02-28', '2025-03-31', [0, 1, 3], [0, 1, 3]],
  ];
  for (const [b, t, clamp, roll] of rows) {
    assert.deepEqual(age(b, t, 'clamp'), clamp, b + '→' + t);
    assert.deepEqual(age(b, t, 'rollover'), roll, b + '→' + t);
    assert.equal(A.calculateTotalDays(D(b), D(t)), A.calculateAgeAtDate(D(b), D(t), { rule: 'rollover' }).totals.days);
  }
});
test('article worked examples', () => {
  const r = A.calculateAgeAtDate(D('2000-09-24'), D('2026-09-26'));
  assert.equal(r.totals.weeks, 1356); assert.equal(r.totals.weeksRemDays, 6); assert.equal(r.totals.months, 312);
  assert.equal(A.toISO(r.birthday.next), '2027-09-24'); assert.equal(r.birthday.weekday, 'Friday'); assert.equal(r.birthday.daysUntil, 363);
  assert.deepEqual(age('2008-03-15', '2026-06-01'), [18, 2, 17]);
  assert.equal(A.toISO(A.addDays(D('1990-01-15'), 10000)), '2017-06-02');
  assert.equal(A.toISO(A.addDays(D('1990-01-15'), 20000)), '2044-10-18');
  const t = A.calculateExactDurationWithTime(D('2000-09-24'), T('14:30'), D('2026-09-26'), T('09:00'), 'Asia/Kolkata', 'Asia/Kolkata');
  assert.deepEqual([t.years, t.months, t.days, t.hours, t.minutes, t.totalHours], [26, 0, 1, 18, 30, 227946]);
});
