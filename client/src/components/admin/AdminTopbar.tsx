import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Shield,
  ChevronDown,
  AlertTriangle,
  ExternalLink,
  Settings,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface AdminTopbarProps {
  onMobileMenuToggle: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard Overview';
    if (path.startsWith('/admin/products')) return 'Product Catalog';
    if (path.startsWith('/admin/categories')) return 'Category Management';
    if (path.startsWith('/admin/brands')) return 'Brand Management';
    if (path.startsWith('/admin/inventory/movements')) return 'Stock Movement Ledger';
    if (path.startsWith('/admin/inventory')) return 'Inventory & Stock Control';
    if (path.startsWith('/admin/orders')) return 'Order Management Foundation';
    if (path.startsWith('/admin/customers')) return 'Customer Directory';
    if (path.startsWith('/admin/coupons')) return 'Coupons & Promotions';
    if (path.startsWith('/admin/staff')) return 'Staff & Access Control';
    if (path.startsWith('/admin/enquiries')) return 'Customer Enquiries';
    if (path.startsWith('/admin/newsletter')) return 'Newsletter Subscribers';
    if (path.startsWith('/admin/reports')) return 'Business Reports & Analytics';
    if (path.startsWith('/admin/settings')) return 'Showroom Settings';
    return 'Admin Console';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <Link to="/admin" className="hover:text-brand-blue">Console</Link>
            <span>/</span>
            <span className="text-slate-600 capitalize">{getPageTitle()}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog or SKU..."
            className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 border border-transparent focus:border-brand-blue focus:bg-white focus:outline-none transition-all w-52 lg:w-64"
          />
        </form>

        {/* View Storefront Pill */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-blue bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsProfileOpen(false);
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-blue ring-2 ring-white animate-pulse" />
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Showroom Alerts</span>
                <span className="text-[10px] text-brand-blue font-semibold">Realtime</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 transition-colors flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800">Inventory Notice</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Dell XPS 16 stock level is currently at 4 units.</p>
                  </div>
                </div>
                <div className="p-3 hover:bg-slate-50 transition-colors flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800">Security Audit</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Role-based permission check active and verified.</p>
                  </div>
                </div>
              </div>
              <div className="px-4 pt-2 border-t border-slate-100 text-center">
                <Link
                  to="/admin/inventory"
                  onClick={() => setIsNotificationOpen(false)}
                  className="text-xs text-brand-blue font-semibold hover:underline"
                >
                  View Inventory Health
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationOpen(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {user?.fullName || 'Staff Member'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                {user?.role?.replace(/_/g, ' ') || 'Admin'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-brand-blue border border-blue-200 uppercase">
                  {user?.role?.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Showroom Settings
                </Link>
                <Link
                  to="/admin/staff"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Staff Management
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

