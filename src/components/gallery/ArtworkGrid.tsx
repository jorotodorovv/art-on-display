
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Artwork } from "@/types/artwork";
import { useLanguage } from "@/components/LanguageToggle";
import { EuroIcon } from "lucide-react";

interface ArtworkGridProps {
  artworks: Artwork[];
  onArtworkClick: (artwork: Artwork) => void;
  noArtworksMessage: string;
}

const ArtworkGrid: React.FC<ArtworkGridProps> = ({ 
  artworks, 
  onArtworkClick,
  noArtworksMessage
}) => {
  const { language } = useLanguage();
  
  if (artworks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{noArtworksMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((artwork) => {
        // Get the appropriate title based on the selected language
        const title = language === 'en' ? artwork.title : (artwork.title_bg || artwork.title);
        
        return (
          <div 
            key={artwork.id} 
            className="group cursor-pointer relative" 
            onClick={() => onArtworkClick(artwork)}
          >
            <div className="rounded-md overflow-hidden image-hover">
              <img 
                loading="lazy"
                src={artwork.image} 
                alt={title} 
                className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="mt-3">
              <h3 className="font-medium">{title}</h3>
              <div className="flex flex-wrap gap-1 mt-2">
                {artwork.tags.map(tag => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
                    {language === 'en' ? tag.name : tag.name_bg}
                  </Badge>
                ))}
              </div>
              
              {/* Price display for artworks that are for sale */}
              {artwork.for_sale && artwork.price && (
                <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground px-2 py-1 rounded-tl-md flex items-center gap-1 text-sm font-medium">
                  <EuroIcon className="h-4 w-4" />
                  <span>{artwork.price.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ArtworkGrid;
