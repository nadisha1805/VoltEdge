import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { useToast } from './ToastContext';
import {
  getServerCart,
  addServerCartItem,
  updateServerCartItem,
  removeServerCartItem,
  clearServerCart,
} from '../services/customerApi';

interface CartContextValue {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  estimatedTax: number;
  estimatedShipping: number;
  grandTotal: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('voltedge_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [serverCartIdMap, setServerCartIdMap] = useState<Record<string, string>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const syncWithServer = async () => {
    try {
      const serverData = await getServerCart();
      if (serverData && serverData.items) {
        const idMap: Record<string, string> = {};
        const formattedCart: CartItem[] = serverData.items.map((item) => {
          idMap[item.productId] = item.id;
          return {
            product: {
              id: item.productId,
              name: item.name,
              slug: item.slug,
              sku: item.sku,
              primaryImage: item.primaryImage,
              images: [item.primaryImage],
              sellingPrice: item.unitPrice,
              originalPrice: item.originalPrice || undefined,
              stockQuantity: item.stockQuantity,
              stockStatus: item.stockStatus as any,
              rating: 4.5,
              reviewCount: 0,
              description: '',
              brandId: '',
              brand: { id: '', name: '', slug: '' },
              categoryId: '',
              category: { id: '', name: '', slug: '' },
              isFeatured: false,
              isBestSeller: false,
              isLatestArrival: false,
              isSpecialOffer: false,
              createdAt: '',
              updatedAt: '',
            },
            quantity: item.quantity,
          };
        });
        setCart(formattedCart);
        setServerCartIdMap(idMap);
        localStorage.setItem('voltedge_cart', JSON.stringify(formattedCart));
      }
    } catch (err) {
      console.warn('Server cart sync unavailable, using local cart state');
    }
  };

  useEffect(() => {
    syncWithServer();
  }, []);

  const addToCart = async (product: Product, quantity = 1) => {
    try {
      setIsLoading(true);
      await addServerCartItem(product.id, quantity);
      await syncWithServer();
      showToast(`Added "${product.name}" to your cart`);
    } catch (err: any) {
      // Fallback local update
      setCart((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity }];
      });
      showToast(err.response?.data?.message || `Added "${product.name}" to cart`);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setIsLoading(true);
      const serverItemId = serverCartIdMap[productId];
      if (serverItemId) {
        await removeServerCartItem(serverItemId);
      }
      await syncWithServer();
      showToast('Item removed from cart', 'info');
    } catch {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      showToast('Item removed from cart', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    try {
      setIsLoading(true);
      const serverItemId = serverCartIdMap[productId];
      if (serverItemId) {
        await updateServerCartItem(serverItemId, quantity);
        await syncWithServer();
      } else {
        setCart((prev) =>
          prev.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        );
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Could not update quantity', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      await clearServerCart();
    } catch {
      // ignore
    } finally {
      setCart([]);
      localStorage.removeItem('voltedge_cart');
    }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.sellingPrice * item.quantity,
    0
  );
  const estimatedTax = Math.round(subtotal * 0.18);
  const estimatedShipping = subtotal >= 50000 || subtotal === 0 ? 0 : 499;
  const grandTotal = subtotal + estimatedTax + estimatedShipping;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: syncWithServer,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        estimatedTax,
        estimatedShipping,
        grandTotal,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
