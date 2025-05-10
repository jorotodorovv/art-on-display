
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageToggle";
import { useArtworks } from "../contexts/ArtworkContext";
import { useAuth } from "../contexts/AuthContext";
import { Artwork } from "@/types/artwork";
import { Plus } from "lucide-react";
import ArtworkGrid from "@/components/gallery/ArtworkGrid";
import ArtworkDetail from "@/components/gallery/ArtworkDetail";
import UploadArtworkModal from "@/components/gallery/UploadArtworkModal";

const translations = {
  en: {
    title: "Gallery",
    allCategories: "All",
    allTags: "All Tags",
    noArtworks: "No artworks found.",
    uploadArtwork: "Upload Artwork"
  },
  bg: {
    title: "Galería",
    allCategories: "Todos",
    allTags: "Todas las Etiquetas",
    noArtworks: "No se encontraron obras.",
    uploadArtwork: "Subir Obra"
  }
};

const Gallery = () => {
  const { language } = useLanguage();
  const { artworks } = useArtworks();
  const { isAuthenticated } = useAuth();
  const t = translations[language];
  
  const [loaded, setLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>(artworks);
  const [visibleArtwork, setVisibleArtwork] = useState<Artwork | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
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
  
  const openArtworkDetail = (artwork: Artwork) => {
    setVisibleArtwork(artwork);
  };
  
  const closeArtworkDetail = () => {
    setVisibleArtwork(null);
  };
  
  return (
    <div className={`space-y-8 ${loaded ? 'animate-fade-in' : 'opacity-0'}`}>
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-6">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          
          {isAuthenticated && (
            <Button 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              {t.uploadArtwork}
            </Button>
          )}
        </div>
        
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
      
      <ArtworkGrid 
        artworks={filteredArtworks} 
        onArtworkClick={openArtworkDetail} 
        noArtworksMessage={t.noArtworks}
      />
      
      {visibleArtwork && (
        <ArtworkDetail artwork={visibleArtwork} onClose={closeArtworkDetail} />
      )}
      
      <UploadArtworkModal 
        open={isUploadModalOpen} 
        onOpenChange={setIsUploadModalOpen} 
      />
    </div>
  );
};

export default Gallery;
