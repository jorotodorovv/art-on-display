
import { useState } from 'react';
import { ShoppingCart as CartIcon, Trash2, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { EuroIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const translations = {
  en: {
    cart: 'Cart',
    empty: 'Your cart is empty',
    checkout: 'Checkout',
    total: 'Total',
    remove: 'Remove',
    continue: 'Continue Shopping'
  },
  bg: {
    cart: 'Кошница',
    empty: 'Вашата кошница е празна',
    checkout: 'Плащане',
    total: 'Общо',
    remove: 'Премахни',
    continue: 'Продължи пазаруването'
  }
};

const ShoppingCart = () => {
  const { items, removeFromCart, getTotalItems, getTotalPrice } = useCart();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[language];
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="relative cursor-pointer hover-scale text-muted-foreground hover:text-primary">
          <CartIcon className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
              {totalItems}
            </Badge>
          )}
        </div>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="space-y-2 pb-4 border-b">
          <SheetTitle className="flex justify-between items-center">
            <span>{t.cart}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover-scale"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] space-y-4 text-muted-foreground">
              <CartIcon className="h-12 w-12" />
              <p>{t.empty}</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                {t.continue}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const title = language === 'en' ? item.artwork.title : (item.artwork.title_bg || item.artwork.title);
                return (
                  <div key={item.artwork.id} className="flex space-x-4">
                    <div className="w-20 h-20 overflow-hidden rounded-md">
                      <img
                        src={item.artwork.image}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{title}</h4>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <EuroIcon className="h-3 w-3 mr-1" />
                        {item.artwork.price?.toFixed(2)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-destructive"
                      onClick={() => removeFromCart(item.artwork.id)}
                      aria-label={t.remove}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="pt-4 border-t space-y-4">
            <div className="flex justify-between items-center font-medium">
              <span>{t.total}:</span>
              <div className="flex items-center">
                <EuroIcon className="h-4 w-4 mr-1" />
                <span>{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <Button 
              className="w-full" 
              asChild
              onClick={() => setIsOpen(false)}
            >
              <Link to="/checkout">
                {t.checkout}
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCart;
