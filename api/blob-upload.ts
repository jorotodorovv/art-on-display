// This file should be placed in the `api` directory at the root of your project
// for Vercel to deploy it as a serverless function.
// e.g., /api/blob-upload.ts

import { handleUpload, type HandleUploadBody } from '@vercel/blob/server';
import type { VercelRequest, VercelResponse } from '@vercel/node'; // For Vercel Serverless Functions

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // The body will be parsed by Vercel Blob's `handleUpload`
  const body = request.body as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request, // Pass the VercelRequest
      onBeforeGenerateToken: async (pathnameFromClient: string, clientPayload?: string) => {
        // `pathnameFromClient` is the `filename` passed from the client.
        // It's good practice to prefix it or place it in a specific folder.
        const blobPathname = `artworks/${pathnameFromClient}`;

        // Add any server-side validation here
        // For example, check user authentication if needed:
        // if (!isAuthenticated(request)) {
        //   throw new Error('Unauthorized');
        // }

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          // `pathname` is the path where the blob will be stored in Vercel Blob.
          pathname: blobPathname,
          // You can pass a clientPayload from the client, parse it here,
          // and use it in `tokenPayload` or other logic.
          tokenPayload: JSON.stringify({
            // Example: associate the upload with a user ID or other metadata
            // uploadedBy: 'user-id-from-auth-check',
            originalFilename: pathnameFromClient,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This callback is triggered after the file is successfully uploaded to Vercel Blob.
        console.log('Blob upload completed. URL:', blob.url);
        if (tokenPayload) {
          const payload = JSON.parse(tokenPayload);
          console.log('Token payload:', payload);
          // You could store `blob.url` and `payload.originalFilename` in your database here.
        }
      },
    });

    // `jsonResponse` contains the signed URL and other details for the client to use for the PUT request.
    return response.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Error in Vercel Blob upload handler:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return response.status(400).json({ error: message });
  }
}