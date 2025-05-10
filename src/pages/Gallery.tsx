
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageToggle";
import { useArtworks } from "../contexts/ArtworkContext";

const translations = {
  en: {
    title: "Gallery",
    allCategories: "All",
    allTags: "All Tags",
    noArtworks: "No artworks found."
  },
  bg: {
    title: "Galería",
    allCategories: "Todos",
    allTags: "Todas las Etiquetas",
    noArtworks: "No se encontraron obras."
  }
};

const Gallery = () => {
  const { language } = useLanguage();
  const { artworks } = useArtworks();
  const t = translations[language];
  
  const [loaded, setLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredArtworks, setFilteredArtworks] = useState(artworks);
  const [visibleArtwork, setVisibleArtwork] = useState<typeof artworks[0] | null>(null);
  
  // Get unique categories
  const categories = ["All", ...new Set(artworks.map(artwork => artwork.category))];
  
  // Get unique tags
  const tags = [...new Set(artworks.flatMap(artwork => artwork.tags.map(tag => tag.id)))];
  const tagObjects = tags.map(tagId => {
    const foundTag = artworks.flatMap(artwork => artwork.tags).find(tag => tag.id === tagId);
    return foundTag || { id: tagId, name: tagId };
  });
  
  useEffect(() => {
    setLoaded(true);
    
    // Filter artworks based on selected category and tag
    let filtered = [...artworks];
    
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter(artwork => artwork.category === selectedCategory);
    }
    
    if (selectedTag) {
      filtered = filtered.filter(artwork => 
        artwork.tags.some(tag => tag.id === selectedTag)
      );
    }
    
    setFilteredArtworks(filtered);
  }, [selectedCategory, selectedTag, artworks]);
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === "All" ? null : category);
  };
  
  const handleTagSelect = (tagId: string | null) => {
    setSelectedTag(tagId);
  };
  
  const openArtworkDetail = (artwork: typeof artworks[0]) => {
    setVisibleArtwork(artwork);
  };
  
  const closeArtworkDetail = () => {
    setVisibleArtwork(null);
  };
  
  return (
    <div className={`space-y-8 ${loaded ? 'animate-fade-in' : 'opacity-0'}`}>
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
        
        <div className="flex flex-wrap gap-2 justify-center mb-4">
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
        
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <Badge
            variant={selectedTag === null ? "default" : "outline"}
            className="cursor-pointer hover-scale"
            onClick={() => handleTagSelect(null)}
          >
            {t.allTags}
          </Badge>
          {tagObjects.map((tag) => (
            <Badge 
              key={tag.id} 
              variant={selectedTag === tag.id ? "secondary" : "outline"} 
              className="cursor-pointer hover-scale"
              onClick={() => handleTagSelect(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>
      
      {filteredArtworks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t.noArtworks}</p>
        </div>
      ) : (
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
                <div className="flex flex-wrap gap-1 mt-2">
                  {artwork.tags.map(tag => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
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
              <p className="text-muted-foreground mb-4">{visibleArtwork.description}</p>
              <div className="flex flex-wrap gap-2">
                {visibleArtwork.tags.map(tag => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
