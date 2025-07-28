/**
 * Fetch file from a URL
 * @param url - The URL of the file which should include the extension, e.g., https://example.com/sitemap.xml
 * @returns The file content as a string, or null if an error occurs
 */
export async function fetchTextFromUrlFile(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      return null;
    }

    const fileContent = await response.text();
    return fileContent;
  } catch (error) {
    console.error(`Error fetching file ${url} and converting to text: ${(error as Error).message}`);
    return null;
  }
}

/**
 * Check if a string is a valid URL
 * @param url - The URL string to validate
 * @returns True if the string is a valid URL, false otherwise
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}