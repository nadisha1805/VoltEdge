import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShoppingBag,
  IndianRupee,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import {
  getAdminCustomers,
  getAdminCustomerById,
  updateAdminCustomer,
} from '../../services/adminApi';
import { Customer } from '../../types/admin';
import { StatusBadge } from '../../components/admin/StatusBadge';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('spent-desc');

  // Customer Profile Modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await getAdminCustomers({
        search,
        status,
        sort: sortBy,
        page,
        limit: 10,
      });
      setCustomers(res.data);
      setTotalCount(res.pagination.totalCount);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search, status, sortBy, page]);

  const handleOpenProfile = async (id: string) => {
    try {
      setIsLoadingProfile(true);
      const data = await getAdminCustomerById(id);
      setSelectedCustomer(data);
      setEditStatus(data.status);
      setEditNotes(data.notes || '');
    } catch (err) {
      alert('Failed to load customer profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      setIsSaving(true);
      const updated = await updateAdminCustomer(selectedCustomer.id, {
        status: editStatus,
        notes: editNotes,
      });
      setSelectedCustomer(updated.data);
      loadCustomers();
      alert('Customer profile updated.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Customer Directory & Profiles
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track customer relationship profiles, address books, order frequencies, and lifetime value.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-semibold bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          Total Customers: <strong className="text-slate-900">{totalCount}</strong>
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
            placeholder="Search by customer name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-medium"
        >
          <option value="all">All Customer Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="BLOCKED">Blocked</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-medium"
        >
          <option value="spent-desc">Highest Spenders First</option>
          <option value="orders-desc">Most Orders First</option>
          <option value="newest">Recently Registered</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-blue" />
                    Loading customer records...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-blue to-cyan-500 text-white font-bold flex items-center justify-center shrink-0">
                          {c.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.firstName} {c.lastName}</p>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {c.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-800">{c.email}</p>
                        <p className="text-[11px] text-slate-500">{c.phone || 'Phone: N/A'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {c.totalOrders} order(s)
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      ₹{c.totalSpent.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} type="general" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenProfile(c.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customers found.
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

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                  {selectedCustomer.firstName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Completed Orders
                  </span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {selectedCustomer.totalOrders}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cumulative Spending
                  </span>
                  <span className="text-xl font-black text-brand-blue font-mono">
                    ₹{selectedCustomer.totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Delivery Addresses */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Verified Shipping Addresses ({selectedCustomer.addresses?.length || 0})</span>
                </h4>
                {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.addresses.map((addr) => (
                      <div key={addr.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-slate-800">{addr.addressType} Destination: </span>
                        <span className="text-slate-600">
                          {addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No registered address records yet.</p>
                )}
              </div>

              {/* Order History */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Recent Purchases ({selectedCustomer.orders?.length || 0})</span>
                </h4>
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {selectedCustomer.orders.map((ord) => (
                      <div key={ord.id} className="p-3 flex items-center justify-between text-xs bg-white">
                        <div>
                          <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                          <span className="text-slate-400 text-[10px] block">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block">₹{ord.totalAmount.toLocaleString()}</span>
                          <StatusBadge status={ord.orderStatus} type="order" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No order history available.</p>
                )}
              </div>

              {/* Staff Notes and Status Modification */}
              <form onSubmit={handleSaveProfile} className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-3">
                <span className="text-xs font-bold text-brand-navy block uppercase tracking-wider">
                  Update Account Status & Relationship Notes
                </span>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Customer Account Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold outline-none"
                  >
                    <option value="ACTIVE">Active (Normal showroom client)</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BLOCKED">Blocked (Restricted)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Concierge Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="e.g. VIP client, preferred pickup times, tech preferences..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blueHover shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Save Customer Profile</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

