import { XMLParser } from 'fast-xml-parser';

/**
 * Parse the sitemap XML string into a JavaScript object
 * @param xmlString - The XML string to parse
 * @returns The parsed XML object, or null if parsing fails
 */
export function parseSitemapXmlFast(xmlString: string): Record<string, any> | null {
  const parser = new XMLParser();
  try {
    const result = parser.parse(xmlString);
    return result;
  } catch (error) {
    console.error(`Error parsing XML: ${(error as Error).message}`);
    return null;
  }
}

/**
 * Extract routes from the parsed sitemap object
 * @param sitemapXML - The content of the sitemap file
 * @returns An array of routes found in the sitemap, an empty array for sitemap index, or null if invalid XML
 */
export function parseRoutes(sitemapXML: string): string[] | null {
  if (!sitemapXML) {
    console.error('Sitemap XML content is null');
    return null;
  }

  const parsedFile = parseSitemapXmlFast(sitemapXML);
  if (!parsedFile) {
    console.error('Failed to parse sitemap XML');
    return null;
  }

  if (parsedFile.urlset || parsedFile.urlset === '') {
    if(parsedFile.urlset?.urlset) {
      console.error(`\tERROR: Nested <urlset> found in <urlset> element. This is not supported.`);
      return null;
    }
    if (parsedFile.urlset?.url === undefined || parsedFile.urlset?.url === null || parsedFile.urlset?.url === '') {
      console.warn(`\tWARNING: <urlset> does not contain <url> elements. Returning empty array.`)
      return [];
    } else if (Array.isArray(parsedFile.urlset.url)) {
      const routesFound = parsedFile.urlset.url.map((item: { loc: string; lastmod?: string; priority?: number }) => {
        if (!item.loc) {
          console.error(`\tERROR: Missing <loc> field in <url> element with lastmod: ${item.lastmod} priority: ${item.priority}`);
          return null;
        }
    
        if (item.lastmod && isNaN(Date.parse(item.lastmod))) {
          console.warn(`\tWARNING: Invalid <lastmod> date format in <url><loc>: ${item.loc}`);
        }
    
        return item.loc;
      }).filter((loc): loc is string => loc !== null); // Filter out null values
    
        // Warn for duplicate routes
        const duplicateRoutes = routesFound.filter((route, index, self) => self.indexOf(route) !== index);
        if (duplicateRoutes.length > 0) {
          console.warn(`\tWARNING: Duplicate routes found in the sitemap: ${[...new Set(duplicateRoutes)].join(', ')}`);
        }
    
      return routesFound;
    }
  }

  console.error('\tERROR: Unsupported sitemap.xml file. No <urlset>, or it was not empty, or it did not contain <url>(s)');
  return null;
}

/**
 * Extract paths from the sitemap XML, optionally filtering out specific paths
 * @param sitemapXML - The content of the sitemap file in XML format
 * @param excludePaths - An array of paths to exclude from the result
 * @returns An array of paths found in the sitemap, empty array for no paths, or null if parsing fails
 */
export function parsePaths(sitemapXML: string, excludePaths?: string[]): string[] | null {
  const routes = parseRoutes(sitemapXML);
  if (!routes) {
    return null; // Return null if routes could not be extracted
  }

  if(routes.length == 0)
  {
    return [];
  }
  const pathsFound = routes.map(route => {
    try {
      const urlObj = new URL(route);
      return urlObj.pathname; // return path
    } catch (error) {
      console.error(`Invalid URL: ${route}`);
      return null;
    }
  }).filter((path): path is string => path !== null); // Filter out null values

  if (excludePaths && excludePaths.length > 0) {
    // Filter out paths that match any of the excludePaths
    return pathsFound.filter(element => !excludePaths.includes(element));
  } else {
    return pathsFound;
  }
}

/**
 * Validate a single <url> element in a sitemap <urlset>
 * @param url - The <url> element to validate
 * @returns True if the <url> element is valid, otherwise false
 */
