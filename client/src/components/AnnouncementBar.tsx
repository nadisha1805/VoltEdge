import React, { useState } from 'react';
import { Sparkles, Truck, ShieldCheck, MapPin, X } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-brand-navyDark text-slate-200 border-b border-slate-800 text-xs py-2 px-4 relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Highlight message */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 text-brand-blue font-semibold uppercase tracking-wider bg-brand-blue/10 px-2 py-0.5 rounded-full border border-brand-blue/20">
            <Sparkles className="w-3 h-3" /> Flagship Showroom
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-300">
            <Truck className="w-3.5 h-3.5 text-slate-400" /> Free Express Delivery on orders over $150
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Genuine Manufacturer Warranty
          </span>
        </div>

        {/* Right: Quick Showroom info & close */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-brand-blue" />
            <span>Visit Showroom: 450 Technology Parkway, Suite 100</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss announcement"
            className="text-slate-400 hover:text-white transition-colors p-0.5 rounded hover:bg-slate-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

