import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from 'lucide-react';
import { getInventoryMovements } from '../../services/adminApi';
import { InventoryMovement } from '../../types/admin';

export const AdminMovementsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialProductId = searchParams.get('productId') || 'all';

  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [movementType, setMovementType] = useState('all');

  const loadMovements = async () => {
    try {
      setIsLoading(true);
      const res = await getInventoryMovements({
        productId: initialProductId !== 'all' ? initialProductId : undefined,
        movementType: movementType !== 'all' ? movementType : undefined,
        search,
        page,
        limit: 15,
      });
      setMovements(res.data);
      setTotalCount(res.pagination.totalCount);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load movements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, [movementType, search, page, initialProductId]);

  const getMovementBadge = (type: string, change: number) => {
    if (type === 'STOCK_IN' || change > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ArrowUpRight className="w-3.5 h-3.5" />
          {type.replace(/_/g, ' ')} (+{change})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <ArrowDownRight className="w-3.5 h-3.5" />
        {type.replace(/_/g, ' ')} ({change})
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Stock Movement Audit Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable transaction records of all inventory receipts, showroom allocations, and count corrections.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/admin/inventory"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Stock Overview</span>
          </Link>
          <button
            onClick={loadMovements}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            placeholder="Search by product name, SKU, reason, or reference #..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all"
          />
        </div>

        <select
          value={movementType}
          onChange={(e) => {
            setMovementType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-medium"
        >
          <option value="all">All Movement Types</option>
          <option value="STOCK_IN">Stock In</option>
          <option value="STOCK_OUT">Stock Out</option>
          <option value="ADJUSTMENT">Adjustment</option>
          <option value="RETURN_RESTOCK">Return Restock</option>
          <option value="CORRECTION">Correction</option>
        </select>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-4">Movement Type & Change</th>
                <th className="py-3 px-4 text-center">Previous</th>
                <th className="py-3 px-4 text-center">New Balance</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Reference #</th>
                <th className="py-3 px-4 text-right">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-blue" />
                    Loading movement records...
                  </td>
                </tr>
              ) : movements.length > 0 ? (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{m.product?.name || 'Catalog Item'}</p>
                        <span className="text-[10px] font-mono text-slate-500">{m.product?.sku}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getMovementBadge(m.movementType, m.quantityChanged)}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-500">
                      {m.previousQuantity}
                    </td>
                    <td className="py-3 px-4 text-center font-black text-slate-900">
                      {m.newQuantity}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={m.reason}>
                      {m.reason}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {m.referenceNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      {m.updatedBy}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No stock movements found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page <strong className="text-slate-800">{page}</strong> of{' '}
            <strong className="text-slate-800">{totalPages}</strong> ({totalCount} recorded movements)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

