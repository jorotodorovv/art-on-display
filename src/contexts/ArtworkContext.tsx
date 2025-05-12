
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Artwork } from "../types/artwork";
import { fetchBlobs, deleteBlob } from "../lib/api/blob-service";

// Type for artworks for sale
export interface ArtworkForSale {
  id: number;
  title: string;
  blob_url: string;
  price: number;
  description: string;
  available: boolean;
}

interface ArtworkContextType {
  artworks: Artwork[];
  artworksForSale: ArtworkForSale[];
  addArtwork: (artwork: Omit<Artwork, "id">) => void;
  setArtworkForSale: (id: number, price: number) => void;
  getTags: () => { id: string; name: string }[];
  loading: boolean;
  error: Error | null;
  deleteArtwork: (id: number) => Promise<void>;
}

const ArtworkContext = createContext<ArtworkContextType | undefined>(undefined);

export const ArtworkProvider = ({ children }: { children: ReactNode }) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch artworks from Vercel Blob
  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch blobs from Vercel Blob storage
        const blobs = await fetchBlobs();
        
        // Convert blobs to artwork objects
        // Note: In a real app, you would fetch additional metadata from a database
        // For now, we'll create basic artwork objects from the blob data
        const artworksFromBlobs = blobs.map((blob, index) => {
          // Extract a title from the pathname
          const filename = blob.pathname.split('/').pop() || 'Untitled';
          const title = filename.split('.')[0].replace(/-/g, ' ');
          
          return {
            id: index + 1,
            title: title.charAt(0).toUpperCase() + title.slice(1), // Capitalize first letter
            image: blob.url,
            description: `Uploaded on ${blob.uploadedAt}`,
            tags: [{ id: "uploaded", name: "Uploaded" }],
            forSale: false,
            // Store the original blob URL to use for deletion later
            blobUrl: blob.url
          };
        });
        
        setArtworks(artworksFromBlobs);
      } catch (err) {
        console.error("Failed to fetch artworks:", err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  // Add new artwork
  const addArtwork = (artwork: Omit<Artwork, "id">) => {
    const newId = artworks.length > 0 
      ? Math.max(...artworks.map(a => a.id)) + 1 
      : 1;
    setArtworks([...artworks, { ...artwork, id: newId }]);
  };

  // Delete artwork
  const deleteArtwork = async (id: number) => {
    const artwork = artworks.find(a => a.id === id);
    if (!artwork) {
      throw new Error('Artwork not found');
    }
    
    try {
      // Delete the blob from Vercel Blob storage
      // This assumes the artwork has a blobUrl property
      if ('blobUrl' in artwork) {
        await deleteBlob(artwork.blobUrl as string);
      }
      
      // Remove the artwork from state
      setArtworks(currentArtworks => 
        currentArtworks.filter(a => a.id !== id)
      );
    } catch (error) {
      console.error('Error deleting artwork:', error);
      throw error;
    }
  };

  // Set artwork for sale
  const setArtworkForSale = (id: number, price: number) => {
    setArtworks(currentArtworks => 
      currentArtworks.map(artwork => 
        artwork.id === id 
          ? { ...artwork, forSale: true, price } 
          : artwork
      )
    );
  };

  // Get unique tags from all artworks
  const getTags = () => {
    const tagsMap = new Map();
    artworks.forEach(artwork => {
      artwork.tags.forEach(tag => {
        tagsMap.set(tag.id, tag);
      });
    });
    return Array.from(tagsMap.values());
  };

  // Generate artworks for sale from regular artworks
  const artworksForSale = artworks
    .filter(artwork => artwork.forSale)
    .map(artwork => ({
      id: artwork.id,
      title: artwork.title,
      price: artwork.price || 0,
      description: artwork.description,
      blob_url: artwork.blob_url,
      available: true
    }));

  return (
    <ArtworkContext.Provider value={{ 
      artworks, 
      artworksForSale,
      addArtwork, 
      setArtworkForSale,
      getTags,
      loading,
      error,
      deleteArtwork
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
