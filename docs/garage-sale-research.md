# Garage sale pricing calculator — research and method

Research date: 30 September 2026, from web-search results (pricing guides and their search summaries).
No keyword-volume tool data was used.

## Competition

A search for "garage sale price calculator online tool" returned no interactive web calculator — only
mobile apps (Point Of Sale Manager, Underpriced), printable PDFs and blog guides (Angi, The Dollar
Stretcher, Money Crashers, YardHunts, Yardy, tryfinna). The page targets that gap.

## Rules taken from the guides

| Rule | Value used | Source |
|---|---|---|
| Everyday items | 10–30% of retail; like-new toward 30%, well-used toward 10% | Dollar Stretcher, GarageSalesTracker |
| Excellent condition | up to 50% of retail → hard cap at 50% | Angi / guides |
| Electronics | 20–30% of current retail, tested | Dollar Stretcher |
| Furniture | at most one third of what you paid | Money Crashers, Dupaco |
| Clothes | adult $3–$5, kids $1–$3, baby $0.25–$1 | Money Crashers, My Frugal Home PDF |
| Books | hardcover ~$1–$2, paperback $0.25–$0.50 | Hillbilly Housewife |
| DVDs | $2–$4 | Hillbilly Housewife |
| Dishes | $0.25–$1 each; small appliances $3–$10 if working | Dollar Stretcher |
| Hand tools | ~$2 each | Angi |
| Haggle room | mark 25–50% above bottom line → floor = 70% of sticker | Angi / guides |
| Safety | selling recalled products is illegal (CPSC); car seat recalls at NHTSA | cpsc.gov, nhtsa.gov |

## Method (see app/config/garage-sale.php)

sticker = round_friendly(clamp(new price × category % × condition × age^sensitivity × goal,
category minimum, 50% of new price)); floor = round_down(sticker × 0.7).
Friendly steps: <$1 quarters, <$5 halves, <$20 dollars, <$100 fives, else tens.
Reference items (tests/garage-sale.test.js) land inside the guide ranges: jeans $50 → $5,
hardcover $28 → $1.50, air fryer $100 → $9, TV $500 (3–5 yrs) → $90, solid dresser $800 (5–10 yrs) → $200.

## Keywords handled

garage sale pricing calculator, yard sale pricing calculator, garage sale price guide, how to price
garage sale items, what to charge at a garage sale, 10% rule garage sale, garage sale clothes prices,
garage sale price tags (printable), yard sale price list.
