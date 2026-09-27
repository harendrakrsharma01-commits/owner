"""Generate independent reference positions with Swiss Ephemeris (pyswisseph, Moshier mode).

Test-only tool: it is never deployed and Swiss Ephemeris code is not shipped with the site.
Run:  pip install pyswisseph==2.10.3.2 && python3 tests/fixtures/generate-d9-swisseph.py > tests/fixtures/d9-swisseph.json
"""
import json, random
import swisseph as swe

swe.set_sid_mode(swe.SIDM_LAHIRI)
FLAGS = swe.FLG_MOSEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
BODIES = [('Sun', swe.SUN), ('Moon', swe.MOON), ('Mars', swe.MARS), ('Mercury', swe.MERCURY),
          ('Jupiter', swe.JUPITER), ('Venus', swe.VENUS), ('Saturn', swe.SATURN), ('Rahu', swe.MEAN_NODE)]
rng = random.Random(9)
cases = [
    # Fixed, human-checkable cases (UTC instants)
    (2000, 1, 1, 12, 0, 0, 28.6139, 77.2090),
    (1990, 6, 15, 4, 30, 0, 19.0760, 72.8777),
    (1984, 2, 29, 23, 59, 0, 51.5074, -0.1278),
    (1947, 8, 14, 18, 30, 0, 28.6139, 77.2090),
    (2024, 3, 10, 7, 0, 0, 40.7128, -74.0060),
    (1900, 1, 1, 0, 0, 0, 13.0827, 80.2707),
    (2050, 12, 31, 12, 0, 0, -33.8688, 151.2093),
]
for _ in range(60):
    cases.append((rng.randint(1850, 2090), rng.randint(1, 12), rng.randint(1, 28), rng.randint(0, 23),
                  rng.randint(0, 59), rng.randint(0, 59), round(rng.uniform(-60, 60), 4), round(rng.uniform(-180, 180), 4)))
out = []
for (y, mo, d, h, mi, s, lat, lon) in cases:
    jd = swe.julday(y, mo, d, h + mi / 60 + s / 3600)
    row = {'utc': '%04d-%02d-%02dT%02d:%02d:%02dZ' % (y, mo, d, h, mi, s), 'lat': lat, 'lon': lon, 'bodies': {}}
    for name, b in BODIES:
        xx = swe.calc_ut(jd, b, FLAGS)[0]
        row['bodies'][name] = {'lon': xx[0], 'speed': xx[3]}
    cusps, ascmc = swe.houses_ex(jd, lat, lon, b'W', swe.FLG_SIDEREAL)
    row['bodies']['Ascendant'] = {'lon': ascmc[0]}
    row['ayanamsha'] = swe.get_ayanamsa_ut(jd)
    out.append(row)
print(json.dumps({'generator': 'pyswisseph ' + swe.version + ' Moshier, SIDM_LAHIRI, mean node', 'cases': out}, indent=1))
