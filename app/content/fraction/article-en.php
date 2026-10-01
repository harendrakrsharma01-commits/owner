<?php /** Fraction Calculator article — English. Worked examples match tests/fraction.test.js. */ ?>
<section aria-labelledby="a-intro">
  <h2 id="a-intro">A fraction calculator that shows its work</h2>
  <p>A fraction has two parts: the <strong>numerator</strong> (top number) counts the parts you have, and the <strong>denominator</strong> (bottom number) says how many equal parts make one whole. This calculator works with proper fractions such as 3/4, improper fractions such as 7/4, mixed numbers such as 2 1/3, whole numbers and negative values.</p>
  <p>Answers are exact. The calculator uses whole-number arithmetic for every step instead of rounded decimals, so 1/3 stays 1/3 and very large numerators and denominators don’t lose accuracy. Decimals are only used for display, and you choose how many places to show.</p>
</section>

<section aria-labelledby="a-use">
  <h2 id="a-use">How to use the fraction calculator</h2>
  <ol>
    <li>Type the first fraction: the top box is the numerator, the bottom box is the denominator. For a mixed number, also fill in the whole-number box on the left.</li>
    <li>Choose <strong>+</strong>, <strong>−</strong>, <strong>×</strong> or <strong>÷</strong>.</li>
    <li>Type the second fraction and press <strong>Calculate</strong> (or Enter).</li>
    <li>Read the simplified fraction, the mixed number, decimal and percent, then open the step-by-step solution.</li>
  </ol>
  <p>The tabs above the calculator open the other tools: several fractions at once, simplify, mixed numbers, decimals, percents, compare, order, a fraction of a number, “what fraction is X of Y?” and equivalent fractions.</p>
</section>

<section aria-labelledby="a-add">
  <h2 id="a-add">Adding fractions</h2>
  <p>You can only add parts of the same size, so first give both fractions the same denominator. The smallest one that works is the <strong>least common denominator (LCD)</strong>.</p>
  <div class="fr-callout"><p><strong>Example: <span dir="ltr">1/2 + 1/3</span></strong></p><ol>
    <li>LCD of 2 and 3 = 6</li><li><span dir="ltr">1/2 = 3/6</span> and <span dir="ltr">1/3 = 2/6</span></li><li><span dir="ltr">3/6 + 2/6 = 5/6</span></li><li>5/6 is already in lowest terms.</li></ol></div>
</section>

<section aria-labelledby="a-sub">
  <h2 id="a-sub">Subtracting fractions</h2>
  <p>Subtraction works the same way: common denominator first, then subtract the numerators.</p>
  <div class="fr-callout"><p><strong>Example: <span dir="ltr">3/4 − 1/6</span></strong></p><ol>
    <li>LCD of 4 and 6 = 12</li><li><span dir="ltr">3/4 = 9/12</span> and <span dir="ltr">1/6 = 2/12</span></li><li><span dir="ltr">9/12 − 2/12 = 7/12</span></li></ol></div>
  <p>If the second fraction is larger, the answer is negative: <span dir="ltr">1/4 − 3/4 = −1/2</span>.</p>
</section>

<section aria-labelledby="a-mul">
  <h2 id="a-mul">Multiplying fractions</h2>
  <p>No common denominator is needed. Multiply the numerators, multiply the denominators, then simplify.</p>
  <div class="fr-callout"><p><strong>Example: <span dir="ltr">2/3 × 3/4</span></strong></p><ol>
    <li>Numerators: 2 × 3 = 6</li><li>Denominators: 3 × 4 = 12</li><li><span dir="ltr">6/12 = 1/2</span> (GCD 6)</li></ol></div>
</section>

<section aria-labelledby="a-div">
  <h2 id="a-div">Dividing fractions</h2>
  <p>To divide by a fraction, multiply by its <strong>reciprocal</strong> — the same fraction flipped upside down.</p>
  <div class="fr-callout"><p><strong>Example: <span dir="ltr">2/3 ÷ 4/5</span></strong></p><ol>
    <li>Flip 4/5 to 5/4</li><li><span dir="ltr">2/3 × 5/4 = 10/12</span></li><li><span dir="ltr">10/12 = 5/6</span> (GCD 2)</li></ol></div>
  <p>Dividing by zero is undefined, so the calculator stops you if the second fraction equals 0. Zero divided by a fraction is simply 0.</p>
</section>

<section aria-labelledby="a-simp">
  <h2 id="a-simp">How to simplify a fraction</h2>
  <p>A fraction is in <strong>lowest terms</strong> when the numerator and denominator have no common factor except 1. Divide both by their <strong>greatest common divisor (GCD)</strong>, also called the greatest common factor. The Simplify tab finds the GCD with Euclid’s algorithm and shows each line.</p>
  <div class="fr-callout"><p><strong>Example: 24/36.</strong> 36 = 1 × 24 + 12, 24 = 2 × 12 + 0, so GCD = 12 and <span dir="ltr">24/36 = 2/3</span>.</p></div>
</section>

