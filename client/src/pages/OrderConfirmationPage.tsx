import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Printer } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const order = (location.state as any)?.order;

  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full">
          Order Confirmed
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-4 mb-2">
          Thank you for choosing VOLTEDGE!
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          Your order <strong>#{orderNumber}</strong> has been received and is currently being prepared by our showroom warehouse team.
        </p>

        {order && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-8 text-left text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Customer:</span>
              <span className="text-white font-medium">{order.customerName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payment Mode:</span>
              <span className="text-white font-medium">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payment Status:</span>
              <span className="text-emerald-400 font-semibold">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
              <span className="font-semibold text-white">Total Amount Paid / Due:</span>
              <span className="font-bold text-cyan-400 text-sm">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {order?.id ? (
            <Link
              to={`/account/orders/${order.id}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
            >
              <Package className="w-4 h-4" /> View Order & Invoice
            </Link>
          ) : (
            <Link
              to="/account"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
            >
              <Package className="w-4 h-4" /> Go to My Orders
            </Link>
          )}

          <Link
            to="/shop"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all border border-slate-700"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

