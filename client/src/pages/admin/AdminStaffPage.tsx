import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit,
  KeyRound,
  UserCheck,
  UserX,
  X,
  Loader2,
  Mail,
  Phone,
  Shield,
  Activity,
  Calendar,
} from 'lucide-react';
import {
  getAdminStaffList,
  createAdminStaff,
  updateAdminStaff,
  toggleAdminStaffStatus,
  resetStaffPassword,
} from '../../services/adminApi';
import { AdminUser, AdminRole } from '../../types/admin';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminStaffPage: React.FC = () => {
  const { user: currentUser } = useAdminAuth();

  const [staffList, setStaffList] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<AdminRole>('SALES_STAFF');

  // Password Reset Modal
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const data = await getAdminStaffList({
        search,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      });
      setStaffList(data);
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [search, roleFilter]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setRole('SALES_STAFF');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: AdminUser) => {
    setIsEditing(true);
    setEditingId(s.id);
    setFullName(s.fullName);
    setEmail(s.email);
    setPassword('');
    setPhone(s.phone || '');
    setRole(s.role);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    if (!isEditing && (!password || password.length < 8)) {
      alert('Password must be at least 8 characters long for security compliance.');
      return;
    }

    try {
      setIsSaving(true);
      if (isEditing && editingId) {
        await updateAdminStaff(editingId, {
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          role,
        });
      } else {
        await createAdminStaff({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim() || null,
          role,
        });
      }

      setIsModalOpen(false);
      loadStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save staff member');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (s: AdminUser) => {
    if (s.id === currentUser?.id) {
      alert('You cannot deactivate your own active Super Admin session.');
      return;
    }

    try {
      await toggleAdminStaffStatus(s.id, !s.isActive);
      loadStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update staff status');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget || newPassword.length < 8) {
      alert('New password must be at least 8 characters long.');
      return;
    }

    try {
      setIsResetting(true);
      await resetStaffPassword(resetTarget.id, newPassword);
      alert(`Password for ${resetTarget.fullName} reset successfully.`);
      setResetTarget(null);
      setNewPassword('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-blue" />
            Staff Directory & Role-Based Access Control
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Super Admin privileged module: Provision team credentials and enforce departmental role security.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blueHover text-white text-xs font-bold shadow-md shadow-brand-blue/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
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
            placeholder="Search staff by name, email, or contact number..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-medium"
        >
          <option value="all">All Staff Roles</option>
          <option value="SUPER_ADMIN">Super Admin (Universal Access)</option>
          <option value="ADMIN">Admin / Store Manager</option>
          <option value="INVENTORY_MANAGER">Inventory Controller</option>
          <option value="SALES_STAFF">Sales Specialist</option>
        </select>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email & Phone</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Last Active Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-blue" />
                    Loading staff directory...
                  </td>
                </tr>
              ) : staffList.length > 0 ? (
                staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {s.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {s.fullName}
                            {s.id === currentUser?.id && (
                              <span className="text-[9px] text-cyan-600 bg-cyan-50 px-1.5 py-0.2 rounded font-bold">
                                (You)
                              </span>
                            )}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {s.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-slate-800">{s.email}</p>
                        <p className="text-[11px] text-slate-400">{s.phone || 'Phone: Not registered'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={s.role} type="role" />
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {s.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString() : 'Never logged in'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setResetTarget(s)}
                          title="Reset Password"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-blue-50 transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          title="Edit Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {s.id !== currentUser?.id && (
                          <button
                            onClick={() => handleToggleStatus(s)}
                            title={s.isActive ? 'Deactivate Account' : 'Activate Account'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              s.isActive ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {s.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No staff members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Staff Profile' : 'Add Showroom Staff Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Staff Email Address *
                </label>
                <input
                  type="email"
                  required
                  disabled={isEditing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@voltedge.com"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Initial Password (Min 8 chars) *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Departmental Role & Permissions *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none font-semibold"
                >
                  <option value="SUPER_ADMIN">1. Super Admin (Full Showroom Control & Staff Admin)</option>
                  <option value="ADMIN">2. Admin / Manager (Products, Orders, Customers, Reports)</option>
                  <option value="INVENTORY_MANAGER">3. Inventory Manager (Stock Tracking & Adjustments)</option>
                  <option value="SALES_STAFF">4. Sales Staff (Showroom Order Entry & Catalog Read)</option>
                </select>
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
                  <span>{isEditing ? 'Save Changes' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Reset Staff Password</h3>
              <button onClick={() => setResetTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                Target Staff: <strong className="text-slate-900">{resetTarget.fullName}</strong> ({resetTarget.email})
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Password (Min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secure password"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-brand-blueHover rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Reset Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

