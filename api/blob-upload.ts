// This file should be placed in the `api` directory at the root of your project
// for Vercel to deploy it as a serverless function.
// e.g., /api/blob-upload.ts

import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { VercelRequest, VercelResponse } from '@vercel/node'; // For Vercel Serverless Functions

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // For Vercel serverless functions, we need to parse the body ourselves
    const body = await JSON.parse(request.body) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Add authentication and authorization checks here
        // if (!isAuthenticated(request)) {
        //   throw new Error('Unauthorized');
        // }

        // You can use clientPayload to receive additional data from the client
        // like post IDs, user IDs, etc.
        
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          // Optional: modify the pathname if needed
          pathname: `artworks/${pathname}`,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This callback is called when the upload is completed
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to test the full upload flow
        
        console.log('Blob upload completed:', blob);
        
        try {
          // Here you can update your database with the blob URL
          // For example:
          // await db.artworks.update({
          //   where: { id: tokenPayload.artworkId },
          //   data: { imageUrl: blob.url }
          // });
        } catch (error) {
          throw new Error('Could not update database with the uploaded file');
        }
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Error in Vercel Blob upload handler:', error);
    return response.status(400).json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
}
