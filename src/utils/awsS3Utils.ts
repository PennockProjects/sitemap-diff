import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

/**
 * Fetch a file from an S3 bucket using an S3 URL
 * @param s3Url - The S3 URL to parse and fetch the file from (e.g., "s3://bucket-name/key:region://region-name")
 * @returns The file content as a string, or null if an error occurs
 */
export async function fetchFromS3(s3Url: string): Promise<string | null> {
  const s3Details = parseS3Url(s3Url);

  if (!s3Details) {
    console.error(`Failed to parse S3 URL: ${s3Url}`);
    return null;
  }

  const { bucketName, key, region } = s3Details;

  const s3Client = new S3Client(region ? { region: region } : {});
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const response = await s3Client.send(command);
    return response.Body?.transformToString() || null; // Convert the stream to a string
  } catch (error) {
    console.error(`fetchFromS3 GetObject Error: ${error.message}`);
    return null;
  }
}

/**
 * Extract the bucket name from an S3 URL
 * @param s3Url - The S3 URL to extract the bucket name from
 * @returns The bucket name, or null if the S3 URL is invalid
 */
export function getBucketNameFromS3Url(s3Url: string): string | null {
  const match = s3Url.match(/^s3:\/\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Extract the region from an S3 URL
 * @param s3Url - The S3 URL to extract the region from
 * @returns The region of the S3 bucket, or null if the S3 URL is invalid
 */
export function getRegionFromS3Url(s3Url: string): string | null {
  const match = s3Url.match(/:region:\/\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Extract the key (path) from an S3 URL
 * @param s3Url - The S3 URL to extract the key from
 * @returns The key (path) of the S3 object, or null if the S3 URL is invalid
 */
export function getKeyFromS3Url(s3Url: string): string | null {
  const match = s3Url.match(/^s3:\/\/[^/]+\/(.*?)(:region:\/\/|$)/);
  return match ? match[1] : null;
}

/**
 * Parse an S3 URL and extract the bucket name, key, and region
 * @param s3Url - The S3 URL to parse (e.g., "s3://bucket-name/key:region://region-name" or "s3://bucket-name/key")
 * @returns An object containing `bucketName`, `key`, and `region`, or null if the URL is invalid
 */
export function parseS3Url(s3Url: string): { bucketName: string; key: string; region: string | null } | null {
  const bucketName = getBucketNameFromS3Url(s3Url);
  const key = getKeyFromS3Url(s3Url);
  const region = getRegionFromS3Url(s3Url);

  if (!bucketName || !key) {
    console.error(`Invalid S3 URL format: ${s3Url}`);
    return null;
  }

  return {
    bucketName,
    key,
    region: region || null, // Use null if region is not specified
  };
}