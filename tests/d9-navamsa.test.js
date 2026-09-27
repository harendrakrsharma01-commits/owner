'use strict';
/* Run: node --test tests/d9-navamsa.test.js */
const test = require('node:test');
const assert = require('node:assert/strict');
const N = require('../assets/js/lib/d9-navamsa.js');
const FX = require('./fixtures/d9-swisseph.json');

const S = N.SIGNS;
const idx = (name) => S.indexOf(name);
const mas = (sign, d, m, s, ms) => sign * N.MAS_SIGN + N.dmsToMas(d, m, s, ms);
const BOUNDS = [[0, 0], [3, 20], [6, 40], [10, 0], [13, 20], [16, 40], [20, 0], [23, 20], [26, 40]];

// Independent expectation: the textbook start-sign table, written out by hand (not derived from the engine).
const START = { Aries: 'Aries', Cancer: 'Cancer', Libra: 'Libra', Capricorn: 'Capricorn',
  Taurus: 'Capricorn', Leo: 'Aries', Scorpio: 'Cancer', Aquarius: 'Libra',
  Gemini: 'Libra', Virgo: 'Capricorn', Sagittarius: 'Aries', Pisces: 'Cancer' };
const expected = (sign, part) => (idx(START[S[sign]]) + part) % 12;

/* ---------- 108 mapping cases ---------- */
for (let sign = 0; sign < 12; sign++) {
  for (let part = 0; part < 9; part++) {
    test(`navamsa ${S[sign]} part ${part + 1}`, () => {
      const [d, m] = BOUNDS[part];
      const mid = mas(sign, d, m, 0) + N.MAS_NAVAMSA / 2;
      const r = N.navamsa({ mas: mid });
      assert.equal(r.sign, sign); assert.equal(r.part, part + 1);
      assert.equal(r.d9Sign, expected(sign, part), `${S[sign]} #${part + 1}`);
      assert.equal(r.d9Sign, Math.floor(mid / N.MAS_NAVAMSA) % 12, 'equals floor(lon/3°20′) mod 12');
      assert.equal(r.vargottama, r.d9Sign === sign);
    });
  }
}

/* ---------- exact boundaries: below / at / above, every boundary of every sign ---------- */
test('boundaries: 1 mas below stays, exact boundary and 1 mas above move to next part (12 × 10 boundaries)', () => {
  let n = 0;
  for (let sign = 0; sign < 12; sign++) {
    for (let b = 0; b <= 9; b++) {
      const at = sign * N.MAS_SIGN + b * N.MAS_NAVAMSA;      // b = 9 is 30° = next sign 0°
      const below = N.navamsa({ mas: at - 1 }), exact = N.navamsa({ mas: at }), above = N.navamsa({ mas: at + 1 });
      const absAt = ((sign * 9 + b) % 108);
      assert.equal(exact.absoluteIndex, absAt); assert.equal(above.absoluteIndex, absAt);
      assert.equal(below.absoluteIndex, (absAt + 107) % 108);
      assert.equal(exact.d9Sign, absAt % 12); assert.equal(below.d9Sign, (absAt + 107) % 12);
      n++;
    }
  }
  assert.equal(n, 120);
});

test('degree inputs at textbook boundaries do not suffer float error', () => {
  const cases = [[10 / 3, 1], [20 / 3, 2], [10, 3], [40 / 3, 4], [50 / 3, 5], [20, 6], [70 / 3, 7], [80 / 3, 8]];
  for (const [deg, part] of cases) {
    assert.equal(N.navamsa(deg).part, part + 1, `${deg}° → part ${part + 1}`);
    assert.equal(N.navamsa(deg - 1 / 3600000).part, part, `just below ${deg}°`);
    assert.equal(N.navamsa(deg + 1 / 3600000).part, part + 1, `just above ${deg}°`);
  }
  assert.equal(N.navamsa(3.3333333333333335).d9Sign, idx('Taurus'));
  assert.equal(N.navamsa(3.333333333333333).d9Sign, idx('Taurus')); // rounds to exactly 3°20′
  assert.equal(N.navamsa(3.3333).d9Sign, idx('Aries'));
  assert.equal(N.navamsa(30).sign, idx('Taurus')); assert.equal(N.navamsa(30).d9Sign, idx('Capricorn'));
  assert.equal(N.navamsa(29.999999).d9Sign, idx('Sagittarius'));
  assert.equal(N.navamsa(360).d9Sign, idx('Aries')); assert.equal(N.navamsa(-0.5).sign, idx('Pisces'));
  assert.equal(N.navamsa(359.9999).d9Sign, idx('Pisces')); assert.equal(N.navamsa(359.9999999).d9Sign, idx('Aries'));
});

