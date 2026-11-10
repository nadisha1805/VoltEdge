import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const currentImage = selectedImage || product.primaryImage;
  const isFavorited = isInWishlist(product.id);

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.primaryImage];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Images */}
          <div className="bg-slate-50 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white p-4 flex items-center justify-center border border-slate-200/60 shadow-sm">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl border-2 p-1 bg-white shrink-0 transition-all ${
                      currentImage === img
                        ? 'border-brand-blue shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div>
              {/* Category & Brand */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-brand-blue uppercase tracking-wider">
                  {product.brand?.name}
                </span>
                <span>SKU: {product.sku}</span>
              </div>

              <h2 className="text-xl font-bold text-brand-navy leading-snug">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 my-2">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <span className="text-sm font-bold text-slate-800">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-400">({product.reviewCount} customer reviews)</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 my-3">
                <span className="text-2xl font-extrabold text-brand-navy font-['Plus_Jakarta_Sans']">
                  {formatPrice(product.sellingPrice)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.discountPercentage && (
                  <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Save {product.discountPercentage}%
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-4">
                {product.shortDescription || product.description}
              </p>

              {/* Key Specs Pills if present */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-4 text-xs space-y-1.5">
                  {Object.entries(product.specifications).slice(0, 3).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-500 font-medium">{key}:</span>
                      <span className="text-slate-800 font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stock status */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-slate-500">Availability:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {product.stockStatus === 'IN_STOCK' ? 'Ready to Ship / In Stock' : 'Limited Stock'}
                </span>
              </div>
            </div>

            {/* Actions: Quantity & Add to Cart */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity input */}
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-200 font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-200 font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-brand-blue hover:bg-brand-blueHover text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart ({formatPrice(product.sellingPrice * quantity)})
                </button>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(product)}
                  aria-label="Toggle Wishlist"
                  className={`p-2.5 rounded-xl border transition-all ${
                    isFavorited
                      ? 'bg-rose-50 text-rose-500 border-rose-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              {/* View full product page link */}
              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="block text-center text-xs font-semibold text-brand-blue hover:underline py-1 flex items-center justify-center gap-1 group"
              >
                View Complete Specifications & Gallery
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

