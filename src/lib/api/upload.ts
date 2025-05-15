import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { upload } from '@vercel/blob/client';
import type { PutBlobResult } from '@vercel/blob';

// The response from Vercel Blob client upload
export type UploadResponse = PutBlobResult;

// Variables for the mutation: the file and an optional desired filename
export interface UploadVariables {
  file: File;
  filename: string; // Vercel Blob needs a pathname for the blob
  // You can add an optional clientPayload string if you want to send extra data to onBeforeGenerateToken
  clientPayload?: string;
}

const performUpload = async (variables: UploadVariables): Promise<UploadResponse> => {
  const { file, filename } = variables;

  if (!file) {
    throw new Error('No file selected for upload.');
  }
  if (!filename) {
    throw new Error('A filename is required for the upload path.');
  }

  try {
    const blob = await upload(
      `/artworks/${filename}`,
      file,
      {
        access: 'public', // The blob will be publicly accessible
        handleUploadUrl: '/api/blob-upload', // The API route you created in step 2
        clientPayload: variables.clientPayload, // If you want to send extra data
      }
    );
    return blob;
  } catch (error) {
    console.error('Vercel Blob upload error:', error);
    const message = error instanceof Error ? error.message : 'Client-side upload failed.';
    // Try to get a more specific message if the server responded with JSON error
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        throw new Error(error.message);
    }
    throw new Error(message);
  }
};

// Custom hook for the upload mutation
export const useUploadFileMutation = (
  options?: UseMutationOptions<UploadResponse, Error, UploadVariables>
) => {
  return useMutation<UploadResponse, Error, UploadVariables>({
    mutationFn: performUpload,
    ...options,
  });
};

export { performUpload };