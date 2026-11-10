import React, { useState, useEffect } from 'react';
import {
  Percent,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  Tag,
  Gift,
} from 'lucide-react';
import {
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
} from '../../services/adminApi';
import { Coupon } from '../../types/admin';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrderAmount, setMinOrderAmount] = useState('5000');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [perCustomerLimit, setPerCustomerLimit] = useState('1');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCoupons = async () => {
    try {
      setIsLoading(true);
      const data = await getAdminCoupons({
        search,
        isActive: filterActive !== 'all' ? filterActive : undefined,
      });
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [search, filterActive]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setCode(`SAVE${Math.floor(10 + Math.random() * 90)}`);
    setDescription('Showroom promotional discount');
    setDiscountType('PERCENTAGE');
    setDiscountValue('10');
    setMinOrderAmount('5000');
    setMaxDiscount('2000');
    setUsageLimit('100');
    setPerCustomerLimit('1');
    setExpiryDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setIsEditing(true);
    setEditingId(c.id);
    setCode(c.code);
    setDescription(c.description);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue.toString());
    setMinOrderAmount(c.minOrderAmount.toString());
    setMaxDiscount(c.maxDiscount ? c.maxDiscount.toString() : '');
    setUsageLimit(c.usageLimit ? c.usageLimit.toString() : '');
    setPerCustomerLimit(c.perCustomerLimit.toString());
    setExpiryDate(c.expiryDate ? c.expiryDate.split('T')[0] : '');
    setIsActive(c.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !description.trim() || !discountValue) return;

    try {
      setIsSaving(true);
      const payload = {
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        perCustomerLimit: parseInt(perCustomerLimit, 10) || 1,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        isActive,
      };

      if (isEditing && editingId) {
        await updateAdminCoupon(editingId, payload);
      } else {
        await createAdminCoupon(payload);
      }

      setIsModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (c: Coupon) => {
    try {
      await updateAdminCoupon(c.id, { isActive: !c.isActive });
      loadCoupons();
    } catch (err: any) {
      alert('Failed to toggle coupon status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await deleteAdminCoupon(deleteTarget.id);
      setDeleteTarget(null);
      loadCoupons();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete coupon');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Coupons & Promotional Campaigns
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure discount vouchers, minimum cart thresholds, and usage caps for customer redemption.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blueHover text-white text-xs font-bold shadow-md shadow-brand-blue/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promotion</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by coupon code or campaign description..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all"
          />
        </div>

        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-medium"
        >
          <option value="all">All Campaign Statuses</option>
          <option value="true">Active Promotions</option>
          <option value="false">Paused / Inactive</option>
        </select>
      </div>

      {/* Coupons Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-blue" />
            Loading campaigns...
          </div>
        ) : coupons.length > 0 ? (
          coupons.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                c.isActive ? 'border-slate-200/80' : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-brand-navy text-cyan-300 font-mono font-black text-sm tracking-wider shadow-sm">
                      {c.code}
                    </span>
                    <StatusBadge status={c.discountType} type="general" />
                  </div>
                  <button
                    onClick={() => handleToggleActive(c)}
                    title={c.isActive ? 'Pause Promotion' : 'Activate Promotion'}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                      c.isActive ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Paused'}
                  </button>
                </div>

                <div className="my-3">
                  <div className="text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.description}</p>
                </div>

                <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Min. Order Threshold:</span>
                    <strong className="text-slate-800">₹{c.minOrderAmount.toLocaleString()}</strong>
                  </div>
                  {c.maxDiscount && (
                    <div className="flex justify-between">
                      <span>Max Discount Cap:</span>
                      <strong className="text-slate-800">₹{c.maxDiscount.toLocaleString()}</strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Redemptions:</span>
                    <strong className="text-slate-800">
                      {c.usageCount} {c.usageLimit ? `/ ${c.usageLimit} max` : 'unlimited'}
                    </strong>
                  </div>
                  {c.expiryDate && (
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <strong className="text-slate-800">{new Date(c.expiryDate).toLocaleDateString()}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                  title="Edit Coupon"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(c)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400">
            No promotional campaigns created yet.
          </div>
        )}
      </div>

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Coupon Parameters' : 'Create New Campaign Coupon'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VOLT10, FESTIVE500"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Campaign Description *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 10% discount on first audio purchase"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none font-semibold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="10"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Min Order Spend (₹)
                  </label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="5000"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Max Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="Optional max cap"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-brand-blue"
                  />
                  <span className="text-xs font-semibold text-slate-700">Campaign is Active for Checkout</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-brand-blueHover rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isEditing ? 'Save Changes' : 'Create Coupon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Delete Coupon"
          message={`Are you sure you want to remove coupon "${deleteTarget.code}"? If customers have redeemed this coupon previously, it will be safely archived to protect sales reporting history.`}
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete Coupon'}
          isDanger={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

