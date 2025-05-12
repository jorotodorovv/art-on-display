import { del } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateUser } from './auth';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { url } = request.body;

    if (!url || typeof url !== 'string') {
      return response.status(400).json({ error: 'URL is required' });
    }

    const user = await authenticateUser(request);

    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    await del(url);

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting blob:', error);
    return response.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
}