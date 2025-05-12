
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Artwork } from "@/types/artwork";

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
  if (artworks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{noArtworksMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((artwork) => (
        <div 
          key={artwork.id} 
          className="group cursor-pointer" 
          onClick={() => onArtworkClick(artwork)}
        >
          <div className="rounded-md overflow-hidden image-hover">
            <img 
              loading="lazy"
              src={artwork.blob_url} 
              alt={artwork.title} 
              className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="mt-3">
            <h3 className="font-medium">{artwork.title}</h3>
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
  );
};

export default ArtworkGrid;
