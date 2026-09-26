<?php /* Day of Birth Calculator article. */ ?>
<section aria-labelledby="d-how">
  <h2 id="d-how">How the weekday of a date is found</h2>
  <p>Weekdays repeat every seven days without exception, so the weekday of any date can be found by counting days from a date whose weekday is known. This calculator converts your date of birth into a day number — the count of days since Thursday 1 January 1970 — using an exact formula for the Gregorian calendar (the widely used <code>days_from_civil</code> algorithm), then takes the remainder after dividing by seven. No lookup tables or external services are involved, so it works the same for 1850, 2000 or 2400.</p>
  <p>The same day number gives the <strong>day of the year</strong> (1 January is day 1; 31 December is day 365, or 366 in a leap year) and the <strong>ISO week number</strong>.</p>
</section>

<section aria-labelledby="d-iso">
  <h2 id="d-iso">ISO week numbers</h2>
  <p>ISO 8601 weeks start on Monday, and week 1 is the week that contains 4 January (equivalently, the first week with a Thursday). As a result the first days of January can belong to the last week of the previous year, and the last days of December to week 1 of the next. 31 December 2024 is in ISO week 1 of 2025, and 3 January 2021 is in week 53 of 2020 — the calculator shows the week-year whenever it differs from the calendar year.</p>
</section>

<section aria-labelledby="d-ex">
  <h2 id="d-ex">Examples</h2>
  <div class="adob-scroll">
  <table>
    <caption class="adob-sr">Example dates and their weekdays</caption>
    <thead><tr><th scope="col">Date</th><th scope="col">Weekday</th><th scope="col">Day of year</th><th scope="col">ISO week</th></tr></thead>
    <tbody>
      <tr><th scope="row">15 January 1990</th><td>Monday</td><td>15</td><td>3</td></tr>
      <tr><th scope="row">24 September 2000</th><td>Sunday</td><td>268</td><td>38</td></tr>
      <tr><th scope="row">29 February 2024</th><td>Thursday</td><td>60</td><td>9</td></tr>
      <tr><th scope="row">31 December 2024</th><td>Tuesday</td><td>366</td><td>1 (of 2025)</td></tr>
    </tbody>
  </table>
  </div>
</section>

<section aria-labelledby="d-cal">
  <h2 id="d-cal">Old dates and the calendar change</h2>
  <p>The calculator applies Gregorian rules to every date, including those before a country adopted the Gregorian calendar. Most of Catholic Europe switched in 1582; Great Britain and its colonies, including those in North America, switched in September 1752, when 2 September was followed by 14 September. A birth recorded in the older Julian calendar (“Old Style”) therefore shows a different weekday here unless it is first converted to the Gregorian date.</p>
</section>

<section aria-labelledby="d-next">
  <h2 id="d-next">Your birthday’s weekday in future years</h2>
  <p>A common year is 52 weeks plus one day, so a birthday moves forward one weekday each year, and two when a 29 February falls in between. The table in the results lists the weekday of your next ten birthdays. For a countdown to the next one, see the <a href="/birthday-countdown-calculator/">Birthday Countdown Calculator</a>; for your full age and days lived, the <a href="/date-of-birth-calculator/">Date of Birth Calculator</a>.</p>
</section>
