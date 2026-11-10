import React, { useEffect, useState } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { CategorySection } from '../components/CategorySection';
import { ProductSection } from '../components/ProductSection';
import { FeaturedBrandsSection } from '../components/FeaturedBrandsSection';
import { WhyChooseUsSection } from '../components/WhyChooseUsSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { NewsletterSection } from '../components/NewsletterSection';
import { QuickViewModal } from '../components/QuickViewModal';
import {
  getCategories,
  getBrands,
  getBanners,
  getTestimonials,
  getProducts,
} from '../services/api';
import { Category, Brand, Banner, Testimonial, Product } from '../types';
import { Loader2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [latestArrivals, setLatestArrivals] = useState<Product[]>([]);
  const [specialOffers, setSpecialOffers] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);

        const [
          catRes,
          brandRes,
          bannerRes,
          testRes,
          featuredRes,
          bestSellerRes,
          latestRes,
          offerRes,
        ] = await Promise.all([
          getCategories().catch(() => []),
          getBrands(true).catch(() => []),
          getBanners().catch(() => []),
          getTestimonials().catch(() => []),
          getProducts({ featured: true, limit: 4 }).catch(() => ({ data: [] })),
          getProducts({ bestSeller: true, limit: 4 }).catch(() => ({ data: [] })),
          getProducts({ latestArrival: true, limit: 4 }).catch(() => ({ data: [] })),
          getProducts({ specialOffer: true, limit: 4 }).catch(() => ({ data: [] })),
        ]);

        setCategories(catRes);
        setBrands(brandRes);
        setBanners(bannerRes);
        setTestimonials(testRes);

        setFeaturedProducts(featuredRes.data);
        setBestSellers(bestSellerRes.data);
        setLatestArrivals(latestRes.data);
        setSpecialOffers(offerRes.data);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Loading Showroom Showcase...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 8. Hero Banner */}
      <HeroBanner banners={banners} />

      {/* 9. Shop by Category */}
      <CategorySection categories={categories} />

      {/* 10. Featured Products */}
      <ProductSection
        title="Featured Tech Showpieces"
        badge="Flagship Collection"
        description="Our most innovative computing and audio hardware, handpicked by VOLTEDGE hardware specialists."
        products={featuredProducts}
        viewMoreLink="/shop?featured=true"
        viewMoreText="Explore All Featured"
        onQuickView={(p) => setQuickViewProduct(p)}
        bgColor="bg-white"
      />

      {/* 11. Best Sellers */}
      <ProductSection
        title="Best Sellers"
        badge="Community Favorites"
        description="Consistently rated 5 stars by audiophiles, software developers, and competitive gamers."
        products={bestSellers}
        viewMoreLink="/shop?bestSeller=true"
        viewMoreText="View All Best Sellers"
        onQuickView={(p) => setQuickViewProduct(p)}
        bgColor="bg-slate-50/70"
      />

      {/* 12. Latest Arrivals */}
      <ProductSection
        title="Latest Arrivals"
        badge="2026 Launches"
        description="Fresh off the production lines with next-generation neural silicon and upgraded acoustic drivers."
        products={latestArrivals}
        viewMoreLink="/shop?latestArrival=true"
        viewMoreText="See All New Releases"
        onQuickView={(p) => setQuickViewProduct(p)}
        bgColor="bg-white"
      />

      {/* 13. Special Offers */}
      <ProductSection
        title="Special Offers & Deals"
        badge="Limited Time Savings"
        description="Take advantage of exclusive showroom discounts and bundle promotions with instant manufacturer rebates."
        products={specialOffers}
        viewMoreLink="/shop?specialOffer=true"
        viewMoreText="Browse All Deals"
        onQuickView={(p) => setQuickViewProduct(p)}
        bgColor="bg-blue-50/40"
      />

      {/* 14. Featured Brands */}
      <FeaturedBrandsSection brands={brands} />

      {/* 15. Why Choose VOLTEDGE */}
      <WhyChooseUsSection />

      {/* 16. Customer Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 17. Newsletter Subscription */}
      <NewsletterSection />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
