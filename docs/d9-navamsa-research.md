# D9 / Navamsa Chart Calculator — research, keyword map and coverage audit

Research date: 27 September 2026. Sources: live web-search results (SERP titles and snippets). Competitor pages
(desiutils.in, kundligpt.com and others) were blocked by the build environment's egress proxy, so their features were
assessed from SERP snippets only. No keyword-volume, CPC or difficulty data was used; none is claimed.

## Architecture decision

| URL | Status | Why |
|---|---|---|
| `/d9-chart-calculator/` | **new, only page** | All D9 / Navamsa / Navamsa-for-marriage / Vargottama / Navamsa-Lagna queries share one calculation and one SERP cluster. |
| `/navamsa-chart-calculator/`, `/navamsa-d9-calculator/` | **not built** | They would duplicate the same calculation (doorway pages). The terms are covered in the title, meta, intro and FAQ. |
| Country pages (IN/US/UK/CA/AU/NZ) | **not built** | The maths is identical, and there is no country-specific intent beyond terminology. Indian terms (kundli, Navmansh, North/South style) are covered in the article. |
| Hindi page | **not built** | Hindi SERP demand exists (InstaAstro /hi/, Ishvaram /hi/, astrologylover hindi), but the site has no i18n architecture and machine translation was ruled out. Flagged as a future page. |

## Engine decision

The repo had no astrology or ephemeris engine (only the Age/DOB family), so there was nothing to reuse. Swiss Ephemeris is
AGPL/commercial and would need WASM or a server. Instead we use **Astronomy Engine 2.1.19 (MIT)**, vendored and loaded
only on this page, and verify it against **pyswisseph 2.10.03** (test-time only, `tests/fixtures/generate-d9-swisseph.py`).
Result over 67 charts from 1861 to 2084: 0 D9 sign differences. The Lahiri ayanamsha matches Swiss Ephemeris to < 0.3″.

## Keyword → handler map

| Cluster | Keywords | Handled by |
|---|---|---|
| Core | d9 chart calculator, d9 calculator, navamsa (chart) calculator, navamsa d9 / d9 navamsa calculator, free … | Title, H1, meta, intro |
| Birth data | …by date of birth, birth date time place, exact birth time, birth details | Form, "Why exact birth time matters", FAQ |
| Marriage | d9/navamsa for marriage, D9 marriage/spouse calculator | "Marriage and partnership reading points" in the result (deterministic), article section, FAQ. No predictions. |
| Planets | d9 planet calculator/placement, navamsa lagna / d9 ascendant calculator, vargottama calculator | Result: D9 Ascendant header, table, Vargottama section, filter |
| D1/D9 | D1 D9 calculator, rashi and navamsa, compare D1 and D9 | D1/D9 chart toggle, comparison table, article |
| Advanced | Lahiri, sidereal, Swiss Ephemeris, Rahu Ketu, houses, degrees, nakshatra pada | Methodology table, provenance, table columns (D9 position, nakshatra/pada), whole-sign houses. Swiss Ephemeris is used for verification and stated as such. |
| Interpretation | what is d9/navamsa, how to read, meaning, what d9 shows, vargottama meaning | Article + FAQ, framed as tradition |
| India | d9 kundli, navamsa kundli, navmansh | India terms section; North + South Indian chart styles; Indian cities first in the place list |
| Karakamsha | karakamsha | Advanced interpretation block (7-karaka scheme, stated) |
| Excluded | navamsa calculator Hindi (page), other ayanamshas, true node, D10/D60 | Not verified or out of scope; documented under Limitations |

## People Also Ask / question map (all → FAQ on the main page)

What is a D9 chart · What is a Navamsa chart · How is D9 calculated · D1 vs D9 · Why birth time matters ·
What is Navamsa Lagna · What is Vargottama · Is D9 used for marriage · What does Navamsa show · Which ayanamsha ·
What is Lahiri · D9 without birth time · Can minutes change Navamsa (SERP snippets claim "13–14 minutes" or "5 minutes";
we deliberately give no fixed number) · Nine divisions · 3°20′ · How to read D9 · Compare D1/D9 · D9 vs birth chart ·
Is Navamsa scientific.

## Competitors (from SERP snippets)

DesiUtils (browser-side, Lahiri within 12″ of Swiss Ephemeris, birth-time confidence check, N/S charts), KundliGPT
(in-browser, vargottama), Deluxe Astrology (JPL DE431), Muhuratam, Steer, Jagannath Hora site (Lahiri, whole-sign),
AppliedJyotish (PDF report), Mahadasha, InstaAstro, AstroRishis, AstrologyM, Astro-Seek (9th harmonic).
Ganapati, CalcoTools, Vedara, Parasara, JatinScience, YesAstrology and Astroly were searched for but did not surface in
the checked SERPs, and their pages could not be fetched.

Gaps we implemented: ±5-minute boundary sensitivity (†), whole-day placements for unknown time, provenance with UTC/ΔT/JD,
DST gap/overlap handling, a fixed-offset zone option, D1/D9 chart toggle, Vargottama filter with reasons, an accessible
table as the primary fallback, and privacy (no network calls, no birth data in URLs).

## Country notes

India is the primary market (kundli terminology, North/South styles, IST, DD/MM dates via the native date picker).
US/UK/CA/AU/NZ intent is the same English query set with diaspora and Western-astrology crossover ("Vedic Navamsa", "9th
harmonic"). Covered by the article, and major cities in each country are in the place list.
