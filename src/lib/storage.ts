import { uploadApi } from './api';

/**
 * Upload a PDF file to the backend server storage.
 * This replaces the previous DigitalOcean Spaces direct-upload flow.
 * Files are stored in the backend's /uploads/pdfs/ directory and served
 * as static files via http://localhost:8000/uploads/pdfs/<filename>
 *
 * @returns The public URL of the uploaded file, or null on failure.
 */
export async function uploadFileToSpaces(file: File, name?: string): Promise<string | null> {
  try {
    const docName = name || file.name.split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9]/g, ' ') || 'Uploaded PDF';

    const response = await uploadApi.uploadFile(file, docName);

    if (!response.success || !response.data?.url) {
      console.error('Backend upload failed:', response.message);
      return null;
    }

    console.log('File uploaded successfully to:', response.data.url);
    return response.data.url;
  } catch (error: any) {
    console.error('Error in uploadFileToSpaces:', error?.response?.data || error);
    return null;
  }
}

// Compatibility aliases — other pages (e.g. banners, admission forms) that call these
// will now also use backend storage automatically.
export const uploadToCloudinary = uploadFileToSpaces;
export const uploadVideoToCloudinary = uploadFileToSpaces;
