/**
 * Utility functions for CSV download handling
 */

/**
 * Downloads a blob as a file with the specified filename
 * @param blob - The blob data to download
 * @param filename - The filename for the downloaded file
 */
export const downloadBlobAsFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Handles CSV download with proper error handling
 * @param downloadFunction - The API function that returns a blob
 * @param filename - The filename for the downloaded file
 * @param onError - Optional error callback
 */
export const handleCSVDownload = async (
  downloadFunction: () => Promise<Blob>,
  filename: string,
  onError?: (error: any) => void
): Promise<void> => {
  try {
    const blob = await downloadFunction();
    downloadBlobAsFile(blob, filename);
  } catch (error) {
    console.error('CSV download error:', error);
    if (onError) {
      onError(error);
    } else {
      throw error;
    }
  }
};

/**
 * Generates a filename with current date
 * @param prefix - The prefix for the filename
 * @param extension - The file extension (default: 'csv')
 * @returns The generated filename
 */
export const generateFilename = (prefix: string, extension: string = 'csv'): string => {
  const date = new Date().toISOString().split('T')[0];
  return `${prefix}_${date}.${extension}`;
};

/**
 * Formats CSV data for display in console (for debugging)
 * @param csvData - The CSV data as string
 */
export const logCSVData = (csvData: string): void => {
  console.log('CSV Data Preview:');
  console.log(csvData.split('\n').slice(0, 5).join('\n'));
  console.log('...');
};
