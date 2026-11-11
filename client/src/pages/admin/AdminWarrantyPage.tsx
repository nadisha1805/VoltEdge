import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Clock,
  Wrench,
  FileText,
  Calendar,
  User,
  Package,
} from 'lucide-react';
import { getAdminWarrantyClaims, updateAdminWarrantyClaim } from '../../services/adminApi';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useToast } from '../../context/ToastContext';

export const AdminWarrantyPage: React.FC = () => {
  const { showToast } = useToast();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await getAdminWarrantyClaims({ status: statusFilter, search });
      setClaims(res.claims || []);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load warranty claims', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClaims();
  };

  const handleOpenModal = (claim: any) => {
    setSelectedClaim(claim);
    setUpdateStatus(claim.status);
    setAdminNotes(claim.adminNotes || '');
    setRejectionReason(claim.rejectionReason || '');
  };

  const handleSaveClaim = async () => {
    if (!selectedClaim) return;
    try {
      setSaving(true);
      await updateAdminWarrantyClaim(selectedClaim.id, {
        status: updateStatus,
        adminNotes,
        rejectionReason: updateStatus === 'Rejected' ? rejectionReason : undefined,
      });
      showToast('Warranty claim updated successfully', 'success');
      setSelectedClaim(null);
      fetchClaims();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update warranty claim', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-7 h-7 text-brand-blue" />
            Warranty Claims Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, verify, and resolve customer warranty claims for purchased electronics.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-96">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by claim #, customer, serial or product..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-blue"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Additional Information Required">Info Required</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="In Service">In Service</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="p-4">Claim # / Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product & Serial</th>
                <th className="p-4">Issue Category</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Loading claims...
                  </td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No warranty claims found.
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{claim.claimNumber}</div>
                      <div className="text-slate-400 text-[11px]">
                        {new Date(claim.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{claim.customerName}</div>
                      <div className="text-slate-500 text-[11px]">{claim.customerEmail}</div>
                      {claim.customerPhone && (
                        <div className="text-slate-400 text-[11px]">{claim.customerPhone}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 line-clamp-1">
                        {claim.product?.name}
                      </div>
                      <div className="text-slate-400 text-[11px]">SKU: {claim.product?.sku}</div>
                      {claim.serialNumber && (
                        <div className="text-cyan-700 text-[11px] font-mono">
                          SN: {claim.serialNumber}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                        {claim.issueCategory}
                      </span>
                      <div className="text-slate-500 text-[11px] mt-1 line-clamp-1">
                        {claim.issueDescription}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          claim.status === 'Approved' || claim.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : claim.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : claim.status === 'In Service'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenModal(claim)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Manage Claim: {selectedClaim.claimNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Submitted on {new Date(selectedClaim.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Claim Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Customer</span>
                <span className="font-semibold text-slate-800">{selectedClaim.customerName}</span>
                <div className="text-slate-500">{selectedClaim.customerEmail}</div>
                <div className="text-slate-500">{selectedClaim.customerPhone || 'No Phone'}</div>
              </div>
              <div>
                <span className="text-slate-400 block">Product</span>
                <span className="font-semibold text-slate-800">{selectedClaim.product?.name}</span>
                <div className="text-slate-500">SKU: {selectedClaim.product?.sku}</div>
                <div className="text-cyan-700 font-mono">
                  Serial: {selectedClaim.serialNumber || 'N/A'}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Issue Description</span>
                <p className="text-slate-700 font-medium mt-0.5">
                  {selectedClaim.issueDescription}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Coverage Policy</span>
                <p className="text-slate-600 font-medium">
                  {selectedClaim.coverageDetails || '1 Year Standard Brand Warranty'}
                </p>
              </div>
            </div>

            {/* Supporting Documents */}
            {selectedClaim.supportingDocs && selectedClaim.supportingDocs.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Uploaded Documents & Proof
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedClaim.supportingDocs.map((doc: any) => (
                    <a
                      key={doc.id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 hover:bg-slate-100"
                    >
                      <FileText className="w-3.5 h-3.5 text-brand-blue" />
                      {doc.fileName || 'View Attachment'}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action Form */}
            <div className="space-y-4 pt-2 border-t">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-blue font-semibold"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Additional Information Required">Additional Information Required</option>
                  <option value="Approved">Approved</option>
                  <option value="In Service">In Service</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {updateStatus === 'Rejected' && (
                <div>
                  <label className="block text-xs font-bold text-rose-700 mb-1">
                    Rejection Reason (Visible to Customer)
                  </label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why warranty coverage cannot be applied..."
                    className="w-full text-xs border border-rose-200 rounded-xl p-2.5 focus:outline-none focus:border-rose-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internal / Customer Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Service center log or action steps taken..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveClaim}
                  disabled={saving}
                  className="px-5 py-2 bg-brand-blue text-white rounded-xl text-xs font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Claim'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

