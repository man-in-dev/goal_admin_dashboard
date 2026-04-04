import axios from "axios";
import { getSignedUploadUrl } from "./storage-actions";

/**
 * Client-side helper to upload a file to DigitalOcean Spaces
 * This function runs in the browser and uploads the file directly to Spaces
 */
export async function uploadFileToSpaces(
  file: File
): Promise<string | null> {
  try {
    // 1. Get signed URL from server (Server Action)
    const response = await getSignedUploadUrl(file.name, file.type);
    if (!response) return null;

    const { uploadUrl, key } = response;

    // 2. Upload file directly to Spaces from client browser
    // Note: We use fetch instead of axios for direct S3 uploads to avoid unexpected headers
    // AND we omit x-amz-acl header because it's already in the signed URL's query parameters
    const uploadResult = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
        "x-amz-acl": "public-read",
      },
    });

    if (!uploadResult.ok) {
      const errorText = await uploadResult.text();
      throw new Error(`Upload failed with status ${uploadResult.status}: ${errorText}`);
    }

    // 3. Construct the public URL
    // Use the provided CDN endpoint or fallback to default
    const publicEndpoint = process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT || 
      `https://goalinstitute.sfo3.digitaloceanspaces.com`;
    
    // Ensure the endpoint doesn't end with a slash
    const base = publicEndpoint.endsWith('/') ? publicEndpoint.slice(0, -1) : publicEndpoint;
    
    return `${base}/${key}`;
  } catch (error) {
    console.error("Error uploading file to Spaces:", error);
    return null;
  }
}

// Keep existing function names for compatibility during migration if needed
export const uploadToCloudinary = uploadFileToSpaces;
export const uploadVideoToCloudinary = uploadFileToSpaces;
