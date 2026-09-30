# Anganwadi salary calculator — data, sources and keyword notes

Research date: 30 September 2026. Figures come from web-search results (news reports, All India Radio,
Rajya Sabha answers). Most publisher pages could not be opened from the build environment (egress
blocked), so each figure was accepted only when the same number appeared in the search summaries of at
least one national/official outlet. No government order (GO) PDF was read directly — re-check against
the state WCD order before relying on any figure.

## Central scheme (applies to every state)

| Item | Value | Source |
|---|---|---|
| Norm, Anganwadi worker (main AWC) | ₹4,500 / month since 1 Oct 2018 | Rajya Sabha PQ 11 Dec 2024; PIB Feb 2024 |
| Norm, mini-AWC worker | ₹3,500 | same |
| Norm, helper | ₹2,250 | same |
| Performance-linked incentive | ₹500 worker, ₹250 helper | same |
| Cost sharing | 60:40 states & UTs with legislature; 90:10 NE & Himalayan states incl. J&K; 100:0 UTs without legislature | same |

The calculator's "centre share" = norm × ratio (+ incentive × ratio); "state share" = the rest. This is
an estimate from the scheme rule, labelled as such on the page.

## States

| State | Worker | Mini | Helper | Effective | Status / source |
|---|---|---|---|---|---|
| Uttar Pradesh | ₹12,000 (was 8,000) | not confirmed | ₹6,000 (was 4,000) | Sep 2026, paid Oct 2026 | confirmed — AIR 9 Sep 2026, Prabhat Khabar, ThePrint |
| Bihar | ₹9,000 (was 7,000) | not confirmed | ₹4,500 (was 4,000) | 1 Oct 2025 | confirmed — AIR 8–9 Sep 2025, Scroll |
| Madhya Pradesh | ₹13,000 (was 10,000) | ₹6,500 (was 3,500) | ₹6,500 (was 5,000) | 1 Jul 2023 | confirmed for 2023 — Patrika, ETV Bharat; later changes not found |
| Haryana | ₹13,250 (≤10 yrs, was 12,500); ₹14,750 (>10 yrs, was 14,000) | not confirmed after 2024 | ₹7,900 (was 7,500) | 16 Aug 2024 | confirmed — The Haryana Story; Nov 2023 base in Business Standard / Tribune |
| Jharkhand | ₹9,500 | ₹9,500 | ₹4,750 | Aug 2022 cabinet | confirmed — ETV Bharat, Prabhat Khabar; same figures in 2025 reports |
| Gujarat | ₹10,000 | not confirmed | ₹5,500 | — | from Sep 2026 recruitment notice summaries (FreeJobAlert, MaruGujarat) |
| Rajasthan | — | — | — | 10% hike in state share from 1 Apr 2026 | **unverified** — only low-quality sites give ₹8,250; hike applies to state share only |
| Maharashtra | — | — | — | — | **unverified** — reports range ₹10,000–15,000 for sevika |

Rejected: a YouTube claim of "₹23,000 for workers and helpers" (Jharkhand/general) — no support.

## Updating

Edit `app/config/anganwadi.php` (move current figures to `previous`, add new `rates`, `effective`,
`note`, `sources`, bump `site.updated` and `site.asset_ver`), run `php tools/build-static.php`,
then `node --test tests/*.test.js` and the browser test.

## Keywords handled by the page

anganwadi salary calculator, anganwadi salary 2026, anganwadi mandey, aanganwadi karyakarta salary,
anganwadi sahayika salary, anganwadi helper salary, state-wise anganwadi salary (UP / Bihar / MP /
Haryana / Jharkhand / Gujarat), anganwadi arrear calculator, anganwadi honorarium centre state share.
State-specific pages were not built: the maths is identical and the state selector + state table cover
those queries; separate URLs would be near-duplicates.
