
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Trash2, EuroIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

const translations = {
  en: {
    checkout: 'Checkout',
    summary: 'Order Summary',
    total: 'Total',
    continueToPayment: 'Continue to Payment',
    continueShopping: 'Continue Shopping',
    empty: 'Your cart is empty',
    noItems: 'No items in your cart',
    remove: 'Remove',
    processingPayment: 'Processing payment...'
  },
  bg: {
    checkout: 'Плащане',
    summary: 'Резюме на поръчката',
    total: 'Общо',
    continueToPayment: 'Продължи към плащане',
    continueShopping: 'Продължи пазаруването',
    empty: 'Вашата кошница е празна',
    noItems: 'Нямате артикули в кошницата',
    remove: 'Премахни',
    processingPayment: 'Обработка на плащането...'
  }
};

const Checkout = () => {
  const { items, removeFromCart, getTotalPrice } = useCart();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];
  const totalPrice = getTotalPrice();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      
      // Create a checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          items: items.map(item => ({
            id: item.artwork.id,
            title: item.artwork.title,
            price: item.artwork.price,
            image: item.artwork.image,
            quantity: item.quantity
          }))
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(language === 'en' 
        ? 'Failed to process payment. Please try again.' 
        : 'Грешка при обработката на плащането. Моля, опитайте отново.');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{t.checkout}</h1>
        <div className="bg-background shadow-md rounded-lg p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-lg text-muted-foreground mb-4">{t.noItems}</p>
            <Button asChild>
              <Link to="/gallery">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.continueShopping}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{t.checkout}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Order items */}
        <div className="md:col-span-2">
          <div className="bg-background shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t.summary}</h2>
            <div className="space-y-4 divide-y">
              {items.map((item) => {
                const title = language === 'en' ? item.artwork.title : (item.artwork.title_bg || item.artwork.title);
                return (
                  <div key={item.artwork.id} className="flex space-x-4 py-4">
                    <div className="w-24 h-24 overflow-hidden rounded-md">
                      <img
                        src={item.artwork.image}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{title}</h4>
                      <div className="flex items-center mt-1 text-muted-foreground">
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
          </div>
        </div>

        {/* Order summary */}
        <div className="md:col-span-1">
          <div className="bg-background shadow-md rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">{t.total}</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>{t.total}:</span>
                <div className="flex items-center">
                  <EuroIcon className="h-4 w-4 mr-1" />
                  <span>{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.processingPayment}
                  </>
                ) : (
                  t.continueToPayment
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
