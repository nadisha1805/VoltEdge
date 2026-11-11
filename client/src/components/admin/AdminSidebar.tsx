import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Boxes,
  ArrowLeftRight,
  ShoppingBag,
  Users,
  Percent,
  ShieldCheck,
  MessageSquare,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Award,
  Wrench,
  RotateCcw,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminRole } from '../../types/admin';

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: AdminRole[];
  badge?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { user, logout, hasRole } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Brands', path: '/admin/brands', icon: Tag },
    { name: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { name: 'Stock Movements', path: '/admin/inventory/movements', icon: ArrowLeftRight },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Returns & Refunds', path: '/admin/returns', icon: RotateCcw },
    { name: 'Warranty Claims', path: '/admin/warranty', icon: Award },
    { name: 'Service & Repairs', path: '/admin/service', icon: Wrench },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Coupons & Promos', path: '/admin/coupons', icon: Percent },
    { name: 'Staff Management', path: '/admin/staff', icon: ShieldCheck, roles: ['SUPER_ADMIN'] },
    { name: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { name: 'Newsletter', path: '/admin/newsletter', icon: Mail },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
  ];

  const visibleItems = navItems.filter((item) => !item.roles || hasRole(item.roles));

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0B1726] border-r border-[#1E293B] text-slate-300 transition-all duration-300 flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Header Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#1E293B]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-brand-blue/20">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-lg font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  VOLT<span className="text-brand-blue">EDGE</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase text-cyan-400 font-bold">
                  Management Console
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Card when expanded */}
        {!isCollapsed && user && (
          <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-[#10243A]/60 border border-[#1E293B]/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-blue to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
              {user.fullName.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{user.fullName}</span>
              <span className="text-[10px] text-cyan-400 font-medium truncate uppercase tracking-wider">
                {user.role.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className={`w-5 h-5 shrink-0 transition-colors ${isCollapsed ? 'mx-auto' : ''}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50 border border-slate-700">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[#1E293B] space-y-1">
          {/* View Showroom Link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={isCollapsed ? 'View Showroom' : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <ExternalLink className={`w-5 h-5 shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
            {!isCollapsed && <span>View Showroom</span>}
          </a>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className={`w-5 h-5 shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

