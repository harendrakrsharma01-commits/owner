<?php /* Main article — Date of Birth Calculator. Plain HTML; figures verified by tests/age-dob.test.js and the engine. */ ?>
<section aria-labelledby="a-what">
  <h2 id="a-what">What a date of birth calculator does</h2>
  <p>A date of birth calculator — often shortened to <strong>DOB calculator</strong> — turns a birth date into an age. The simplest version answers “how old am I today?”, but the useful questions are usually more specific: how old will I be on the exam date, how old was I when we moved house, how many days have I been alive, and when is my next birthday?</p>
  <p>This page answers all of those from a single form. Enter the date of birth, leave “Age as of” on today or change it to any date between the years 1 and 9999, and read the results: exact age in years, months and days; the same span as total months, weeks, days, hours, minutes and seconds; your next birthday and the age you will turn; the weekday you were born; and upcoming milestone birthdays.</p>
  <p>There is no “calculate” button to press. Results appear as soon as both dates are valid — we call this <em>instant calculation</em> — and everything happens inside your browser.</p>
</section>

<section aria-labelledby="a-how">
  <h2 id="a-how">How to calculate age from date of birth</h2>
  <ol>
    <li><strong>Enter the date of birth.</strong> Type it in the format shown (the placeholder follows the country you picked) or use the calendar button. Under the field, the date is repeated in words — “Reads as Sunday, 24 September 2000” — so you can confirm it was understood correctly.</li>
    <li><strong>Choose the “as of” date.</strong> It starts on today’s date on your device. Use the quick buttons for yesterday, tomorrow, your birthday this year or your next birthday, or type any past or future date.</li>
    <li><strong>Read the result.</strong> The large figure is the exact age. The cards beneath give totals in other units, followed by the birthday countdown, weekday of birth and an age timeline.</li>
    <li><strong>Optional:</strong> open “Include time of birth” if you know the time and want precise hours, minutes and seconds.</li>
  </ol>
</section>

<section aria-labelledby="a-exact">
  <h2 id="a-exact">How exact age is worked out</h2>
  <p>Subtracting birth year from the current year is only right after this year’s birthday has passed. A correct age count works like reading a calendar:</p>
  <ol>
    <li><strong>Completed years</strong> — the number of birthdays that have happened up to and including the as-of date.</li>
    <li><strong>Completed months</strong> — whole calendar months from the last birthday, counted from the same day-of-month (15 January → 15 February is one month whether that month had 28 or 31 days).</li>
    <li><strong>Remaining days</strong> — the days left between the last whole month and the as-of date.</li>
  </ol>
  <p>Each step is measured from the original birth date rather than from the result of the previous step. That detail matters for dates such as 31 January: chaining “+1 month” three times would drift to the 28th, while measuring from the original date keeps coming back to the 31st whenever the month allows it.</p>
  <div class="adob-callout">
    <p><strong>Worked example.</strong> Born 24 September 2000, as of 26 September 2026:</p>
    <ul>
      <li>24 Sep 2000 → 24 Sep 2026 = 26 completed years</li>
      <li>24 Sep 2026 → 26 Sep 2026 = 0 completed months and 2 days</li>
      <li>Exact age: <strong>26 years, 0 months, 2 days</strong></li>
    </ul>
  </div>
</section>

<section aria-labelledby="a-units">
  <h2 id="a-units">Age in total days, weeks, months, hours, minutes and seconds</h2>
  <p>“How many days old am I?” is a different question from “how old am I?”. Calendar age tells you completed birthdays; totals count every unit that has passed. The calculator keeps the two apart and computes totals directly from the dates, never from the rounded age.</p>

  <h3>Total days</h3>
  <p>Total days is the number of calendar days from the date of birth to the as-of date. For the example above it is <strong>9,498 days</strong>. Notice that 26 × 365 would give 9,490, yet the span from 24 September 2000 to 24 September 2026 is 9,496 days: the six 29 Februaries in 2004, 2008, 2012, 2016, 2020 and 2024 each add a day. That is why this tool never estimates age as days ÷ 365.25 for the headline result.</p>

  <h3>Total weeks</h3>
  <p>Weeks are total days divided by seven, shown as completed weeks plus leftover days — 9,498 days is 1,356 weeks and 6 days. The number is never rounded up, so a baby who is 6 days old is 0 weeks and 6 days, not “1 week”.</p>

  <h3>Total months</h3>
  <p>Total months are completed calendar months: years × 12 plus the months part of the exact age, with remaining days shown separately. For the example that is 312 months and 2 days. Dividing days by 30 or 30.44 would produce a figure that doesn’t match any real calendar date, so it isn’t used.</p>

  <h3>Hours, minutes and seconds</h3>
  <p>With only a date of birth, nobody can know the exact number of seconds you have been alive — you might have been born at 00:01 or at 23:59. When no time is entered, the calculator says so and counts whole days from midnight to midnight: total days × 24 hours, × 1,440 minutes or × 86,400 seconds. Treat those as date-based figures, not second-accurate ones.</p>
  <p>For precision, switch on <strong>Include time of birth</strong>. You can set the birth time and the time zone where the birth happened, plus an as-of time and zone. The totals then become the true elapsed time between two moments, including any daylight-saving changes in between (the browser applies the rules from the IANA time zone database). Someone born at 14:30 on 24 September 2000 in India is, at 09:00 on 26 September 2026 in India, 26 years, 0 months, 1 day, 18 hours and 30 minutes old — 227,946 complete hours.</p>
