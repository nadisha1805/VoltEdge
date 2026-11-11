import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useToast } from './ToastContext';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveWishlistToCart,
} from '../services/customerApi';

interface WishlistContextValue {
  wishlist: Product[];
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
  wishlistCount: number;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('voltedge_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const syncWithServer = async () => {
    const token = localStorage.getItem('volt_customer_token');
    if (!token) return;
    try {
      const res = await getWishlist();
      if (res && res.items) {
        const prods = res.items.map((i) => i.product);
        setWishlist(prods);
        localStorage.setItem('voltedge_wishlist', JSON.stringify(prods));
      }
    } catch {
      // fallback to local state
    }
  };

  useEffect(() => {
    syncWithServer();
  }, []);

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = async (product: Product) => {
    const token = localStorage.getItem('volt_customer_token');
    const inList = isInWishlist(product.id);

    if (inList) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      showToast(`Removed "${product.name}" from wishlist`, 'info');
      if (token) {
        try {
          await removeFromWishlist(product.id);
        } catch {
          // ignore
        }
      }
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast(`Saved "${product.name}" to your wishlist`);
      if (token) {
        try {
          await addToWishlist(product.id);
        } catch {
          // ignore
        }
      }
    }
  };

  const moveToCart = async (productId: string) => {
    try {
      setIsLoading(true);
      await moveWishlistToCart(productId);
      setWishlist((prev) => prev.filter((i) => i.id !== productId));
      showToast('Moved product to cart successfully!');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Could not move to cart', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        moveToCart,
        refreshWishlist: syncWithServer,
        wishlistCount: wishlist.length,
        isWishlistOpen,
        setIsWishlistOpen,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
