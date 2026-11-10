import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Zap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both staff email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Authentication failed. Please verify your staff credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickDemo = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1726] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-800">
        {/* Left Side: Brand Showcase (Deep Navy) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#10243A] to-[#0B1726] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Glows */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-brand-blue/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-blue/30">
                <Zap className="w-7 h-7 text-white fill-white" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  VOLT<span className="text-brand-blue">EDGE</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-cyan-400">
                  Electronics Showroom
                </span>
              </div>
            </div>

            <div className="mt-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-brand-blue/20 text-cyan-300 border border-brand-blue/40 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Staff Management Portal
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 leading-tight font-['Plus_Jakarta_Sans']">
                Powering Your Showroom Operations.
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                Centralized showroom control: inventory synchronization, product catalog management, order processing, and real-time business telemetry.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Milestone 2 • Showroom Security</span>
            <a href="/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
              Storefront <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Sign In to Management Console
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your authorized staff credentials to continue
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@voltedge.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="text-xs text-brand-blue hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-brand-blue hover:bg-brand-blueHover text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-brand-blue/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Admin Console</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Reviewers */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Quick Role Switch (Demo Credentials)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => fillQuickDemo('admin@voltedge.com', 'AdminPassword@123')}
                className="p-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-left transition-colors"
              >
                <div className="text-[10px] font-extrabold text-purple-700">SUPER ADMIN</div>
                <div className="text-[9px] text-slate-500 truncate">Vikram Malhotra</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('manager@voltedge.com', 'ManagerPassword@123')}
                className="p-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-left transition-colors"
              >
                <div className="text-[10px] font-extrabold text-blue-700">ADMIN / MGR</div>
                <div className="text-[9px] text-slate-500 truncate">Priya Sharma</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('inventory@voltedge.com', 'InventoryPassword@123')}
                className="p-2 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-left transition-colors"
              >
                <div className="text-[10px] font-extrabold text-amber-700">INVENTORY MGR</div>
                <div className="text-[9px] text-slate-500 truncate">Rahul Verma</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('sales@voltedge.com', 'SalesPassword@123')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
              >
                <div className="text-[10px] font-extrabold text-slate-700">SALES STAFF</div>
                <div className="text-[9px] text-slate-500 truncate">Ananya Patel</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal Foundation */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Credential Reset Notice</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              For showroom security, staff passwords must be reset directly by a <strong>Super Admin</strong> via the Staff Management module or authorized terminal CLI.
            </p>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 text-left">
              Contact: <strong>admin@voltedge.com</strong>
            </div>
            <button
              onClick={() => setShowResetModal(false)}
              className="mt-5 w-full py-2.5 bg-brand-blue text-white text-xs font-semibold rounded-xl hover:bg-brand-blueHover transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