</section>

<section aria-labelledby="a-asof">
  <h2 id="a-asof">Age on a past or future date</h2>
  <p>The “as of” date turns the calculator into an <strong>age on date calculator</strong>. Common reasons to change it include:</p>
  <ul>
    <li>the age a child will be on a school-year or sports-season cut-off date;</li>
    <li>your age on an exam date, admission date or application deadline;</li>
    <li>how old you will be on a planned retirement date or at a future event;</li>
    <li>how old you, a parent or a historical figure were on a particular day.</li>
  </ul>
  <p>For instance, someone born on 15 March 2008 is 18 years, 2 months and 17 days old on 1 June 2026. The result is the age on that date — nothing more. Whether it satisfies a minimum or maximum age rule depends on how the organisation writes that rule (some count “age on” a date, some “age not exceeding” a number of years, some ignore the day), so always read the official notice. If the as-of date is before the date of birth, the calculator tells you instead of showing a negative age.</p>
</section>

<section aria-labelledby="a-bday">
  <h2 id="a-bday">Next birthday and the day you were born</h2>
  <p>The birthday panel shows your next birthday with its weekday, the age you will turn, the days remaining and the same countdown as weeks plus days. The ring fills as the current birthday year passes. On your birthday itself the panel says so and counts towards the following one. For a dedicated countdown with previous and upcoming birthdays in a table, use the <a href="/birthday-countdown-calculator/">Birthday Countdown Calculator</a>.</p>
  <p>The “Born on” panel gives the weekday of birth, the day of the year and the ISO week number. Someone born on 15 January 1990 was born on a Monday — day 15 of 365, ISO week 3. The <a href="/day-of-birth-calculator/">Day of Birth Calculator</a> also lists the weekday of your next ten birthdays.</p>
</section>

<section aria-labelledby="a-leap">
  <h2 id="a-leap">Leap years and 29 February birthdays</h2>
  <p>Under the Gregorian calendar a year is a leap year if it is divisible by 4, except century years, which must also be divisible by 400. So 2000 and 2024 were leap years, while 1900 was not and 2100 will not be. The calculator uses that rule for every date, which keeps total-day counts exact over long spans.</p>
  <p>People born on 29 February keep that date of birth; the calculator never changes it. The only question is which day counts as the birthday in a common year. There are two widespread conventions:</p>
  <ul>
    <li><strong>28 February</strong> — the last day of February. This is our default, and it matches how the tool treats every other month-end date.</li>
    <li><strong>1 March</strong> — the day after 28 February. Choose “Next day (Mar 1)” in the rule menu to use it.</li>
  </ul>
  <p>The choice changes the answer on exactly one day. Born 29 February 2004, on 28 February 2025 you are 21 years old under the first rule and 20 years, 11 months and 30 days under the second. There is no single worldwide legal answer. In Scotland, for example, section 6 of the Age of Legal Capacity (Scotland) Act 1991 says the anniversary of a 29 February birth in a non-leap year is taken to be 1 March. Other countries, states and organisations set their own rules, or none, so check the relevant authority if the date matters legally.</p>
</section>

<section aria-labelledby="a-monthend">
  <h2 id="a-monthend">Month-end dates: 31st, 30th and February</h2>
  <p>Birth dates on the 29th, 30th or 31st raise the same issue every month: “one month after 31 January” does not exist in February. The same rule menu decides it:</p>
  <div class="adob-scroll">
  <table>
    <caption class="adob-sr">Month-end examples under each rule</caption>
    <thead><tr><th scope="col">From</th><th scope="col">To</th><th scope="col">Last day of month (default)</th><th scope="col">Next day</th></tr></thead>
    <tbody>
      <tr><th scope="row">31 Jan 2025</th><td>28 Feb 2025</td><td>1 month, 0 days</td><td>0 months, 28 days</td></tr>
      <tr><th scope="row">31 Jan 2025</th><td>1 Mar 2025</td><td>1 month, 1 day</td><td>1 month, 0 days</td></tr>
      <tr><th scope="row">31 Jan 2025</th><td>31 Mar 2025</td><td>2 months, 0 days</td><td>2 months, 0 days</td></tr>
      <tr><th scope="row">30 Apr 2025</th><td>31 May 2025</td><td>1 month, 1 day</td><td>1 month, 1 day</td></tr>
      <tr><th scope="row">31 May 2025</th><td>30 Jun 2025</td><td>1 month, 0 days</td><td>0 months, 30 days</td></tr>
      <tr><th scope="row">28 Feb 2025</th><td>31 Mar 2025</td><td>1 month, 3 days</td><td>1 month, 3 days</td></tr>
    </tbody>
  </table>
  </div>
  <p>Either way the result is never negative, the days part never exceeds the length of a month, and the total-days figure is identical under both rules — only the split into months and days changes.</p>
