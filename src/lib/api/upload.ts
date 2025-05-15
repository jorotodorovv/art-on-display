import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import type { PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';

export type UploadResponse = PutBlobResult & {
};

export interface UploadVariables {
  file: File;
  filename: string;
  token: string;
  artwork?: {
    title: string;
    description: string;
    tags: string[];
    price: number;
  }
}

const performUpload = async (variables: UploadVariables): Promise<UploadResponse> => {
  const { file, filename, token, artwork } = variables;

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
        access: 'public',
        handleUploadUrl: '/api/blob-upload',
        clientPayload: JSON.stringify({
          token,
          artwork
        }),
      }
    );

    if (!blob) {
      throw new Error('Failed to upload image');
    }

    return blob as UploadResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Client-side upload failed.';
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