import React from 'react';
import { Link } from 'react-router-dom';
import {
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  Gamepad2,
  Home,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { Category } from '../types';

interface CategorySectionProps {
  categories: Category[];
}

export const CategorySection: React.FC<CategorySectionProps> = ({ categories }) => {
  const getIcon = (slug: string) => {
    switch (slug) {
      case 'laptops-computers':
        return <Laptop className="w-6 h-6" />;
      case 'smartphones-tablets':
        return <Smartphone className="w-6 h-6" />;
      case 'audio-headphones':
        return <Headphones className="w-6 h-6" />;
      case 'smartwatches-wearables':
        return <Watch className="w-6 h-6" />;
      case 'gaming-consoles':
        return <Gamepad2 className="w-6 h-6" />;
      case 'smart-home':
        return <Home className="w-6 h-6" />;
      default:
        return <Layers className="w-6 h-6" />;
    }
  };

  return (
    <section className="py-16 bg-[#F7F9FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-brand-blue text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-6 h-0.5 bg-brand-blue rounded-full"></span>
              <span>Curated Showroom Departments</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-['Plus_Jakarta_Sans']">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="mt-3 sm:mt-0 text-xs sm:text-sm font-bold text-brand-blue hover:text-brand-blueHover flex items-center gap-1.5 group transition-colors"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-brand-blue/40 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1"
            >
              {/* Category Icon Badge */}
              <div className="w-14 h-14 rounded-2xl bg-brand-blueLight text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-300 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110">
                {getIcon(cat.slug)}
              </div>

              {/* Title */}
              <h3 className="font-bold text-brand-navy group-hover:text-brand-blue text-sm transition-colors mb-1 line-clamp-1">
                {cat.name}
              </h3>

              {/* Product count */}
              <span className="text-[11px] font-medium text-slate-400">
                {cat.productCount ? `${cat.productCount} Products` : 'Explore Devices'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

