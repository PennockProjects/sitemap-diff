import { diffArrays } from './arrayUtils.ts';
import { fetchSitemap } from './sitemapFetch.ts';
import { parsePaths } from './sitemapParse.ts';

/**
 * Process a sitemap file: read, parse, and extract paths
 * @param sitemapFile - The path to the sitemap file (local, URL, or S3)
 * @returns An array of paths extracted from the sitemap
 */
export async function fetchParsePaths(sitemapFile: string): Promise<string[]> {
  if (!sitemapFile) {
    throw new Error('No sitemap file path provided');
  }  
  const sitemapXML = await fetchSitemap(sitemapFile);
  if (!sitemapXML) {
    throw new Error(`${sitemapFile} - Could not read sitemap file`);
  }

  console.log(`\t${sitemapFile} - Parsing XML from sitemap file`);
  const paths = parsePaths(sitemapXML);
  if (!paths) {
    throw new Error(`${sitemapFile} - Could not extract paths from sitemap file`);
  }

  console.log(`\t${sitemapFile} - Paths extracted from sitemap file`);
  return paths;
}

/**
 * Compare two sitemaps and return the differences
 * @param sitemap1 - The path to the first sitemap file
 * @param sitemap2 - The path to the second sitemap file
 * @param pathExcludes - An array of paths to exclude from the comparison
 * @returns An object containing the comparison results
 */
export async function pathsDiff(
  sitemap1: string,
  sitemap2: string,
  pathExcludes: string[]
): Promise<{
  sitemap1: string;
  sitemap2: string;
  commonPaths: string[];
  sitemap1PathsNotInSitemap2: string[];
  sitemap2PathsNotInSitemap1: string[];
}> {
  if (!sitemap1 || !sitemap2) {
    throw new Error('Both sitemap1 and sitemap2 must be provided');
  }

  try {
    console.log(`Processing sitemap1: ${sitemap1}`);
    const sitemap1Paths = await fetchParsePaths(sitemap1);
    console.log(`Processing sitemap2: ${sitemap2}`);
    const sitemap2Paths = await fetchParsePaths(sitemap2);

    console.log(`Comparing paths from both sitemaps...`);
    const pathsDiff = diffArrays(sitemap1Paths, sitemap2Paths);

    return {
      sitemap1: sitemap1,
      sitemap2: sitemap2,
      commonPaths: pathsDiff.commonElements || [], // Ensure it's an array
      sitemap1PathsNotInSitemap2: pathsDiff.elements1NotIn2 || [], // Ensure it's an array
      sitemap2PathsNotInSitemap1: pathsDiff.elements2NotIn1 || [], // Ensure it's an array
    };
  } catch (error) {
    console.error(`Error processing sitemaps: ${(error as Error).message}`);
    throw error;
  }
}
