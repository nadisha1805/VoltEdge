import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  ArrowRight,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-navyDark text-slate-300 border-t border-slate-800">
      {/* Top Value Propositions */}
      <div className="border-b border-slate-800/80 bg-brand-navy/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-brand-blue" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">White-Glove Express</h4>
                <p className="text-xs text-slate-400">Insured next-day tech delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Genuine Tech</h4>
                <p className="text-xs text-slate-400">Direct authorized partner warranty</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">30-Day Showroom Trial</h4>
                <p className="text-xs text-slate-400">Hassle-free replacement guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Expert Audio & PC Concierge</h4>
                <p className="text-xs text-slate-400">In-house technician support 7 days/wk</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-blue/20">
                <Zap className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <span className="text-2xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  VOLT<span className="text-brand-blue">EDGE</span>
                </span>
                <span className="block text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                  Electronics Showroom
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              VOLTEDGE Electronics is a premier tech showroom and e-commerce destination.
              We curate flagship computing, audiophile gear, pro gaming hardware, and intelligent home ecosystems.
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-blue shrink-0" />
                <span>450 Technology Parkway, Suite 100, Silicon Valley, CA 94025</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-blue shrink-0" />
                <span>+1 (800) 865-8334 (Mon - Sat, 9am - 8pm EST)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-blue shrink-0" />
                <span>concierge@voltedge-electronics.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-blue shrink-0" />
                <span>Showroom Hours: Mon–Sun 10:00 AM – 9:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-sm font-bold text-white tracking-wide uppercase mb-4">
              Explore Showroom
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/shop" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-3.5 h-3.5 text-brand-blue group-hover:translate-x-1 transition-transform" />
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?featured=true" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-3.5 h-3.5 text-brand-blue group-hover:translate-x-1 transition-transform" />
                  Featured Collection
                </Link>
              </li>
              <li>
                <Link to="/shop?bestSeller=true" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-3.5 h-3.5 text-brand-blue group-hover:translate-x-1 transition-transform" />
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/shop?latestArrival=true" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-3.5 h-3.5 text-brand-blue group-hover:translate-x-1 transition-transform" />
                  Latest Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop?specialOffer=true" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-3.5 h-3.5 text-brand-blue group-hover:translate-x-1 transition-transform" />
                  Special Offers & Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-sm font-bold text-white tracking-wide uppercase mb-4">
              Top Categories
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/shop?category=laptops-computers" className="text-slate-400 hover:text-white transition-colors">
                  Laptops & Workstations
                </Link>
              </li>
              <li>
                <Link to="/shop?category=smartphones-tablets" className="text-slate-400 hover:text-white transition-colors">
                  Smartphones & Tablets
                </Link>
              </li>
              <li>
                <Link to="/shop?category=audio-headphones" className="text-slate-400 hover:text-white transition-colors">
                  Audio & Hi-Fi Headphones
                </Link>
              </li>
              <li>
                <Link to="/shop?category=gaming-consoles" className="text-slate-400 hover:text-white transition-colors">
                  Gaming Gear & Consoles
                </Link>
              </li>
              <li>
                <Link to="/shop?category=smartwatches-wearables" className="text-slate-400 hover:text-white transition-colors">
                  Smartwatches & Wearables
                </Link>
              </li>
              <li>
                <Link to="/shop?category=smart-home" className="text-slate-400 hover:text-white transition-colors">
                  Smart Home & OLED Displays
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h5 className="text-sm font-bold text-white tracking-wide uppercase mb-4">
              Customer Support
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Manufacturer Warranty Registration
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Order Tracking (Milestone 2)
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Showroom Walk-in Appointments
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  White-Glove Setup Service
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Corporate & Volume Procurement
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Privacy Policy & Terms
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} VOLTEDGE Electronics Inc. All rights reserved. Milestone 1: Website Design & Technical Foundation.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Security</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Accessibility</span>
            <span>•</span>
            <span className="text-brand-blue font-semibold">Powering Your Digital World.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

