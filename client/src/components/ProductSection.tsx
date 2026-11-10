import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductSectionProps {
  title: string;
  badge?: string;
  description?: string;
  products: Product[];
  viewMoreLink?: string;
  viewMoreText?: string;
  onQuickView: (product: Product) => void;
  bgColor?: string;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  badge,
  description,
  products,
  viewMoreLink = '/shop',
  viewMoreText = 'View All',
  onQuickView,
  bgColor = 'bg-white',
}) => {
  if (products.length === 0) return null;

  return (
    <section className={`py-14 sm:py-18 ${bgColor} border-t border-slate-200/60`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            {badge && (
              <div className="flex items-center gap-1.5 text-brand-blue text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badge}</span>
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-['Plus_Jakarta_Sans']">
              {title}
            </h2>
            {description && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                {description}
              </p>
            )}
          </div>

          {viewMoreLink && (
            <Link
              to={viewMoreLink}
              className="mt-3 sm:mt-0 text-xs sm:text-sm font-bold text-brand-blue hover:text-brand-blueHover flex items-center gap-1.5 group transition-colors"
            >
              <span>{viewMoreText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