</section>

<section aria-labelledby="a-disagree">
  <h2 id="a-disagree">Why age calculators sometimes disagree</h2>
  <ul>
    <li><strong>Month-end conventions</strong>, described above, change the months/days split around the 29th–31st.</li>
    <li><strong>Leap-day birthdays</strong> may be placed on 28 February or 1 March.</li>
    <li><strong>Averages instead of calendars.</strong> Tools that divide days by 365.25 or treat a month as 30 days produce ages that drift by a day or more.</li>
    <li><strong>Time zones.</strong> A tool running on a server may use a different “today” from yours near midnight. This one uses the date on your own device.</li>
    <li><strong>Inclusive counting.</strong> Some forms count both the start and end days. This calculator counts the difference between dates, so the day of birth itself is day 0.</li>
    <li><strong>Misread dates.</strong> 04/05/2000 is 4 May in the UK and India but 5 April in the US — see the next section.</li>
  </ul>
</section>

<section aria-labelledby="a-formats">
  <h2 id="a-formats">Date formats in the US, UK, Canada, India and elsewhere</h2>
  <p>The age calculation is identical in every country. What changes is how people write dates, and a misread date gives a wrong age with no warning. The country menu sets a sensible display format; you can override it with the date-format menu. Whatever you choose, the calculator stores the date internally as an unambiguous year-month-day value and repeats it in words.</p>
  <ul>
    <li><strong>United States</strong> — month first: 09/24/2000, written out as September 24, 2000.</li>
    <li><strong>United Kingdom</strong> — day first: 24/09/2000, written out as 24 September 2000.</li>
    <li><strong>Canada</strong> — mixed in everyday use. The Government of Canada and the Standards Council of Canada recommend the ISO 8601 form 2000-09-24 for all-numeric dates because it cannot be misread, so that is the default for Canada here; switch to DD/MM/YYYY or MM/DD/YYYY if a form asks for it.</li>
    <li><strong>India</strong> — day first: 24/09/2000 or 24-09-2000. Recruitment and admission notices commonly state an “age as on” date; set that date in the as-of field. Numbers are grouped the Indian way (for example 1,00,000).</li>
    <li><strong>Australia and New Zealand</strong> — day first, as in the UK.</li>
  </ul>
  <p>Four-digit years are required when typing, so “04/05/00” is rejected rather than guessed.</p>
</section>

<section aria-labelledby="a-mistakes">
  <h2 id="a-mistakes">Common mistakes to avoid</h2>
  <ul>
    <li>Subtracting years without checking whether this year’s birthday has passed.</li>
    <li>Entering a day-first date while the format is set to month first (watch the “Reads as” line).</li>
    <li>Multiplying age in years by 365 to get days lived.</li>
    <li>Treating date-only hours or seconds as exact.</li>
    <li>Assuming a calculated age proves eligibility — the organisation’s own rule decides that.</li>
  </ul>
</section>

<section aria-labelledby="a-privacy">
  <h2 id="a-privacy">Privacy and limitations</h2>
  <p>A date of birth is personal information, so the calculator is built to keep it with you. The page makes no network request with your inputs, the date of birth never appears in the page address, and copy or share only includes it if you tick the box to allow that. “Remember on this device” is off by default; when ticked it stores the date of birth and your display settings in your browser’s local storage, and unticking removes them.</p>
  <p>Limitations: dates use the Gregorian calendar throughout, including before countries adopted it (Britain changed in 1752), so ages computed from Julian-calendar records can differ by 10–13 days. The tool supports years 1–9999. It performs date arithmetic only; it is not an identity check, an official record or a legal, medical or insurance determination.</p>
  <p>Related tools: the quick <a href="/age-calculator/">Age Calculator</a>, the <a href="/age-difference-calculator/">Age Difference Calculator</a> for the gap between two people, and the <a href="/age-milestone-calculator/">Age Milestone Calculator</a> for the dates you turn 18, 21, 50 or 100.</p>
</section>
