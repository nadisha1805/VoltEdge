import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  X,
  Mail,
  Phone,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  getAdminEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} from '../../services/adminApi';
import { ContactEnquiry } from '../../types/admin';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

export const AdminEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiry | null>(null);
  const [statusInput, setStatusInput] = useState<string>('NEW');
  const [notesInput, setNotesInput] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<ContactEnquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEnquiries = async () => {
    try {
      setIsLoading(true);
      const res = await getAdminEnquiries({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search,
        page,
        limit: 10,
      });
      setEnquiries(res.data);
      setTotalCount(res.pagination.totalCount);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, [search, statusFilter, page]);

  const handleOpenDetail = (enq: ContactEnquiry) => {
    setSelectedEnquiry(enq);
    setStatusInput(enq.status);
    setNotesInput(enq.adminNotes || '');
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    try {
      setIsUpdating(true);
      const res = await updateEnquiryStatus(selectedEnquiry.id, {
        status: statusInput,
        adminNotes: notesInput,
      });
      setSelectedEnquiry(res.data);
      loadEnquiries();
      alert('Enquiry status updated.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update enquiry');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await deleteEnquiry(deleteTarget.id);
      setDeleteTarget(null);
      loadEnquiries();
    } catch (err: any) {
      alert('Failed to delete enquiry');
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
            Customer Enquiries & Concierge Inbox
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage product inquiries, showroom demo requests, and corporate B2B procurement queries.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-semibold bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          Total Inquiries: <strong className="text-slate-900">{totalCount}</strong>
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
            placeholder="Search by customer name, email, subject, or message..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="NEW">New (Unread)</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Date Received</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Message Snippet</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-blue" />
                    Loading enquiries...
                  </td>
                </tr>
              ) : enquiries.length > 0 ? (
                enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{enq.name}</p>
                        <p className="text-[10px] text-slate-400">{enq.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs truncate" title={enq.subject}>
                      {enq.subject}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm truncate" title={enq.message}>
                      {enq.message}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={enq.status} type="general" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(enq)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(enq)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Enquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No enquiries found.
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
            <strong className="text-slate-800">{totalPages}</strong>
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

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Enquiry Consultation</h3>
                <StatusBadge status={selectedEnquiry.status} type="general" />
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="block text-slate-400">Sender</span>
                    <strong className="text-slate-900">{selectedEnquiry.name}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">Received Date</span>
                    <strong className="text-slate-900">{new Date(selectedEnquiry.createdAt).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">Email</span>
                    <a href={`mailto:${selectedEnquiry.email}`} className="text-brand-blue font-semibold hover:underline">
                      {selectedEnquiry.email}
                    </a>
                  </div>
                  <div>
                    <span className="block text-slate-400">Phone</span>
                    <strong className="text-slate-900">{selectedEnquiry.phone || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Subject
                </span>
                <p className="font-bold text-slate-900 text-sm">{selectedEnquiry.subject}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Message Content
                </span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </p>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleStatusUpdate} className="pt-3 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Update Status
                    </label>
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold outline-none"
                    >
                      <option value="NEW">New (Unresolved)</option>
                      <option value="IN_PROGRESS">In Progress (Staff Assigned)</option>
                      <option value="RESOLVED">Resolved (Completed)</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Internal Concierge Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Staff action taken, quote dispatched, or demo schedule confirmed..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEnquiry(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blueHover shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Save Update</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Delete Enquiry Record"
          message={`Are you sure you want to delete this enquiry from ${deleteTarget.name}?`}
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete Enquiry'}
          isDanger={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

