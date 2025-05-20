
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trash2, EuroIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

const translations = {
  en: {
    checkout: 'Checkout',
    summary: 'Order Summary',
    shippingInfo: 'Shipping Information',
    addressRequired: 'Address is required',
    total: 'Total',
    continueToPayment: 'Continue to Payment',
    continueShopping: 'Continue Shopping',
    empty: 'Your cart is empty',
    noItems: 'No items in your cart',
    remove: 'Remove',
    processingPayment: 'Processing payment...',
    fullName: 'Full Name',
    address: 'Address',
    city: 'City',
    postalCode: 'Postal Code',
    country: 'Country',
    phone: 'Phone Number',
    notes: 'Order Notes (optional)',
    loginRequired: 'Login required to checkout',
    pleaseLogin: 'Please log in to continue with your purchase',
    login: 'Log In',
    nameRequired: 'Name is required',
    cityRequired: 'City is required',
    postalCodeRequired: 'Postal code is required',
    countryRequired: 'Country is required',
    phoneRequired: 'Phone number is required'
  },
  bg: {
    checkout: 'Плащане',
    summary: 'Резюме на поръчката',
    shippingInfo: 'Информация за доставка',
    addressRequired: 'Адресът е задължителен',
    total: 'Общо',
    continueToPayment: 'Продължи към плащане',
    continueShopping: 'Продължи пазаруването',
    empty: 'Вашата кошница е празна',
    noItems: 'Нямате артикули в кошницата',
    remove: 'Премахни',
    processingPayment: 'Обработка на плащането...',
    fullName: 'Име и фамилия',
    address: 'Адрес',
    city: 'Град',
    postalCode: 'Пощенски код',
    country: 'Държава',
    phone: 'Телефонен номер',
    notes: 'Бележки към поръчката (по избор)',
    loginRequired: 'Изисква се вход',
    pleaseLogin: 'Моля, влезте за да продължите с покупката',
    login: 'Вход',
    nameRequired: 'Името е задължително',
    cityRequired: 'Градът е задължителен',
    postalCodeRequired: 'Пощенският код е задължителен',
    countryRequired: 'Държавата е задължителна',
    phoneRequired: 'Телефонният номер е задължителен'
  }
};

const addressFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Name is required' }),
  address: z.string().min(5, { message: 'Address is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  postalCode: z.string().min(3, { message: 'Postal code is required' }),
  country: z.string().min(2, { message: 'Country is required' }),
  phone: z.string().min(6, { message: 'Phone number is required' }),
  notes: z.string().optional()
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

const Checkout = () => {
  const { items, removeFromCart, getTotalPrice } = useCart();
  const { language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];
  const totalPrice = getTotalPrice();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      phone: '',
      notes: ''
    }
  });

  useEffect(() => {
    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
      toast.error(t.loginRequired);
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, navigate, t.loginRequired]);

  const handleCheckout = async (formData: AddressFormValues) => {
    try {
      setIsProcessing(true);
      
      // Create a checkout session with shipping address
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          items: items.map(item => ({
            id: item.artwork.id,
            title: item.artwork.title,
            price: item.artwork.price,
            image: item.artwork.image,
            quantity: item.quantity
          })),
          shippingAddress: {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
            notes: formData.notes || ''
          }
        }
      });
      
      if (error) {
        if (error.message.includes('Authentication required')) {
          toast.error(t.loginRequired);
          navigate('/login', { state: { from: '/checkout' } });
          return;
        }
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

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{t.loginRequired}</h1>
        <div className="bg-background shadow-md rounded-lg p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-lg text-muted-foreground mb-4">{t.pleaseLogin}</p>
            <Button asChild>
              <Link to="/login" state={{ from: '/checkout' }}>
                {t.login}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">{t.checkout}</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCheckout)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order items */}
            <div className="lg:col-span-2">
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
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-background shadow-md rounded-lg p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">{t.shippingInfo}</h2>
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
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>{t.address}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>{t.notes}</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
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
                    type="submit"
                    disabled={isProcessing || !isAuthenticated}
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
        </form>
      </Form>
    </div>
  );
};

export default Checkout;
