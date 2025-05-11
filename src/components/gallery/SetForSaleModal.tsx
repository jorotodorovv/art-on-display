
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useArtworks } from "@/contexts/ArtworkContext";
import { useLanguage } from "@/components/LanguageToggle";
import { Artwork } from "@/types/artwork";
import { toast } from "@/components/ui/sonner";
import { DollarSign } from "lucide-react";

const translations = {
  en: {
    title: "Add to For Sale",
    price: "Price",
    add: "Add to For Sale",
    cancel: "Cancel",
    success: "Artwork added to For Sale page successfully",
    error: "Please enter a valid price",
    priceLabel: "Enter price in USD",
  },
  bg: {
    title: "Añadir a En Venta",
    price: "Precio",
    add: "Añadir a En Venta",
    cancel: "Cancelar",
    success: "Obra añadida a la página En Venta correctamente",
    error: "Por favor ingresa un precio válido",
    priceLabel: "Ingresa el precio en USD",
  }
};

interface SetForSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artwork: Artwork | null;
}

const SetForSaleModal: React.FC<SetForSaleModalProps> = ({ 
  open, 
  onOpenChange, 
  artwork 
}) => {
  const { setArtworkForSale } = useArtworks();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [price, setPrice] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!price || isNaN(Number(price)) || Number(price) <= 0 || !artwork) {
      toast.error(t.error);
      return;
    }
    
    setArtworkForSale(artwork.id, Number(price));
    toast.success(t.success);
    onOpenChange(false);
    setPrice("");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>
        
        {artwork && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-24 w-24 rounded overflow-hidden">
                <img 
                  src={artwork.image} 
                  alt={artwork.title} 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">{t.price}</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={t.priceLabel}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => {
                onOpenChange(false);
                setPrice("");
              }}>
                {t.cancel}
              </Button>
              <Button type="submit">{t.add}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SetForSaleModal;