<section aria-labelledby="a-mixed">
  <h2 id="a-mixed">Mixed numbers and improper fractions</h2>
  <p>An <strong>improper fraction</strong> has a numerator at least as large as its denominator (7/3). A <strong>mixed number</strong> writes the same value as a whole number plus a proper fraction (2 1/3).</p>
  <ul>
    <li>Mixed → improper: whole × denominator + numerator. <span dir="ltr">2 1/3</span> → 2 × 3 + 1 = 7 → 7/3.</li>
    <li>Improper → mixed: divide. 7 ÷ 3 = 2 remainder 1 → <span dir="ltr">2 1/3</span>.</li>
  </ul>
  <p>For a negative mixed number, the minus sign belongs to the whole value: <span dir="ltr">−2 1/3 = −7/3</span>. Type the minus sign in the whole-number box only.</p>
</section>

<section aria-labelledby="a-dec">
  <h2 id="a-dec">Fractions to decimals and decimals to fractions</h2>
  <p><strong>Fraction → decimal:</strong> divide the numerator by the denominator. 3/8 = 0.375. A fraction in lowest terms has a decimal that ends only if its denominator has no prime factors except 2 and 5; otherwise the digits repeat, like <span dir="ltr">1/6 = 0.1666… = 0.1(6)</span>.</p>
  <p><strong>Decimal → fraction:</strong> count the decimal places and write the digits over 10, 100, 1000 and so on, then simplify. <span dir="ltr">0.75 = 75/100 = 3/4</span> and <span dir="ltr">0.125 = 125/1000 = 1/8</span>. The calculator treats a typed decimal as exactly what you wrote: 0.333333 becomes 333333/1000000, not 1/3. To enter a repeating decimal exactly, put the repeating digits in brackets: <span dir="ltr">0.(3) = 1/3</span>.</p>
</section>

<section aria-labelledby="a-pct">
  <h2 id="a-pct">Fractions to percentages</h2>
  <p>Percent means “per hundred”. Multiply a fraction by 100 to get a percent: <span dir="ltr">1/2 = 50%</span>, <span dir="ltr">3/4 = 75%</span>, <span dir="ltr">1/8 = 12.5%</span>. To go back, write the percent over 100 and simplify: <span dir="ltr">12.5% = 12.5/100 = 1/8</span>.</p>
</section>

<section aria-labelledby="a-cmp">
  <h2 id="a-cmp">Comparing and ordering fractions</h2>
  <p>To see which fraction is larger, <strong>cross-multiply</strong>: for 2/3 and 3/5, 2 × 5 = 10 and 3 × 3 = 9, so <span dir="ltr">2/3 &gt; 3/5</span>. You can also rewrite both with the LCD (10/15 and 9/15). The Compare and Order tabs use exact cross-multiplication rather than rounded decimals, so even fractions that differ in the 17th decimal place are ordered correctly.</p>
</section>

<section aria-labelledby="a-eq">
  <h2 id="a-eq">Equivalent fractions</h2>
  <p>Multiplying the numerator and denominator by the same number gives an equivalent fraction — the same amount cut into more pieces: <span dir="ltr">1/2 = 2/4 = 3/6 = 4/8 = 5/10</span>. Simplifying is the same idea in reverse.</p>
</section>

<section aria-labelledby="a-of">
  <h2 id="a-of">Finding a fraction of a number</h2>
  <p>“Of” means multiply. <span dir="ltr">3/4 of 80 = 3/4 × 80 = 240/4 = 60</span>. The reverse question — “15 is what fraction of 60?” — is a division: <span dir="ltr">15/60 = 1/4 = 25%</span>.</p>
</section>

<section aria-labelledby="a-lcd">
  <h2 id="a-lcd">Least common denominator, GCD and LCM</h2>
  <p>Two whole-number helpers do most of the work in fraction arithmetic:</p>
  <ul>
    <li><strong>GCD</strong> (greatest common divisor) — the largest number that divides both numbers. Used to simplify.</li>
    <li><strong>LCM</strong> (least common multiple) — the smallest number both numbers divide. The LCM of the denominators is the <strong>LCD</strong>, used to add, subtract and compare.</li>
  </ul>
  <p>They are linked: LCM(a, b) = a × b ÷ GCD(a, b). For 4 and 6, GCD = 2, so LCM = 24 ÷ 2 = 12.</p>
</section>

<section aria-labelledby="a-mist">
  <h2 id="a-mist">Common fraction mistakes</h2>
  <ul>
    <li>Adding denominators: <span dir="ltr">1/2 + 1/3</span> is not 2/5. Use a common denominator.</li>
    <li>Forgetting to flip the second fraction when dividing.</li>
    <li>Leaving answers unsimplified, such as 6/12 instead of 1/2.</li>
    <li>Treating <span dir="ltr">−2 1/3</span> as −2 + 1/3. It means −(2 + 1/3) = −7/3.</li>
    <li>Comparing fractions by their denominators alone: 3/5 is larger than 1/2 even though 5 is the bigger denominator.</li>
  </ul>
</section>
