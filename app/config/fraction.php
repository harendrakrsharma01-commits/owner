<?php
/**
 * Fraction Calculator — shared settings for every language version.
 *
 * The maths lives once in assets/js/lib/fraction.js. Each language has its own content file
 * (app/content/fraction/<code>.php: title, meta, UI strings, step templates, FAQ) and article
 * (app/content/fraction/article-<code>.php). Add a language by adding it to 'langs' and creating
 * those two files; hreflang links, the language switcher and the sitemap pick it up automatically.
 */

return [

    'site' => [
        'name'      => 'EasyCalculatorSmart',
        'base_url'  => 'https://easycalculatorsmart.com',
        'asset_ver' => '2026.10.01',
        'updated'   => '2026-10-01',
    ],

    'slug' => 'fraction-calculator',

    // URL convention: English at /fraction-calculator/, other languages under /<code>/fraction-calculator/.
    'langs' => [
        'en' => ['prefix' => '',    'hreflang' => 'en', 'native' => 'English', 'dir' => 'ltr', 'locale' => 'en_US'],
        'hi' => ['prefix' => 'hi/', 'hreflang' => 'hi', 'native' => 'हिन्दी',   'dir' => 'ltr', 'locale' => 'hi_IN'],
        'ur' => ['prefix' => 'ur/', 'hreflang' => 'ur', 'native' => 'اردو',    'dir' => 'rtl', 'locale' => 'ur_PK'],
        'ja' => ['prefix' => 'ja/', 'hreflang' => 'ja', 'native' => '日本語',   'dir' => 'ltr', 'locale' => 'ja_JP'],
        'ru' => ['prefix' => 'ru/', 'hreflang' => 'ru', 'native' => 'Русский', 'dir' => 'ltr', 'locale' => 'ru_RU'],
    ],
    'default_lang' => 'en',   // x-default

    // Shipped to the browser with the language's strings.
    'client' => [
        'digits'        => [2, 4, 6, 8, 10, 12],
        'defaultDigits' => 6,
        'maxRows'       => 10,
        'modes'         => ['calc', 'multi', 'simplify', 'mixed', 'decimal', 'percent', 'compare', 'order', 'of', 'what', 'equiv'],
        // Quick examples. 'lbl' is a UI-string template key; the values fill the calculator and run it.
        'examples' => [
            ['mode' => 'calc',     'a' => '1/2', 'op' => '+', 'b' => '1/3',  'lbl' => null],
            ['mode' => 'calc',     'a' => '3/4', 'op' => '-', 'b' => '1/8',  'lbl' => null],
            ['mode' => 'calc',     'a' => '2/3', 'op' => '*', 'b' => '5/7',  'lbl' => null],
            ['mode' => 'calc',     'a' => '3/4', 'op' => '/', 'b' => '2/5',  'lbl' => null],
            ['mode' => 'calc',     'a' => '2 1/3', 'op' => '+', 'b' => '1 1/2', 'lbl' => null],
            ['mode' => 'simplify', 'a' => '12/18', 'lbl' => 'exSimplify'],
            ['mode' => 'mixed',    'a' => '7/4',   'dir' => 'toMixed', 'lbl' => 'exMixed'],
            ['mode' => 'decimal',  'v' => '0.75',  'dir' => 'toFrac',  'lbl' => 'exDecToFrac'],
            ['mode' => 'percent',  'a' => '3/8',   'dir' => 'toPct',   'lbl' => 'exToPct'],
            ['mode' => 'compare',  'a' => '2/3',   'b' => '3/5',       'lbl' => 'exCompare'],
            ['mode' => 'of',       'a' => '3/4',   'x' => '80',        'lbl' => 'exOf'],
        ],
    ],

    // Only pages that exist in this project. Nothing here links to a URL that is not built.
    'related' => [
        'garage-sale-pricing-calculator' => '/garage-sale-pricing-calculator/',
        'date-of-birth-calculator'       => '/date-of-birth-calculator/',
    ],
];
