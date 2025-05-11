export interface BlobItem {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

/**
 * Fetches all artwork images from Vercel Blob storage
 * @returns Promise with array of blob items
 */
// blob-service.ts
// This function is now called from your client-side React code
export const fetchBlobs = async () => {
  try {
    const response = await fetch('/api/blob-get'); // Make an HTTP request to your serverless function

    if (!response.ok) {
      throw new Error(`Error fetching blobs: ${response.statusText}`);
    }

    const blobs = await response.json();
    return blobs;
  } catch (error) {
    console.error('Error in fetchBlobs (client-side):', error);
    throw error; // Re-throw the error for your context to handle
  }
};

/**
 * Deletes a blob from Vercel Blob storage
 * @param url The URL of the blob to delete
 */
export const deleteBlob = async (url: string): Promise<void> => {
  try {
    // Note: This is a placeholder. You'll need to implement a serverless function
    // to handle deletion since it requires server-side authentication
    const response = await fetch('/api/blob-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete image');
    }
  } catch (error) {
    console.error('Error deleting blob:', error);
    throw error;
  }
};