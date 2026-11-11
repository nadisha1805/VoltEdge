import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import {
  getCustomerAddresses,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  getCustomerOrders,
  updateCustomerProfile,
  changeCustomerPassword,
} from '../services/customerApi';
import { CustomerAddress, CustomerOrder } from '../types/customer';
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Clock,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Award,
  Wrench,
  RotateCcw,
  Bell,
} from 'lucide-react';
import {
  getCustomerWarrantyClaims,
  submitWarrantyClaim,
  getCustomerServiceRequests,
  submitServiceRequest,
  getCustomerReturns,
  submitReturnRequest,
  getCustomerNotifications,
  markCustomerNotificationRead,
} from '../services/customerApi';

export const CustomerAccountPage: React.FC = () => {
  const { customer, logout, refreshProfile } = useCustomerAuth();
  const { wishlist, moveToCart } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'orders'
    | 'warranty'
    | 'service'
    | 'returns'
    | 'notifications'
    | 'addresses'
    | 'wishlist'
    | 'profile'
    | 'settings'
  >('overview');

  // Milestone 4: Customer States
  const [warrantyClaims, setWarrantyClaims] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [returnRequests, setReturnRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Milestone 4: Modals
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Forms
  const [warrantyForm, setWarrantyForm] = useState({
    orderId: '',
    productId: '',
    serialNumber: '',
    issueCategory: 'HARDWARE_DEFECT',
    issueDescription: '',
  });

  const [serviceForm, setServiceForm] = useState({
    productCategory: 'Smartphones',
    productName: '',
    productModel: '',
    serialNumber: '',
    serviceType: 'IN_STORE',
    problemDescription: '',
    serviceAddress: '',
  });

  const [returnForm, setReturnForm] = useState({
    orderId: '',
    reasonCategory: 'DAMAGED_PRODUCT',
    reasonDetails: '',
    productId: '',
  });

  // Address State
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'HOME',
    isDefault: false,
  });

  // Orders State
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (customer) {
      setProfileForm({
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone || '',
      });
      loadAddresses();
      loadOrders();
      loadMilestone4Data();
    }
  }, [customer]);

  const loadMilestone4Data = async () => {
    try {
      const [w, s, r, n] = await Promise.all([
        getCustomerWarrantyClaims().catch(() => []),
        getCustomerServiceRequests().catch(() => []),
        getCustomerReturns().catch(() => []),
        getCustomerNotifications().catch(() => ({ notifications: [], unreadCount: 0 })),
      ]);
      setWarrantyClaims(w);
      setServiceRequests(s);
      setReturnRequests(r);
      setNotifications(n.notifications || []);
      setUnreadNotifications(n.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  const loadAddresses = async () => {
    try {
      const data = await getCustomerAddresses();
      setAddresses(data);
    } catch {
      // ignore
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await getCustomerOrders();
      setOrders(data);
    } catch {
      // ignore
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await updateCustomerAddress(editingAddress.id, addressForm);
        showToast('Address updated successfully');
      } else {
        await addCustomerAddress(addressForm);
        showToast('New address added');
      }
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      loadAddresses();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save address', 'error');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery address?')) return;
    try {
      await deleteCustomerAddress(id);
      showToast('Address removed', 'info');
      loadAddresses();
    } catch {
      showToast('Could not delete address', 'error');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCustomerProfile(profileForm);
      await refreshProfile();
      showToast('Profile updated successfully!');
    } catch {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    try {
      await changeCustomerPassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully!');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update password', 'error');
    }
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center py-20 px-4">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Please log in to view your customer portal.</p>
          <Link to="/login" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Portal Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/20">
              {customer.firstName[0]}
              {customer.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>Welcome back, {customer.firstName}!</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Verified Customer
                </span>
              </h1>
              <p className="text-slate-400 text-sm">{customer.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => logout().then(() => navigate('/'))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <User className="w-4 h-4" /> Overview
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'orders'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" /> My Orders
                </div>
                {orders.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('warranty')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'warranty'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4" /> Warranty Claims
                </div>
                {warrantyClaims.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {warrantyClaims.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('service')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'service'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4" /> Service Requests
                </div>
                {serviceRequests.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {serviceRequests.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('returns')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'returns'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4" /> Returns & Refunds
                </div>
                {returnRequests.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {returnRequests.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" /> Notifications
                </div>
                {unreadNotifications > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-blue text-white font-bold">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'addresses'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" /> Delivery Addresses
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {addresses.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'wishlist'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4" /> My Wishlist
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {wishlist.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Settings className="w-4 h-4" /> Account Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</span>
                      <Package className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{customer.totalOrders}</div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved Wishlist</span>
                      <Heart className="w-5 h-5 text-pink-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{wishlist.length}</div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Showroom Spent</span>
                      <ShieldCheck className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="text-2xl font-bold text-teal-400">₹{customer.totalSpent.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Recent Orders Preview */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Recent Orders</h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No orders placed yet. Explore our electronic showroom!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((ord) => (
                        <div
                          key={ord.id}
                          className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-xl"
                        >
                          <div>
                            <div className="text-sm font-semibold text-white flex items-center gap-2">
                              <span>#{ord.orderNumber}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                  ord.orderStatus === 'DELIVERED'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : ord.orderStatus === 'CANCELLED'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                }`}
                              >
                                {ord.orderStatus}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}{' '}
                              • {ord.items.length} item(s)
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-bold text-white">
                              ₹{ord.totalAmount.toLocaleString('en-IN')}
                            </div>
                            <Link
                              to={`/account/orders/${ord.id}`}
                              className="text-xs text-cyan-400 hover:underline mt-1 inline-block"
                            >
                              Track Order & Invoice
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Order History & Invoices</h2>

                {loadingOrders ? (
                  <div className="text-center py-12 text-slate-400">Loading your orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-base font-semibold text-slate-300">You haven't placed any orders yet</p>
                    <p className="text-xs text-slate-500 mt-1 mb-6">Discover the best electronics with full brand warranty.</p>
                    <Link
                      to="/shop"
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm rounded-xl shadow-lg"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                          <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Order Reference</span>
                            <h3 className="text-base font-bold text-white">#{ord.orderNumber}</h3>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                ord.orderStatus === 'DELIVERED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : ord.orderStatus === 'CANCELLED'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              }`}
                            >
                              {ord.orderStatus}
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                              Payment: {ord.paymentStatus} ({ord.paymentMethod})
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="py-4 space-y-3">
                          {ord.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                                  {item.productImageUrl ? (
                                    <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-5 h-5 text-slate-600" />
                                  )}
                                </div>
                                <div>
                                  <div className="text-white font-medium line-clamp-1">{item.productName}</div>
                                  <div className="text-xs text-slate-400">
                                    Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                                  </div>
                                </div>
                              </div>
                              <div className="text-white font-bold shrink-0">
                                ₹{item.totalPrice.toLocaleString('en-IN')}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-xs text-slate-400">Total Payable: </span>
                            <span className="text-base font-black text-cyan-400">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Link
                              to={`/account/orders/${ord.id}`}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Details & Invoice
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MILESTONE 4: WARRANTY CLAIMS TAB */}
            {activeTab === 'warranty' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Warranty & Protection Claims</h2>
                    <p className="text-xs text-slate-400">
                      Submit brand warranty claims, track repairs, and verify policy coverage
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (orders.length === 0) {
                        showToast('You must have completed orders to submit a warranty claim', 'error');
                        return;
                      }
                      setIsWarrantyModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition"
                  >
                    <Plus className="w-4 h-4" /> New Claim
                  </button>
                </div>

                {warrantyClaims.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-base font-semibold text-slate-300">No warranty claims on record</p>
                    <p className="text-xs text-slate-500 mt-1">
                      All your electronics purchased at VOLTEDGE come with authentic manufacturer warranties.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {warrantyClaims.map((claim) => (
                      <div
                        key={claim.id}
                        className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{claim.claimNumber}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                claim.status === 'Approved' || claim.status === 'Resolved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : claim.status === 'Rejected'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {claim.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 font-semibold">{claim.product?.name}</div>
                          <div className="text-xs text-slate-400">
                            Category: {claim.issueCategory} • Purchase Date:{' '}
                            {new Date(claim.purchaseDate).toLocaleDateString()}
                          </div>
                          <p className="text-xs text-slate-400 italic mt-1 line-clamp-1">
                            "{claim.issueDescription}"
                          </p>
                          {claim.adminNotes && (
                            <div className="text-xs text-cyan-400 bg-cyan-950/40 p-2 rounded border border-cyan-800/50 mt-2">
                              Note from Support: {claim.adminNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MILESTONE 4: REPAIR & SERVICE TAB */}
            {activeTab === 'service' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Electronics Repair & Service</h2>
                    <p className="text-xs text-slate-400">
                      Book technician showroom visits or in-store repairs for all your electronics
                    </p>
                  </div>
                  <button
                    onClick={() => setIsServiceModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition"
                  >
                    <Plus className="w-4 h-4" /> Book Service
                  </button>
                </div>

                {serviceRequests.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-base font-semibold text-slate-300">No active service tickets</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Our certified engineers provide inspection, hardware upgrades, and repairs.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{req.requestNumber}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                req.status === 'Completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              }`}
                            >
                              {req.status}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              {req.serviceType.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 font-semibold">
                            {req.productName} ({req.productCategory})
                          </div>
                          <p className="text-xs text-slate-400 italic">"{req.problemDescription}"</p>
                          {req.assignedStaffName && (
                            <div className="text-xs text-emerald-400">
                              Assigned Engineer: {req.assignedStaffName}
                            </div>
                          )}
                          {req.finalCost > 0 && (
                            <div className="text-xs text-cyan-400 font-bold">
                              Final Bill: ₹{req.finalCost.toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MILESTONE 4: RETURNS & REFUNDS TAB */}
            {activeTab === 'returns' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Returns & Refunds</h2>
                    <p className="text-xs text-slate-400">
                      Submit return requests, view product inspection status, and monitor refund disbursal
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (orders.length === 0) {
                        showToast('No orders eligible for return', 'error');
                        return;
                      }
                      setIsReturnModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition"
                  >
                    <Plus className="w-4 h-4" /> Request Return
                  </button>
                </div>

                {returnRequests.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-base font-semibold text-slate-300">No returns on record</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Enjoy hassle-free returns within the verified return policy period.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {returnRequests.map((ret) => (
                      <div
                        key={ret.id}
                        className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{ret.returnNumber}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                ret.status === 'Completed' || ret.status === 'Approved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {ret.status}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                ret.refundStatus === 'Refunded'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              Refund: {ret.refundStatus}
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 font-semibold">
                            Order: {ret.order?.orderNumber} • ₹{ret.refundAmount?.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-slate-400">
                            Reason: {ret.reasonCategory.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MILESTONE 4: NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Notifications & Alerts</h2>
                    <p className="text-xs text-slate-400">
                      Stay updated with order deliveries, warranty resolutions, and refund status
                    </p>
                  </div>
                  {unreadNotifications > 0 && (
                    <button
                      onClick={async () => {
                        await markCustomerNotificationRead('all');
                        setUnreadNotifications(0);
                        loadMilestone4Data();
                      }}
                      className="text-xs text-cyan-400 hover:underline font-semibold"
                    >
                      Mark All as Read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-base font-semibold text-slate-300">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 rounded-xl border transition ${
                          n.isRead
                            ? 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                            : 'bg-slate-800/60 border-blue-500/40 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-white">{n.title}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Delivery Addresses</h2>
                    <p className="text-xs text-slate-400">Manage multiple shipping addresses for rapid checkout</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      setAddressForm({
                        fullName: `${customer.firstName} ${customer.lastName}`,
                        phone: customer.phone || '',
                        addressLine1: '',
                        addressLine2: '',
                        city: '',
                        state: '',
                        postalCode: '',
                        country: 'India',
                        addressType: 'HOME',
                        isDefault: addresses.length === 0,
                      });
                      setIsAddressModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-base font-semibold text-slate-300">No addresses saved</p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">Add your home or office address to speed up checkout.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`bg-slate-950/70 border rounded-xl p-5 relative ${
                          addr.isDefault ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/5' : 'border-slate-800'
                        }`}
                      >
                        {addr.isDefault && (
                          <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase">
                            Default Address
                          </span>
                        )}

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase">
                            {addr.addressType}
                          </span>
                          <span className="text-sm font-bold text-white">{addr.fullName}</span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                          <br />
                          {addr.city}, {addr.state} - {addr.postalCode}
                          <br />
                          {addr.country}
                        </p>

                        <div className="text-xs text-slate-400 mt-2">
                          Phone: <span className="text-slate-200">{addr.phone || 'N/A'}</span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setEditingAddress(addr);
                              setAddressForm({
                                fullName: addr.fullName || '',
                                phone: addr.phone || '',
                                addressLine1: addr.addressLine1,
                                addressLine2: addr.addressLine2 || '',
                                city: addr.city,
                                state: addr.state,
                                postalCode: addr.postalCode,
                                country: addr.country,
                                addressType: addr.addressType,
                                isDefault: addr.isDefault,
                              });
                              setIsAddressModalOpen(true);
                            }}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>

                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Saved Wishlist ({wishlist.length})</h2>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-base font-semibold text-slate-300">Your wishlist is empty</p>
                    <p className="text-xs text-slate-500 mt-1 mb-6">Save devices you love to track prices and availability.</p>
                    <Link
                      to="/shop"
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm rounded-xl shadow-lg"
                    >
                      Browse Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                      >
                        <div className="aspect-video rounded-lg bg-slate-900 overflow-hidden mb-3 relative">
                          <img
                            src={prod.primaryImage}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">{prod.name}</h3>
                          <div className="text-xs text-slate-400 mb-2">
                            {prod.stockStatus === 'IN_STOCK' ? (
                              <span className="text-emerald-400 font-semibold">In Stock</span>
                            ) : (
                              <span className="text-rose-400 font-semibold">Out of Stock</span>
                            )}
                          </div>
                          <div className="text-base font-black text-cyan-400 mb-4">
                            ₹{prod.sellingPrice.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <button
                          onClick={() => moveToCart(prod.id)}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
                        >
                          Move to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. PROFILE & SETTINGS TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Customer Profile Information</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">First Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Last Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={customer.email}
                        className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-500 text-sm cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md"
                    >
                      Save Profile Changes
                    </button>
                  </form>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Change Account Password</h2>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Edit/Add Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Delivery Address'}
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Address Line 1</label>
                <input
                  type="text"
                  required
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  placeholder="House/Flat No., Building name, Street"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                  placeholder="Landmark, Area"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Type</label>
                  <select
                    value={addressForm.addressType}
                    onChange={(e) => setAddressForm({ ...addressForm, addressType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                  >
                    <option value="HOME">Home</option>
                    <option value="WORK">Work / Office</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefaultAddr"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700"
                />
                <label htmlFor="isDefaultAddr" className="text-xs text-slate-300">Set as default shipping address</label>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

