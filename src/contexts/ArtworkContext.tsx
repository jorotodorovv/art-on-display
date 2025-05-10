
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Artwork } from "../types/artwork";

// Initial artwork data
const initialArtworks: Artwork[] = [
  {
    id: 1,
    title: "Serene Lake",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    category: "Paintings",
    year: "2023",
    description: "Acrylic on canvas, 24x36 inches",
    tags: [{ id: "nature", name: "Nature" }, { id: "landscape", name: "Landscape" }]
  },
  {
    id: 2,
    title: "Abstract Forms",
    image: "https://images.unsplash.com/photo-1493397212122-2b85dda8106b",
    category: "Mixed Media",
    year: "2022",
    description: "Mixed media on paper, 18x24 inches",
    tags: [{ id: "abstract", name: "Abstract" }, { id: "modern", name: "Modern" }]
  },
  {
    id: 3,
    title: "Mountain Vista",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
    category: "Digital Art",
    year: "2023",
    description: "Digital print on archival paper, 16x20 inches",
    tags: [{ id: "nature", name: "Nature" }, { id: "landscape", name: "Landscape" }]
  },
  {
    id: 4,
    title: "Urban Geometry",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
    category: "Photography",
    year: "2022",
    description: "Digital photography, limited edition print",
    tags: [{ id: "urban", name: "Urban" }, { id: "architecture", name: "Architecture" }]
  },
  {
    id: 5,
    title: "Night Sky",
    image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb",
    category: "Paintings",
    year: "2021",
    description: "Oil on canvas, 30x40 inches",
    tags: [{ id: "nature", name: "Nature" }, { id: "night", name: "Night" }]
  },
  {
    id: 6,
    title: "Forest Lights",
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
    category: "Photography",
    year: "2021",
    description: "Digital photography, archival print",
    tags: [{ id: "nature", name: "Nature" }, { id: "forest", name: "Forest" }]
  },
  {
    id: 7,
    title: "Geometric Patterns",
    image: "https://images.unsplash.com/photo-1492321936769-b49830bc1d1e",
    category: "Digital Art",
    year: "2022",
    description: "Digital art, limited edition print",
    tags: [{ id: "abstract", name: "Abstract" }, { id: "geometry", name: "Geometry" }]
  },
  {
    id: 8,
    title: "Urban Landscape",
    image: "https://images.unsplash.com/photo-1527576539890-dfa815648363",
    category: "Mixed Media",
    year: "2020",
    description: "Mixed media on canvas, 24x36 inches",
    tags: [{ id: "urban", name: "Urban" }, { id: "landscape", name: "Landscape" }]
  },
  {
    id: 9,
    title: "Colorful Abstract",
    image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b",
    category: "Paintings",
    year: "2021",
    description: "Acrylic on canvas, 18x24 inches",
    tags: [{ id: "abstract", name: "Abstract" }, { id: "colorful", name: "Colorful" }]
  }
];

interface ArtworkContextType {
  artworks: Artwork[];
  addArtwork: (artwork: Omit<Artwork, "id">) => void;
  getTags: () => { id: string; name: string }[];
}

const ArtworkContext = createContext<ArtworkContextType | undefined>(undefined);

export const ArtworkProvider = ({ children }: { children: ReactNode }) => {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);

  // Add new artwork
  const addArtwork = (artwork: Omit<Artwork, "id">) => {
    const newId = Math.max(0, ...artworks.map(a => a.id)) + 1;
    setArtworks([...artworks, { ...artwork, id: newId }]);
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

  return (
    <ArtworkContext.Provider value={{ artworks, addArtwork, getTags }}>
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
