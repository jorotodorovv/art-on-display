import { VercelRequest } from '@vercel/node';
import { supabase } from './supabase';

/**
 * Authenticates a user based on the Authorization header in the request
 * @param request The Vercel serverless function request object
 * @returns The authenticated user object or throws an error if authentication fails
 */
export async function authenticateUser(request: VercelRequest) {
  // Get the authorization header
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid token');
  }
  
  // Extract the token
  const token = authHeader.split(' ')[1];
  
  // Verify the token with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Unauthorized: Invalid token');
  }

  return user;
}