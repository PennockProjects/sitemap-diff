import { isValidFilePath, readLocalFile } from './fileUtils';
import { fetchTextFromUrlFile } from './urlUtils';
import { fetchFromS3 } from './awsS3Utils';

/**
 * Get the XML content from a sitemap file, which can be a local file, a URL, or an S3 bucket.
 * @param sitemapPath - The path to the sitemap file, which can be a local file, a URL, or an S3 bucket.
 * @returns The XML content of the sitemap file, or null if an error occurs.
 */
export async function fetchSitemap(sitemapPath: string): Promise<string | null> {
  if (!sitemapPath) {
    console.error('No sitemap url or file path provided.');
    return null; // Invalid path
  }
  const parsedPath = parseSitemapPath(sitemapPath);
  if (!parsedPath) {
    console.error(`Invalid sitemap path: ${sitemapPath}`);
    return null; // Invalid path
  }
  
  if (parsedPath.urlLocationString) {
    console.log(`\t${sitemapPath} - Fetching URL file`);
    return await fetchTextFromUrlFile(parsedPath.urlLocationString);
  } else if (parsedPath.s3LocationString) {
    console.log(`\t${sitemapPath} - Getting S3 file`);
    return await fetchFromS3(parsedPath.s3LocationString);
  } else if (parsedPath.fileLocationString) {
    console.log(`\t${sitemapPath} - Reading local file`);
    return readLocalFile(parsedPath.fileLocationString);
  }
}

export function parseSitemapPath(sitemapPath: string): {
  s3LocationString?: string;
  urlLocationString?: string;
  fileLocationString?: string;
} | null {

  if(!sitemapPath) {
    return null; // Invalid path
  }
  if(sitemapPath.startsWith('http://') || sitemapPath.startsWith('https://') && (sitemapPath.endsWith('.xml'))) {
    return { urlLocationString: sitemapPath} // Valid URL
  }
  if(sitemapPath.startsWith('s3://')) {
    let s3Parts = sitemapPath.split(':region://');
    if((s3Parts.length == 1 && s3Parts[0].endsWith('.xml')) || (s3Parts.length == 2 && s3Parts[0].endsWith('.xml') && s3Parts[1] && s3Parts[1].length > 0)) {
      return { s3LocationString: sitemapPath }; // Valid S3 path
    }

  }
  if(isValidFilePath(sitemapPath) && sitemapPath.endsWith('.xml')) {
    return { fileLocationString: sitemapPath}; // Valid local path
  }
  return null; // Invalid path
}

