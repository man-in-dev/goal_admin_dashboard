"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "./s3";

/**
 * Generates a signed URL for uploading a file to DigitalOcean Spaces
 * This is a Server Action that runs strictly on the server
 */
export async function getSignedUploadUrl(
  fileName: string,
  fileType: string
): Promise<{ uploadUrl: string; key: string } | null> {
  try {
    const bucket = process.env.DO_SPACES_BUCKET;
    if (!bucket) throw new Error("DO_SPACES_BUCKET is not defined");

    // Create a unique key for the file
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const key = `uploads/${timestamp}-${cleanFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
      ACL: "public-read",
      // Explicitly disable checksums which can cause CORS issues with browser uploads
      ChecksumAlgorithm: undefined,
    });

    // The S3 client uses the credentials from environment variables on the server
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    return { uploadUrl, key };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return null;
  }
}
