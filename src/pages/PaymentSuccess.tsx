
import { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/components/LanguageToggle';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const translations = {
  en: {
    success: 'Payment Successful',
    message: 'Thank you for your purchase! Your order has been confirmed.',
    orderNumber: 'Order #',
    continue: 'Continue Shopping',
    orderProcessing: 'Your order is being processed and will be shipped soon.',
    emailNotification: 'You will receive an email with the details of your purchase.',
    viewAll: 'View All Artworks',
    viewOrders: 'View My Orders',
    processing: 'Finalizing your order...'
  },
  bg: {
    success: 'Плащането е успешно',
    message: 'Благодарим ви за покупката! Вашата поръчка е потвърдена.',
    orderNumber: 'Поръчка #',
    continue: 'Продължи пазаруването',
    orderProcessing: 'Вашата поръчка се обработва и скоро ще бъде изпратена.',
    emailNotification: 'Ще получите имейл с подробности за покупката си.',
    viewAll: 'Преглед на всички произведения',
    viewOrders: 'Моите поръчки',
    processing: 'Финализиране на поръчката...'
  }
};

const PaymentSuccess = () => {
  const { clearCart } = useCart();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const orderId = searchParams.get('order_id');
  const t = translations[language];
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/payment-success' } });
      return;
    }

    // Process payment if order ID is present
    if (orderId) {
      const processPayment = async () => {
        try {
          // Call the process-payment function to update artwork status
          const { error } = await supabase.functions.invoke('process-payment', {
            body: { orderId }
          });
          
          if (error) {
            console.error('Error processing payment:', error);
          }
          
          // Clear the cart
          clearCart();
          
          // Show success toast
          toast.success(
            language === 'en' ? 'Payment completed successfully!' : 'Плащането е завършено успешно!'
          );
        } catch (error) {
          console.error('Error finalizing payment:', error);
        } finally {
          setIsProcessing(false);
        }
      };
      
      processPayment();
    } else {
      // If there's no order ID, just clear the cart
      clearCart();
      setIsProcessing(false);
    }
  }, [clearCart, language, orderId, navigate, isAuthenticated]);

  if (isProcessing) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl">
        <div className="bg-background shadow-md rounded-lg p-8 text-center">
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <p className="text-lg text-muted-foreground">{t.processing}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <div className="bg-background shadow-md rounded-lg p-8 text-center">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold">{t.success}</h1>
          <p className="text-lg text-muted-foreground mb-2">{t.message}</p>
          
          {orderId && (
            <div className="bg-muted/50 px-6 py-4 rounded-md w-full max-w-sm">
              <p className="font-medium">{t.orderNumber}{orderId}</p>
            </div>
          )}
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{t.orderProcessing}</p>
            <p>{t.emailNotification}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm pt-4">
            <Button asChild variant="default" size="lg" className="flex-1">
              <Link to="/gallery">
                {t.continue}
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link to="/orders" className="flex items-center justify-center">
                {t.viewOrders}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
