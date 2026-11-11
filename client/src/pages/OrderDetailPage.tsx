import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCustomerOrderDetail, getCustomerOrderInvoice } from '../services/customerApi';
import { CustomerOrder, InvoiceData } from '../types/customer';
import {
  ArrowLeft,
  Package,
  Printer,
  CheckCircle,
  Truck,
  CreditCard,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvoiceView, setShowInvoiceView] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  const loadOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const data = await getCustomerOrderDetail(orderId);
      setOrder(data);
      // Pre-load invoice
      const inv = await getCustomerOrderInvoice(orderId);
      setInvoice(inv);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 py-20 text-center text-slate-400">
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950 py-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">{error || 'This order does not exist or belongs to another customer.'}</p>
          <Link
            to="/account"
            className="inline-block px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold"
          >
            Back to Customer Portal
          </Link>
        </div>
      </div>
    );
  }

  const steps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = steps.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/account"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </Link>

          <button
            onClick={() => setShowInvoiceView(!showInvoiceView)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            {showInvoiceView ? 'Hide Invoice' : 'View / Print Tax Invoice'}
          </button>
        </div>

        {/* PRINTABLE INVOICE VIEW */}
        {showInvoiceView && invoice && (
          <div className="bg-white text-slate-900 rounded-2xl p-8 mb-8 shadow-2xl border border-slate-200 print:m-0 print:p-0 print:shadow-none">
            <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">VOLTEDGE Electronics</h1>
                <p className="text-xs text-slate-500">{invoice.seller.tagline}</p>
                <p className="text-xs text-slate-600 mt-2 max-w-xs">{invoice.seller.address}</p>
                <p className="text-xs text-slate-600">GSTIN: {invoice.seller.gstin}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Tax Invoice
                </span>
                <div className="text-lg font-black text-slate-900 mt-2">#{invoice.invoiceNumber}</div>
                <div className="text-xs text-slate-500">
                  Date: {new Date(invoice.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="text-xs text-slate-500">Order: #{invoice.orderNumber}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
              <div>
                <h3 className="font-bold text-slate-700 uppercase tracking-wider mb-1">Billed & Shipped To:</h3>
                <div className="font-semibold text-slate-900">{invoice.customer.name}</div>
                <div className="text-slate-600">{invoice.customer.shippingAddress}</div>
                <div className="text-slate-600">Ph: {invoice.customer.phone}</div>
              </div>

              <div className="text-right">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Method:</h3>
                <div className="font-semibold text-slate-900">{invoice.paymentMethod}</div>
                <div className="text-slate-600">Status: {invoice.paymentStatus}</div>
                <div className="text-slate-600">Ref: {invoice.paymentReference}</div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-xs text-left mb-6">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{i.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{i.sku}</td>
                    <td className="py-2.5 px-3 text-center text-slate-700">{i.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">₹{i.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{i.totalPrice.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{invoice.pricing.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {invoice.pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({invoice.pricing.couponCode || 'Promo'}):</span>
                    <span>-₹{invoice.pricing.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>GST (18% Included):</span>
                  <span>₹{invoice.pricing.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee:</span>
                  <span>{invoice.pricing.shippingFee === 0 ? 'FREE' : `₹${invoice.pricing.shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Final Total:</span>
                  <span>₹{invoice.pricing.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between print:hidden">
              <span>This is a computer-generated tax invoice for VOLTEDGE Electronics.</span>
              <button
                onClick={printInvoice}
                className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Print to PDF
              </button>
            </div>
          </div>
        )}

        {/* Order Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Order Reference</div>
              <h1 className="text-2xl font-bold text-white tracking-tight">#{order.orderNumber}</h1>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5" />
                Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                  order.orderStatus === 'DELIVERED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : order.orderStatus === 'CANCELLED'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                }`}
              >
                {order.orderStatus}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                Payment: {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          {order.orderStatus !== 'CANCELLED' && (
            <div className="pt-8 pb-4">
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-0" />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-cyan-400 transition-all duration-500 -z-0"
                  style={{
                    width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`,
                  }}
                />

                {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  return (
                    <div key={step} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isDone
                            ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/20'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 mt-2 uppercase">
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Details & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-4">Ordered Items ({order.items.length})</h2>
              <div className="divide-y divide-slate-800/80">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                        {item.productImageUrl ? (
                          <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{item.productName}</div>
                        <div className="text-xs text-slate-400">
                          SKU: {item.productSku} • Qty: {item.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm font-bold text-white">
                      ₹{item.totalPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery & Payment Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase mb-2">
                  <MapPin className="w-4 h-4 text-cyan-400" /> Delivery Address
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{order.shippingAddress}</p>
                <div className="text-xs text-slate-400 mt-2">
                  Shipping Mode: <strong className="text-white">{order.shippingMethod}</strong>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase mb-2">
                  <CreditCard className="w-4 h-4 text-blue-400" /> Payment Info
                </div>
                <div className="text-xs text-slate-300">
                  Method: <strong className="text-white">{order.paymentMethod}</strong>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Status: <strong className="text-white">{order.paymentStatus}</strong>
                </div>
                {order.paymentReference && (
                  <div className="text-xs text-slate-400 mt-1 truncate">
                    Ref ID: <code>{order.paymentReference}</code>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="md:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h2 className="text-base font-bold text-white mb-2">Order Summary</h2>

              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal:</span>
                <span className="text-white font-medium">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Coupon Discount:</span>
                  <span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-slate-400">
                <span>Estimated GST (18%):</span>
                <span className="text-white font-medium">₹{order.taxAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-400">
                <span>Shipping Charges:</span>
                <span className="text-white font-medium">
                  {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee.toLocaleString('en-IN')}`}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Total Amount:</span>
                <span className="text-cyan-400 text-lg">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Protected by VOLTEDGE Official Brand Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

