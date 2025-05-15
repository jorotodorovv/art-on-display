import { del } from '@vercel/blob';
import { handleUpload } from '@vercel/blob/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

import { supabase } from './supabase.js';
import { authenticateUser } from './auth.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // For Vercel serverless functions, we need to parse the body ourselves
    const jsonResponse = await handleUpload({
      body: request.body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {

        try {

          const { token, artwork } = JSON.parse(clientPayload);

          const user = await authenticateUser(token);

          return {
            addRandomSuffix: true,
            allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            tokenPayload: JSON.stringify({
              userId: user.id,
              artwork,
            }),
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Unauthorized');
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          if (!tokenPayload) {
            throw new Error('Missing token payload');
          }

          const { artwork = {}, userId } = JSON.parse(tokenPayload);

          if (!userId) {
            throw new Error('Missing user ID in token payload');
          }

          const { data, error } = await supabase
            .from('artworks')
            .insert({
              title: artwork.title || 'Untitled',
              description: artwork.description || '',
              price: artwork.price || null,
              tags: artwork.tags || [],
              date: artwork.date || new Date().toISOString().split('T')[0],
              blob_url: blob.url,
              user_id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) {
            console.error('Supabase error:', error);
            try {
              await del(blob.url);
              console.log(`Deleted blob ${blob.url} after database insert failure`);
            } catch (deleteError) {
              console.error('Failed to delete blob after database error:', deleteError);
            }

            throw new Error('Failed to store artwork metadata');
          }
        } catch (error) {
          console.error('Database update error:', error);
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
