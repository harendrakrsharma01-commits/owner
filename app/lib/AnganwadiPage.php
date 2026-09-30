<?php
/**
 * Renders the Anganwadi salary calculator page from app/config/anganwadi.php.
 * Everything user-visible is escaped with e(); JSON is emitted with JSON_HEX_* flags
 * so it cannot break out of <script> blocks.
 */
final class AnganwadiPage
{
    private array $cfg;
    private array $page;

    public function __construct(?array $cfg = null)
    {
        $this->cfg = $cfg ?? require __DIR__ . '/../config/anganwadi.php';
        $this->page = $this->cfg['page'];
    }

    public static function e(?string $s): string
    {
        return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    public static function json($data): string
    {
        return json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    /** Indian digit grouping: 144000 → 1,44,000 (mirrors formatINR in assets/js/lib/anganwadi.js). */
    public static function inr(?float $n): string
    {
        if ($n === null) return '';
        $s = (string) (int) round($n);
        if (strlen($s) <= 3) return $s;
        $out = substr($s, -3);
        $s = substr($s, 0, -3);
        while (strlen($s) > 2) { $out = substr($s, -2) . ',' . $out; $s = substr($s, 0, -2); }
        return $s . ',' . $out;
    }

    public static function hindiMonth(?string $ym): string
    {
        static $months = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
        if (!$ym || !preg_match('/^(\d{4})-(\d{2})$/', $ym, $m)) return '';
        return $months[(int) $m[2] - 1] . ' ' . $m[1];
    }

    public function url(): string
    {
        return rtrim($this->cfg['site']['base_url'], '/') . '/' . $this->page['slug'] . '/';
    }

    public function sources(): array
    {
        return array_map(fn ($k) => $this->cfg['sources'][$k], $this->page['sources']);
    }

    /** One source label/url pair by key, for the state table. */
    public function source(string $key): array
    {
        return $this->cfg['sources'][$key];
    }

    public function schema(): array
    {
        $url = $this->url();
        $base = $this->cfg['site']['base_url'];
        $graph = [
            [
                '@type' => 'WebPage', '@id' => $url . '#webpage', 'url' => $url,
                'name' => $this->page['title'], 'description' => $this->page['meta'],
                'dateModified' => $this->cfg['site']['updated'], 'inLanguage' => 'hi',
                'isPartOf' => ['@type' => 'WebSite', 'name' => $this->cfg['site']['name'], 'url' => $base . '/'],
            ],
            [
                '@type' => 'SoftwareApplication', 'name' => 'Anganwadi Salary Calculator', 'url' => $url,
                'applicationCategory' => 'FinanceApplication', 'operatingSystem' => 'Any (web browser)',
                'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'INR'],
                'description' => $this->page['meta'], 'inLanguage' => 'hi',
            ],
            [
                '@type' => 'BreadcrumbList',
                'itemListElement' => [
                    ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => $base . '/'],
                    ['@type' => 'ListItem', 'position' => 2, 'name' => 'Anganwadi Salary Calculator', 'item' => $url],
                ],
            ],
            [
                '@type' => 'FAQPage',
                'mainEntity' => array_map(fn ($qa) => [
                    '@type' => 'Question', 'name' => $qa[0],
                    'acceptedAnswer' => ['@type' => 'Answer', 'text' => $qa[1]],
                ], $this->page['faq']),
            ],
        ];
        return ['@context' => 'https://schema.org', '@graph' => $graph];
    }

    public function render(): string
    {
        $cfg = $this->cfg;
        $page = $this->page;
        $view = $this;
        ob_start();
        require __DIR__ . '/../views/anganwadi/layout.php';
        return (string) ob_get_clean();
    }
}
