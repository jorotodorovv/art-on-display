
import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/components/LanguageToggle';

const translations = {
  en: {
    success: 'Payment Successful',
    message: 'Thank you for your purchase! Your order has been confirmed.',
    continue: 'Continue Shopping'
  },
  bg: {
    success: 'Плащането е успешно',
    message: 'Благодарим ви за покупката! Вашата поръчка е потвърдена.',
    continue: 'Продължи пазаруването'
  }
};

const PaymentSuccess = () => {
  const { clearCart } = useCart();
  const { language } = useLanguage();
  const t = translations[language];

  // Clear the cart when payment is successful
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="container mx-auto px-4 py-24 max-w-xl">
      <div className="bg-background shadow-md rounded-lg p-8 text-center">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <CheckCircle className="h-24 w-24 text-green-500" />
          <h1 className="text-3xl font-bold mt-4">{t.success}</h1>
          <p className="text-lg text-muted-foreground mb-4">{t.message}</p>
          <Button asChild size="lg">
            <Link to="/gallery">
              {t.continue}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
