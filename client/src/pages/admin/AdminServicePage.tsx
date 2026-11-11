import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Filter,
  Eye,
  UserCheck,
  DollarSign,
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { getAdminServiceRequests, updateAdminServiceRequest } from '../../services/adminApi';
import { useToast } from '../../context/ToastContext';

export const AdminServicePage: React.FC = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedReq, setSelectedReq] = useState<any | null>(null);

  // Form states
  const [status, setStatus] = useState('');
  const [assignedStaffName, setAssignedStaffName] = useState('');
  const [inspectionDetails, setInspectionDetails] = useState('');
  const [repairNotes, setRepairNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number | string>(0);
  const [finalCost, setFinalCost] = useState<number | string>(0);
  const [saving, setSaving] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getAdminServiceRequests({
        status: statusFilter,
        category: categoryFilter,
        search,
      });
      setRequests(res.requests || []);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load service requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleOpenModal = (req: any) => {
    setSelectedReq(req);
    setStatus(req.status);
    setAssignedStaffName(req.assignedStaffName || '');
    setInspectionDetails(req.inspectionDetails || '');
    setRepairNotes(req.repairNotes || '');
    setEstimatedCost(req.estimatedCost || 0);
    setFinalCost(req.finalCost || 0);
  };

  const handleSave = async () => {
    if (!selectedReq) return;
    try {
      setSaving(true);
      await updateAdminServiceRequest(selectedReq.id, {
        status,
        assignedStaffName,
        inspectionDetails,
        repairNotes,
        estimatedCost: Number(estimatedCost),
        finalCost: Number(finalCost),
      });
      showToast('Service ticket updated successfully', 'success');
      setSelectedReq(null);
      fetchRequests();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update service ticket', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Wrench className="w-7 h-7 text-brand-blue" />
          Repair & Service Center Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track customer electronics repairs, technician visits, diagnostics, and billing.
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
              placeholder="Search ticket #, customer, product..."
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-blue"
          >
            <option value="ALL">All Categories</option>
            <option value="Smartphones">Smartphones</option>
            <option value="Laptops">Laptops</option>
            <option value="Televisions">Televisions</option>
            <option value="Refrigerators">Refrigerators</option>
            <option value="Washing Machines">Washing Machines</option>
            <option value="Air Conditioners">Air Conditioners</option>
            <option value="Audio Devices">Audio Devices</option>
            <option value="Other Electronics">Other Electronics</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-blue"
          >
            <option value="ALL">All Statuses</option>
            <option value="Requested">Requested</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Assigned">Assigned</option>
            <option value="Inspection">Inspection</option>
            <option value="Awaiting Approval">Awaiting Approval</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="p-4">Ticket # / Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Product Category & Device</th>
                <th className="p-4">Service Type</th>
                <th className="p-4">Assigned Staff</th>
                <th className="p-4">Status & Cost</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading service tickets...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No service requests found.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{r.requestNumber}</div>
                      <div className="text-slate-400 text-[11px]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{r.customerName}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {r.customerPhone}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 block">{r.productName}</span>
                      <span className="text-slate-400 text-[11px]">
                        {r.productCategory} {r.productModel ? `• ${r.productModel}` : ''}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                        {r.serviceType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      {r.assignedStaffName ? (
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {r.assignedStaffName}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : r.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {r.status}
                      </span>
                      {r.finalCost > 0 ? (
                        <div className="text-emerald-700 font-bold text-[11px] mt-0.5">
                          Final: ₹{r.finalCost.toLocaleString('en-IN')}
                        </div>
                      ) : r.estimatedCost > 0 ? (
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Est: ₹{r.estimatedCost.toLocaleString('en-IN')}
                        </div>
                      ) : null}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenModal(r)}
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

      {/* Management Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Service Ticket: {selectedReq.requestNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Created on {new Date(selectedReq.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Ticket Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Customer</span>
                <span className="font-semibold text-slate-800">{selectedReq.customerName}</span>
                <div className="text-slate-500">{selectedReq.customerPhone}</div>
                <div className="text-slate-500">{selectedReq.customerEmail}</div>
              </div>
              <div>
                <span className="text-slate-400 block">Device</span>
                <span className="font-semibold text-slate-800">{selectedReq.productName}</span>
                <div className="text-slate-500">Category: {selectedReq.productCategory}</div>
                {selectedReq.serialNumber && (
                  <div className="text-cyan-700 font-mono">SN: {selectedReq.serialNumber}</div>
                )}
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Problem Stated</span>
                <p className="text-slate-700 font-medium mt-0.5">
                  {selectedReq.problemDescription}
                </p>
              </div>
              {selectedReq.serviceAddress && (
                <div className="col-span-2">
                  <span className="text-slate-400 block">Technician Visit Address</span>
                  <p className="text-slate-700 font-medium">{selectedReq.serviceAddress}</p>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="space-y-4 pt-2 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Service Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand-blue font-semibold"
                  >
                    <option value="Requested">Requested</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Awaiting Approval">Awaiting Approval</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Technician / Staff Name
                  </label>
                  <input
                    type="text"
                    value={assignedStaffName}
                    onChange={(e) => setAssignedStaffName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar (Hardware Tech)"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Final Bill Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={finalCost}
                    onChange={(e) => setFinalCost(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inspection & Diagnostic Notes
                </label>
                <textarea
                  rows={2}
                  value={inspectionDetails}
                  onChange={(e) => setInspectionDetails(e.target.value)}
                  placeholder="Parts inspected, hardware diagnostics summary..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Repair & Resolution Summary
                </label>
                <textarea
                  rows={2}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="Components replaced, tests performed, handover notes..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-brand-blue text-white rounded-xl text-xs font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

