
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EuroIcon, X, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/components/LanguageToggle';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const translations = {
  en: {
    checkout: 'Checkout',
    orderSummary: 'Order Summary',
    shippingInfo: 'Shipping Information',
    fullName: 'Full Name',
    address: 'Address',
    city: 'City',
    postalCode: 'Postal Code',
    country: 'Country',
    phone: 'Phone',
    notes: 'Notes (optional)',
    emptyCart: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    total: 'Total',
    proceedToPayment: 'Proceed to Payment',
    processing: 'Processing...',
    loginRequired: 'Login required',
    pleaseLogin: 'Please log in to proceed with checkout',
    login: 'Log In',
    invalidAddress: 'Please provide a valid address',
    invalidCity: 'Please provide a valid city',
    invalidPostalCode: 'Please provide a valid postal code',
    invalidCountry: 'Please provide a valid country',
    invalidPhone: 'Please provide a valid phone number',
    invalidFullName: 'Please provide your full name'
  },
  bg: {
    checkout: 'Плащане',
    orderSummary: 'Обобщение на поръчката',
    shippingInfo: 'Информация за доставка',
    fullName: 'Име и Фамилия',
    address: 'Адрес',
    city: 'Град',
    postalCode: 'Пощенски код',
    country: 'Държава',
    phone: 'Телефон',
    notes: 'Бележки (незадължително)',
    emptyCart: 'Вашата кошница е празна',
    continueShopping: 'Продължи пазаруването',
    total: 'Общо',
    proceedToPayment: 'Продължи към плащане',
    processing: 'Обработва се...',
    loginRequired: 'Изисква се вход',
    pleaseLogin: 'Моля, влезте за да продължите към плащане',
    login: 'Вход',
    invalidAddress: 'Моля, въведете валиден адрес',
    invalidCity: 'Моля, въведете валиден град',
    invalidPostalCode: 'Моля, въведете валиден пощенски код',
    invalidCountry: 'Моля, въведете валидна държава',
    invalidPhone: 'Моля, въведете валиден телефонен номер',
    invalidFullName: 'Моля, въведете пълното си име'
  }
};

// Form validation schema
const formSchema = z.object({
  fullName: z.string().min(3),
  address: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2),
  phone: z.string().min(5),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const t = translations[language];
  const totalPrice = getTotalPrice();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      phone: '',
      notes: '',
    },
  });

  // Check if user is authenticated, if not redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(t.loginRequired);
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, navigate, t.loginRequired]);

  const onSubmit = async (data: FormValues) => {
    if (items.length === 0) {
      toast.error(language === 'en' ? 'Your cart is empty' : 'Вашата кошница е празна');
      return;
    }

    setIsProcessing(true);

    try {
      // Format items for the order
      const orderItems = items.map(item => ({
        id: item.artwork.id,
        title: item.artwork.title,
        image: item.artwork.image,
        price: item.artwork.price,
        quantity: 1
      }));

      // Create order record in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          items: orderItems,
          shipping_address: data,
          total_amount: totalPrice,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Create checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: { 
          orderId: orderData.id,
          items: orderItems,
          totalAmount: totalPrice
        }
      });

      if (checkoutError) {
        throw checkoutError;
      }

      // Store order ID in session storage (will be used on payment success page)
      sessionStorage.setItem('current_order_id', orderData.id);
      
      // Redirect to Stripe checkout
      window.location.href = checkoutData.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(language === 'en' ? 'Error creating checkout session' : 'Грешка при създаване на плащане');
      setIsProcessing(false);
    }
  };

  // If cart is empty, show empty state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{t.checkout}</h1>
        <div className="bg-background shadow-md rounded-lg p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-lg text-muted-foreground mb-4">{t.emptyCart}</p>
            <Button onClick={() => navigate('/gallery')}>
              {t.continueShopping}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{t.checkout}</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Order items and summary - Takes 1/3 of the screen on desktop */}
        <div className="md:col-span-1">
          <div className="bg-background shadow-md rounded-lg p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">{t.orderSummary}</h2>
            
            <div className="space-y-4 divide-y">
              {items.map((item) => {
                const artwork = item.artwork;
                const title = language === 'en' ? artwork.title : (artwork.title_bg || artwork.title);
                
                return (
                  <div key={artwork.id} className="flex space-x-4 py-4">
                    <div className="w-20 h-20 overflow-hidden rounded-md">
                      <img
                        src={artwork.image}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{title}</h3>
                      <div className="flex items-center mt-1 text-sm">
                        <EuroIcon className="h-3 w-3 mr-1" />
                        <span>{artwork.price?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center font-medium">
              <span>{t.total}</span>
              <div className="flex items-center">
                <EuroIcon className="h-4 w-4 mr-1" />
                <span>{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Shipping information form - Takes 2/3 of the screen on desktop */}
        <div className="md:col-span-2">
          <div className="bg-background shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t.shippingInfo}</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.fullName}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.phone}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.address}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.city}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.postalCode}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.country}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.notes}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.processing}
                    </>
                  ) : (
                    t.proceedToPayment
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
