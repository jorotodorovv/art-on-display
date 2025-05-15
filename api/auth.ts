import { VercelRequest } from '@vercel/node';
import { supabase } from './supabase.js';

/**
 * Authenticates a user based on the Authorization header in the request
 * @param request The Vercel serverless function request object
 * @returns The authenticated user object or throws an error if authentication fails
 */
export async function authenticateUser(token: string) {  
  // Verify the JWT token with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Unauthorized: Invalid JWT token');
  }

  return user;
}