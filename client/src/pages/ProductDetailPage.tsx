import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Sparkles,
} from 'lucide-react';
import { getProductByIdentifier } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        setIsLoading(true);
        const data = await getProductByIdentifier(slug);
        setProduct(data);
        setSelectedImage(data.primaryImage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Loading Product Specifications...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-brand-navy mb-4">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested electronic device is unavailable or has been archived.
        </p>
        <Link
          to="/shop"
          className="bg-brand-blue text-white px-6 py-2.5 rounded-xl text-xs font-bold"
        >
          Return to Showroom
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const currentImage = selectedImage || product.primaryImage;
  const images = product.images && product.images.length > 0 ? product.images : [product.primaryImage];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Showroom product link copied to clipboard!');
    }
  };

  return (
    <div className="bg-[#F7F9FC] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation / Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-blue transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Product Overview Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Gallery Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="aspect-square bg-slate-50 rounded-2xl p-6 border border-slate-200/60 flex items-center justify-center relative overflow-hidden group">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                />
                {product.discountPercentage && (
                  <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    -{product.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-20 h-20 rounded-xl border-2 p-2 bg-slate-50 shrink-0 transition-all ${
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

            {/* Info & Purchasing Column (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                {/* Brand & Stock */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Link
                    to={`/shop?brand=${product.brand?.slug}`}
                    className="text-xs font-bold text-brand-blue uppercase tracking-wider hover:underline"
                  >
                    {product.brand?.name}
                  </Link>

                  {product.stockStatus === 'IN_STOCK' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      In Stock • Ready for Express Dispatch
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Low Stock • Only {product.stockQuantity} remaining
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-['Plus_Jakarta_Sans'] leading-tight mb-3">
                  {product.name}
                </h1>

                {/* Rating & SKU */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                    </div>
                    <span className="font-bold text-slate-800">{product.rating.toFixed(1)}</span>
                    <span>({product.reviewCount} customer reviews)</span>
                  </div>
                  <span>•</span>
                  <span>SKU: {product.sku}</span>
                  <span>•</span>
                  <span>Department: {product.category?.name}</span>
                </div>

                {/* Pricing Block */}
                <div className="py-4 flex items-baseline gap-4">
                  <span className="text-3xl sm:text-4xl font-extrabold text-brand-navy font-['Plus_Jakarta_Sans']">
                    {formatPrice(product.sellingPrice)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.sellingPrice && (
                    <span className="text-base text-slate-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {product.discountPercentage && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
                      You Save {formatPrice(product.originalPrice! - product.sellingPrice)} ({product.discountPercentage}%)
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Purchase Controls */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Quantity Picker */}
                    <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-sm">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="px-4 py-2.5 text-xs font-bold text-slate-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(product, quantity)}
                      className="w-full sm:flex-1 bg-brand-blue hover:bg-brand-blueHover text-white py-3 px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 transition-all active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart ({formatPrice(product.sellingPrice * quantity)})</span>
                    </button>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`p-3 rounded-xl border transition-all ${
                        isFavorited
                          ? 'bg-rose-50 text-rose-500 border-rose-200'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                      title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
                    >
                      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Service Guarantees */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-blue shrink-0" />
                    <span>Free Nationwide Express Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>2-Year Official Manufacturer Warranty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>30-Day Showroom Trial & Return</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications Section */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10 mb-12">
            <h3 className="text-xl font-bold text-brand-navy font-['Plus_Jakarta_Sans'] mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-blue" />
              <span>Full Technical Specifications</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs sm:text-sm"
                >
                  <span className="font-semibold text-slate-500">{key}</span>
                  <span className="font-bold text-slate-900 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-brand-navy font-['Plus_Jakarta_Sans']">
                Related Showroom Recommendations
              </h3>
              <Link
                to={`/shop?category=${product.category?.slug}`}
                className="text-xs font-bold text-brand-blue hover:underline"
              >
                View Category
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

