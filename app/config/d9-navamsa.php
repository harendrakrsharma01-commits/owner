<?php
/**
 * D9 / Navamsa Chart Calculator — single source of truth.
 *
 * Edit labels, FAQs, interpretation blocks, chart options, SEO text and sources here.
 * app/lib/D9Page.php renders the page from it; the browser UI (assets/js/calculators/d9-chart.js)
 * receives the 'client' section as JSON. The astronomy and the Navamsa arithmetic live only in
 * assets/js/lib/d9-navamsa.js — nothing in this file can change a calculated position.
 */

return [

    'site' => [
        'name'      => 'EasyCalculatorSmart',
        'base_url'  => 'https://easycalculatorsmart.com',
        'asset_ver' => '2026.09.27',
        'updated'   => '2026-09-27',
    ],

    'page' => [
        'slug'   => 'd9-chart-calculator',
        'title'  => 'D9 Chart Calculator (Navamsa) — Free Vedic Astrology Chart',
        'h1'     => 'D9 Chart Calculator (Navamsa)',
        'meta'   => 'Free D9 Navamsa chart from your birth date, exact time and place. Sidereal Lahiri positions, Navamsa Lagna, D9 houses, Vargottama planets and a D1 vs D9 comparison. Runs in your browser.',
        'kicker' => 'Vedic astrology · Divisional chart D9',
        'intro'  => 'Enter your date, exact time and place of birth to draw your Navamsa (D9) chart. Planet positions are calculated astronomically in the sidereal zodiac with the Lahiri ayanamsha, then divided into the nine 3°20′ Navamsas of each sign.',
        'breadcrumb' => [['Home', '/']],
    ],

    /* ------------------------------------------------------------------
     * Sent to the browser as JSON. Keep free of secrets.
     * ------------------------------------------------------------------ */
    'client' => [
        'system' => [
            'zodiac'     => 'Sidereal',
            'ayanamsha'  => 'Lahiri (Chitrapaksha)',
            'houses'     => 'Whole sign (from the Ascendant of each chart)',
            'node'       => 'Mean node',
            'engineNote' => 'Astronomy Engine 2.1.19 (VSOP87 / NOVAS-derived, MIT licence), checked against Swiss Ephemeris',
        ],
        'defaultChartStyle' => 'north',                // 'north' | 'south'
        'chartStyles' => ['north' => 'North Indian', 'south' => 'South Indian'],
        'minYear' => 1800,

        // Planet display order, abbreviations and names. Positions never come from here.
        'planets' => [
            'Ascendant' => ['abbr' => 'As', 'label' => 'Ascendant (Lagna)'],
            'Sun'     => ['abbr' => 'Su', 'label' => 'Sun (Surya)'],
            'Moon'    => ['abbr' => 'Mo', 'label' => 'Moon (Chandra)'],
            'Mars'    => ['abbr' => 'Ma', 'label' => 'Mars (Mangal)'],
            'Mercury' => ['abbr' => 'Me', 'label' => 'Mercury (Budha)'],
            'Jupiter' => ['abbr' => 'Ju', 'label' => 'Jupiter (Guru)'],
            'Venus'   => ['abbr' => 'Ve', 'label' => 'Venus (Shukra)'],
            'Saturn'  => ['abbr' => 'Sa', 'label' => 'Saturn (Shani)'],
            'Rahu'    => ['abbr' => 'Ra', 'label' => 'Rahu (north node)'],
            'Ketu'    => ['abbr' => 'Ke', 'label' => 'Ketu (south node)'],
        ],
        'signAbbr' => ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'],

        // Classical dignities (Brihat Parashara Hora Shastra tradition). Sign indices 0 = Aries … 11 = Pisces.
        // Rahu/Ketu are left out on purpose: authorities disagree on their dignities.
        'dignities' => [
            'Sun'     => ['exalted' => 0,  'debilitated' => 6,  'own' => [4]],
            'Moon'    => ['exalted' => 1,  'debilitated' => 7,  'own' => [3]],
            'Mars'    => ['exalted' => 9,  'debilitated' => 3,  'own' => [0, 7]],
            'Mercury' => ['exalted' => 5,  'debilitated' => 11, 'own' => [2, 5]],
            'Jupiter' => ['exalted' => 3,  'debilitated' => 9,  'own' => [8, 11]],
            'Venus'   => ['exalted' => 11, 'debilitated' => 5,  'own' => [1, 6]],
            'Saturn'  => ['exalted' => 6,  'debilitated' => 0,  'own' => [9, 10]],
        ],
        'signLords' => ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'],

        // Interpretation building blocks. The UI only combines these with the calculated placements;
        // it never invents text. Wording stays inside the tradition ("traditionally associated with").
        'interpretation' => [
            'planetThemes' => [
                'Sun'     => 'authority, self-respect and the father',
                'Moon'    => 'the mind, emotional needs and the mother',
                'Mars'    => 'drive, courage and conflict',
                'Mercury' => 'communication, learning and trade',
                'Jupiter' => 'wisdom, dharma, teachers and children; for women in older texts, also the husband',
                'Venus'   => 'relationships, affection, comfort and refinement; in many traditions the main marriage significator',
                'Saturn'  => 'discipline, duty, endurance and delay',
                'Rahu'    => 'desire, the unfamiliar and obsession',
                'Ketu'    => 'detachment, past-life skill and spirituality',
            ],
            'houseThemes' => [
                1 => 'the self as shown in the Navamsa',
                2 => 'family and resources',
                3 => 'effort, siblings and communication',
                4 => 'home and inner contentment',
                5 => 'creativity, children and merit (purva punya)',
                6 => 'obstacles, service and competition',
                7 => 'partnership and the spouse',
                8 => 'transformation and longevity',
                9 => 'dharma, fortune and teachers',
                10 => 'duty and action in the world',
                11 => 'gains and fulfilment of desires',
                12 => 'expenses, retreat and liberation',
            ],
            'dignityText' => [
                'exalted'     => 'exalted in its D9 sign — a placement traditional texts rate as very strong',
                'debilitated' => 'debilitated in its D9 sign — traditionally read as weakened, though rules such as neecha-bhanga are applied before any conclusion',
                'own'         => 'in its own sign in the D9 — traditionally read as comfortable and strong',
            ],
            'vargottama' => 'In traditional Vedic astrology, Vargottama is interpreted as a sign of consistency: the planet expresses the qualities of the same sign in both the birth chart and the Navamsa, and many texts treat this as added strength.',
            'marriageIntro' => 'Traditional Jyotish commonly reads the following from the Navamsa when discussing marriage. These are the tradition\'s reading points for your calculated chart, not predictions.',
            'disclaimer' => 'Astrological interpretation is a traditional belief system, not a science. The positions above are astronomical calculations; the meanings are summaries of how Jyotish texts are commonly read and are not personal predictions or advice.',
        ],

        'labels' => [
            'errDate'        => 'Enter a valid date of birth.',
            'errFuture'      => 'The date of birth is in the future. Please check the date.',
            'errRange'       => 'This calculator supports birth years from 1800 up to today.',
            'errTime'        => 'Enter the birth time as HH:MM (24-hour), for example 06:45 or 18:30.',
            'errTimeUnknown' => 'A D9 chart needs the birth time: the Navamsa Lagna and D9 houses change every few minutes. Enter your best estimate and choose “Approximate”, or use the D1 sign-only positions below.',
            'errPlace'       => 'Choose a birthplace from the list, or enter coordinates manually.',
            'errPlaceAmbiguous' => 'Several places match — choose the one with the correct state or country.',
            'errLat'         => 'Latitude must be between −66° and +66° (the Ascendant is not reliable inside the polar circles).',
            'errLon'         => 'Longitude must be between −180° and +180° (east is positive).',
            'errZone'        => 'Choose a valid time zone.',
            'errNonexistent' => 'That local time did not exist at this place: clocks jumped forward for daylight saving. Check the birth certificate or enter the time 1 hour later/earlier as recorded.',
            'errEphemeris'   => 'The astronomical calculation could not be completed. Please reload the page and try again.',
            'ambiguousNote'  => 'This local time occurred twice (clocks were set back). Choose which occurrence applies:',
            'approxNote'     => 'Birth time marked approximate: planets near a Navamsa boundary and the D9 Ascendant may differ from the true chart. Items that could change within ±5 minutes are flagged.',
            'boundaryFlag'   => 'near a boundary',
            'copied'         => 'Copied to clipboard.',
            'copyFail'       => 'Copy failed — select the text manually.',
        ],

        // Example chart: a fixed demonstration record, not a real person. Positions are computed live by the engine.
        'example' => ['date' => '2000-01-01', 'time' => '12:00', 'place' => 'New Delhi|Delhi|India', 'name' => 'Example chart'],
    ],

    'faq' => [
        ['What is a D9 chart?', 'The D9 chart is the ninth divisional chart (varga) of Vedic astrology. Every 30° sign is split into nine parts of 3°20′, and each planet is re-placed in the sign that rules its part. The result is a second chart, read alongside the birth chart.'],
        ['What is a Navamsa chart?', 'Navamsa (“ninth part”) is the Sanskrit name for the same D9 chart. In Hindi it is often called the Navmansh or Navamsha kundli. D9 and Navamsa refer to one and the same chart.'],
        ['How is the D9 chart calculated?', 'First the sidereal longitude of each planet and of the Ascendant is calculated for the birth moment. Each sign is divided into nine 3°20′ parts. For movable signs (Aries, Cancer, Libra, Capricorn) the count starts from the same sign, for fixed signs (Taurus, Leo, Scorpio, Aquarius) from the 9th sign, and for dual signs (Gemini, Virgo, Sagittarius, Pisces) from the 5th. The planet’s part number, counted forward from that start, gives its Navamsa sign.'],
        ['What is the difference between D1 and D9?', 'D1 (Rashi) places planets by their actual sidereal sign. D9 re-maps each planet by the 3°20′ part it occupies within that sign. D1 is the main birth chart; D9 is a derived chart that tradition uses to refine planetary strength, marriage and dharma.'],
        ['Why is birth time important for a D9 chart?', 'The Ascendant moves through the whole zodiac in about 24 hours, so it crosses a 3°20′ Navamsa roughly every 10–20 minutes depending on the sign and latitude. The Navamsa Lagna and every D9 house therefore depend on the birth time. The Moon also changes Navamsa every 4–7 hours.'],
        ['What is Navamsa Lagna?', 'The Navamsa Lagna (D9 Ascendant) is the Navamsa sign of the natal Ascendant degree. It is the first house of the D9 chart, and the D9 houses are counted from it.'],
        ['What is Vargottama?', 'A planet (or the Ascendant) is Vargottama when its sign in the D1 chart and in the D9 chart is the same. It happens in the first Navamsa of movable signs, the fifth of fixed signs and the ninth of dual signs. In traditional Vedic astrology this is interpreted as strength and consistency.'],
        ['Is D9 used for marriage?', 'Yes — in traditional Jyotish the Navamsa is the chart most commonly consulted for marriage and partnership, alongside the 7th house of the birth chart. It is a tradition-based reading, not a scientific or guaranteed forecast.'],
        ['What does the Navamsa chart show?', 'Traditionally the Navamsa is read for the inner strength of planets, marriage and the spouse, dharma (life direction) and the “fruit” of the birth chart in later life. Astronomically, it only shows which ninth-part of a sign each planet occupies.'],
        ['Which ayanamsha does this calculator use?', 'Lahiri (Chitrapaksha), the ayanamsha adopted by the Indian Calendar Reform Committee and used by the Indian national ephemeris. Our value agrees with the Swiss Ephemeris Lahiri definition to better than 1 arcsecond.'],
        ['What is Lahiri ayanamsha?', 'An ayanamsha is the angle between the tropical zodiac (tied to the equinox) and the sidereal zodiac (tied to the stars). Lahiri fixes the sidereal zodiac so that the star Spica (Chitra) sits near 0° Libra. In 2026 it is about 24°13′.'],
        ['Can I calculate D9 without birth time?', 'Not a complete one. Without a time the D9 Ascendant and houses cannot be known, and the Moon’s Navamsa may be uncertain. This calculator therefore requires a time; if yours is uncertain, enter your best estimate and mark it “Approximate” so near-boundary placements are flagged.'],
        ['Can a few minutes change the Navamsa?', 'Yes, near a boundary. The D9 Ascendant can change with a difference of a few minutes if the Ascendant is close to a 3°20′ edge, and it cannot change at all if it is in the middle of a part. There is no fixed number of minutes that always changes it; the calculator shows how close each placement is to a boundary.'],
        ['What are the nine divisions of a sign?', 'Each sign is divided into nine Navamsas: 0°–3°20′, 3°20′–6°40′, 6°40′–10°, 10°–13°20′, 13°20′–16°40′, 16°40′–20°, 20°–23°20′, 23°20′–26°40′ and 26°40′–30°.'],
        ['What is 3°20′ in Navamsa?', '3°20′ is one-ninth of a 30° sign (30 ÷ 9 = 3⅓°). It is also the width of one Nakshatra pada, so the 108 Navamsas of the zodiac line up with the 108 padas of the 27 Nakshatras.'],
        ['How do I read a D9 chart?', 'Traditionally, start with the Navamsa Lagna and its lord, then look at each planet’s D9 sign (own, exalted or debilitated), its house from the Navamsa Lagna, Vargottama planets, and finally compare with the D1 chart. The calculator lays these out in that order.'],
        ['Can I compare D1 and D9?', 'Yes. The comparison table shows each planet’s D1 sign next to its D9 sign, and can be filtered to show only Vargottama placements.'],
        ['Is a D9 chart the same as a birth chart?', 'No. The birth chart (D1, Rashi chart) uses actual sign positions. The D9 is derived from it by the Navamsa rule, so the same planet is often in a different sign in the D9.'],
        ['Is Navamsa scientifically proven?', 'No. The planetary positions are real astronomy, but astrology — including Navamsa interpretation — is a traditional belief system that has not been scientifically validated. Use the interpretation for cultural or personal interest, not as the basis for medical, financial, legal or relationship decisions.'],
    ],

    'sources' => [
        ['Astronomy Engine (Don Cross) — source code and accuracy notes, MIT licence', 'https://github.com/cosinekitty/astronomy'],
        ['Swiss Ephemeris documentation — ayanamshas (SE_SIDM_LAHIRI) and house calculation', 'https://www.astro.com/swisseph/swisseph.htm'],
        ['IAU 2006 precession (Capitaine et al. 2003, A&A 412, 567)', 'https://doi.org/10.1051/0004-6361:20031539'],
        ['Jean Meeus, Astronomical Algorithms (2nd ed.) — mean lunar node, eq. 47.7', 'https://www.willbell.com/math/mc1.htm'],
        ['Report of the Calendar Reform Committee (Government of India, 1955)', 'https://en.wikipedia.org/wiki/Indian_national_calendar'],
        ['IANA Time Zone Database', 'https://www.iana.org/time-zones'],
        ['Navamsa — overview of the divisional chart', 'https://en.wikipedia.org/wiki/Navamsa'],
    ],

    // Existing EasyCalculatorSmart tools. 'enabled' => false hides a link until the page exists.
    'related' => [
        ['Date of Birth Calculator', '/date-of-birth-calculator/', 'Exact age from a birth date, with time and time zone.', true],
        ['Day of Birth Calculator', '/day-of-birth-calculator/', 'Find the weekday you were born on.', true],
        ['Birthday Countdown Calculator', '/birthday-countdown-calculator/', 'Days until your next birthday.', true],
        ['Shadbala Calculator', '/shadbala-calculator/', 'Six-fold planetary strength in Vedic astrology.', false],
        ['Time Zone Converter', '/time-zone-converter/', 'Convert a time between places.', false],
    ],
];
