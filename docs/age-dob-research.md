# Age / Date-of-Birth calculator family — research, keyword map and coverage audit

Research date: 26 September 2026. Sources: live web search results (SERP titles/snippets), competitor pages
visible in results, legislation.gov.uk, Wikipedia summaries of national date-notation standards.
Calculator.net and mass.gov could not be fetched from the build environment (egress blocked); their
features were assessed from SERP snippets only. No keyword-volume tool data was used.

## Architecture decision

| URL | Status | Why it is separate |
|---|---|---|
| `/date-of-birth-calculator/` | **new, main** | Broad DOB / exact-age / age-on-date / totals intent. |
| `/birthday-countdown-calculator/` | new | Distinct intent ("days until my birthday"), distinct SERP (Omni, howmanydaysuntilmybirthday.com, visualtimer). Countdown-first UI + birthday table. |
| `/day-of-birth-calculator/` | new | "What day was I born" is a distinct query; weekday strip, ISO week, next-10-birthday weekdays. |
| `/age-milestone-calculator/` | new | "When will I turn 18/21/65" + day-count milestones; full milestone table + custom age. |
| `/age-calculator/`, `/age-difference-calculator/` | existing — **kept, linked** | Not replaced or redirected (no URL churn). |
| age-on-date, exact-age-with-time, age-in-days/weeks/months/hours/minutes/seconds | **modes of main page** | Same calculation as the main page; separate URLs would be doorway pages. |
| `/age-calculator-usa|uk|canada|india/` | **not built** | Maths identical; country only changes format/wording → country selector + article section. |
| Hindi page | **not built** | No localisation architecture found in the repo. India gets DD/MM/YYYY, "Age as on", en-IN digit grouping. |

## Keyword → handler map

| Cluster | Keywords | Handled by |
|---|---|---|
| Core | date of birth calculator, DOB calculator, DOB age calculator, age calculator by/from date of birth, calculate age from DOB, how old am I, age calculator online/free, date of birth to age | Main page (title/H1/intro/article) |
| Exact age | exact age calculator, age in years months days, exact age by DOB | Main result card + "How exact age is worked out" |
| Target date | age as of date, age on a specific date, age on date calculator, age at future/past date, how old was I on a date, age on historical date, age at event date | Main "as of" field + presets + article section |
| Totals | age in days/weeks/months/hours/minutes/seconds, how many days/weeks/months/hours/minutes/seconds old am I, days lived, total days lived | Main totals cards + article + FAQ |
| Time | age calculator with time of birth, exact age with time | Main advanced mode (time + IANA zone, DST-aware) |
| Birthday | birthday calculator, next birthday, birthday countdown, days until birthday, age you will turn | Birthday Countdown page; summary card on main |
| Day of birth | day of birth calculator, what day was I born, born on what day, birthday weekday | Day of Birth page; "Born on" card on main |
| Milestones | age milestone calculator, milestone birthday, age 18/21/30/40/50/65/100 calculator, next milestone | Milestone page (config-driven ages + custom); next milestone on main |
| Leap/month-end | leap year age calculator, Feb 29 birthday | Rule selector + article + FAQ on all pages |
| Country | age/DOB calculator USA/UK/Canada/India | Country selector (format, "as of" wording, number grouping) + article section |
| Format | age calculator DD/MM/YYYY, MM/DD/YYYY | Format selector + long-form echo |
| Hindi | age calculator in Hindi, janam tarikh se age, जन्म तिथि से आयु | **Excluded** (no i18n architecture) — flagged as a future page |
| Privacy | private age calculator, without sign up | Badges, privacy section, FAQ |
| Chronological vs biological age | PAA | **Excluded** — medical topic, not a date-maths feature |

## People Also Ask coverage

How do I calculate age from DOB · exact age · age on another date · days/weeks/months/hours/minutes/seconds old ·
what day was I born · days until birthday · what age next · how Y/M/D is computed · why calculators disagree ·
Feb 29 · month-end · time of birth · is it private · can I use it for forms → FAQ + article sections on the
relevant page. "Chronological vs biological age" intentionally not answered (medical).

## Country research summary

- **USA** — MM/DD/YYYY, "age as of"; no single nationwide leap-day rule located; no eligibility claims made.
- **UK** — DD/MM/YYYY; Scotland: Age of Legal Capacity (Scotland) Act 1991 s.6 → 1 March (cited). No NHS/HMRC/pension claims.
- **Canada** — mixed practice; Government of Canada / Standards Council recommend YYYY-MM-DD → default YMD.
- **India** — DD/MM/YYYY or DD-MM-YYYY; recruitment notices use "age as on <date>" → label "Age as on", en-IN grouping.
- **Australia / New Zealand** — DD/MM/YYYY, "as at" wording.

## Competitor feature gap (all implemented)

Age on any date, totals in six units, birthday countdown + weekday, weekday of birth, day of year, ISO week,
milestones incl. 10,000 days, time of birth with time zones, stated leap/month-end convention with a toggle,
show-your-work, format selector with long-form echo, copy/share/print without leaking DOB, opt-in storage,
dark/light, mobile. Not copied: zodiac/birthstone/celebrity/number-one-song trivia (thin, off-intent).
