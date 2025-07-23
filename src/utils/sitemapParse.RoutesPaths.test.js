import { describe, it, expect } from 'vitest';
import { parseRoutes, parsePaths } from './sitemapParse';

describe('parseRoutes', () => {
  it('should extract valid routes from a sitemap XML', () => {
    const sitemapXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>https://example.com/</loc>
        </url>
        <url>
          <loc>https://example.com/about</loc>
        </url>
      </urlset>
    `;

    const routes = parseRoutes(sitemapXML);
    expect(routes).toEqual(['https://example.com/', 'https://example.com/about']);
  });

  it('should return null for invalid sitemap XML', () => {
    const invalidSitemapXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <lastmod>2025-07-16</lastmod>
        </url>
      </urlset>
    `;

    const routes = parseRoutes(invalidSitemapXML);
    expect(routes).toBeNull();
  });

  it('should handle a sitemap with no <url> elements', () => {
    const emptySitemapXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      </urlset>
    `;

    const routes = parseRoutes(emptySitemapXML);
    expect(routes).toEqual([]);
  });

  it('should handle a sitemap with invalid <lastmod> date format', () => {
    const invalidDateSitemapXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>https://example.com/</loc>
          <lastmod>INVALID_DATE</lastmod>
        </url>
        <url>
          <loc>https://example.com/contact</loc>
        </url>
      </urlset>
    `;

    const routes = parseRoutes(invalidDateSitemapXML);
    expect(routes).toEqual(['https://example.com/', 'https://example.com/contact'])
  });

  it('should handle a sitemap with duplicate <loc> entries', () => {
    const duplicateSitemapXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>https://example.com/</loc>
        </url>
        <url>
          <loc>https://example.com/</loc>
        </url>
      </urlset>
    `;

    const routes = parseRoutes(duplicateSitemapXML);
    expect(routes).toEqual(['https://example.com/', 'https://example.com/']);
  });

  it('should handle a sitemap with a mix of valid and invalid <url> elements', () => {
    const mixedSitemapXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>https://example.com/</loc>
        </url>
        <url>
          <lastmod>2025-07-16</lastmod>
        </url>
        <url>
          <loc>https://example.com/about</loc>
        </url>
      </urlset>
    `;

    const routes = parseRoutes(mixedSitemapXML);
    expect(routes).toEqual(['https://example.com/', 'https://example.com/about']);
  });

  it('should handle a sitemap with a valid <sitemapindex>', () => {
    const sitemapIndexXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap>
          <loc>https://example.com/sitemap1.xml</loc>
        </sitemap>
        <sitemap>
          <loc>https://example.com/sitemap2.xml</loc>
        </sitemap>
      </sitemapindex>
    `;

    const routes = parseRoutes(sitemapIndexXML);
    expect(routes).toBeNull(); // Sitemap index is not supported
  });

  it('should handle a sitemap with a <urlset> containing another <urlset>', () => {
    const nestedUrlsetXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <urlset>
          <url>
            <loc>https://example.com/nested</loc>
          </url>
        </urlset>
      </urlset>
    `;

    const routes = parseRoutes(nestedUrlsetXML);
    expect(routes).toBeNull(); // Invalid structure
  });

  it('should handle a sitemap with empty <urlset>', () => {
    const emptyUrlsetXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      </urlset>
    `;

    const routes = parseRoutes(emptyUrlsetXML);
    expect(routes).toEqual([]); // Empty sitemap should return an empty array
  });
});

describe('parsePaths', () => {
  it('should extract valid paths from a sitemap XML', () => {
    const sitemapXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>https://example.com/</loc>
        </url>
        <url>
          <loc>https://example.com/about</loc>
        </url>
      </urlset>
    `;

    const paths = parsePaths(sitemapXML);
    expect(paths).toEqual(['/', '/about']);
  });

  it('should exclude specified paths from the result', () => {
    const sitemapXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>https://example.com/</loc>
        </url>
        <url>
          <loc>https://example.com/about</loc>
        </url>
        <url>
          <loc>https://example.com/contact</loc>
        </url>
      </urlset>
    `;

    const paths = parsePaths(sitemapXML, ['/about']);
    expect(paths).toEqual(['/', '/contact']);
  });

  it('should return null for invalid sitemap XML', () => {
    const invalidSitemapXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <lastmod>2025-07-16</lastmod>
        </url>
      </urlset>
    `;

    const paths = parsePaths(invalidSitemapXML);
    expect(paths).toBeNull();
  });

  it('should handle a sitemap with no <url> elements', () => {
    const emptySitemapXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      </urlset>
    `;

    const paths = parsePaths(emptySitemapXML);
    expect(paths).toEqual([]);
  });
});