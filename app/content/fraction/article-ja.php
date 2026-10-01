<?php /** 分数計算機の解説 — 日本語。例は tests/fraction.test.js と一致。 */ ?>
<section aria-labelledby="a-intro">
  <h2 id="a-intro">分数計算機でできること</h2>
  <p>分数は、<strong>分母</strong>（下の数）が「1を何等分したか」、<strong>分子</strong>（上の数）が「そのうちいくつ分か」を表します。この計算機は真分数（3/4）、仮分数（7/4）、帯分数（2と1/3）、整数、負の分数に対応しています。</p>
  <p>答えは常に正確です。計算はすべて整数で行い、四捨五入した小数は使わないため、1/3 は1/3のまま、大きな数でも誤差が出ません。小数は表示のためだけに使い、桁数は自分で選べます。</p>
</section>

<section aria-labelledby="a-use">
  <h2 id="a-use">使い方</h2>
  <ol>
    <li>1つ目の分数を入力します。上の欄が分子、下の欄が分母です。帯分数のときは左の欄に整数部分も入力します。</li>
    <li><strong>+</strong>・<strong>−</strong>・<strong>×</strong>・<strong>÷</strong> から選びます。</li>
    <li>2つ目の分数を入力して<strong>計算する</strong>（または Enter）を押します。</li>
    <li>既約分数・帯分数・小数・パーセントの答えと、途中式を確認します。</li>
  </ol>
  <p>上のタブから、3つ以上の分数の計算、約分、帯分数と仮分数の変換、小数・パーセント、大小比較、並べ替え、「ある数の何分のいくつ」、等しい分数のツールを使えます。</p>
</section>

<section aria-labelledby="a-add">
  <h2 id="a-add">分数の足し算（通分）</h2>
  <p>分母がちがう分数は、そのままでは足せません。まず<strong>通分</strong>して分母をそろえます。いちばん小さい公分母は、分母どうしの<strong>最小公倍数</strong>です。</p>
  <div class="fr-callout"><p><strong>例：<span dir="ltr">1/2 + 1/3</span></strong></p><ol>
    <li>2と3の最小公倍数 = 6</li><li><span dir="ltr">1/2 = 3/6</span>、<span dir="ltr">1/3 = 2/6</span></li><li><span dir="ltr">3/6 + 2/6 = 5/6</span></li><li>5/6 はこれ以上約分できません。</li></ol></div>
</section>

<section aria-labelledby="a-sub">
  <h2 id="a-sub">分数の引き算</h2>
  <p>引き算も通分してから分子を引きます。</p>
  <div class="fr-callout"><p><strong>例：<span dir="ltr">3/4 − 1/6</span></strong></p><ol>
    <li>4と6の最小公倍数 = 12</li><li><span dir="ltr">3/4 = 9/12</span>、<span dir="ltr">1/6 = 2/12</span></li><li><span dir="ltr">9/12 − 2/12 = 7/12</span></li></ol></div>
  <p>引く数のほうが大きいと答えは負になります：<span dir="ltr">1/4 − 3/4 = −1/2</span>。</p>
</section>

<section aria-labelledby="a-mul">
  <h2 id="a-mul">分数の掛け算</h2>
  <p>掛け算では通分は不要です。分子どうし、分母どうしを掛けてから約分します。</p>
  <div class="fr-callout"><p><strong>例：<span dir="ltr">2/3 × 3/4</span></strong></p><ol>
    <li>分子：2 × 3 = 6</li><li>分母：3 × 4 = 12</li><li><span dir="ltr">6/12 = 1/2</span>（最大公約数 6）</li></ol></div>
</section>

<section aria-labelledby="a-div">
  <h2 id="a-div">分数の割り算</h2>
  <p>分数で割るときは、割る数を<strong>逆数</strong>（分子と分母を入れかえた数）にして掛けます。</p>
  <div class="fr-callout"><p><strong>例：<span dir="ltr">2/3 ÷ 4/5</span></strong></p><ol>
    <li>4/5 の逆数は 5/4</li><li><span dir="ltr">2/3 × 5/4 = 10/12</span></li><li><span dir="ltr">10/12 = 5/6</span>（最大公約数 2）</li></ol></div>
  <p>0で割ることはできないので、割る数が0のときは計算機がエラーを表示します。0を分数で割った答えは0です。</p>
</section>

<section aria-labelledby="a-simp">
  <h2 id="a-simp">約分のしかた</h2>
  <p>分子と分母を<strong>最大公約数</strong>で割ると、それ以上約分できない<strong>既約分数</strong>になります。「約分」タブでは、ユークリッドの互除法で最大公約数を求める計算を1行ずつ表示します。</p>
  <div class="fr-callout"><p><strong>例：24/36。</strong> 36 = 1 × 24 + 12、24 = 2 × 12 + 0 より最大公約数は12、<span dir="ltr">24/36 = 2/3</span>。</p></div>
