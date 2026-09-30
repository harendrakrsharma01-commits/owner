<?php
/**
 * Renders the Garage Sale Pricing Calculator page from app/config/garage-sale.php.
 * Everything user-visible is escaped with e(); JSON is emitted with JSON_HEX_* flags
 * so it cannot break out of <script> blocks.
 */
final class GarageSalePage
{
    private array $cfg;
    private array $page;

    public function __construct(?array $cfg = null)
    {
        $this->cfg = $cfg ?? require __DIR__ . '/../config/garage-sale.php';
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

    public function url(): string
    {
        return rtrim($this->cfg['site']['base_url'], '/') . '/' . $this->page['slug'] . '/';
    }

    public function sources(): array
    {
        return array_map(fn ($k) => $this->cfg['sources'][$k], $this->page['sources']);
    }

    public function schema(): array
    {
        $url = $this->url();
        $base = $this->cfg['site']['base_url'];
        return ['@context' => 'https://schema.org', '@graph' => [
            [
                '@type' => 'WebPage', '@id' => $url . '#webpage', 'url' => $url,
                'name' => $this->page['title'], 'description' => $this->page['meta'],
                'dateModified' => $this->cfg['site']['updated'], 'inLanguage' => 'en-US',
                'isPartOf' => ['@type' => 'WebSite', 'name' => $this->cfg['site']['name'], 'url' => $base . '/'],
            ],
            [
                '@type' => 'SoftwareApplication', 'name' => $this->page['h1'], 'url' => $url,
                'applicationCategory' => 'UtilitiesApplication', 'operatingSystem' => 'Any (web browser)',
                'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'USD'],
                'description' => $this->page['meta'],
            ],
            [
                '@type' => 'BreadcrumbList',
                'itemListElement' => [
                    ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => $base . '/'],
                    ['@type' => 'ListItem', 'position' => 2, 'name' => $this->page['h1'], 'item' => $url],
                ],
            ],
            [
                '@type' => 'FAQPage',
                'mainEntity' => array_map(fn ($qa) => [
                    '@type' => 'Question', 'name' => $qa[0],
                    'acceptedAnswer' => ['@type' => 'Answer', 'text' => $qa[1]],
                ], $this->page['faq']),
            ],
        ]];
    }

    public function render(): string
    {
        $cfg = $this->cfg;
        $page = $this->page;
        $view = $this;
        ob_start();
        require __DIR__ . '/../views/garage-sale/layout.php';
        return (string) ob_get_clean();
    }
}
