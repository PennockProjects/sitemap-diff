import { describe, it, expect } from 'vitest';
import { parseValidate } from './sitemapParse';

describe('parseValidate', () => {
  it('should return the parsed file for a valid sitemap XML', () => {
    const sitemapXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>https://example.com/</loc>
        </url>
      </urlset>
    `; 

    const result = parseValidate(sitemapXML);
    expect(result).toBeTruthy();
    expect(result?.urlset?.url).toHaveLength(1);
  });

  it('should return null for an invalid sitemap XML', () => {
    const invalidSitemapXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <lastmod>INVALID_DATE</lastmod>
        </url>
      </urlset>
    `;

    const result = parseValidate(invalidSitemapXML);
    expect(result).toBeNull();
  });

  it('should return return the parsed file for a valid sitemap index', () => {
    const sitemapIndexXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap>
          <loc>https://example.com/sitemap1.xml</loc>
        </sitemap>
      </sitemapindex>
    `;

    const result = parseValidate(sitemapIndexXML);
    expect(result).toBeTruthy();
    expect(result).toHaveProperty('sitemapindex');
    expect(result.sitemapindex).toBeDefined();
    expect(result.sitemapindex.sitemap).toHaveLength(1);
    expect(result.sitemapindex.sitemap[0].loc).toBe('https://example.com/sitemap1.xml');
  });
});