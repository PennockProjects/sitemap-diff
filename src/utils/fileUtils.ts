import fs from 'fs';
import logger from "./logger";

/**
 * Read a local file
 * @param filePath - The path to the local file as a UTF-8 string
 * @returns The content of the file as a UTF-8 string, or null if an error occurs
 */
export function readLocalFile(filePath: string): string | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
  } catch (error) {
    logger.error(`Error while reading ${filePath}: ${(error as Error).message}`);
    return null;
  }
}

/**
 * Write a JSON object to a local file
 * @param outputFile - The name of the output file
 * @param jsonData - The JSON object to write to the file
 * @returns True if the operation succeeds, otherwise false
 */
export function writeJsonToFile(outputFile: string, jsonData: Record<string, unknown>): boolean {
  if (!isValidFilePath(outputFile) || !outputFile.endsWith('.json')) {
    logger.error('Invalid output file name. Must be a valid JSON file (e.g., "output.json").');
    return false; // Indicate failure
  }

  try {
    const jsonString = JSON.stringify(jsonData, null, 2); // Pretty-print JSON with 2 spaces
    fs.writeFileSync(outputFile, jsonString, 'utf8');
    return true; // Indicate success
  } catch (error) {
    logger.error(`Error writing JSON to file: ${(error as Error).message}`);
    return false; // Indicate failure
  }
}

/**
 * Check if a string is a valid filename
 * @param filename - The string to validate as a filename
 * @returns True if the string is a valid filename, otherwise false
 */
export function isValidFilename(filename: string): boolean {
  const validFilenameRegex = /^[^<>:"/\\|?*\x00-\x1F]+$/; // Disallows invalid characters
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
  ];

  return validFilenameRegex.test(filename) && !reservedNames.includes(filename.toUpperCase());
}

/**
 * Check if a string is a valid file path (Windows or Linux)
 * @param filePath - The string to validate as a file path
 * @returns True if the string is a valid file path, otherwise false
 */
export function isValidFilePath(filePath: string): boolean {
  const validLinuxFilePathRegex = /^[^<>:"|?*\x00-\x1F]+$/; // Disallows invalid characters
  const validWindowsFilePathRegex = /^(?:[a-zA-Z]:)?(?:[\\/][^<>:"|?*\x00-\x1F]+)+$/; // Matches valid Windows paths
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
  ];

  if (!validLinuxFilePathRegex.test(filePath) && !validWindowsFilePathRegex.test(filePath)) {
    return false;
  }

  const normalizedPath = filePath.replace(/\\\\/g, '/').replace(/\\/g, '/'); // Normalize Windows-style paths
  const fileName = normalizedPath.split('/').pop(); // Extract the filename

  return fileName ? !reservedNames.includes(fileName.toUpperCase()) : false;
}