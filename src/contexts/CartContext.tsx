
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Artwork } from '@/types/artwork';
import { toast } from '@/components/ui/sonner';
import { useLanguage } from '@/components/LanguageToggle';

interface CartItem {
  artwork: Artwork;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (artwork: Artwork) => void;
  removeFromCart: (artworkId: number) => void;
  clearCart: () => void;
  updateQuantity: (artworkId: number, quantity: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (artworkId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('art-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse saved cart:', error);
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('art-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (artwork: Artwork) => {
    setItems(prevItems => {
      // Check if the artwork is already in the cart
      const existingItem = prevItems.find(item => item.artwork.id === artwork.id);
      
      if (existingItem) {
        // Show toast that the item is already in cart
        toast.info(language === 'en' 
          ? 'This artwork is already in your cart' 
          : 'Тази творба вече е в кошницата ви');
        return prevItems;
      } else {
        // Add new item to cart
        toast.success(language === 'en' 
          ? 'Added to cart' 
          : 'Добавено в кошницата');
        return [...prevItems, { artwork, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (artworkId: number) => {
    setItems(prevItems => prevItems.filter(item => item.artwork.id !== artworkId));
    toast.info(language === 'en' 
      ? 'Removed from cart' 
      : 'Премахнато от кошницата');
  };

  const clearCart = () => {
    setItems([]);
    toast.info(language === 'en' 
      ? 'Cart cleared' 
      : 'Кошницата е изчистена');
  };

  const updateQuantity = (artworkId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(artworkId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.artwork.id === artworkId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.artwork.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const isInCart = (artworkId: number) => {
    return items.some(item => item.artwork.id === artworkId);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      clearCart,
      updateQuantity,
      getTotalItems,
      getTotalPrice,
      isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
