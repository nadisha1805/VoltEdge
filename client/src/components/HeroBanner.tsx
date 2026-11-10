import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award, ChevronRight } from 'lucide-react';
import { Banner } from '../types';

interface HeroBannerProps {
  banners: Banner[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ banners }) => {
  const activeBanner = banners[0];

  return (
    <section className="relative overflow-hidden bg-brand-navyDark text-white pt-8 pb-16 sm:py-20 lg:py-24">
      {/* Background visual accents */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-blue blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyan-500 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-blue/15 border border-brand-blue/30 px-3.5 py-1.5 rounded-full text-brand-blue text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeBanner?.badge || 'NEXT-GEN ELECTRONICS SHOWROOM 2026'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-['Plus_Jakarta_Sans']">
              Powering Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300">
                Digital World.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Step into VOLTEDGE Electronics — an extraordinary showroom combining premium
              computing, audiophile acoustics, ultra-high-refresh gaming monitors, and intelligent smart living ecosystems.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-blue hover:bg-brand-blueHover text-white text-sm font-bold shadow-lg shadow-brand-blue/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore Showroom Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/shop?specialOffer=true"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <span>View Special Offers</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-left">
              <div>
                <p className="text-xl sm:text-2xl font-black text-white font-['Plus_Jakarta_Sans']">100%</p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Genuine Tech</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-white font-['Plus_Jakarta_Sans']">24h</p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Express Dispatch</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-white font-['Plus_Jakarta_Sans']">4.9 / 5</p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Product Showcase */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/70 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-hidden group">
              {/* Product floating preview */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-full">
                  Showroom Spotlight
                </span>
                <span className="text-xs font-semibold text-slate-400">Flagship Edition</span>
              </div>

              <div className="relative z-10 my-4 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
                  alt="Flagship MacBook Pro M3 Max"
                  className="w-full max-h-56 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="relative z-10 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">MacBook Pro 16" M3 Max</h4>
                    <p className="text-xs text-slate-400">Liquid Retina XDR • 36GB Unified</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 line-through">$3,899</span>
                    <p className="text-sm font-black text-emerald-400">$3,499</p>
                  </div>
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/20 via-transparent to-cyan-500/10 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
