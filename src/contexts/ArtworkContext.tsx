
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Artwork, ArtworkTag } from "../types/artwork";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "./AuthContext";

interface ArtworkContextType {
  artworks: Artwork[];
  featuredArtworks: Artwork[];
  addArtwork: (artwork: Omit<Artwork, "id" | "tags"> & { tags: string[] }) => Promise<void>;
  setArtworkForSale: (id: number, price: number) => Promise<void>;
  toggleFeatured: (id: number) => Promise<void>;
  getTags: () => Promise<ArtworkTag[]>;
  reorderArtworks: (reorderedArtworks: Artwork[]) => Promise<void>;
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
        .order('display_order', { ascending: true });

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
          title: artwork.title,
          title_bg: artwork.title_bg,
          description: artwork.description,
          description_bg: artwork.description_bg,
          tags: artworkTags,
          display_order: artwork.display_order || 0, // Ensure display_order is always defined
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
      // Get the highest display_order to place new artwork at the end
      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('artworks')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = maxOrderData?.display_order ? maxOrderData.display_order + 1 : 0;

      // Insert the artwork
      const { data: newArtwork, error: artworkError } = await supabase
        .from('artworks')
        .insert({
          title: artwork.title,
          title_bg: artwork.title_bg,
          image: artwork.image,
          description: artwork.description,
          description_bg: artwork.description_bg,
          for_sale: artwork.for_sale || false,
          price: artwork.price || null,
          display_order: nextOrder,
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

  // Toggle artwork featured status
  const toggleFeatured = async (id: number) => {
    try {
      // Find the artwork to toggle
      const artwork = artworks.find(art => art.id === id);
      
      if (!artwork) {
        toast.error("Artwork not found");
        return;
      }
      
      // Toggle the featured status
      const { error } = await supabase
        .from('artworks')
        .update({ featured: !artwork.featured })
        .eq('id', id);

      if (error) {
        toast.error("Failed to update artwork");
        console.error("Error updating artwork featured status:", error);
        return;
      }

      // Refresh artworks
      fetchArtworks();
      toast.success(artwork.featured ? "Artwork removed from featured" : "Artwork added to featured");
    } catch (error) {
      console.error("Error in toggleFeatured:", error);
      toast.error("Failed to update artwork");
    }
  };

  // Reorder artworks
  const reorderArtworks = async (reorderedArtworks: Artwork[]) => {
    try {
      // Update local state immediately for responsive UI
      setArtworks(reorderedArtworks);
      
      // Prepare batch updates for Supabase
      const updates = reorderedArtworks.map((artwork, index) => ({
        id: artwork.id,
        display_order: index
      }));
      
      // Update each artwork's display_order in the database
      for (const update of updates) {
        const { error } = await supabase
          .from('artworks')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
          
        if (error) {
          console.error(`Error updating artwork ${update.id}:`, error);
          // Continue with other updates even if one fails
        }
      }
      
      toast.success("Artwork order updated");
    } catch (error) {
      console.error("Error in reorderArtworks:", error);
      toast.error("Failed to update artwork order");
      // Revert to original order by refetching
      fetchArtworks();
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

  // Get featured artworks
  const featuredArtworks = artworks.filter(artwork => artwork.featured);

  return (
    <ArtworkContext.Provider value={{ 
      artworks,
      featuredArtworks,
      addArtwork, 
      setArtworkForSale,
      toggleFeatured,
      reorderArtworks,
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
