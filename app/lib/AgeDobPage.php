<?php
/**
 * Renders one page of the Age / DOB calculator family from app/config/age-dob.php.
 * Everything user-visible is escaped with e(); JSON is emitted with JSON_HEX_* flags
 * so it cannot break out of <script> blocks.
 */
final class AgeDobPage
{
    private array $cfg;
    private array $page;
    private string $slug;

    public function __construct(string $slug, ?array $cfg = null)
    {
        $this->cfg = $cfg ?? require __DIR__ . '/../config/age-dob.php';
        if (!isset($this->cfg['pages'][$slug])) {
            throw new InvalidArgumentException('Unknown age-dob page: ' . $slug);
        }
        $this->slug = $slug;
        $this->page = $this->cfg['pages'][$slug];
    }

    public static function e(?string $s): string
    {
        return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    public static function json($data): string
    {
        return json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    public function url(?string $slug = null): string
    {
        return rtrim($this->cfg['site']['base_url'], '/') . '/' . ($slug ?? $this->slug) . '/';
    }

    /** Related links: sibling family pages first, then enabled existing site pages. */
    public function related(): array
    {
        $out = [];
        foreach ($this->page['related'] as $key) {
            if (isset($this->cfg['pages'][$key])) {
                $p = $this->cfg['pages'][$key];
                $out[] = ['title' => $p['h1'], 'url' => '/' . $key . '/', 'desc' => $p['kicker']];
            } elseif (!empty($this->cfg['related'][$key]['enabled'])) {
                $out[] = $this->cfg['related'][$key];
            }
        }
        return $out;
    }

    public function sources(): array
    {
        return array_map(fn ($k) => $this->cfg['sources'][$k], $this->page['sources']);
    }

    public function schema(): array
    {
        $url = $this->url();
        $graph = [
            [
                '@type' => 'WebPage', '@id' => $url . '#webpage', 'url' => $url,
                'name' => $this->page['title'], 'description' => $this->page['meta'],
                'dateModified' => $this->cfg['site']['updated'], 'inLanguage' => 'en',
                'isPartOf' => ['@type' => 'WebSite', 'name' => $this->cfg['site']['name'], 'url' => $this->cfg['site']['base_url'] . '/'],
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
                    ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => $this->cfg['site']['base_url'] . '/'],
                    ['@type' => 'ListItem', 'position' => 2, 'name' => 'Date & Time Calculators', 'item' => $this->cfg['site']['base_url'] . '/date-of-birth-calculator/'],
                    ['@type' => 'ListItem', 'position' => 3, 'name' => $this->page['h1'], 'item' => $url],
                ],
            ],
        ];
        if (!empty($this->page['faq'])) {
            $graph[] = [
                '@type' => 'FAQPage',
                'mainEntity' => array_map(fn ($qa) => [
                    '@type' => 'Question', 'name' => $qa[0],
                    'acceptedAnswer' => ['@type' => 'Answer', 'text' => $qa[1]],
                ], $this->page['faq']),
            ];
        }
        return ['@context' => 'https://schema.org', '@graph' => $graph];
    }

    public function render(): string
    {
        $cfg = $this->cfg;
        $page = $this->page;
        $slug = $this->slug;
        $view = $this;
        ob_start();
        require __DIR__ . '/../views/age-dob/layout.php';
        return (string) ob_get_clean();
    }
}
