// api/fetch-blobs.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list } from '@vercel/blob';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'GET') {
    return response.status(405).send('Method Not Allowed');
  }

  try {
    const { blobs } = await list();
    response.status(200).json(blobs);
  } catch (error) {
    console.error('Error fetching blobs:', error);
    response.status(500).json({ error: 'Failed to fetch blobs.' });
  }
};
