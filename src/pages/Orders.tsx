
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/components/LanguageToggle';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, EuroIcon } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface OrderItem {
  id: number;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  items: OrderItem[];
  shipping_address: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    notes?: string;
  };
  total_amount: number;
}

const translations = {
  en: {
    myOrders: 'My Orders',
    noOrders: 'You have no orders yet',
    startShopping: 'Start Shopping',
    order: 'Order',
    status: 'Status',
    date: 'Date',
    items: 'Items',
    loginRequired: 'Login required to view orders',
    pleaseLogin: 'Please log in to view your order history',
    login: 'Log In',
    shipping: 'Shipping Information',
    total: 'Total',
    backToOrders: 'Back to Orders',
    viewAll: 'View All Artworks'
  },
  bg: {
    myOrders: 'Моите Поръчки',
    noOrders: 'Все още нямате поръчки',
    startShopping: 'Започнете Пазаруване',
    order: 'Поръчка',
    status: 'Статус',
    date: 'Дата',
    items: 'Артикули',
    loginRequired: 'Изисква се вход за преглед на поръчки',
    pleaseLogin: 'Моля, влезте за да видите историята на вашите поръчки',
    login: 'Вход',
    shipping: 'Информация за доставка',
    total: 'Общо',
    backToOrders: 'Обратно към поръчки',
    viewAll: 'Преглед на всички произведения'
  }
};

// Helper function to format date
const formatDate = (dateString: string, language: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'bg-BG', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Helper function to translate status
const translateStatus = (status: string, language: string) => {
  const statusTranslations = {
    pending: language === 'en' ? 'Pending' : 'В процес',
    completed: language === 'en' ? 'Completed' : 'Завършена',
    cancelled: language === 'en' ? 'Cancelled' : 'Отказана',
  };
  
  return statusTranslations[status as keyof typeof statusTranslations] || status;
};

const Orders = () => {
  const { isAuthenticated, user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const t = translations[language];

  useEffect(() => {
    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
      toast.error(t.loginRequired);
      navigate('/login', { state: { from: '/orders' } });
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error(language === 'en' ? 'Failed to load orders' : 'Грешка при зареждане на поръчки');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, language, navigate, t.loginRequired]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{t.loginRequired}</h1>
        <div className="bg-background shadow-md rounded-lg p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-lg text-muted-foreground mb-4">{t.pleaseLogin}</p>
            <Button asChild>
              <Link to="/login" state={{ from: '/orders' }}>
                {t.login}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{t.myOrders}</h1>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Display order details if an order is selected
  if (selectedOrder) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t.order} #{selectedOrder.id}</h1>
          <Button variant="outline" onClick={() => setSelectedOrder(null)}>
            {t.backToOrders}
          </Button>
        </div>
        
        <div className="grid gap-6">
          {/* Order status and date */}
          <div className="bg-background shadow-md rounded-lg p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t.status}</p>
                <p className="font-medium">
                  {translateStatus(selectedOrder.status, language)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.date}</p>
                <p className="font-medium">
                  {formatDate(selectedOrder.created_at, language)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Ordered items */}
          <div className="bg-background shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t.items}</h2>
            <div className="space-y-4 divide-y">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex space-x-4 py-4">
                  <div className="w-24 h-24 overflow-hidden rounded-md">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.title}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center text-muted-foreground">
                        <EuroIcon className="h-3 w-3 mr-1" />
                        {item.price?.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-muted-foreground">{t.total}</p>
                <div className="flex items-center text-xl font-bold">
                  <EuroIcon className="h-4 w-4 mr-1" />
                  {selectedOrder.total_amount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Shipping information */}
          <div className="bg-background shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t.shipping}</h2>
            <div className="grid gap-2">
              <p><span className="font-medium">{selectedOrder.shipping_address.fullName}</span></p>
              <p>{selectedOrder.shipping_address.address}</p>
              <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.postalCode}</p>
              <p>{selectedOrder.shipping_address.country}</p>
              <p>{selectedOrder.shipping_address.phone}</p>
              {selectedOrder.shipping_address.notes && (
                <p className="text-muted-foreground mt-2 italic">{selectedOrder.shipping_address.notes}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{t.myOrders}</h1>
        <div className="bg-background shadow-md rounded-lg p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-lg text-muted-foreground mb-4">{t.noOrders}</p>
            <Button asChild>
              <Link to="/gallery">
                {t.startShopping}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{t.myOrders}</h1>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className="bg-background shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedOrder(order)}
          >
            <div className="flex flex-wrap justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.order}</p>
                <p className="font-medium">#{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.date}</p>
                <p className="font-medium">
                  {formatDate(order.created_at, language)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.status}</p>
                <p className="font-medium">
                  {translateStatus(order.status, language)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.total}</p>
                <div className="flex items-center font-medium">
                  <EuroIcon className="h-3 w-3 mr-1" />
                  {order.total_amount.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {order.items.slice(0, 3).map((item) => (
                <div key={item.id} className="w-12 h-12 overflow-hidden rounded-md">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-sm font-medium">
                  +{order.items.length - 3}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
