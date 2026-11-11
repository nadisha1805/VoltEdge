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
  ShieldCheck,
  Scale,
  Package,
  LogOut,
  MapPin,
  Settings,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const { compareCount } = useCompare();
  const { customer, isAuthenticated, logout } = useCustomerAuth();

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
    { name: 'Compare', path: '/compare', isCompare: true },
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Comparison Matrix Link */}
          <Link
            to="/compare"
            className="p-2 sm:px-2.5 sm:py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors relative"
            title="Product Comparison"
          >
            <Scale className="w-5 h-5" />
            {compareCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {compareCount}
              </span>
            )}
          </Link>

          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Customer Account"
              aria-label="Account menu"
            >
              <User className="w-5 h-5 text-cyan-400" />
              <span className="hidden xl:inline text-xs font-medium text-left">
                <span className="block text-slate-400 text-[10px]">
                  {isAuthenticated ? `Hi, ${customer?.firstName}` : 'Sign In'}
                </span>
                <span>{isAuthenticated ? 'My Account' : 'Customer Portal'}</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
            </button>

            {/* Account dropdown */}
            {isAccountOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-elevated p-2 text-sm z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setIsAccountOpen(false)}
              >
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="font-semibold text-white truncate">{customer?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/account"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-cyan-400" /> Account Dashboard
                      </Link>
                      <Link
                        to="/account"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium"
                      >
                        <Package className="w-3.5 h-3.5 text-blue-400" /> My Orders & Invoices
                      </Link>
                      <Link
                        to="/account"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Delivery Addresses
                      </Link>
                      <button
                        onClick={() => {
                          setIsAccountOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-slate-800 text-xs font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2 border-b border-slate-800 text-center">
                      <p className="text-xs text-slate-400 mb-2">Welcome to VOLTEDGE</p>
                      <Link
                        to="/login"
                        onClick={() => setIsAccountOpen(false)}
                        className="block w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl text-xs shadow-md mb-1.5"
                      >
                        Customer Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsAccountOpen(false)}
                        className="text-[11px] text-cyan-400 hover:underline"
                      >
                        Create an account
                      </Link>
                    </div>
                  </>
                )}

                <div className="p-2 border-t border-slate-800 bg-slate-950/50 rounded-xl flex flex-col gap-1 mt-1">
                  <Link
                    to="/admin"
                    onClick={() => setIsAccountOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-brand-blue" />
                    <span>Staff Admin Dashboard</span>
                  </Link>
                  <span className="text-[10px] text-slate-500 px-3">
                    Milestone 2 • Management Console
                  </span>
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

          {/* Shopping Cart Icon (Links to /cart or drawer) */}
          <Link
            to="/cart"
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
          </Link>

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
                        : link.isCompare
                        ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    {link.isSpecial && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                    {link.isCompare && <Scale className="w-3.5 h-3.5 text-cyan-400" />}
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
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-brand-blue"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold"
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
