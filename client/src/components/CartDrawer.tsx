import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalItems,
  } = useCart();

  if (!isCartOpen) return null;

  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.0;
  const grandTotal = subtotal + shipping;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-blue/15 flex items-center justify-center text-brand-blue">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-brand-navy text-base">Shopping Cart</h3>
                <p className="text-xs text-slate-500">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Your cart is currently empty</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Explore our showroom collection of laptops, audio, and high-performance electronics.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-brand-blue text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-blueHover transition-colors"
                >
                  Start Exploring Tech
                </button>
              </div>
            ) : (
              <>
                {/* Free shipping progress bar */}
                <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-xs">
                  {subtotal >= 150 ? (
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Congratulations! You qualified for Free Express Delivery!</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Add <strong>{formatPrice(150 - subtotal)}</strong> more for Free Delivery</span>
                        <span className="font-bold">{Math.round((subtotal / 150) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-brand-blue h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (subtotal / 150) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="divide-y divide-slate-100 space-y-3 pt-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="pt-3 flex gap-3 group">
                      {/* Product Thumbnail */}
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-slate-50 p-2 border border-slate-200/80 shrink-0 flex items-center justify-center">
                        <img
                          src={item.product.primaryImage}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold text-brand-blue uppercase">
                              {item.product.brand?.name}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <h5 className="text-xs font-semibold text-brand-navy line-clamp-1">
                            {item.product.name}
                          </h5>
                          <span className="text-xs font-bold text-slate-800">
                            {formatPrice(item.product.sellingPrice)}
                          </span>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs font-bold text-brand-navy">
                            {formatPrice(item.product.sellingPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-right pt-2">
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-slate-400 hover:text-rose-500 underline"
                  >
                    Clear all items
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/80 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Express Delivery</span>
                  <span className="font-semibold text-slate-800">
                    {shipping === 0 ? <span className="text-emerald-600">FREE</span> : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-brand-navy pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Preview Button */}
              <button
                onClick={() => {
                  alert('Milestone 1 Preview: Cart functionality is live and interactive! Complete checkout & payment gateway will be implemented in Milestone 3.');
                }}
                className="w-full bg-brand-blue hover:bg-brand-blueHover text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>30-Day Showroom Guarantee & Insured Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

