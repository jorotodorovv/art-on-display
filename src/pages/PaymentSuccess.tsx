
import { useEffect } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/components/LanguageToggle';
import { toast } from '@/components/ui/sonner';

const translations = {
  en: {
    success: 'Payment Successful',
    message: 'Thank you for your purchase! Your order has been confirmed.',
    orderNumber: 'Order #',
    continue: 'Continue Shopping',
    orderProcessing: 'Your order is being processed and will be shipped soon.',
    emailNotification: 'You will receive an email with the details of your purchase.',
    viewAll: 'View All Artworks'
  },
  bg: {
    success: 'Плащането е успешно',
    message: 'Благодарим ви за покупката! Вашата поръчка е потвърдена.',
    orderNumber: 'Поръчка #',
    continue: 'Продължи пазаруването',
    orderProcessing: 'Вашата поръчка се обработва и скоро ще бъде изпратена.',
    emailNotification: 'Ще получите имейл с подробности за покупката си.',
    viewAll: 'Преглед на всички произведения'
  }
};

const PaymentSuccess = () => {
  const { clearCart } = useCart();
  const { language } = useLanguage();
  const t = translations[language];
  
  // Generate a random order ID for demonstration purposes
  const orderId = Math.floor(100000 + Math.random() * 900000);

  // Clear the cart when payment is successful
  useEffect(() => {
    clearCart();
    
    // Show a success toast
    toast.success(
      language === 'en' ? 'Payment completed successfully!' : 'Плащането е завършено успешно!'
    );
  }, [clearCart, language]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <div className="bg-background shadow-md rounded-lg p-8 text-center">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold">{t.success}</h1>
          <p className="text-lg text-muted-foreground mb-2">{t.message}</p>
          
          <div className="bg-muted/50 px-6 py-4 rounded-md w-full max-w-sm">
            <p className="font-medium">{t.orderNumber}{orderId}</p>
          </div>
          
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
              <Link to="/gallery" className="flex items-center justify-center">
                {t.viewAll}
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
