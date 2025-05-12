import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export type ArtworkMetadata = {
  id?: string;
  title: string;
  description: string;
  price?: number;
  date: string;
  url: string;
  blob_url: string;
  created_at?: string;
  updated_at?: string;
};

export type ContentItem = {
  id?: string;
  key: string;
  content_en: string;
  content_bg: string;
  page: string;
  created_at?: string;
  updated_at?: string;
};

// Database operations for artworks
export const artworkOperations = {
  // Create a new artwork entry
  createArtwork: async (metadata: ArtworkMetadata) => {
    const { data, error } = await supabase
      .from('artworks')
      .insert(metadata)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Get all artworks
  getArtworks: async () => {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  // Delete an artwork
  deleteArtwork: async (id: string) => {
    const { error } = await supabase
      .from('artworks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Database operations for content
export const contentOperations = {
  // Get content for a specific page
  getPageContent: async (page: string) => {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('page', page);
    
    if (error) throw error;
    return data;
  },
  
  // Update content
  updateContent: async (id: string, updates: Partial<ContentItem>) => {
    const { data, error } = await supabase
      .from('content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Create content if it doesn't exist
  upsertContent: async (content: ContentItem) => {
    const { data, error } = await supabase
      .from('content')
      .upsert(content)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};