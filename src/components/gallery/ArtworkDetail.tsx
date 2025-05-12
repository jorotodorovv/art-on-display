
import React, { useState } from "react";
import { Artwork } from "@/types/artwork";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, DollarSign, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useArtworks } from "@/contexts/ArtworkContext";
import { toast } from "@/components/ui/sonner";

const translations = {
  en: {
    addToSale: "Add to For Sale",
    deleteArtwork: "Delete Artwork",
    deleteConfirm: "Are you sure you want to delete this artwork?",
    deleting: "Deleting artwork...",
    deleteSuccess: "Artwork deleted successfully",
    deleteError: "Failed to delete artwork"
  },
  bg: {
    addToSale: "Añadir a En Venta",
    deleteArtwork: "Изтрий Произведение",
    deleteConfirm: "Сигурни ли сте, че искате да изтриете това произведение?",
    deleting: "Изтриване на произведение...",
    deleteSuccess: "Произведението е изтрито успешно",
    deleteError: "Грешка при изтриване на произведение"
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
  const { deleteArtwork } = useArtworks();
  const [isDeleting, setIsDeleting] = useState(false);
  const t = translations[language];
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background max-w-3xl w-full rounded-lg shadow-lg overflow-hidden animate-scale-in">
        <div className="relative">
          <img 
            src={artwork.blob_url} 
            alt={artwork.title} 
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
          <h2 className="text-2xl font-semibold mb-2">{artwork.title}</h2>
          <p className="text-muted-foreground mb-4">{artwork.description}</p>
          <div className="flex flex-wrap gap-2">
            {artwork.tags.map(tag => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
          
          {isAuthenticated && (
            <div className="mt-6 pt-4 border-t flex flex-wrap gap-3">
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
                variant="destructive"
                onClick={async () => {
                  if (window.confirm(t.deleteConfirm)) {
                    try {
                      setIsDeleting(true);
                      toast.loading(t.deleting);
                      await deleteArtwork(artwork.id);
                      toast.dismiss();
                      toast.success(t.deleteSuccess);
                      onClose();
                    } catch (error) {
                      console.error('Error deleting artwork:', error);
                      toast.dismiss();
                      toast.error(t.deleteError);
                    } finally {
                      setIsDeleting(false);
                    }
                  }
                }}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t.deleteArtwork}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;
