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
  Scale,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { getProductByIdentifier } from '../services/api';
import { getProductReviews, submitProductReview } from '../services/customerApi';
import { Product } from '../types';
import { ProductReview } from '../types/customer';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Reviews State
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useCompare();
  const { isAuthenticated, customer } = useCustomerAuth();
  const { showToast } = useToast();

  const loadProductData = async () => {
    if (!slug) return;
    try {
      setIsLoading(true);
      const data = await getProductByIdentifier(slug);
      setProduct(data);
      setSelectedImage(data.primaryImage);
      // Load reviews
      const r = await getProductReviews(data.id);
      setReviews(r);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to load product', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!isAuthenticated) {
      showToast('Please log in to submit a product review', 'error');
      navigate('/login');
      return;
    }
    if (!reviewForm.comment.trim()) {
      showToast('Please write a review comment', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      await submitProductReview(product.id, reviewForm);
      showToast('Thank you! Your review has been published.');
      setReviewForm({ rating: 5, title: '', comment: '' });
      const updatedReviews = await getProductReviews(product.id);
      setReviews(updatedReviews);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Could not submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="text-2xl font-bold text-brand-navy">Product Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md">
          The requested electronic item could not be retrieved from the catalog.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const formatPrice = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-blue transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Showroom Products</span>
          </Link>
          <span className="text-xs font-medium text-slate-400">SKU: {product.sku}</span>
        </div>

        {/* Main Product Showcase Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Gallery Column */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="relative aspect-square rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/80 flex items-center justify-center group">
                <img
                  src={selectedImage || product.primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.discountPercentage && (
                  <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                    SAVE {product.discountPercentage}%
                  </div>
                )}
              </div>

              {/* Thumbnail Selector */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto py-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImage === img
                          ? 'border-brand-blue shadow-md scale-95'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Information Column */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {product.brand?.name}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {product.category?.name}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight font-['Plus_Jakarta_Sans'] mb-3">
                  {product.name}
                </h1>

                {/* Rating & Review Counter */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {reviews.length} Verified Reviews
                  </span>
                </div>

                {/* Pricing Block */}
                <div className="flex items-baseline gap-3 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-3xl font-black text-brand-navy">
                    {formatPrice(product.sellingPrice)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-base font-semibold text-slate-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 ml-auto font-medium">
                    Inclusive of all taxes & warranty
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Stock Status Indicator */}
                <div className="flex items-center gap-2 mb-6">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      product.stockQuantity > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      product.stockQuantity > 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {product.stockQuantity > 0
                      ? `In Stock (${product.stockQuantity} units available at showroom)`
                      : 'Out of Stock'}
                  </span>
                </div>

                {/* Actions & Quantity */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shrink-0">
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
                      onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                      className="px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addToCart(product, quantity)}
                    disabled={product.stockQuantity === 0}
                    className="w-full sm:flex-1 bg-brand-blue hover:bg-brand-blueHover text-white py-3 px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 transition-all active:scale-95 disabled:opacity-50"
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

                  {/* Add to Compare Button */}
                  <button
                    onClick={() => addToCompare(product)}
                    className={`p-3 rounded-xl border transition-all ${
                      inCompare
                        ? 'bg-cyan-50 text-cyan-600 border-cyan-300'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                    title="Compare Product"
                  >
                    <Scale className="w-5 h-5" />
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
                  <span>Official Manufacturer Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Showroom Trial & Support</span>
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

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-bold text-brand-navy font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-blue" />
                <span>Customer Reviews & Ratings ({reviews.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Real feedback from verified VOLTEDGE customers
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-3xl font-black text-brand-navy">{product.rating}</div>
              <div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.rating) ? 'fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-slate-400">Based on verified reviews</div>
              </div>
            </div>
          </div>

          {/* Review Submission Form */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-6 mb-8">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Write a Customer Review</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Your Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewForm.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Review Headline (Optional)"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-blue"
                />
              </div>

              <textarea
                rows={3}
                required
                placeholder="Share your experience with this device's performance, build, and features..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-blue"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blueHover text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No customer reviews yet. Be the first to share your thoughts on this device!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-slate-50/60 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                        {rev.customer?.firstName?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{rev.customer?.firstName} {rev.customer?.lastName}</span>
                          {rev.isVerifiedPurchase && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {rev.title && <h5 className="text-xs font-bold text-slate-800 mb-1">{rev.title}</h5>}
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

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
