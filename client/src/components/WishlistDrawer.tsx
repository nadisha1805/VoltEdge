import React from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export const WishlistDrawer: React.FC = () => {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

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
        onClick={() => setIsWishlistOpen(false)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-500">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-brand-navy text-base">Your Wishlist</h3>
                <p className="text-xs text-slate-500">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
              </div>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Heart className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">No saved products yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Save your favorite laptops, headphones, and consoles to your wishlist by clicking the heart icon.
                  </p>
                </div>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="bg-brand-blue text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-blueHover transition-colors"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-3">
                {wishlist.map((product) => (
                  <div key={product.id} className="pt-3 flex gap-3 group">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl bg-slate-50 p-2 border border-slate-200/80 shrink-0 flex items-center justify-center">
                      <img
                        src={product.primaryImage}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold text-brand-blue uppercase">
                            {product.brand?.name}
                          </span>
                          <button
                            onClick={() => toggleWishlist(product)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h5 className="text-xs font-semibold text-brand-navy line-clamp-1">
                          {product.name}
                        </h5>
                        <span className="text-xs font-bold text-slate-800">
                          {formatPrice(product.sellingPrice)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => addToCart(product)}
                          className="bg-brand-blue hover:bg-brand-blueHover text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                        <Link
                          to={`/product/${product.slug}`}
                          onClick={() => setIsWishlistOpen(false)}
                          className="text-xs font-medium text-slate-500 hover:text-brand-blue px-2 py-1"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {wishlist.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/80">
              <Link
                to="/shop"
                onClick={() => setIsWishlistOpen(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

