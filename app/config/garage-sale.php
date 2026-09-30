<?php
/**
 * Garage sale pricing calculator — single source of truth.
 *
 * Category percentages are the starting point for an item in GOOD condition, as a share of what it
 * cost new. They sit inside the ranges published by the pricing guides listed in 'sources'
 * (most items 10–30% of retail, electronics 20–30%, furniture at most a third). 'min' is the lowest
 * sticker price we suggest for one item; 'typical' is the range shoppers expect to see.
 * The engine (assets/js/lib/garage-sale.js) receives the 'client' section as JSON.
 */

return [

    'site' => [
        'name'      => 'EasyCalculatorSmart',
        'base_url'  => 'https://easycalculatorsmart.com',
        'asset_ver' => '2026.09.30',
        'updated'   => '2026-09-30',
    ],

    'client' => [
        'defaultCategory'  => 'clothing-adult',
        'defaultCondition' => 'good',
        'defaultAge'       => '1-3',
        'defaultGoal'      => 'balanced',
        'maxShare'         => 0.5,    // never suggest more than half of the new price
        'floorShare'       => 0.7,    // lowest price to accept = 70% of the sticker, rounded down
        'minPrice'         => 0.25,
        'maxOriginal'      => 100000,
        'storageKey'       => 'ecs-garage-list-v1',

        // pct: share of the new price in good condition. ageSens: how much age matters (0 = not at all, 1 = normal, 1.5 = fast-dating).
        'categories' => [
            'clothing-adult'  => ['label' => 'Clothing — adult',           'pct' => 0.10, 'min' => 1,    'ageSens' => 0.5, 'typical' => '$2–$5; coats and name brands more'],
            'clothing-kids'   => ['label' => 'Clothing — kids & baby',     'pct' => 0.10, 'min' => 0.25, 'ageSens' => 0.5, 'typical' => '$0.25–$3'],
            'shoes'           => ['label' => 'Shoes & bags',               'pct' => 0.12, 'min' => 1,    'ageSens' => 0.5, 'typical' => '$3–$10'],
            'books'           => ['label' => 'Books',                      'pct' => 0.05, 'min' => 0.25, 'ageSens' => 0,   'typical' => 'paperbacks $0.25–$0.50, hardcovers $1–$2'],
            'media'           => ['label' => 'DVDs, CDs & vinyl',          'pct' => 0.15, 'min' => 0.5,  'ageSens' => 0.5, 'typical' => '$1–$4'],
            'video-games'     => ['label' => 'Video games & consoles',     'pct' => 0.30, 'min' => 2,    'ageSens' => 1,   'typical' => 'games $3–$15; consoles more'],
            'toys'            => ['label' => 'Toys & games',               'pct' => 0.12, 'min' => 0.5,  'ageSens' => 0.5, 'typical' => '$1–$5; large playsets more'],
            'kitchen'         => ['label' => 'Kitchen & housewares',       'pct' => 0.10, 'min' => 0.25, 'ageSens' => 0.5, 'typical' => 'dishes $0.25–$1 each, sets $2–$5'],
            'small-appliance' => ['label' => 'Small appliances',           'pct' => 0.10, 'min' => 2,    'ageSens' => 1,   'typical' => '$3–$15 if working'],
            'electronics'     => ['label' => 'Electronics (TVs, audio, computers)', 'pct' => 0.25, 'min' => 2, 'ageSens' => 1.5, 'typical' => '20–30% of today’s retail, tested and working'],
            'furniture-basic' => ['label' => 'Furniture — particle board / flat-pack', 'pct' => 0.15, 'min' => 5, 'ageSens' => 1, 'typical' => '$5–$50'],
            'furniture-solid' => ['label' => 'Furniture — solid wood / quality', 'pct' => 0.30, 'min' => 10, 'ageSens' => 0.5, 'typical' => 'up to about a third of what you paid'],
            'tools'           => ['label' => 'Tools & garden',             'pct' => 0.30, 'min' => 1,    'ageSens' => 0.5, 'typical' => 'hand tools $1–$3; power tools 25–40%'],
            'sports'          => ['label' => 'Sports, bikes & fitness',    'pct' => 0.20, 'min' => 2,    'ageSens' => 1,   'typical' => '$5–$50; bikes and gym gear more'],
            'baby-gear'       => ['label' => 'Baby gear (strollers, high chairs)', 'pct' => 0.20, 'min' => 2, 'ageSens' => 1, 'typical' => '$5–$40',
                                  'warn' => 'Check cpsc.gov/Recalls before selling. Selling a recalled product is illegal, and many buyers avoid used cribs and car seats.'],
            'decor'           => ['label' => 'Home décor & misc.',         'pct' => 0.10, 'min' => 0.5,  'ageSens' => 0.5, 'typical' => '$0.50–$10'],
            'jewelry'         => ['label' => 'Costume jewelry & accessories', 'pct' => 0.10, 'min' => 0.5, 'ageSens' => 0, 'typical' => '$0.50–$5',
                                  'warn' => 'Gold, silver and gemstones are worth their metal/stone value — get those appraised rather than using this estimate.'],
        ],

        'conditions' => [
            'new'     => ['label' => 'New with tags / unopened', 'factor' => 2.0, 'hint' => 'Never used, original tags or box.'],
            'like-new'=> ['label' => 'Like new',                 'factor' => 1.4, 'hint' => 'Used a few times, no visible wear.'],
            'good'    => ['label' => 'Good',                     'factor' => 1.0, 'hint' => 'Normal wear, fully working, clean.'],
            'fair'    => ['label' => 'Fair',                     'factor' => 0.6, 'hint' => 'Visible wear, small flaws, missing minor parts.'],
            'poor'    => ['label' => 'Poor / for parts',         'factor' => 0.3, 'hint' => 'Damaged, stained or not working — sold as-is.'],
        ],

        // Age factor before category sensitivity is applied.
        'ages' => [
            '0-1'  => ['label' => 'Less than 1 year', 'factor' => 1.0],
            '1-3'  => ['label' => '1–3 years',        'factor' => 0.9],
            '3-5'  => ['label' => '3–5 years',        'factor' => 0.8],
            '5-10' => ['label' => '5–10 years',       'factor' => 0.65],
            '10+'  => ['label' => 'More than 10 years','factor' => 0.5],
        ],

        'goals' => [
            'fast'     => ['label' => 'Clear it out — sell fast',   'factor' => 0.75],
            'balanced' => ['label' => 'Balanced',                   'factor' => 1.0],
            'top'      => ['label' => 'Get top dollar',             'factor' => 1.25],
        ],

        'labels' => [
            'errPrice' => 'Enter what the item cost new, in dollars (for example 40 or 39.99).',
            'errQty'   => 'Quantity must be a whole number from 1 to 999.',
            'added'    => 'Added to your price list.',
            'copied'   => 'Price list copied to clipboard.',
            'empty'    => 'Your price list is empty. Price an item above and press “Add to price list”.',
        ],
    ],

    'sources' => [
        'angi'       => ['Angi — Garage Sale Pricing Guide', 'https://www.angi.com/articles/ultimate-garage-sale-pricing-guide.htm'],
        'dollar'     => ['The Dollar Stretcher — How to Price Garage Sale Items (2026)', 'https://thedollarstretcher.com/frugal-living/how-to-price-garage-sale-items/'],
        'moneycr'    => ['Money Crashers — 7 Tips for Garage Sale Pricing', 'https://www.moneycrashers.com/price-garage-sale-items/'],
        'dupaco'     => ['Dupaco Community Credit Union — How to price your garage sale items', 'https://www.dupaco.com/learn/blog/how-to-price-your-garage-sale-items'],
        'hillbilly'  => ['Hillbilly Housewife — Yard Sale Price Guide', 'https://www.hillbillyhousewife.com/site/yard-sale-price-guide.htm'],
        'gstracker'  => ['GarageSalesTracker — Garage sale pricing guide', 'https://www.garagesalestracker.com/garage-sales-guide-pricing.asp'],
        'frugal'     => ['My Frugal Home — Printable yard sale pricing guide (PDF)', 'https://myfrugalhome.com/printables/yard-sale-price-guide.pdf'],
        'cpsc'       => ['U.S. Consumer Product Safety Commission — Recalls', 'https://www.cpsc.gov/Recalls'],
        'nhtsa'      => ['NHTSA — Car seat and vehicle recalls', 'https://www.nhtsa.gov/recalls'],
    ],

    'related' => [
        ['title' => 'Date of Birth Calculator', 'url' => '/date-of-birth-calculator/', 'desc' => 'Exact age from a date of birth.'],
    ],

    'page' => [
        'slug'    => 'garage-sale-pricing-calculator',
        'title'   => 'Garage Sale Pricing Calculator — What to Charge for Used Items',
        'h1'      => 'Garage Sale Pricing Calculator',
        'kicker'  => 'Yard sale price calculator',
        'meta'    => 'Free garage sale pricing calculator: enter what an item cost new, its category, condition and age to get a sticker price and the lowest offer to accept. Build a price list and print price tags.',
        'intro'   => 'Enter what an item cost new, pick its category, condition and age, and get a garage-sale-friendly sticker price plus the lowest offer worth accepting. Add items to a price list to see your expected total and print price tags.',
        'sources' => ['angi', 'dollar', 'moneycr', 'dupaco', 'hillbilly', 'gstracker', 'frugal', 'cpsc', 'nhtsa'],
        'faq' => [
            ['How do I price items for a garage sale?', 'Start from what the item cost new and take a fraction of it: most everyday items sell for about 10–30% of retail, electronics for 20–30% of today’s price, and furniture for at most a third of what you paid. Adjust for condition and age, round to an easy amount like $0.50, $1 or $5, and leave some room to haggle. The calculator applies exactly those steps.'],
            ['What is the 10% rule for garage sales?', 'It is a shortcut: price ordinary used items at about 10% of their original retail price, moving toward 30% for like-new items. It works for clothes, housewares and décor; electronics, quality furniture and tools usually hold more value.'],
            ['How much should I sell clothes for at a garage sale?', 'Adult clothes usually sell for $2–$5 a piece, kids’ and baby clothes for $0.25–$3, with coats, shoes and name brands higher. Many sellers also offer a “fill a bag for $5” deal near the end of the day.'],
            ['How much room should I leave for haggling?', 'Shoppers expect to negotiate. The calculator’s “lowest price to accept” is about 30% under the sticker price, which matches the common advice to mark prices 25–50% above your bottom line.'],
            ['Should I price every item?', 'Yes. Buyers are less likely to ask than to walk away, and price stickers speed up checkout. Group cheap items into bins with one price (“everything in this box $1”) and use the price-tag print option for the rest.'],
            ['What should I not sell at a garage sale?', 'Recalled products, used car seats and cribs you can’t vouch for, and helmets that may have been in a crash. Check cpsc.gov/Recalls — selling a recalled product is illegal, including at yard sales.'],
            ['What if my item is vintage, collectible or valuable?', 'Don’t rely on a percentage of the original price. Look up recently sold listings for the same item online, or get an appraisal for jewelry, art and antiques, then price from that value.'],
            ['Does this calculator save my items?', 'Your price list is saved only in this browser on this device so you can come back to it. Nothing is sent to a server. Use “Clear list” to delete it.'],
        ],
    ],
];
