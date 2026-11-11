import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  ArrowRight,
  Boxes,
  DollarSign,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  getAdminReturns,
  updateAdminReturnStatus,
  processAdminRefund,
} from '../../services/adminApi';
import { useToast } from '../../context/ToastContext';

export const AdminReturnsPage: React.FC = () => {
  const { showToast } = useToast();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refundStatusFilter, setRefundStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected for modal
  const [selectedReturn, setSelectedReturn] = useState<any | null>(null);
  const [status, setStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [restockApproved, setRestockApproved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Refund processing modal
  const [refundTarget, setRefundTarget] = useState<any | null>(null);
  const [refundAmount, setRefundAmount] = useState<number | string>(0);
  const [refundNotes, setRefundNotes] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await getAdminReturns({
        status: statusFilter,
        refundStatus: refundStatusFilter,
        search,
      });
      setReturns(res.returns || []);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load returns', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [statusFilter, refundStatusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReturns();
  };

  const handleOpenManage = (ret: any) => {
    setSelectedReturn(ret);
    setStatus(ret.status);
    setRejectionReason(ret.rejectionReason || '');
    setInspectionNotes(ret.inspectionNotes || '');
    setRestockApproved(ret.approvedForRestock || false);
  };

  const handleSaveReturnStatus = async () => {
    if (!selectedReturn) return;
    try {
      setSaving(true);
      await updateAdminReturnStatus(selectedReturn.id, {
        status,
        rejectionReason: status === 'Rejected' ? rejectionReason : undefined,
        inspectionNotes,
        restockApproved,
      });
      showToast('Return request updated successfully', 'success');
      setSelectedReturn(null);
      fetchReturns();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update return', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenRefund = (ret: any) => {
    setRefundTarget(ret);
    setRefundAmount(ret.refundAmount);
    setRefundNotes(`Refund for Return ${ret.returnNumber}`);
  };

  const handleExecuteRefund = async () => {
    if (!refundTarget) return;
    try {
      setProcessingRefund(true);
      await processAdminRefund({
        returnRequestId: refundTarget.id,
        orderId: refundTarget.orderId,
        amount: Number(refundAmount),
        notes: refundNotes,
      });
      showToast('Refund processed successfully', 'success');
      setRefundTarget(null);
      fetchReturns();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to process refund', 'error');
    } finally {
      setProcessingRefund(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <RotateCcw className="w-7 h-7 text-brand-blue" />
          Returns, Inspections & Refunds
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review return requests, verify product inspection, execute Razorpay/COD refunds, and restock inventory safely.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by return #, customer, order..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-blue"
          >
            <option value="ALL">All Return Statuses</option>
            <option value="Requested">Requested</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Inspection">Inspection</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={refundStatusFilter}
            onChange={(e) => setRefundStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-blue"
          >
            <option value="ALL">All Refund Statuses</option>
            <option value="Requested">Refund: Requested</option>
            <option value="Approved">Refund: Approved</option>
            <option value="Processing">Refund: Processing</option>
            <option value="Refunded">Refund: Refunded</option>
            <option value="Rejected">Refund: Rejected</option>
          </select>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="p-4">Return ID / Date</th>
                <th className="p-4">Order Details</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Reason Category</th>
                <th className="p-4">Refund Amount</th>
                <th className="p-4">Status & Restock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading returns...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No return requests found.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{ret.returnNumber}</div>
                      <div className="text-slate-400 text-[11px]">
                        {new Date(ret.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{ret.order?.orderNumber}</div>
                      <div className="text-slate-400 text-[11px]">
                        Method: {ret.order?.paymentMethod}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{ret.customerName}</div>
                      <div className="text-slate-400 text-[11px]">{ret.customerEmail}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                        {ret.reasonCategory.replace('_', ' ')}
                      </span>
                      <div className="text-slate-500 text-[11px] mt-1 line-clamp-1">
                        {ret.reasonDetails}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">
                        ₹{ret.refundAmount.toLocaleString('en-IN')}
                      </div>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ret.refundStatus === 'Refunded'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {ret.refundStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ret.status === 'Completed' || ret.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ret.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ret.status}
                      </span>
                      {ret.approvedForRestock ? (
                        <div className="text-cyan-700 font-semibold text-[10px] mt-1 flex items-center gap-1">
                          <Boxes className="w-3 h-3" /> Restocked
                        </div>
                      ) : null}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenManage(ret)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                      {ret.refundStatus !== 'Refunded' && (
                        <button
                          onClick={() => handleOpenRefund(ret)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect & Update Return Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Inspect Return: {selectedReturn.returnNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  For Order {selectedReturn.order?.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Returned Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Products Requested for Return
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedReturn.items?.map((item: any) => (
                  <div key={item.id} className="p-3 bg-slate-50 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{item.productName}</div>
                      <div className="text-slate-400">SKU: {item.productSku} • Qty: {item.quantity}</div>
                    </div>
                    <div className="font-bold text-slate-900">
                      ₹{item.totalRefund.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Form */}
            <div className="space-y-4 pt-2 border-t">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Return Lifecycle Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-blue font-semibold"
                >
                  <option value="Requested">Requested</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {status === 'Rejected' && (
                <div>
                  <label className="block text-xs font-bold text-rose-700 mb-1">
                    Rejection Reason
                  </label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Physical damage observed, seal broken, or out of policy..."
                    className="w-full text-xs border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:border-rose-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Inspection & Verification Notes
                </label>
                <textarea
                  rows={2}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="Verification checklist: original packaging, accessories present, condition check..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-blue-900">Restock Approved Items into Inventory?</div>
                  <div className="text-[11px] text-blue-700">
                    If checked, will atomically increment stock and record an inventory movement.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={restockApproved}
                  disabled={selectedReturn.approvedForRestock}
                  onChange={(e) => setRestockApproved(e.target.checked)}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedReturn(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReturnStatus}
                  disabled={saving}
                  className="px-5 py-2 bg-brand-blue text-white rounded-xl text-xs font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Return'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Execute Refund Modal */}
      {refundTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Process Order Refund
              </h3>
              <button
                onClick={() => setRefundTarget(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1">
              <div><span className="text-slate-400">Order:</span> <span className="font-semibold">{refundTarget.order?.orderNumber}</span></div>
              <div><span className="text-slate-400">Payment Gateway:</span> <span className="font-semibold">{refundTarget.order?.paymentMethod}</span></div>
              <div><span className="text-slate-400">Customer:</span> <span className="font-semibold">{refundTarget.customerName}</span></div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Refund Reason / Audit Note</label>
                <input
                  type="text"
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-blue"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRefundTarget(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRefund}
                disabled={processingRefund}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {processingRefund ? 'Executing Gateway Refund...' : 'Confirm & Disburse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

