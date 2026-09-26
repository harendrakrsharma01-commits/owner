<?php
/**
 * Age / Date-of-Birth calculator family — single source of truth.
 *
 * Add a milestone, preset, country, FAQ, label or source here; the page
 * renderer (app/lib/AgeDobPage.php) and the browser UI (assets/js/age-dob-ui.js,
 * which receives the 'client' section as JSON) both read from this file.
 * The date maths itself never depends on anything in here except the
 * milestone lists and the default month-end rule.
 */

return [

    'site' => [
        'name'      => 'EasyCalculatorSmart',
        'base_url'  => 'https://easycalculatorsmart.com',
        'asset_ver' => '2026.09.26',
        'updated'   => '2026-09-26',
    ],

    /* ------------------------------------------------------------------
     * Settings shipped to the browser (JSON). Keep it free of secrets.
     * ------------------------------------------------------------------ */
    'client' => [
        'defaultCountry' => 'us',
        'defaultRule'    => 'clamp',      // 'clamp' (Feb 28 / last day of month) or 'rollover' (Mar 1 / next day)
        'milestoneAges'  => [18, 21, 25, 30, 40, 50, 60, 65, 70, 80, 90, 100],
        'dayMilestones'  => [1000, 5000, 10000, 15000, 20000, 25000, 30000],
        'weekdayStart'   => 1,            // 1 = Monday for the weekday strip; 0 = Sunday

        // Country presets change DISPLAY only (format, wording, examples) — never the maths.
        'countries' => [
            'us' => ['locale' => 'en-US', 'label' => 'United States', 'format' => 'MDY', 'monthFirst' => true,  'asOf' => 'Age as of',  'example' => '09/24/2000'],
            'uk' => ['locale' => 'en-GB', 'label' => 'United Kingdom', 'format' => 'DMY', 'monthFirst' => false, 'asOf' => 'Age on',     'example' => '24/09/2000'],
            'ca' => ['locale' => 'en-CA', 'label' => 'Canada',         'format' => 'YMD', 'monthFirst' => true,  'asOf' => 'Age as of',  'example' => '2000-09-24'],
            'in' => ['locale' => 'en-IN', 'label' => 'India',          'format' => 'DMY', 'monthFirst' => false, 'asOf' => 'Age as on',  'example' => '24/09/2000'],
            'au' => ['locale' => 'en-AU', 'label' => 'Australia',      'format' => 'DMY', 'monthFirst' => false, 'asOf' => 'Age as at',  'example' => '24/09/2000'],
            'nz' => ['locale' => 'en-NZ', 'label' => 'New Zealand',    'format' => 'DMY', 'monthFirst' => false, 'asOf' => 'Age as at',  'example' => '24/09/2000'],
            'intl' => ['locale' => 'en-US', 'label' => 'Other / ISO',  'format' => 'YMD', 'monthFirst' => false, 'asOf' => 'Age as of',  'example' => '2000-09-24'],
        ],

        'formats' => [
            'MDY' => ['label' => 'MM/DD/YYYY', 'placeholder' => 'MM/DD/YYYY'],
            'DMY' => ['label' => 'DD/MM/YYYY', 'placeholder' => 'DD/MM/YYYY'],
            'YMD' => ['label' => 'YYYY-MM-DD', 'placeholder' => 'YYYY-MM-DD'],
        ],

        // Presets. 'dob' / 'target' accept: an ISO date, 'today', 'yesterday', 'tomorrow',
        // 'today-Nd' / 'today+Nd' / 'today-Ny', 'birthday-this-year', 'next-birthday'.
        'presets' => [
            ['id' => 'today',      'label' => 'Today',              'target' => 'today'],
            ['id' => 'yesterday',  'label' => 'Yesterday',          'target' => 'yesterday'],
            ['id' => 'tomorrow',   'label' => 'Tomorrow',           'target' => 'tomorrow'],
            ['id' => 'bday-year',  'label' => 'Birthday this year', 'target' => 'birthday-this-year'],
            ['id' => 'next-bday',  'label' => 'Next birthday',      'target' => 'next-birthday'],
            ['id' => 'ex-1990',    'label' => 'Example 1990',       'dob' => '1990-01-15', 'target' => 'today'],
            ['id' => 'ex-2000',    'label' => 'Example 2000',       'dob' => '2000-09-24', 'target' => 'today'],
            ['id' => 'leap',       'label' => 'Leap day',           'dob' => '2004-02-29', 'target' => 'today'],
            ['id' => 'newborn',    'label' => 'Newborn',            'dob' => 'today-10d',  'target' => 'today'],
            ['id' => 'past',       'label' => 'Past date',          'target' => '2020-01-01'],
            ['id' => 'future',     'label' => 'Future date',        'target' => 'today+5y'],
        ],

        'labels' => [
            'exactAge'   => 'Exact age',
            'years'      => 'years', 'year' => 'year',
            'months'     => 'months', 'month' => 'month',
            'days'       => 'days', 'day' => 'day',
            'weeks'      => 'weeks', 'week' => 'week',
            'hours'      => 'hours', 'minutes' => 'minutes', 'seconds' => 'seconds',
            'totalMonths' => 'Total months', 'totalWeeks' => 'Total weeks', 'totalDays' => 'Total days',
            'totalHours' => 'Total hours', 'totalMinutes' => 'Total minutes', 'totalSeconds' => 'Total seconds',
            'bornOn'     => 'Born on', 'nextBirthday' => 'Next birthday', 'turning' => 'Turning',
            'daysUntil'  => 'Days until birthday', 'nextMilestone' => 'Next milestone',
            'errInvalid' => 'Enter a real calendar date in the selected format (four-digit year).',
            'errBefore'  => 'The “as of” date is before the date of birth. Choose a later date.',
            'errTime'    => 'Enter times as HH:MM or HH:MM:SS (24-hour).',
            'dateOnlyNote' => 'No birth time entered: hours, minutes and seconds count whole days from midnight to midnight.',
            'timeNote'   => 'Birth time included: totals are the real elapsed time between the two moments, including daylight-saving changes in the chosen time zones.',
            'copied'     => 'Result copied to clipboard.',
        ],

        'timeZones' => ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
            'America/Anchorage', 'Pacific/Honolulu', 'America/Toronto', 'America/Vancouver', 'America/Halifax',
            'America/St_Johns', 'Europe/London', 'Europe/Dublin', 'Europe/Paris', 'Asia/Kolkata', 'Asia/Dubai',
            'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'Australia/Perth', 'Pacific/Auckland'],

        'storageKey' => 'ecs-agedob-v1', // only used if the visitor ticks "Remember on this device"
    ],

    /* ------------------------------------------------------------------
     * Sources (cited in page "Sources" sections).
     * ------------------------------------------------------------------ */
    'sources' => [
        'iso8601'   => ['ISO 8601 — Date and time format (International Organization for Standardization)', 'https://www.iso.org/iso-8601-date-and-time-format.html'],
        'scotland'  => ['Age of Legal Capacity (Scotland) Act 1991, section 6 — birthdays of persons born on 29 February (legislation.gov.uk)', 'https://www.legislation.gov.uk/ukpga/1991/50/section/6'],
        'canada'    => ['Date and time notation in Canada — summary of Government of Canada / Standards Council of Canada guidance on YYYY-MM-DD', 'https://en.wikipedia.org/wiki/Date_and_time_notation_in_Canada'],
        'india'     => ['Date and time notation in India — DD/MM/YYYY and DD-MM-YYYY usage', 'https://en.wikipedia.org/wiki/Date_and_time_notation_in_India'],
        'gregorian' => ['Gregorian calendar leap-year rule (U.S. Naval Observatory / Astronomical Applications)', 'https://aa.usno.navy.mil/faq/calendars'],
        'tzdb'      => ['IANA Time Zone Database (used by browsers for daylight-saving rules)', 'https://www.iana.org/time-zones'],
        'hinnant'   => ['Howard Hinnant — chrono-compatible low-level date algorithms (days_from_civil)', 'https://howardhinnant.github.io/date_algorithms.html'],
    ],

    /* ------------------------------------------------------------------
     * Existing site pages we link to instead of duplicating.
     * Set 'enabled' => false for any URL that is not live on production.
     * ------------------------------------------------------------------ */
    'related' => [
        'age-calculator'            => ['title' => 'Age Calculator',            'url' => '/age-calculator/',            'desc' => 'The quick everyday age check.', 'enabled' => true],
        'age-difference-calculator' => ['title' => 'Age Difference Calculator', 'url' => '/age-difference-calculator/', 'desc' => 'Gap between two people’s birthdays.', 'enabled' => true],
        'time-calculator'           => ['title' => 'Time Calculator',           'url' => '/time-calculator/',           'desc' => 'Add or subtract hours and minutes.', 'enabled' => true],
        'date-calculator'           => ['title' => 'Date Calculator',           'url' => '/date-calculator/',           'desc' => 'Days between any two dates.', 'enabled' => true],
        '10000-days-calculator'     => ['title' => '10,000 Days Calculator',    'url' => '/10000-days-calculator/',     'desc' => 'When you reach 10,000 days old.', 'enabled' => true],
        'birthday-milestone-calculator' => ['title' => 'Birthday Milestone Calculator', 'url' => '/birthday-milestone-calculator/', 'desc' => 'Existing milestone birthday tool.', 'enabled' => false],
    ],

    /* ------------------------------------------------------------------
     * Pages. 'mode' selects which calculator panels render.
     * ------------------------------------------------------------------ */
    'pages' => [

        'date-of-birth-calculator' => [
            'mode'     => 'full',
            'title'    => 'Date of Birth Calculator — Exact Age From Your DOB',
            'h1'       => 'Date of Birth Calculator',
            'meta'     => 'Free DOB calculator: exact age in years, months and days on any date, plus total days, weeks, hours, next birthday and weekday born. Runs in your browser.',
            'kicker'   => 'Age calculator by date of birth',
            'intro'    => 'Enter a date of birth to get your exact age in years, months and days — today or on any past or future date — with total days, weeks and months, your next birthday, the weekday you were born and upcoming milestones.',
            'icon'     => 'calendar',
            'article'  => 'date-of-birth-calculator.php',
            'related'  => ['birthday-countdown-calculator', 'day-of-birth-calculator', 'age-milestone-calculator', 'age-calculator', 'age-difference-calculator', 'date-calculator', '10000-days-calculator', 'time-calculator'],
            'sources'  => ['gregorian', 'scotland', 'iso8601', 'canada', 'india', 'tzdb', 'hinnant'],
            'faq' => [
                ['How do I calculate age from date of birth?', 'Count the completed years since the birth date, then the completed months since the last birthday, then the days left over. Enter the DOB above and the calculator does this with real month lengths and leap years, so the answer matches what you would count on a calendar.'],
                ['What is my exact age?', 'Your exact age is the number of completed years, months and days between your date of birth and today (or the date you choose). For example, someone born on 24 September 2000 is 26 years, 0 months and 2 days old on 26 September 2026.'],
                ['Can I calculate my age on another date?', 'Yes. Change the “Age as of” date to any past or future date — an exam date, an application deadline or an event — and every result updates for that date. The calculator reports age only; whether that age meets a rule is for the organisation that set the rule.'],
                ['How many days old am I?', 'Total days is the count of calendar days from your date of birth to the chosen date. It is not years × 365: leap days add an extra day roughly every four years, which is why the totals section counts actual days.'],
                ['How many weeks or months old am I?', 'Weeks are total days divided by 7, shown as completed weeks plus leftover days. Months are completed calendar months (for example 14 Jan → 14 Feb is one month), plus leftover days — not days divided by 30.'],
                ['How many hours, minutes or seconds old am I?', 'With only a date of birth, the tool counts whole days from midnight to midnight and multiplies. For a precise figure, switch on “Include time of birth” and enter the birth time and time zone.'],
                ['How are leap-day (29 February) birthdays calculated?', 'The date of birth stays 29 February. In common years the birthday has to fall on another day; this tool uses 28 February by default and lets you switch to 1 March. Laws differ by country and purpose — Scotland, for example, legislates 1 March for legal age.'],
                ['Why do age calculators sometimes disagree?', 'Mostly because of month-end dates. From 31 January, is “one month later” 28 February or 1 March? Tools pick different conventions, and some use rough 30-day months or 365.25-day years. This page states its rule and lets you change it.'],
                ['What is the difference between age in years and total days?', 'Age in years counts completed birthdays; total days counts every day lived. Two people who are both 30 can have different day totals depending on how many leap days fell in their lives.'],
                ['Can I use this calculator for forms?', 'You can use it to work out an age for a form, but it is a date-maths tool, not an official record. Always follow the instructions and cut-off rules of the organisation asking.'],
                ['Is this DOB calculator private?', 'Yes. The calculation runs in your browser. Your date of birth is not sent to our server, is not put in the page address, and is only saved on your device if you tick “Remember on this device”.'],
            ],
        ],

        'birthday-countdown-calculator' => [
            'mode'     => 'birthday',
            'title'    => 'Birthday Countdown Calculator — Days Until Your Birthday',
            'h1'       => 'Birthday Countdown Calculator',
            'meta'     => 'How many days until your birthday? See your next birthday date, the weekday it falls on, the age you will turn and a weeks-and-days countdown.',
            'kicker'   => 'Next birthday calculator',
            'intro'    => 'Enter a birthday to see exactly how many days and weeks are left, which weekday it lands on and the age you will turn — including correct handling of 29 February birthdays.',
            'icon'     => 'cake',
            'article'  => 'birthday-countdown-calculator.php',
            'related'  => ['date-of-birth-calculator', 'age-milestone-calculator', 'day-of-birth-calculator', 'age-calculator', 'date-calculator'],
            'sources'  => ['gregorian', 'scotland'],
            'faq' => [
                ['How many days until my birthday?', 'Enter your date of birth and the countdown shows the calendar days from today to your next birthday. On the birthday itself the tool says so and counts to the following year.'],
                ['What age will I turn on my next birthday?', 'The “Turning” figure is the number of years between your birth year and the year of your next birthday.'],
                ['Does the countdown include today?', 'No. “1 day” means the birthday is tomorrow. The count is the difference between the two calendar dates, so it does not change with the time of day.'],
                ['When is my birthday if I was born on 29 February?', 'In leap years it is 29 February. In other years the tool shows 28 February by default, and you can switch it to 1 March. Your date of birth itself never changes.'],
                ['Can I count down to someone else’s birthday?', 'Yes — enter their date of birth, or just their birthday with any birth year if you only need the days remaining (the “turning” age will then not be meaningful).'],
            ],
        ],

        'day-of-birth-calculator' => [
            'mode'     => 'weekday',
            'title'    => 'Day of Birth Calculator — What Day of the Week Was I Born?',
            'h1'       => 'Day of Birth Calculator',
            'meta'     => 'Find the day of the week you were born, plus the day of the year, ISO week number and whether it was a leap year. Works for any date from year 1 to 9999.',
            'kicker'   => 'What day was I born?',
            'intro'    => 'Enter a date of birth to find the weekday you were born on, the day of the year, the ISO week number and how often your birthday lands on each weekday.',
            'icon'     => 'weekday',
            'article'  => 'day-of-birth-calculator.php',
            'related'  => ['date-of-birth-calculator', 'birthday-countdown-calculator', 'age-milestone-calculator', 'date-calculator'],
            'sources'  => ['gregorian', 'iso8601', 'hinnant'],
            'faq' => [
                ['What day of the week was I born?', 'Enter your date of birth and the weekday appears immediately. It is computed from a fixed day count, not looked up in a table, so it works for any Gregorian date.'],
                ['What is the ISO week number?', 'ISO 8601 numbers weeks from Monday, and week 1 is the week containing 4 January. That is why 31 December can be in week 1 of the next year.'],
                ['Does this work for very old dates?', 'The tool uses the Gregorian calendar for every date (the “proleptic” Gregorian calendar). Countries switched from the Julian calendar at different times — Britain and its colonies in 1752 — so historic records written in the Julian calendar can show a different weekday.'],
                ['Why does my birthday move one weekday each year?', 'A common year is 52 weeks and 1 day, so a birthday moves forward one weekday; after a 29 February it moves two.'],
            ],
        ],

        'age-milestone-calculator' => [
            'mode'     => 'milestone',
            'title'    => 'Age Milestone Calculator — When You Turn 18, 21, 50 or 100',
            'h1'       => 'Age Milestone Calculator',
            'meta'     => 'See the exact date you turn 18, 21, 30, 40, 50, 65 or 100 — or any custom age — how many days away it is, and your 10,000-day and other day-count milestones.',
            'kicker'   => 'Milestone birthday calculator',
            'intro'    => 'Enter a date of birth to see the date of every milestone birthday, how many days away each one is, and day-count milestones such as 10,000 days old. Add any custom age you need.',
            'icon'     => 'flag',
            'article'  => 'age-milestone-calculator.php',
            'related'  => ['date-of-birth-calculator', 'birthday-countdown-calculator', '10000-days-calculator', 'age-calculator', 'birthday-milestone-calculator'],
            'sources'  => ['gregorian', 'scotland'],
            'faq' => [
                ['When will I turn 18 (or 21, 65, 100)?', 'Your milestone date is your birthday in the year you reach that age. The table lists each date, its weekday and the number of days from the selected date.'],
                ['Can I add my own milestone age?', 'Yes. Type any whole age from 1 to 150 in “Custom age” and it is added to the timeline.'],
                ['Does turning 18 on a given date mean I am eligible for something?', 'Not necessarily. Rules often use their own cut-off dates or definitions. This tool gives the date; check the eligibility rule with the organisation concerned.'],
                ['How is a 29 February milestone handled?', 'In a common year it falls on 28 February by default, or 1 March if you choose that rule. In Scotland, for legal age, the law uses 1 March.'],
                ['What is a day-count milestone?', 'It is the date you have lived a round number of days — 10,000 days is about 27 years and 4 months.'],
            ],
        ],
    ],
];
