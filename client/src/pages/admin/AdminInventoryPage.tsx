import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Plus,
  Minus,
  Search,
  Filter,
  AlertTriangle,
  ArrowLeftRight,
  TrendingUp,
  RefreshCw,
  Calculator,
  Loader2,
  X,
  CheckCircle,
  FileText,
} from 'lucide-react';
import {
  getInventoryOverview,
  getInventoryList,
  adjustStock,
  getAdminCategories,
} from '../../services/adminApi';
import { InventoryOverview } from '../../types/admin';
import { StatCard } from '../../components/admin/StatCard';
import { StatusBadge } from '../../components/admin/StatusBadge';

export const AdminInventoryPage: React.FC = () => {
  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [stockStatus, setStockStatus] = useState('all');
  const [category, setCategory] = useState('all');

  // Stock Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<string>('STOCK_IN');
  const [quantityInput, setQuantityInput] = useState<string>('5');
  const [reasonInput, setReasonInput] = useState<string>('');
  const [refNumberInput, setRefNumberInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ovData, listData, catData] = await Promise.all([
        getInventoryOverview(),
        getInventoryList({
          search,
          stockStatus,
          category,
          page,
          limit: 10,
        }),
        getAdminCategories(),
      ]);
      setOverview(ovData);
      setItems(listData.data);
      setTotalCount(listData.pagination.totalCount);
      setTotalPages(listData.pagination.totalPages);
      setCategories(catData);
    } catch (err) {
      console.error('Error loading inventory data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, stockStatus, category, page]);

  const handleOpenAdjust = (product: any, defaultType: string = 'STOCK_IN') => {
    setSelectedProduct(product);
    setAdjustmentType(defaultType);
    setQuantityInput('5');
    setReasonInput(defaultType === 'STOCK_IN' ? 'Warehouse restock shipment receipt' : 'Showroom demo unit allocation');
    setRefNumberInput(`ADJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = parseInt(quantityInput, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid positive quantity to adjust.');
      return;
    }

    if (!reasonInput.trim()) {
      alert('A valid operational reason is required for inventory audit tracking.');
      return;
    }

    // If movement is STOCK_OUT, pass negative quantity
    const quantityChanged = adjustmentType === 'STOCK_OUT' ? -qty : qty;

    try {
      setIsSubmitting(true);
      await adjustStock({
        productId: selectedProduct.id,
        quantityChanged,
        movementType: adjustmentType,
        reason: reasonInput.trim(),
        referenceNumber: refNumberInput.trim() || undefined,
      });

      setSelectedProduct(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Inventory & Stock Control
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time warehouse tracking, FIFO/Standard-cost stock valuation, and transactional audit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/admin/inventory/movements"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Movement Ledger</span>
          </Link>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Refresh Stock Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Valuation & Stock Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Stock Units"
          value={overview?.totalStockUnits ?? 0}
          icon={Boxes}
          color="blue"
          subtext="On-hand physically verified units"
        />
        <StatCard
          title="In Stock Models"
          value={overview?.inStockProducts ?? 0}
          icon={CheckCircle}
          color="emerald"
          subtext="Healthy stock levels (> 5 units)"
        />
        <StatCard
          title="Low Stock Warning"
          value={overview?.lowStockProducts ?? 0}
          icon={AlertTriangle}
          color="amber"
          subtext="Requires supplier replenishment (≤ 5)"
        />
        <StatCard
          title="Out of Stock"
          value={overview?.outOfStockProducts ?? 0}
          icon={AlertTriangle}
          color="rose"
          subtext="Zero availability items"
        />
      </div>

      {/* Inventory Valuation Transparency Callout */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-cyan-400/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Calculator className="w-4 h-4" />
              <span>Accounting Standard Inventory Valuation</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-['Plus_Jakarta_Sans']">
              ₹{(overview?.inventoryCostValuation ?? 0).toLocaleString()}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Calculated using the <strong>Standard Cost Basis Method</strong> [Σ(Unit Purchase Cost × On-Hand Units)]. Potential showroom retail value: <strong>₹{(overview?.inventoryRetailValuation ?? 0).toLocaleString()}</strong>.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right shrink-0">
            <span className="text-[10px] text-slate-300 uppercase tracking-widest block font-bold">
              Potential Margin Spread
            </span>
            <span className="text-lg font-black text-cyan-300 font-mono">
              ₹{((overview?.inventoryRetailValuation ?? 0) - (overview?.inventoryCostValuation ?? 0)).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search inventory by title or SKU..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all"
          />
        </div>

        <select
          value={stockStatus}
          onChange={(e) => {
            setStockStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-medium"
        >
          <option value="all">All Inventory Health</option>
          <option value="IN_STOCK">In Stock (&gt; 5)</option>
          <option value="LOW_STOCK">Low Stock Alert (1 - 5)</option>
          <option value="OUT_OF_STOCK">Out of Stock (0)</option>
        </select>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-medium"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Product / Model</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Retail Price</th>
                <th className="py-3 px-4">On-Hand Stock</th>
                <th className="py-3 px-4">Valuation</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4 text-right">Quick Stock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-blue" />
                    Calculating inventory metrics...
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.primaryImage}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-slate-900 truncate" title={item.name}>
                            {item.name}
                          </p>
                          <span className="text-[10px] text-slate-400">{item.brand?.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600">{item.sku}</td>
                    <td className="py-3 px-4 font-medium">{item.category?.name}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      ₹{item.costPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      ₹{item.sellingPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-black text-sm text-slate-900">{item.stockQuantity}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-blue">
                      ₹{Math.round(item.inventoryValuation).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.stockStatus} type="stock" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAdjust(item, 'STOCK_IN')}
                          title="Restock (Stock In)"
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 transition-colors border border-emerald-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>In</span>
                        </button>
                        <button
                          onClick={() => handleOpenAdjust(item, 'STOCK_OUT')}
                          disabled={item.stockQuantity <= 0}
                          title="Reduce (Stock Out)"
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition-colors border border-rose-200 disabled:opacity-40"
                        >
                          <Minus className="w-3.5 h-3.5" />
                          <span>Out</span>
                        </button>
                        <Link
                          to={`/admin/inventory/movements?productId=${item.id}`}
                          title="View Movement Ledger"
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No inventory records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page <strong className="text-slate-800">{page}</strong> of{' '}
            <strong className="text-slate-800">{totalPages}</strong> ({totalCount} items)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Stock Adjustment Dialog */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Stock Adjustment</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">{selectedProduct.sku}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Product</span>
                  <span className="font-bold text-slate-800 line-clamp-1">{selectedProduct.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-slate-500 block">Current Stock</span>
                  <span className="font-black text-sm text-slate-900">{selectedProduct.stockQuantity} units</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Movement Type *
                </label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none font-semibold"
                >
                  <option value="STOCK_IN">Stock In (Receipt from Supplier / Distributor)</option>
                  <option value="STOCK_OUT">Stock Out (Allocation / Showroom Trial / Damage)</option>
                  <option value="ADJUSTMENT">Stock Adjustment (Audit Reconciliation)</option>
                  <option value="RETURN_RESTOCK">Return Restock (Customer Inspection Return)</option>
                  <option value="CORRECTION">Correction (Inventory Count Fix)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Quantity to {adjustmentType === 'STOCK_OUT' ? 'Deduct' : 'Add'} *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Operational Reason / Note *
                </label>
                <input
                  type="text"
                  required
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="e.g. Distributor shipment received in good condition"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reference # (PO / Invoice / Ticket)
                </label>
                <input
                  type="text"
                  value={refNumberInput}
                  onChange={(e) => setRefNumberInput(e.target.value)}
                  placeholder="PO-2026-8819"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-brand-blueHover rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Commit Transaction</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

