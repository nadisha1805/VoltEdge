import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { useToast } from './ToastContext';

interface CompareContextValue {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  compareCount: number;
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('voltedge_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem('voltedge_compare', JSON.stringify(compareList));
  }, [compareList]);

  const isInCompare = (productId: string) => {
    return compareList.some((p) => p.id === productId);
  };

  const addToCompare = (product: Product) => {
    if (isInCompare(product.id)) {
      showToast('Product is already in your comparison list', 'info');
      return;
    }

    if (compareList.length >= 4) {
      showToast('You can compare a maximum of 4 products at once', 'error');
      return;
    }

    // Verify category compatibility if comparison list is not empty
    if (compareList.length > 0) {
      const firstCategory = compareList[0].categoryId;
      if (product.categoryId && firstCategory && product.categoryId !== firstCategory) {
        showToast(
          `Comparison is most useful for products in the same category (${compareList[0].category?.name || 'current'}).`,
          'info'
        );
      }
    }

    setCompareList((prev) => [...prev, product]);
    showToast(`Added "${product.name}" to comparison matrix`);
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
    showToast('Removed product from comparison matrix', 'info');
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        compareCount: compareList.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
};