</section>

<section aria-labelledby="a-mixed">
  <h2 id="a-mixed">帯分数と仮分数</h2>
  <p><strong>仮分数</strong>は分子が分母以上の分数（7/3）、<strong>帯分数</strong>は同じ大きさを「整数と真分数」で表したもの（2と1/3）です。この計算機では帯分数を「2 1/3」のように、整数と分数の間を空けて表示します。</p>
  <ul>
    <li>帯分数 → 仮分数：整数 × 分母 + 分子。2と1/3 → 2 × 3 + 1 = 7 → 7/3。</li>
    <li>仮分数 → 帯分数：分子 ÷ 分母。7 ÷ 3 = 2 あまり 1 → 2と1/3。</li>
  </ul>
  <p>負の帯分数は全体にマイナスがつきます：<span dir="ltr">−2 1/3 = −7/3</span>。マイナス記号は整数の欄だけに入力してください。</p>
</section>

<section aria-labelledby="a-dec">
  <h2 id="a-dec">分数と小数の変換</h2>
  <p><strong>分数 → 小数：</strong>分子を分母で割ります。3/8 = 0.375。既約分数の分母の素因数が2と5だけなら割り切れ（有限小数）、それ以外なら <span dir="ltr">1/6 = 0.1666… = 0.1(6)</span> のような循環小数になります。</p>
  <p><strong>小数 → 分数：</strong>小数点以下の桁数に合わせて10、100、1000…を分母にして約分します。<span dir="ltr">0.75 = 75/100 = 3/4</span>、<span dir="ltr">0.125 = 125/1000 = 1/8</span>。入力した小数はそのままの値として扱うため、0.333333 は 333333/1000000 になり、1/3 にはなりません。循環小数を正確に入れるときは、循環する部分をかっこで囲みます：<span dir="ltr">0.(3) = 1/3</span>。</p>
</section>

<section aria-labelledby="a-pct">
  <h2 id="a-pct">分数とパーセント</h2>
  <p>パーセント（百分率）は「100あたりいくつ」。分数に100を掛けます：<span dir="ltr">1/2 = 50%</span>、<span dir="ltr">3/4 = 75%</span>、<span dir="ltr">1/8 = 12.5%</span>。逆は100で割って約分します：<span dir="ltr">12.5% = 12.5/100 = 1/8</span>。</p>
</section>

<section aria-labelledby="a-cmp">
  <h2 id="a-cmp">分数の大小比較と並べ替え</h2>
  <p><strong>たすき掛け</strong>で比べると簡単です。2/3 と 3/5 なら 2 × 5 = 10、3 × 3 = 9 なので <span dir="ltr">2/3 &gt; 3/5</span>。通分しても確かめられます（10/15 と 9/15）。「大小比較」と「並べ替え」は四捨五入した小数ではなく正確なたすき掛けで判定するので、差がとても小さい分数でも正しく並びます。</p>
</section>

<section aria-labelledby="a-eq">
  <h2 id="a-eq">等しい分数</h2>
  <p>分子と分母に同じ数を掛けると、大きさの等しい分数ができます：<span dir="ltr">1/2 = 2/4 = 3/6 = 4/8 = 5/10</span>。約分はその逆の操作です。</p>
</section>

<section aria-labelledby="a-of">
  <h2 id="a-of">ある数の分数を求める</h2>
  <p>「80の3/4」は掛け算です：<span dir="ltr">3/4 × 80 = 240/4 = 60</span>。逆に「15は60の何分のいくつ？」は割り算で、<span dir="ltr">15/60 = 1/4 = 25%</span> です。</p>
</section>

<section aria-labelledby="a-lcd">
  <h2 id="a-lcd">最大公約数・最小公倍数と公分母</h2>
  <ul>
    <li><strong>最大公約数</strong>：2つの数をどちらも割り切るいちばん大きい数。約分に使います。</li>
    <li><strong>最小公倍数</strong>：2つの数のどちらでも割り切れるいちばん小さい数。分母の最小公倍数が通分の公分母になります。</li>
  </ul>
  <p>関係式：最小公倍数 = a × b ÷ 最大公約数。4と6なら最大公約数2、最小公倍数 = 24 ÷ 2 = 12。</p>
</section>

<section aria-labelledby="a-mist">
  <h2 id="a-mist">よくある間違い</h2>
  <ul>
    <li>分母どうしを足してしまう：<span dir="ltr">1/2 + 1/3</span> は 2/5 ではありません。</li>
    <li>割り算で逆数にするのを忘れる。</li>
    <li>約分を忘れて 6/12 のまま答える（正しくは 1/2）。</li>
    <li><span dir="ltr">−2 1/3</span> を −2 + 1/3 と考える。正しくは −(2 + 1/3) = −7/3。</li>
    <li>分母の大きさだけで比べる：3/5 は 1/2 より大きい。</li>
  </ul>
</section>