test('three modalities: named examples', () => {
  assert.equal(N.navamsa(1).d9Sign, idx('Aries'));                 // movable: starts from itself
  assert.equal(N.navamsa(30 + 1).d9Sign, idx('Capricorn'));        // fixed: 9th from Taurus
  assert.equal(N.navamsa(60 + 1).d9Sign, idx('Libra'));            // dual: 5th from Gemini
  assert.equal(N.navamsa(120 + 17.75).d9Sign, idx('Virgo'));       // article worked example 17°45′ Leo
  assert.equal(N.formatDms(N.navamsa(120 + 17.75).d9InSignMas), '9°45′00″');
  assert.deepEqual([0, 1, 2, 3].map(N.modality), [0, 1, 2, 0]);
});

test('vargottama zones are exactly the 1st/5th/9th parts of movable/fixed/dual signs', () => {
  for (let a = 0; a < 108; a++) {
    const r = N.navamsa({ mas: a * N.MAS_NAVAMSA + 5 });
    const want = [0, 4, 8][N.modality(r.sign)] === r.part - 1;
    assert.equal(r.vargottama, want, `navamsa ${a}`);
  }
  assert.equal(Array.from({ length: 108 }, (_, a) => N.navamsa({ mas: a * N.MAS_NAVAMSA }).vargottama).filter(Boolean).length, 12);
});

test('D9 position = offset in part × 9, and is always within 0–30°', () => {
  assert.equal(N.navamsa(0).d9InSignMas, 0);
  assert.equal(N.navamsa({ mas: N.MAS_NAVAMSA - 1 }).d9InSignMas, N.MAS_SIGN - 9);
  assert.equal(N.formatDms(N.navamsa(1 + 40 / 60).d9InSignMas), '15°00′00″');
});

test('nakshatra / pada', () => {
  assert.deepEqual(N.nakshatra(0), { index: 0, name: 'Ashwini', pada: 1 });
  assert.deepEqual(N.nakshatra(13 + 20 / 60), { index: 1, name: 'Bharani', pada: 1 });
  assert.equal(N.nakshatra(13 + 19 / 60).pada, 4);
  assert.equal(N.nakshatra(359.99).name, 'Revati'); assert.equal(N.nakshatra(359.99).pada, 4);
  assert.equal(N.nakshatra(180).name, 'Chitra'); assert.equal(N.nakshatra(180).pada, 3); // Spica ≈ 0° Libra in Lahiri
});

test('whole-sign houses', () => {
  assert.equal(N.wholeSignHouse(idx('Libra'), idx('Aries')), 7);
  assert.equal(N.wholeSignHouse(idx('Aries'), idx('Pisces')), 2);
  assert.equal(N.wholeSignHouse(idx('Pisces'), idx('Pisces')), 1);
  assert.equal(N.wholeSignHouse(idx('Aquarius'), idx('Pisces')), 12);
});

test('formatDms truncates, never rounds into the next sign', () => {
  assert.equal(N.formatDms(N.MAS_SIGN - 1), '29°59′59″');
  assert.equal(N.formatDms(N.dmsToMas(3, 20, 0)), '3°20′00″');
});

/* ---------- planets vs Swiss Ephemeris ---------- */
const TOL = { Sun: 10, Moon: 60, Mercury: 20, Venus: 20, Mars: 20, Jupiter: 20, Saturn: 20, Rahu: 2, Ketu: 2, Ascendant: 10 }; // arcsec
test(`Swiss Ephemeris cross-check: ${FX.cases.length} charts × 10 points (longitude, D9 sign, D9 house, Vargottama)`, () => {
  let checked = 0;
  for (const c of FX.cases) {
    const r = N.calculateChart({ utcMs: Date.parse(c.utc), lat: c.lat, lon: c.lon });
    assert.ok(r.ok, c.utc);
    const refLon = (k) => k === 'Ketu' ? (c.bodies.Rahu.lon + 180) % 360 : c.bodies[k].lon;
    const refLagnaD9 = N.navamsa(refLon('Ascendant')).d9Sign;
    for (const p of [r.lagna, ...r.planets]) {
      const ref = refLon(p.key);
      let d = Math.abs(p.longitude - ref); d = Math.min(d, 360 - d) * 3600;
      assert.ok(d < TOL[p.key], `${c.utc} ${p.key}: ${d.toFixed(2)}″`);
      const nv = N.navamsa(ref);
      assert.equal(p.d9Sign, nv.d9Sign, `${c.utc} ${p.key} D9 sign`);
      assert.equal(p.vargottama, nv.vargottama, `${c.utc} ${p.key} vargottama`);
      assert.equal(p.d9House || 1, N.wholeSignHouse(nv.d9Sign, refLagnaD9), `${c.utc} ${p.key} D9 house`);
      if (c.bodies[p.key] && c.bodies[p.key].speed !== undefined && p.key !== 'Rahu') assert.equal(p.retrograde, c.bodies[p.key].speed < 0, `${c.utc} ${p.key} retro`);
      checked++;
    }
    let da = Math.abs(r.ayanamsha.meanDeg - c.ayanamsha) * 3600;
    assert.ok(da < 0.5, `ayanamsha ${da}″`);
  }
  assert.equal(checked, FX.cases.length * 10);
});

