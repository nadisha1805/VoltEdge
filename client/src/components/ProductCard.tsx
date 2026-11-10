import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);
  const isInCart = cart.some((item) => item.product.id === product.id);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-brand-blue/30 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.discountPercentage && product.discountPercentage > 0 && (
          <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wide">
            -{product.discountPercentage}% OFF
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-brand-navy text-white text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shadow-sm">
            Featured
          </span>
        )}
        {product.isBestSeller && !product.discountPercentage && (
          <span className="bg-amber-500 text-slate-900 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm">
            Best Seller
          </span>
        )}
      </div>

      {/* Floating Action Buttons: Wishlist & Quick View */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          aria-label={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isFavorited
              ? 'bg-rose-50 text-rose-500 border border-rose-200'
              : 'bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500 border border-slate-200/60'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
        </button>

        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
            aria-label="Quick View"
            className="p-2 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-brand-blue border border-slate-200/60 shadow-sm opacity-0 group-hover:opacity-100 transition-all hidden sm:block"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Product Image */}
      <Link
        to={`/product/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-slate-50 p-6 flex items-center justify-center cursor-pointer"
      >
        <img
          src={product.primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </Link>

      {/* Product Details Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & Stock Status */}
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
            <span className="font-semibold text-brand-blue uppercase tracking-wider text-[11px]">
              {product.brand?.name || 'VOLTEDGE'}
            </span>

            {/* Stock Availability */}
            {product.stockStatus === 'IN_STOCK' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                In Stock
              </span>
            ) : product.stockStatus === 'LOW_STOCK' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Only {product.stockQuantity} left
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-brand-navy hover:text-brand-blue line-clamp-2 text-sm leading-snug mb-2 transition-colors">
            <Link to={`/product/${product.slug}`} title={product.name}>
              {product.name}
            </Link>
          </h3>

          {/* Star Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-700">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          {/* Pricing */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-brand-navy font-['Plus_Jakarta_Sans']">
                {formatPrice(product.sellingPrice)}
              </span>
            </div>
            {product.originalPrice && product.originalPrice > product.sellingPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => addToCart(product)}
            disabled={product.stockStatus === 'OUT_OF_STOCK'}
            aria-label={`Add ${product.name} to cart`}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              product.stockStatus === 'OUT_OF_STOCK'
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isInCart
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-brand-blue text-white hover:bg-brand-blueHover active:scale-95'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>In Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
