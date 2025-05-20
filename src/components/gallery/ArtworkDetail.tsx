
import React, { useState } from "react";
import { Artwork } from "@/types/artwork";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, EuroIcon, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/LanguageToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useArtworks } from "@/contexts/ArtworkContext";
import { useCart } from "@/contexts/CartContext";

const translations = {
  en: {
    addToSale: "Add to For Sale",
    feature: "Feature on Homepage",
    unfeature: "Remove from Homepage",
    price: "Price",
    setPrice: "Set Price",
    cancel: "Cancel",
    error: "Please enter a valid price",
    priceLabel: "Enter price in EUR",
    adminOnly: "Only admins can set artwork for sale",
    addToCart: "Add to Cart",
    inCart: "In Cart"
  },
  bg: {
    addToSale: "Добави за продажба",
    feature: "Показвай на началната страница",
    unfeature: "Премахни от началната страница",
    price: "Цена",
    setPrice: "Задай цена",
    cancel: "Отказ",
    error: "Моля, въведете валидна цена",
    priceLabel: "Въведете цена в EUR",
    adminOnly: "Само администраторите могат да задават цена на творбите",
    addToCart: "Добави в кошницата",
    inCart: "В кошницата"
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
  const { setArtworkForSale } = useArtworks();
  const { addToCart, isInCart } = useCart();
  const t = translations[language];

  const [price, setPrice] = useState("");
  const [showPriceInput, setShowPriceInput] = useState(false);

  // Get the appropriate title and description based on the selected language
  const title = language === 'en' ? artwork.title : (artwork.title_bg || artwork.title);
  const description = language === 'en' ? artwork.description : (artwork.description_bg || artwork.description);

  const handleToggleFeatured = async () => {
    await toggleFeatured(artwork.id);
  };

  const handleSetForSale = async () => {
    if (!isAdmin) {
      toast.error(t.adminOnly);
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast.error(t.error);
      return;
    }

    await setArtworkForSale(artwork.id, Number(price));
    setPrice("");
    setShowPriceInput(false);

    // If there's an onSetForSale callback, call it
    if (onSetForSale) {
      onSetForSale(artwork);
    }
  };

  const handleAddToCart = () => {
    addToCart(artwork);
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

          {/* For Sale Price Display */}
          {artwork.for_sale && artwork.price && (
            <div className="flex items-center gap-2 mt-4 bg-muted p-3 rounded-md">
              <EuroIcon className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">{artwork.price.toFixed(2)}</span>
              
              {/* Add to Cart Button */}
              <div className="ml-auto">
                <Button 
                  onClick={handleAddToCart} 
                  disabled={isInCart(artwork.id)}
                  variant={isInCart(artwork.id) ? "secondary" : "default"}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isInCart(artwork.id) ? t.inCart : t.addToCart}
                </Button>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="mt-6 pt-4 border-t flex flex-wrap gap-2">
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
          {isAuthenticated && isAdmin && (
            <div className="mt-6 pt-4 border-t">
              {!showPriceInput ? (
                <Button
                  onClick={() => setShowPriceInput(true)}
                  className="flex items-center gap-2"
                >
                  <EuroIcon className="h-4 w-4" />
                  {t.addToSale}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">{t.price}</Label>
                    <div className="relative">
                      <EuroIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPriceInput(false);
                        setPrice("");
                      }}
                    >
                      {t.cancel}
                    </Button>
                    <Button onClick={handleSetForSale}>
                      {t.setPrice}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkDetail;
