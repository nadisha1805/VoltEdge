import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Zap,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Products', path: '/shop' },
    { name: 'Laptops', path: '/shop?category=laptops-computers' },
    { name: 'Smartphones', path: '/shop?category=smartphones-tablets' },
    { name: 'Audio', path: '/shop?category=audio-headphones' },
    { name: 'Gaming', path: '/shop?category=gaming-consoles' },
    { name: 'Smart Home', path: '/shop?category=smart-home' },
    { name: 'Special Offers', path: '/shop?specialOffer=true', isSpecial: true },
  ];

  return (
    <header className="sticky top-0 z-30 bg-brand-navy shadow-md transition-all">
      {/* Main Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-blue/30 group-hover:scale-105 transition-transform duration-200">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                VOLT<span className="text-brand-blue">EDGE</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">
                Showroom
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
              Powering Your Digital World.
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-xl mx-4 relative"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search premium laptops, flagship phones, Hi-Fi audio..."
            className="w-full pl-11 pr-24 py-2.5 rounded-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-blue hover:bg-brand-blueHover text-white px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Action Placeholder Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Account Icon Placeholder */}
          <div className="relative">
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Customer Account"
              aria-label="Account menu"
            >
              <User className="w-5 h-5" />
              <span className="hidden xl:inline text-xs font-medium text-left">
                <span className="block text-slate-400 text-[10px]">Welcome</span>
                <span>My Account</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
            </button>

            {/* Account dropdown */}
            {isAccountOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-elevated p-2 text-sm z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setIsAccountOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs text-slate-400">Account Placeholder</p>
                  <p className="font-semibold text-white">VOLTEDGE Guest</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsAccountOpen(false);
                      navigate('/shop');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium"
                  >
                    Browse Catalog
                  </button>
                  <button
                    onClick={() => {
                      setIsAccountOpen(false);
                      setIsWishlistOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium"
                  >
                    View Saved Wishlist ({wishlistCount})
                  </button>
                  <button
                    onClick={() => {
                      setIsAccountOpen(false);
                      setIsCartOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium"
                  >
                    Shopping Cart ({totalItems})
                  </button>
                </div>
                <div className="p-2 border-t border-slate-800 bg-slate-950/50 rounded-xl text-[11px] text-slate-400">
                  Milestone 1 Preview • Customer Auth module arriving in Milestone 2
                </div>
              </div>
            )}
          </div>

          {/* Wishlist Icon */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors relative"
            title="Saved Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl bg-brand-blue/15 hover:bg-brand-blue/25 border border-brand-blue/30 text-white transition-all relative group"
            title="Shopping Cart"
            aria-label="Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-brand-blue group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-blue text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-200">
              Cart
            </span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Desktop Secondary Navigation Bar */}
      <nav className="hidden md:block bg-brand-navyDark border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-1 lg:gap-2 overflow-x-auto py-2 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/' && !location.search
                  : `${location.pathname}${location.search}` === link.path;

              return (
                <li key={link.name} className="shrink-0">
                  <Link
                    to={link.path}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-brand-blue text-white shadow-sm'
                        : link.isSpecial
                        ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    {link.isSpecial && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-brand-navyDark border-t border-slate-800 p-4 animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-brand-blue"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-blue text-white px-3 py-1 rounded-lg text-xs font-semibold"
            >
              Search
            </button>
          </form>

          {/* Links list */}
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    link.isSpecial
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};
