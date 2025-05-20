
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon, Loader2, ExternalLinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/components/LanguageToggle';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const translations = {
  en: {
    paymentSuccess: 'Payment Successful!',
    thankYou: 'Thank you for your purchase',
    processing: 'Processing your order...',
    confirmingPayment: 'Confirming your payment...',
    orderLocked: 'Your order has been locked in.',
    viewOrders: 'View My Orders',
    continueShopping: 'Continue Shopping',
    orderId: 'Order ID',
    purchaseConfirmed: 'Purchase confirmed!',
    artworksUpdated: 'Artwork status updated'
  },
  bg: {
    paymentSuccess: 'Плащането е успешно!',
    thankYou: 'Благодарим Ви за покупката',
    processing: 'Обработване на поръчката...',
    confirmingPayment: 'Потвърждаване на плащането...',
    orderLocked: 'Вашата поръчка е потвърдена.',
    viewOrders: 'Преглед на поръчките',
    continueShopping: 'Продължи пазаруването',
    orderId: 'Номер на поръчка',
    purchaseConfirmed: 'Покупката е потвърдена!',
    artworksUpdated: 'Статусът на произведенията е актуализиран'
  }
};

const PaymentSuccess = () => {
  const { clearCart } = useCart();
  const { language } = useLanguage();
  const [processing, setProcessing] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const navigate = useNavigate();
  const t = translations[language];

  useEffect(() => {
    // Try to get order ID from session storage
    const storedOrderId = sessionStorage.getItem('current_order_id');
    setOrderId(storedOrderId);

    // Immediately clear the cart on payment success
    clearCart();

    const processPayment = async () => {
      if (!storedOrderId) {
        setProcessing(false);
        return;
      }

      try {
        // Call process-payment edge function to update order status and artwork status
        const { error } = await supabase.functions.invoke('process-payment', {
          body: { orderId: storedOrderId }
        });

        if (error) throw error;

        toast.success(t.purchaseConfirmed);
        
        // Wait 2 seconds to show the checkmark, then navigate to orders page
        setTimeout(() => {
          setProcessing(false);
          
          // Wait a little longer before redirecting to Orders page to give user time to see the success screen
          setTimeout(() => {
            // Clear order ID from session storage
            sessionStorage.removeItem('current_order_id');
            navigate('/orders');
          }, 2000);
        }, 2000);
      } catch (error) {
        console.error('Error processing payment:', error);
        setProcessing(false);
      }
    };

    processPayment();
  }, [clearCart, language, navigate, t.artworksUpdated, t.purchaseConfirmed]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <div className="bg-background shadow-md rounded-lg p-8 text-center">
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          {processing ? (
            <>
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t.processing}</h1>
                <p className="text-muted-foreground mt-1">{t.confirmingPayment}</p>
              </div>
            </>
          ) : (
            <>
              <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckIcon className="h-10 w-10 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t.paymentSuccess}</h1>
                <p className="text-muted-foreground mt-1">{t.thankYou}</p>
              </div>
              
              {orderId && (
                <>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    <span>{t.orderId}: </span>
                    <span className="font-mono">{orderId}</span>
                  </div>
                </>
              )}
              
              <p className="text-muted-foreground">{t.orderLocked}</p>
              
              <div className="flex space-x-4">
                <Button asChild className="flex items-center">
                  <Link to="/orders">
                    {t.viewOrders} 
                    <ExternalLinkIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link to="/gallery">
                    {t.continueShopping}
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
