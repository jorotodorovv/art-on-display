
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

// Content structure
export interface SiteContent {
  id: string;
  content_en: string;
  content_bg: string;
}

// Get content by ID
export const getContentById = async (id: string): Promise<{ en: string; bg: string } | null> => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching content:", error);
      return null;
    }
    
    if (!data) {
      // If content doesn't exist, return null
      return null;
    }
    
    return {
      en: data.content_en,
      bg: data.content_bg
    };
  } catch (error) {
    console.error("Error in getContentById:", error);
    return null;
  }
};

// Upsert content (create or update)
export const saveContent = async (
  id: string, 
  content: { en: string; bg: string }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('site_content')
      .upsert(
        {
          id,
          content_en: content.en,
          content_bg: content.bg
        },
        { onConflict: 'id' }
      );
    
    if (error) {
      console.error("Error saving content:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in saveContent:", error);
    return false;
  }
};

// Get all content
export const getAllContent = async (): Promise<Record<string, { en: string; bg: string }>> => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*');
    
    if (error) {
      console.error("Error fetching all content:", error);
      return {};
    }
    
    // Convert array to object with id as keys
    return data.reduce((acc, item) => {
      acc[item.id] = {
        en: item.content_en,
        bg: item.content_bg
      };
      return acc;
    }, {} as Record<string, { en: string; bg: string }>);
  } catch (error) {
    console.error("Error in getAllContent:", error);
    return {};
  }
};
