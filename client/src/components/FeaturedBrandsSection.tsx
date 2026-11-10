import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';
import { Brand } from '../types';

interface FeaturedBrandsProps {
  brands: Brand[];
}

export const FeaturedBrandsSection: React.FC<FeaturedBrandsProps> = ({ brands }) => {
  return (
    <section className="py-14 bg-white border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-brand-blue text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Official Showroom Partners</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-['Plus_Jakarta_Sans']">
              Featured Brands
            </h2>
          </div>
          <Link
            to="/shop"
            className="mt-3 sm:mt-0 text-xs sm:text-sm font-bold text-brand-blue hover:text-brand-blueHover flex items-center gap-1.5 group transition-colors"
          >
            <span>View All Partner Brands</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Brands logos/cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/shop?brand=${brand.slug}`}
              className="group bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-brand-blue/40 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col items-center justify-center text-center h-28"
            >
              <span className="text-sm font-extrabold text-slate-800 group-hover:text-brand-blue transition-colors font-['Plus_Jakarta_Sans']">
                {brand.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                Authorized
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
