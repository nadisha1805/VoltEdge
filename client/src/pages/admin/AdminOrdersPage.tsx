import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertCircle,
  X,
  CreditCard,
  MapPin,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import {
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
} from '../../services/adminApi';
import { Order } from '../../types/admin';
import { StatusBadge } from '../../components/admin/StatusBadge';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');

  // Detail Drawer State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [statusComment, setStatusComment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const res = await getAdminOrders({
        search,
        orderStatus,
        paymentStatus,
        page,
        limit: 10,
      });
      setOrders(res.data);
      setTotalCount(res.pagination.totalCount);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [search, orderStatus, paymentStatus, page]);

  const handleOpenDetail = async (orderId: string) => {
    try {
      setIsLoadingDetail(true);
      const fullOrder = await getAdminOrderById(orderId);
      setSelectedOrder(fullOrder);
      setNewStatus(fullOrder.orderStatus);
      setNewPaymentStatus(fullOrder.paymentStatus);
      setStatusComment('');
    } catch (err) {
      alert('Failed to load order details');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setIsUpdatingStatus(true);
      const updated = await updateOrderStatus(selectedOrder.id, {
        orderStatus: newStatus,
        paymentStatus: newPaymentStatus,
        comment: statusComment || undefined,
      });
      // Refresh order detail and order list
      setSelectedOrder(updated.data);
      setStatusComment('');
      loadOrders();
      alert(`Order ${selectedOrder.orderNumber} successfully updated.`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Order Fulfillment & Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fulfill showroom purchases, track courier dispatches, and manage status transition histories.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-semibold bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          Total Orders Recorded: <strong className="text-slate-900">{totalCount}</strong>
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
            placeholder="Search by order ID (VOLT-...), customer name, or email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all"
          />
        </div>

        <select
          value={orderStatus}
          onChange={(e) => {
            setOrderStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-medium"
        >
          <option value="all">All Order Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-medium"
        >
          <option value="all">All Payment Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date Placed</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Order Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-blue" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-800">{o.customerName}</p>
                        <p className="text-[10px] text-slate-400">{o.customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">
                      {o.items?.length || 1} product(s)
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      ₹{o.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={o.paymentStatus} type="payment" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={o.orderStatus} type="order" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(o.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No orders found matching your search criteria.
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

      {/* Order Detail Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 font-mono">
                    {selectedOrder.orderNumber}
                  </h3>
                  <StatusBadge status={selectedOrder.orderStatus} type="order" />
                  <StatusBadge status={selectedOrder.paymentStatus} type="payment" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()} • Method: {selectedOrder.paymentMethod}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Customer and Address Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Customer Information
                  </span>
                  <p className="font-semibold text-slate-900">{selectedOrder.customerName}</p>
                  <p className="text-slate-500">{selectedOrder.customerEmail}</p>
                  <p className="text-slate-500">{selectedOrder.customerPhone || 'Phone: Not provided'}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                    Delivery Destination
                  </span>
                  <p className="text-slate-700 leading-relaxed">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Order Items Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Purchased Electronics ({selectedOrder.items?.length || 0})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-4 text-xs bg-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImageUrl || item.product?.primaryImage || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80'}
                          alt={item.productName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.productName}</p>
                          <span className="text-[10px] font-mono text-slate-400">SKU: {item.productSku}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          ₹{item.totalPrice.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {item.quantity} × ₹{item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Financial Totals */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Promotional Discount ({selectedOrder.couponCode || 'PROMO'})</span>
                    <span>-₹{selectedOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Showroom Delivery & White-Glove Shipping</span>
                  <span>{selectedOrder.shippingFee === 0 ? 'Complimentary (₹0)' : `₹${selectedOrder.shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST / Taxes</span>
                  <span>₹{selectedOrder.taxAmount.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-brand-blue font-mono">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Status Progression & Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Status Timeline & Audit Trail
                </h4>
                <div className="space-y-2 border-l-2 border-brand-blue/30 pl-4 ml-2">
                  {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                    selectedOrder.statusHistory.map((hist) => (
                      <div key={hist.id} className="relative text-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-blue absolute -left-[21px] top-1 ring-4 ring-white" />
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{hist.status}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(hist.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {hist.comment && <p className="text-slate-600 text-[11px] mt-0.5">{hist.comment}</p>}
                        <span className="text-[10px] text-slate-400 block font-medium">By: {hist.updatedBy}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No previous status records logged.</p>
                  )}
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleStatusUpdate} className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-3">
                <span className="text-xs font-bold text-brand-navy block uppercase tracking-wider">
                  Update Order Status & Dispatch Progress
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Order Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold outline-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold outline-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="FAILED">Failed</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Status Comment / Courier AWB Tracking #
                  </label>
                  <input
                    type="text"
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    placeholder="e.g. Dispatched via BlueDart AWB #90281982"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blueHover shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Save Order Update</span>
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