export function isValidSitemapUrl(url: { loc: string; lastmod?: string; priority?: number; changefreq?: string }): boolean {
  if (!url || typeof url !== 'object') {
    console.error('Invalid sitemap: <url> element is not an object');
    return false;
  }
  if (!url.loc) {
    console.error('Invalid sitemap: Missing <loc> in <url> element');
    return false;
  }
  if (url.lastmod && isNaN(Date.parse(url.lastmod))) {
    console.error(`Invalid sitemap: Invalid <lastmod> date format in <url> element with loc: ${url.loc}`);
    return false;
  }
  if (url.priority !== undefined && (url.priority < 0 || url.priority > 1)) {
    console.error(`Invalid sitemap: <priority> must be between 0.0 and 1.0 in <url> element with loc: ${url.loc}`);
    return false;
  }
  if (url.changefreq && !['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].includes(url.changefreq)) {
    console.error(`Invalid sitemap: Invalid <changefreq> value in <url> element with loc: ${url.loc}`);
    return false;
  }
  return true;
}

/**
 * Validate a single <sitemap> element in a sitemap index
 * @param sitemap - The <sitemap> element to validate
 * @returns True if the <sitemap> element is valid, otherwise false
 */
export function isValidSitemapIndex(sitemap: { loc: string; lastmod?: string }): boolean {
  if (!sitemap.loc) {
    console.error('Invalid sitemap index: Missing <loc> in <sitemap> element');
    return false;
  }
  if (sitemap.lastmod && isNaN(Date.parse(sitemap.lastmod))) {
    console.error(`Invalid sitemap index: Invalid <lastmod> date format in <sitemap> element with loc: ${sitemap.loc}`);
    return false;
  }
  return true;
}

/**
 * Validate the structure and content of a sitemap XML file
 * @param sitemapXML - The content of the sitemap file in XML format
 * @returns The parsed sitemap object if valid, otherwise null
 */
export function parseValidate(sitemapXML: string): Record<string, any> | null {
  if (!sitemapXML) {
    console.error('Sitemap XML content is empty');
    return null;
  }

  const parsedFile = parseSitemapXmlFast(sitemapXML);
  if (!parsedFile) {
    console.error('Failed to parse sitemap XML');
    return null;
  }

  // Validate sitemap index
  let isValidIndex = false;
  if (parsedFile.sitemapindex) {
    if(Array.isArray(parsedFile.sitemapindex.sitemap)) {
      const isValidIndex = parsedFile.sitemapindex.sitemap.every((sitemap: { loc: string; lastmod?: string }) => {
        return isValidSitemapIndex(sitemap);
      });
      return isValidIndex ? parsedFile : null;
    } else if(parsedFile.sitemapindex.sitemap && typeof parsedFile.sitemapindex.sitemap === 'object') {
      // Handle single sitemap object instead of array
      if (isValidSitemapIndex(parsedFile.sitemapindex.sitemap)) {
        parsedFile.sitemapindex.sitemap = [parsedFile.sitemapindex.sitemap]; // Convert to array
        return parsedFile;
      } else {
        console.error('Invalid sitemap index structure');
        return null;
      }
    }
  }

  // Validate standard sitemap
  let isValidSitemap = false;
  if (parsedFile.urlset) {
    if(parsedFile.urlset.url) {
      if (Array.isArray(parsedFile.urlset.url)) {
        isValidSitemap = parsedFile.urlset.url.every((url: { loc: string; lastmod?: string; priority?: number; changefreq?: string }) => {
          return isValidSitemapUrl(url);
        });
      } else if (typeof parsedFile.urlset.url === 'object' && isValidSitemapUrl(parsedFile.urlset.url)) {
        console.error('Converting single url into a array with single element'); // Debugging message
        parsedFile.urlset.url = [parsedFile.urlset.url]; // Convert single object to array
        isValidSitemap = true;
      } else {
        isValidSitemap = false;
        console.error('Invalid sitemap: <urlset> does not contain valid <url> elements');
      }
    } else {
      console.error('Invalid sitemap: <urlset> does not contain <url> elements');
      isValidSitemap = false;
    }
  } else {
    isValidSitemap = true;
  }

  if(!isValidSitemap) {
    console.error('Invalid sitemap structure: Neither a valid sitemap index nor a valid sitemap');
  } else {
    console.log('Sitemap is valid', parsedFile);
  }
  return isValidSitemap || isValidIndex ? parsedFile : null;
}