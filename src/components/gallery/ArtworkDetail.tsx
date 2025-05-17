
import React from "react";
import { Artwork } from "@/types/artwork";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, DollarSign, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/LanguageToggle";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useArtworks } from "@/contexts/ArtworkContext";

const translations = {
  en: {
    addToSale: "Add to For Sale",
    feature: "Feature on Homepage",
    unfeature: "Remove from Homepage"
  },
  bg: {
    addToSale: "Добави за продажба",
    feature: "Показвай на началната страница",
    unfeature: "Премахни от началната страница"
  }
};

interface ArtworkDetailProps {
  artwork: Artwork;
  onClose: () => void;
  onSetForSale?: (artwork: Artwork) => void;
}

const ArtworkDetail: React.FC<ArtworkDetailProps> = ({ artwork, onClose, onSetForSale }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { language } = useLanguage();
  const { toggleFeatured } = useArtworks();
  const t = translations[language];

  // Get the appropriate title and description based on the selected language
  const title = language === 'en' ? artwork.title : (artwork.title_bg || artwork.title);
  const description = language === 'en' ? artwork.description : (artwork.description_bg || artwork.description);

  const handleToggleFeatured = async () => {
    await toggleFeatured(artwork.id);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="relative">
          <img
            src={artwork.image}
            alt={title}
            className="w-full max-h-[600px] object-cover"
          />
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

          {isAdmin && (
            <div className="mt-6 pt-4 border-t flex flex-wrap gap-2">
              {onSetForSale && (
                <Button
                  onClick={() => onSetForSale(artwork)}
                  className="flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  {t.addToSale}
                </Button>
              )}
              
              <Button
                onClick={handleToggleFeatured}
                variant={artwork.featured ? "secondary" : "outline"}
                className="flex items-center gap-2"
              >
                <Star className={`h-4 w-4 ${artwork.featured ? "fill-current" : ""}`} />
                {artwork.featured ? t.unfeature : t.feature}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkDetail;
