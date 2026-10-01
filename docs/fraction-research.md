# Fraction Calculator — research, SEO decisions and implementation report

Date: 1 October 2026. Search data came from web-search result pages (titles, snippets, AI summaries)
run from the build environment. Google autocomplete, People-Also-Ask and Bing could **not** be queried
directly (outbound access to suggestqueries.google.com is blocked by the environment's network policy),
and the Semrush account had no API units left. **No search volume, KD, CPC or traffic numbers are
claimed anywhere.** Intent below comes from the query wording and the SERP content only.

## 1. Existing-project inspection (what was reused, what had to be added)

| Asked to reuse | Found in repo | Decision |
|---|---|---|
| Calculator page structure / controllers | Per-family PHP renderer class + config + views + content (`AgeDobPage`, `AnganwadiPage`, `GarageSalePage`), `<slug>/index.php` entry, static build in `tools/build-static.php` | Same pattern: `FractionPage`, `app/config/fraction.php`, `app/views/fraction/`, `app/content/fraction/` |
| Engines / math utils | Pure UMD engines in `assets/js/lib/` (date, anganwadi, garage-sale) — no math library | New `assets/js/lib/fraction.js` (BigInt) |
| Shared CSS / `main.css` | None — each family has its own scoped stylesheet (`adob-`, `awc-`, `gs-`) | `assets/css/fraction.css`, scoped `fr-` |
| Header / footer / breadcrumbs / theme | Per-family layout; shared `ecs-theme` localStorage key | Same markup pattern and the same theme key |
| SEO / schema helpers | `schema()` per page class (WebPage, App, Breadcrumb, FAQPage) | Same shape |
| **i18n, language switcher, hreflang** | **None exists** (all pages single-language; anganwadi page is Hindi-only) | Added the smallest possible per-calculator layer (see §5) — not a site-wide system |
| **Sitemap** | **None exists** | Build script now writes `sitemap.xml` for every built page, `lastmod` = each family's `site.updated` |
| Hubs / Math category / Percentage, GCD, LCM… calculators | **None exist** | Nothing linked that doesn't exist; see Limitations |
| calc-extras / history / share utils | None | Copy / Share (Web Share API, falls back to copy) / Print built into this page |
| Tests | `node:test` unit tests + Playwright browser scripts | Same style |

## 2. Research by country / language

| Country | Language | Primary queries | Secondary queries | Feature expectations seen in SERP | Common wording | Gaps found | Decision |
|---|---|---|---|---|---|---|---|
| USA | English | fraction calculator, fractions calculator | fraction calculator with steps, mixed number calculator, simplify fractions / fraction simplifier, fraction to decimal, decimal to fraction, adding/subtracting/multiplying/dividing fractions | step-by-step, proper/improper/mixed support, result as fraction + decimal, GCF simplification | “with steps”, “mixed numbers”, “simplest form”, “GCF” | Results dominated by thin auto-generated pages; few explain *why* (LCD, reciprocal) or handle repeating decimals exactly | One page, many modes; dynamic steps; exact repeating-decimal support |
| India | Hindi + English | fraction calculator, भिन्न कैलकुलेटर | भिन्न जोड़ना/घटाना/गुणा/भाग, भिन्न सरल करना, मिश्रित भिन्न, दशमलव से भिन्न, LCM/HCF | same as US; English “fraction calculator” used alongside Hindi | सरलतम रूप, अंश, हर, HCF/LCM (English abbreviations common in schools) | Hindi SERP returned English spam pages — no real Hindi tool | Full Hindi UI/article; keep “Fraction Calculator”, LCM, HCF in English where students use them |
| Pakistan | Urdu + English | fraction calculator, کسر کیلکولیٹر | کسر جمع/تفریق/ضرب/تقسیم، آسان کرنا، مخلوط کسر، اعشاریہ سے کسر | same | شمار کنندہ، نسب نما، عادِ اعظم، ذو اضعافِ اقل | Urdu SERP returned only English pages — no Urdu tool found | Full RTL Urdu page; maths kept LTR-isolated; English keyword in title |
| Japan | Japanese | 分数計算機, 分数電卓 | 約分, 通分, 帯分数, 仮分数, 途中式, 分数 小数 | 通分→計算→約分 order, 途中式, 帯分数・小数対応, 分母ゼロ検出, 符号の正規化 | 途中式, 既約分数, 最小公倍数で通分 | Japanese SERP is mostly one blog network; 途中式 for 約分 via 互除法 rare | Japanese school terms; Euclid (互除法) steps; 2と1/3 explained |
| Russia | Russian | калькулятор дробей, калькулятор дробей онлайн | с решением, сокращение дробей, смешанные числа, дробь в десятичную, НОК/НОД | step-by-step, ordinary/mixed/decimal/negative, result as fraction + mixed + decimal (toolfox.ru) | «с решением», «несократимая», «общий знаменатель» | Competitor (toolfox.ru) strong on features; periodic decimal input 0,(3) and exact comparison not shown | Russian terms, decimal comma in input and output, periodic-decimal input |

Competitors reviewed (from SERP): toolfox.ru (fraction calculator / reducer / converter), coddy.tech
(mixed number calculator, RU), RuStore / App Store fraction apps, assist-all.co.jp article network (JA),
plus multiple auto-generated “fraction calculator” pages in EN/HI/UR results. Calculator.net,
Omni, Mathway could not be fetched (egress blocked) and were not assessed beyond SERP snippets.

## 3. Features chosen and why

* Core A op B with whole/numerator/denominator fields — the dominant intent in every language.
* Dynamic step-by-step (LCD → convert → combine → simplify → mixed; reciprocal for ÷; Euclid for GCD) — “with steps / 途中式 / с решением” appears in all markets.
* Exact BigInt arithmetic, exact compare/order (cross-multiplication), exact finite and *periodic* decimal input — the competitor gap and a correctness requirement.
* Simplify, mixed↔improper, fraction↔decimal, fraction↔percent, compare, order (3–10), fraction of a number, X of Y, equivalent fractions (capped at 20), multiple fractions with precedence — each matches a secondary query group, all on one URL (no thin doorway pages).
* Visual bar (CSS, segmented up to 24 parts, continuous above; negative values hatched and labelled in text).

## 4. URLs, titles and metas

| Lang | URL | Title | Meta (abridged) |
|---|---|---|---|
| en | /fraction-calculator/ | Fraction Calculator With Steps — Add, Subtract, Multiply & Divide | Free fraction calculator with steps: add, subtract, multiply and divide… |
| hi | /hi/fraction-calculator/ | भिन्न कैलकुलेटर (Fraction Calculator) — स्टेप-बाय-स्टेप हल | मुफ़्त भिन्न कैलकुलेटर: भिन्न और मिश्रित भिन्न जोड़ें… |
| ur | /ur/fraction-calculator/ | کسر کیلکولیٹر (Fraction Calculator) — مرحلہ وار حل کے ساتھ | مفت کسر کیلکولیٹر: کسور اور مخلوط کسور… |
| ja | /ja/fraction-calculator/ | 分数計算機（途中式つき）— 足し算・引き算・掛け算・割り算・約分・通分 | 無料の分数計算機。分数・帯分数の… |
| ru | /ru/fraction-calculator/ | Калькулятор дробей онлайн с решением и сокращением | Бесплатный калькулятор дробей с подробным решением… |

Every page: self canonical, `hreflang` en/hi/ur/ja/ru + `x-default` → English (reciprocal by
construction), `<html lang dir>`, og:locale, language switcher, cross-links to the other languages.

## 5. Localization architecture (new, minimal)

`app/config/fraction.php → langs` defines code, URL prefix, hreflang, native name, direction, locale.
Each language = `app/content/fraction/<code>.php` (title, meta, 143 UI/step strings, 12 FAQ) +
`article-<code>.php`. One engine, one UI script; steps are data `{k, p}` rendered through the
language's templates with values isolated in `<bdi dir="ltr">`. Russian uses a decimal comma.
A test asserts every language has the same key set.

## 6. Limitations

* No live Google autocomplete / PAA / volume data (blocked / no API units) — intent only.
* No hub, Math category, Percentage/GCD/LCM/Ratio calculators exist in this repo, so none are linked;
  the page is reachable from the sitemap and from its sibling language pages only. When those pages
  exist, add them to `related` in `app/config/fraction.php` and the per-language `related` labels.
* The URL convention `/<lang>/fraction-calculator/` is new because the repo had none.
* Parentheses in multiple-fraction expressions are not supported (precedence × ÷ before + − is).
* `base_url` is easycalculatorsmart.com (from existing configs).
