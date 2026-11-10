import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Clock,
  MapPin,
  Mail,
  Phone,
  DollarSign,
  AlertTriangle,
  Lock,
  Check,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import {
  getShowroomSettings,
  updateShowroomSettings,
  updateAdminPassword,
} from '../../services/adminApi';
import { ShowroomSettings } from '../../types/admin';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAdminAuth();

  const [settings, setSettings] = useState<ShowroomSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form Fields
  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [taxRate, setTaxRate] = useState('18.0');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getShowroomSettings();
      setSettings(data);
      setStoreName(data.storeName);
      setTagline(data.tagline);
      setEmail(data.email);
      setPhone(data.phone);
      setAddress(data.address);
      setBusinessHours(data.businessHours);
      setCurrency(data.currency);
      setCurrencySymbol(data.currencySymbol);
      setLowStockThreshold(data.lowStockThreshold.toString());
      setTaxRate(data.taxRate.toString());
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      const updated = await updateShowroomSettings({
        storeName,
        tagline,
        email,
        phone,
        address,
        businessHours,
        currency,
        currencySymbol,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
        taxRate: parseFloat(taxRate) || 18.0,
      });
      setSettings(updated.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      setIsChangingPassword(true);
      await updateAdminPassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-blue" />
        Loading showroom settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
          Showroom & Operational Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure physical showroom profile, low-stock threshold triggers, tax rules, and staff account security.
        </p>
      </div>

      {/* Showroom Configuration Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2.5">
            <Store className="w-5 h-5 text-brand-blue" />
            <h3 className="text-base font-bold text-slate-900">Showroom Identity & Location</h3>
          </div>
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> Settings Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSettingsSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold uppercase mb-1">
                Storefront Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand-blue outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase mb-1">
                Official Support Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase mb-1">
                Showroom Contact Phone *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold uppercase mb-1">
                Physical Showroom Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold uppercase mb-1">
                Operational Business Hours
              </label>
              <input
                type="text"
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase mb-1">
                Low-Stock Alert Threshold (Units) *
              </label>
              <input
                type="number"
                required
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand-blue outline-none font-bold"
              />
              <span className="text-[10px] text-slate-400">Trigger warnings when on-hand stock ≤ threshold</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase mb-1">
                Standard Goods & Services Tax (%) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand-blue outline-none font-bold"
              />
              <span className="text-[10px] text-slate-400">Default GST percentage applied to invoices</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blueHover shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Save Showroom Configuration</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Update Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-brand-blue" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Staff Credential Security</h3>
              <p className="text-[11px] text-slate-400">Update password for your active session ({user?.email})</p>
            </div>
          </div>
          {passwordSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> Password Updated
            </span>
          )}
        </div>

        {passwordError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="block text-slate-700 font-bold uppercase mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase mb-1">
              New Password (Min 8 characters) *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isChangingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Update My Password</span>
          </button>
        </form>
      </div>
    </div>
  );
};

