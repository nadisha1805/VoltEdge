export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  featured?: boolean;
  productCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  featured?: boolean;
  displayOrder?: number;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brandId: string;
  brand: Brand;
  categoryId: string;
  category: Category;
  description: string;
  shortDescription?: string;
  sellingPrice: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  stockQuantity: number;
  images: string[];
  primaryImage: string;
  tags?: string;
  specifications?: Record<string, string>;
  isFeatured: boolean;
  isBestSeller: boolean;
  isLatestArrival: boolean;
  isSpecialOffer: boolean;
  createdAt: string;
  updatedAt: string;
  relatedProducts?: Product[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  bgGradient?: string;
  active: boolean;
  displayOrder: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