test('Ketu is exactly opposite Rahu; Rahu/Ketu always retrograde', () => {
  const r = N.calculateChart({ utcMs: Date.parse('1990-06-15T04:30:00Z'), lat: 19.076, lon: 72.8777 });
  const ra = r.planets.find((p) => p.key === 'Rahu'), ke = r.planets.find((p) => p.key === 'Ketu');
  assert.equal((ke.mas - ra.mas + 360 * N.MAS_PER_DEG) % (360 * N.MAS_PER_DEG), 180 * N.MAS_PER_DEG);
  assert.ok(ra.retrograde && ke.retrograde);
  assert.equal(r.planets.length, 9);
  assert.deepEqual(r.planets.map((p) => p.key), ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']);
});

test('chart fields are finite and consistent', () => {
  const r = N.calculateChart({ utcMs: Date.parse('2000-01-01T06:30:00Z'), lat: 28.61, lon: 77.21 });
  for (const p of [r.lagna, ...r.planets]) {
    for (const k of ['longitude', 'd1Sign', 'd9Sign', 'd1House', 'd9House', 'pada']) assert.ok(Number.isFinite(p[k]), `${p.key}.${k}`);
    assert.ok(p.d9House >= 1 && p.d9House <= 12);
    assert.equal(p.d9House, N.wholeSignHouse(p.d9Sign, r.d9Lagna.sign));
    assert.ok(!/NaN|undefined/.test(p.d1Dms + p.d9Dms));
  }
  assert.ok(/^Lahiri/.test(r.ayanamsha.name));
  assert.equal(r.version, 'd9-1.0.0');
  assert.ok(r.vargottama.every((k) => typeof k === 'string'));
  assert.ok(S.includes(r.karakamsha.name));
});

test('karakamsha: Atmakaraka is the Sun..Saturn planet with the highest degree in sign', () => {
  const r = N.calculateChart({ utcMs: Date.parse('1984-02-29T23:59:00Z'), lat: 51.5074, lon: -0.1278 });
  const seven = r.planets.slice(0, 7);
  const max = seven.reduce((a, b) => (b.d1InSignMas > a.d1InSignMas ? b : a));
  assert.equal(r.karakamsha.atmakaraka, max.key); assert.equal(r.karakamsha.sign, max.d9Sign);
});

test('ayanamsha known value: Lahiri at J2000 = Swiss Ephemeris 23.857092° (to < 0.01″)', () => {
  const t = N._internal.astroTime(Date.parse('2000-01-01T12:00:00Z'));
  assert.ok(Math.abs(N.lahiriAyanamsha(t).mean - 23.8570924) * 3600 < 0.01);
});

/* ---------- input validation ---------- */
test('invalid inputs are rejected, never NaN', () => {
  const t = Date.parse('2000-01-01T00:00:00Z');
  assert.equal(N.calculateChart({ utcMs: NaN, lat: 0, lon: 0 }).error, 'time');
  assert.equal(N.calculateChart({ utcMs: t, lat: 91, lon: 0 }).error, 'lat');
  assert.equal(N.calculateChart({ utcMs: t, lat: 10, lon: 181 }).error, 'lon');
  assert.equal(N.calculateChart({ utcMs: t, lat: 70, lon: 10 }).error, 'polar');
  assert.equal(N.calculateChart({ utcMs: Date.parse('1700-01-01T00:00:00Z'), lat: 10, lon: 10 }).error, 'range');
  assert.equal(N.calculateChart({ utcMs: Date.parse('2150-01-01T00:00:00Z'), lat: 10, lon: 10 }).error, 'range');
  assert.throws(() => N.toMas(NaN));
  assert.equal(N.validDate(2023, 2, 29), false); assert.equal(N.validDate(2024, 2, 29), true);
  assert.equal(N.validDate(1900, 2, 29), false); assert.equal(N.validDate(2000, 2, 29), true);
  assert.equal(N.validDate(2024, 13, 1), false); assert.equal(N.validDate(2024, 4, 31), false);
  assert.equal(N.isValidZone('Asia/Kolkata'), true); assert.equal(N.isValidZone('Mars/Olympus'), false);
  assert.equal(N.isValidZone('UTC+05:30'), true); assert.equal(N.isValidZone('UTC+15:00'), false);
});

/* ---------- birth time → UTC ---------- */
const utc = (p, z) => { const r = N.localToUtc(p, z); return r.status === 'nonexistent' ? r.status : new Date(r.utcMs).toISOString(); };
test('time zones: India, midnight, noon, 23:59', () => {
  assert.equal(utc({ y: 2000, m: 1, d: 1, h: 0, mi: 0 }, 'Asia/Kolkata'), '1999-12-31T18:30:00.000Z');
  assert.equal(utc({ y: 2000, m: 1, d: 1, h: 12, mi: 0 }, 'Asia/Kolkata'), '2000-01-01T06:30:00.000Z');
  assert.equal(utc({ y: 2000, m: 1, d: 1, h: 23, mi: 59 }, 'Asia/Kolkata'), '2000-01-01T18:29:00.000Z');
  assert.equal(utc({ y: 2020, m: 6, d: 1, h: 10, mi: 0 }, 'Asia/Kathmandu'), '2020-06-01T04:15:00.000Z');
});
test('time zones: DST summer vs winter (New York, London, Sydney)', () => {
  assert.equal(utc({ y: 2024, m: 7, d: 4, h: 12, mi: 0 }, 'America/New_York'), '2024-07-04T16:00:00.000Z');
  assert.equal(utc({ y: 2024, m: 1, d: 4, h: 12, mi: 0 }, 'America/New_York'), '2024-01-04T17:00:00.000Z');
  assert.equal(utc({ y: 2024, m: 7, d: 1, h: 9, mi: 0 }, 'Europe/London'), '2024-07-01T08:00:00.000Z');
  assert.equal(utc({ y: 2024, m: 1, d: 15, h: 9, mi: 0 }, 'Australia/Sydney'), '2024-01-14T22:00:00.000Z');
});
test('time zones: spring-forward gap is reported, fall-back overlap gives two candidates', () => {
  assert.equal(N.localToUtc({ y: 2024, m: 3, d: 10, h: 2, mi: 30 }, 'America/New_York').status, 'nonexistent');
  const amb = N.localToUtc({ y: 2024, m: 11, d: 3, h: 1, mi: 30 }, 'America/New_York');
  assert.equal(amb.status, 'ambiguous');
  assert.deepEqual(amb.candidates.map((c) => new Date(c).toISOString()), ['2024-11-03T05:30:00.000Z', '2024-11-03T06:30:00.000Z']);
});
test('time zones: leap day, historical dates and fixed offsets', () => {
  assert.equal(utc({ y: 2024, m: 2, d: 29, h: 6, mi: 0 }, 'Asia/Kolkata'), '2024-02-29T00:30:00.000Z');
  assert.equal(utc({ y: 1947, m: 8, d: 15, h: 0, mi: 0 }, 'Asia/Kolkata'), '1947-08-14T18:30:00.000Z');
  // India used +06:30 war time in 1942–45 per the IANA database
  assert.equal(utc({ y: 1943, m: 6, d: 1, h: 12, mi: 0 }, 'Asia/Kolkata'), '1943-06-01T05:30:00.000Z');
  assert.equal(utc({ y: 1990, m: 5, d: 1, h: 12, mi: 0 }, 'UTC+05:30'), '1990-05-01T06:30:00.000Z');
  assert.equal(utc({ y: 1990, m: 5, d: 1, h: 12, mi: 0 }, 'UTC-03:30'), '1990-05-01T15:30:00.000Z');
  assert.equal(N.formatOffset(19800), 'UTC+05:30'); assert.equal(N.formatOffset(-12600), 'UTC−03:30');
});
test('same city, different time → different Ascendant; different city, same instant → different Ascendant', () => {
  const t = Date.parse('1990-06-15T04:30:00Z');
  const a = N.calculateChart({ utcMs: t, lat: 19.08, lon: 72.88 });
  const b = N.calculateChart({ utcMs: t + 2 * 3600000, lat: 19.08, lon: 72.88 });
  const c = N.calculateChart({ utcMs: t, lat: 51.51, lon: -0.13 });
  assert.notEqual(a.lagna.mas, b.lagna.mas); assert.notEqual(a.lagna.d1Sign, c.lagna.d1Sign);
  assert.equal(a.planets[0].d1Sign, c.planets[0].d1Sign); // same instant → same Sun
});
