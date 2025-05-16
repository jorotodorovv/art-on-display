
import React from "react";
import { Artwork } from "@/types/artwork";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/LanguageToggle";

const translations = {
  en: {
    addToSale: "Add to For Sale",
  },
  bg: {
    addToSale: "Добави за продажба",
  }
};

interface ArtworkDetailProps {
  artwork: Artwork;
  onClose: () => void;
  onSetForSale?: (artwork: Artwork) => void;
}

const ArtworkDetail: React.FC<ArtworkDetailProps> = ({ artwork, onClose, onSetForSale }) => {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  
  // Get the appropriate title and description based on the selected language
  const title = language === 'en' ? artwork.title : (artwork.title_bg || artwork.title);
  const description = language === 'en' ? artwork.description : (artwork.description_bg || artwork.description);
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background max-w-3xl w-full rounded-lg shadow-lg overflow-hidden animate-scale-in">
        <div className="relative">
          <img 
            src={artwork.image} 
            alt={title} 
            className="w-full h-64 sm:h-80 object-cover"
          />
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute top-4 right-4 rounded-full bg-background/50 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-4">{description}</p>
          <div className="flex flex-wrap gap-2">
            {artwork.tags.map(tag => (
              <Badge key={tag.id} variant="secondary">
                {language === 'en' ? tag.name : tag.name_bg}
              </Badge>
            ))}
          </div>
          
          {isAuthenticated && onSetForSale && (
            <div className="mt-6 pt-4 border-t">
              <Button 
                onClick={() => onSetForSale(artwork)}
                className="flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                {t.addToSale}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;
