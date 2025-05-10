
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Define artwork types and data
interface Artwork {
  id: number;
  title: string;
  image: string;
  category: string;
  year: string;
  description: string;
}

const artworks: Artwork[] = [
  {
    id: 1,
    title: "Serene Lake",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    category: "Paintings",
    year: "2023",
    description: "Acrylic on canvas, 24x36 inches"
  },
  {
    id: 2,
    title: "Abstract Forms",
    image: "https://images.unsplash.com/photo-1493397212122-2b85dda8106b",
    category: "Mixed Media",
    year: "2022",
    description: "Mixed media on paper, 18x24 inches"
  },
  {
    id: 3,
    title: "Mountain Vista",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
    category: "Digital Art",
    year: "2023",
    description: "Digital print on archival paper, 16x20 inches"
  },
  {
    id: 4,
    title: "Urban Geometry",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
    category: "Photography",
    year: "2022",
    description: "Digital photography, limited edition print"
  },
  {
    id: 5,
    title: "Night Sky",
    image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb",
    category: "Paintings",
    year: "2021",
    description: "Oil on canvas, 30x40 inches"
  },
  {
    id: 6,
    title: "Forest Lights",
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
    category: "Photography",
    year: "2021",
    description: "Digital photography, archival print"
  },
  {
    id: 7,
    title: "Geometric Patterns",
    image: "https://images.unsplash.com/photo-1492321936769-b49830bc1d1e",
    category: "Digital Art",
    year: "2022",
    description: "Digital art, limited edition print"
  },
  {
    id: 8,
    title: "Urban Landscape",
    image: "https://images.unsplash.com/photo-1527576539890-dfa815648363",
    category: "Mixed Media",
    year: "2020",
    description: "Mixed media on canvas, 24x36 inches"
  },
  {
    id: 9,
    title: "Colorful Abstract",
    image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b",
    category: "Paintings",
    year: "2021",
    description: "Acrylic on canvas, 18x24 inches"
  }
];

const Gallery = () => {
  const [loaded, setLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>(artworks);
  const [visibleArtwork, setVisibleArtwork] = useState<Artwork | null>(null);
  
  // Get unique categories
  const categories = ["All", ...new Set(artworks.map(artwork => artwork.category))];
  
  useEffect(() => {
    setLoaded(true);
    
    // Filter artworks based on selected category
    if (!selectedCategory || selectedCategory === "All") {
      setFilteredArtworks(artworks);
    } else {
      setFilteredArtworks(artworks.filter(artwork => artwork.category === selectedCategory));
    }
  }, [selectedCategory]);
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === "All" ? null : category);
  };
  
  const openArtworkDetail = (artwork: Artwork) => {
    setVisibleArtwork(artwork);
  };
  
  const closeArtworkDetail = () => {
    setVisibleArtwork(null);
  };
  
  return (
    <div className={`space-y-8 ${loaded ? 'animate-fade-in' : 'opacity-0'}`}>
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6">Gallery</h1>
        
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <Badge 
              key={category} 
              variant={selectedCategory === category || (category === "All" && !selectedCategory) ? "default" : "outline"} 
              className="cursor-pointer hover-scale"
              onClick={() => handleCategorySelect(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtworks.map((artwork) => (
          <div 
            key={artwork.id} 
            className="group cursor-pointer" 
            onClick={() => openArtworkDetail(artwork)}
          >
            <div className="rounded-md overflow-hidden image-hover">
              <img 
                src={artwork.image} 
                alt={artwork.title} 
                className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="mt-3">
              <h3 className="font-medium">{artwork.title}</h3>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{artwork.category}</p>
                <p className="text-sm text-muted-foreground">{artwork.year}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {visibleArtwork && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background max-w-3xl w-full rounded-lg shadow-lg overflow-hidden animate-scale-in">
            <div className="relative">
              <img 
                src={visibleArtwork.image} 
                alt={visibleArtwork.title} 
                className="w-full h-64 sm:h-80 object-cover"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-4 right-4 rounded-full bg-background/50 hover:bg-background"
                onClick={(e) => {
                  e.stopPropagation();
                  closeArtworkDetail();
                }}
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-2">{visibleArtwork.title}</h2>
              <div className="flex gap-2 mb-4">
                <Badge>{visibleArtwork.category}</Badge>
                <Badge variant="outline">{visibleArtwork.year}</Badge>
              </div>
              <p className="text-muted-foreground">{visibleArtwork.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
