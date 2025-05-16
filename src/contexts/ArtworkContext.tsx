
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Artwork, ArtworkTag } from "../types/artwork";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "./AuthContext";

// Type for artworks for sale
export interface ArtworkForSale {
  id: number;
  title: string;
  image: string;
  price: number;
  description: string;
  available: boolean;
}

interface ArtworkContextType {
  artworks: Artwork[];
  artworksForSale: ArtworkForSale[];
  addArtwork: (artwork: Omit<Artwork, "id" | "tags"> & { tags: string[] }) => Promise<void>;
  setArtworkForSale: (id: number, price: number) => Promise<void>;
  getTags: () => Promise<ArtworkTag[]>;
  isLoading: boolean;
}

const ArtworkContext = createContext<ArtworkContextType | undefined>(undefined);

export const ArtworkProvider = ({ children }: { children: ReactNode }) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [tags, setTags] = useState<ArtworkTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, session } = useAuth();

  // Fetch all artworks from Supabase
  const fetchArtworks = async () => {
    try {
      setIsLoading(true);
      
      const { data: artworksData, error: artworksError } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });

      if (artworksError) {
        toast.error("Failed to fetch artworks");
        console.error("Error fetching artworks:", artworksError);
        return;
      }

      // Fetch all tags from Supabase
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*');

      if (tagsError) {
        toast.error("Failed to fetch tags");
        console.error("Error fetching tags:", tagsError);
        return;
      }

      // Fetch artwork_tags relationships
      const { data: artworkTagsData, error: artworkTagsError } = await supabase
        .from('artwork_tags')
        .select('*');

      if (artworkTagsError) {
        toast.error("Failed to fetch artwork tags");
        console.error("Error fetching artwork tags:", artworkTagsError);
        return;
      }

      // Convert tags data to ArtworkTag[]
      const tagsMap = tagsData.reduce((acc: Record<string, ArtworkTag>, tag) => {
        acc[tag.id] = { id: tag.id, name: tag.name, name_bg: tag.name_bg };
        return acc;
      }, {});

      setTags(tagsData.map(tag => ({ id: tag.id, name: tag.name, name_bg: tag.name_bg })));

      // Map artwork_tags relationships to artworks
      const artworksWithTags = artworksData.map((artwork) => {
        const artworkTags = artworkTagsData
          .filter(at => at.artwork_id === artwork.id)
          .map(at => tagsMap[at.tag_id])
          .filter(Boolean);

        return {
          ...artwork,
          tags: artworkTags,
        };
      });

      setArtworks(artworksWithTags);
    } catch (error) {
      console.error("Error in fetchArtworks:", error);
      toast.error("Failed to load artworks");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchArtworks();
  }, []);

  // Refetch when auth state changes
  useEffect(() => {
    if (session) {
      fetchArtworks();
    }
  }, [session]);

  // Add new artwork
  const addArtwork = async (artwork: Omit<Artwork, "id" | "tags"> & { tags: string[] }) => {
    try {
      // Insert the artwork
      const { data: newArtwork, error: artworkError } = await supabase
        .from('artworks')
        .insert({
          title: artwork.title,
          image: artwork.image,
          description: artwork.description,
          for_sale: artwork.forSale || false,
          price: artwork.price || null,
        })
        .select()
        .single();

      if (artworkError) {
        toast.error("Failed to add artwork");
        console.error("Error adding artwork:", artworkError);
        return;
      }

      // Insert artwork-tag relationships
      if (artwork.tags.length > 0) {
        const artworkTags = artwork.tags.map(tagId => ({
          artwork_id: newArtwork.id,
          tag_id: tagId
        }));

        const { error: tagsError } = await supabase
          .from('artwork_tags')
          .insert(artworkTags);

        if (tagsError) {
          toast.error("Failed to add artwork tags");
          console.error("Error adding artwork tags:", tagsError);
          // We still continue as the artwork was created
        }
      }

      // Refresh artworks
      fetchArtworks();
      toast.success("Artwork added successfully");
    } catch (error) {
      console.error("Error in addArtwork:", error);
      toast.error("Failed to add artwork");
    }
  };

  // Set artwork for sale
  const setArtworkForSale = async (id: number, price: number) => {
    try {
      const { error } = await supabase
        .from('artworks')
        .update({ for_sale: true, price })
        .eq('id', id);

      if (error) {
        toast.error("Failed to update artwork");
        console.error("Error updating artwork:", error);
        return;
      }

      // Refresh artworks
      fetchArtworks();
      toast.success("Artwork added to For Sale successfully");
    } catch (error) {
      console.error("Error in setArtworkForSale:", error);
      toast.error("Failed to update artwork");
    }
  };

  // Get tags
  const getTags = async (): Promise<ArtworkTag[]> => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*');

      if (error) {
        console.error("Error fetching tags:", error);
        return [];
      }

      return data.map(tag => ({ id: tag.id, name: tag.name, name_bg: tag.name_bg }));
    } catch (error) {
      console.error("Error in getTags:", error);
      return [];
    }
  };

  // Generate artworks for sale from regular artworks
  const artworksForSale = artworks
    .filter(artwork => artwork.forSale)
    .map(artwork => ({
      id: artwork.id,
      title: artwork.title,
      image: artwork.image,
      price: artwork.price || 0,
      description: artwork.description,
      available: true
    }));

  return (
    <ArtworkContext.Provider value={{ 
      artworks, 
      artworksForSale,
      addArtwork, 
      setArtworkForSale,
      getTags,
      isLoading 
    }}>
      {children}
    </ArtworkContext.Provider>
  );
};

export const useArtworks = () => {
  const context = useContext(ArtworkContext);
  if (context === undefined) {
    throw new Error("useArtworks must be used within an ArtworkProvider");
  }
  return context;
};
