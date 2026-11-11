import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { applyCouponCode } from '../services/customerApi';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, ShoppingBag } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, totalItems } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setCouponLoading(true);
      const res = await applyCouponCode({ code: couponCode.trim() });
      setAppliedCoupon({ code: res.couponCode, discountAmount: res.discountAmount });
      showToast(res.message);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Invalid coupon code', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.18);
  const shipping = subtotal >= 50000 || subtotal === 0 ? 0 : 499;
  const finalTotal = taxable + tax + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 py-24 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Your Shopping Cart is Empty</h2>
          <p className="text-slate-400 text-xs mb-6">Explore our showroom to discover premium electronics.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/20"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Shopping Cart</h1>
            <p className="text-slate-400 text-xs mt-1">Review your selected items before proceeding to checkout</p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={item.product.primaryImage}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="text-sm font-bold text-white hover:text-cyan-400 transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <div className="text-xs text-slate-400 mt-0.5">SKU: {item.product.sku}</div>
                    <div className="text-sm font-black text-cyan-400 mt-2">
                      ₹{item.product.sellingPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="flex items-center border border-slate-700 rounded-xl bg-slate-950 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <div className="text-sm font-black text-white">
                      ₹{(item.product.sellingPrice * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1 space-y-4">
            {/* Coupon Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="PROMO CODE"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white text-xs uppercase font-semibold focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shrink-0"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </form>
              {appliedCoupon && (
                <div className="mt-2 text-xs text-emerald-400 font-semibold flex items-center justify-between">
                  <span>Coupon {appliedCoupon.code} applied!</span>
                  <button onClick={() => setAppliedCoupon(null)} className="text-slate-400 hover:text-white">
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h2 className="text-base font-bold text-white mb-2">Order Breakdown</h2>

              <div className="flex justify-between text-xs text-slate-400">
                <span>Items ({totalItems}):</span>
                <span className="text-white font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Coupon Discount:</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-slate-400">
                <span>Estimated GST (18%):</span>
                <span className="text-white font-medium">₹{tax.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-400">
                <span>Standard Delivery:</span>
                <span className="text-white font-medium">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Estimated Total:</span>
                <span className="text-cyan-400 text-xl font-black">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={() =>
                  navigate('/checkout', {
                    state: {
                      couponCode: appliedCoupon?.code,
                    },
                  })
                }
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-[0.99] mt-4"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>100% Genuine Products with Showroom Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

