import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Filter,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Check,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { getProducts, getCategories, getBrands } from '../services/api';
import { Product, Category, Brand } from '../types';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Active Filters synced from query params
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || 'all';
  const currentBrand = searchParams.get('brand') || 'all';
  const currentSort = searchParams.get('sort') || 'featured';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentInStock = searchParams.get('inStock') === 'true';
  const currentFeatured = searchParams.get('featured') === 'true';
  const currentBestSeller = searchParams.get('bestSeller') === 'true';
  const currentLatestArrival = searchParams.get('latestArrival') === 'true';
  const currentSpecialOffer = searchParams.get('specialOffer') === 'true';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Local inputs for search and price range
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  // Fetch Categories & Brands once on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cats, brds] = await Promise.all([getCategories(), getBrands()]);
        setCategories(cats);
        setBrands(brds);
      } catch (err) {
        console.error('Failed to load categories/brands', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Products whenever query params change
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsLoading(true);
        const params: any = {
          page: currentPage,
          limit: 12,
          sort: currentSort,
        };

        if (currentSearch) params.search = currentSearch;
        if (currentCategory && currentCategory !== 'all') params.category = currentCategory;
        if (currentBrand && currentBrand !== 'all') params.brand = currentBrand;
        if (currentMinPrice) params.minPrice = parseFloat(currentMinPrice);
        if (currentMaxPrice) params.maxPrice = parseFloat(currentMaxPrice);
        if (currentInStock) params.inStock = true;
        if (currentFeatured) params.featured = true;
        if (currentBestSeller) params.bestSeller = true;
        if (currentLatestArrival) params.latestArrival = true;
        if (currentSpecialOffer) params.specialOffer = true;

        const res = await getProducts(params);
        setProducts(res.data);
        setPagination(res.pagination);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, [
    currentSearch,
    currentCategory,
    currentBrand,
    currentSort,
    currentMinPrice,
    currentMaxPrice,
    currentInStock,
    currentFeatured,
    currentBestSeller,
    currentLatestArrival,
    currentSpecialOffer,
    currentPage,
  ]);

  // Sync inputs with url
  useEffect(() => {
    setSearchInput(currentSearch);
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }, [currentSearch, currentMinPrice, currentMaxPrice]);

  // Update query params helper
  const updateFilter = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '' || val === 'all') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    });

    // Reset to page 1 on filter changes (unless page itself is changing)
    if (!('page' in updates)) {
      nextParams.delete('page');
    }

    setSearchParams(nextParams);
  };

  // Handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter({ search: searchInput.trim() || null });
  };

  const handlePriceApply = () => {
    updateFilter({
      minPrice: minPriceInput ? minPriceInput : null,
      maxPrice: maxPriceInput ? maxPriceInput : null,
    });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams(new URLSearchParams());
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (currentSearch) count++;
    if (currentCategory !== 'all') count++;
    if (currentBrand !== 'all') count++;
    if (currentMinPrice || currentMaxPrice) count++;
    if (currentInStock) count++;
    if (currentFeatured) count++;
    if (currentBestSeller) count++;
    if (currentLatestArrival) count++;
    if (currentSpecialOffer) count++;
    return count;
  }, [
    currentSearch,
    currentCategory,
    currentBrand,
    currentMinPrice,
    currentMaxPrice,
    currentInStock,
    currentFeatured,
    currentBestSeller,
    currentLatestArrival,
    currentSpecialOffer,
  ]);

  return (
    <div className="bg-[#F7F9FC] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link to="/" className="hover:text-brand-blue">Home</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Showroom Catalog</span>
            {currentCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-brand-blue font-semibold capitalize">
                  {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                </span>
              </>
            )}
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-['Plus_Jakarta_Sans']">
                {currentCategory !== 'all'
                  ? categories.find((c) => c.slug === currentCategory)?.name || 'Category Catalog'
                  : currentSpecialOffer
                  ? 'Special Offers & Deals'
                  : 'All Showroom Products'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Showing {products.length} of {pagination.totalCount} precision electronics
              </p>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
              <span>Filters ({activeFilterCount})</span>
            </button>
          </div>
        </div>

        {/* Top Control Bar: Search & Sorting */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Catalog Search input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by model, brand, or specs..."
              className="w-full pl-10 pr-24 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-brand-blue focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-brand-navy hover:bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-semibold"
            >
              Search
            </button>
          </form>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <label htmlFor="sort-select" className="text-xs text-slate-500 whitespace-nowrap font-medium">
              Sort by:
            </label>
            <div className="relative">
              <select
                id="sort-select"
                value={currentSort}
                onChange={(e) => updateFilter({ sort: e.target.value })}
                className="appearance-none bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:border-brand-blue cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Biggest Savings</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              Active Filters:
            </span>

            {currentSearch && (
              <span className="inline-flex items-center gap-1.5 bg-brand-blueLight text-brand-blue border border-brand-blue/30 text-xs px-3 py-1 rounded-full font-medium">
                Search: "{currentSearch}"
                <button onClick={() => updateFilter({ search: null })} className="hover:text-brand-blueHover">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {currentCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-brand-blueLight text-brand-blue border border-brand-blue/30 text-xs px-3 py-1 rounded-full font-medium">
                Category: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                <button onClick={() => updateFilter({ category: null })} className="hover:text-brand-blueHover">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {currentBrand !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-brand-blueLight text-brand-blue border border-brand-blue/30 text-xs px-3 py-1 rounded-full font-medium">
                Brand: {currentBrand}
                <button onClick={() => updateFilter({ brand: null })} className="hover:text-brand-blueHover">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {(currentMinPrice || currentMaxPrice) && (
              <span className="inline-flex items-center gap-1.5 bg-brand-blueLight text-brand-blue border border-brand-blue/30 text-xs px-3 py-1 rounded-full font-medium">
                Price: ${currentMinPrice || '0'} - ${currentMaxPrice || 'Max'}
                <button onClick={() => updateFilter({ minPrice: null, maxPrice: null })} className="hover:text-brand-blueHover">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {currentInStock && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded-full font-medium">
                In Stock Only
                <button onClick={() => updateFilter({ inStock: null })} className="hover:text-emerald-900">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {currentSpecialOffer && (
              <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs px-3 py-1 rounded-full font-medium">
                Special Offers Only
                <button onClick={() => updateFilter({ specialOffer: null })} className="hover:text-rose-900">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-500 hover:text-rose-700 font-bold underline ml-2"
            >
              Clear All ({activeFilterCount})
            </button>
          </div>
        )}

        {/* Main Grid: Sidebar Filters + Product List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-brand-blue" />
                  <h3 className="font-bold text-brand-navy text-sm">Filters</h3>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-slate-400 hover:text-rose-500 font-medium"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Categories
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => updateFilter({ category: 'all' })}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      currentCategory === 'all'
                        ? 'bg-brand-blue text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Departments</span>
                    <span>{pagination.totalCount}</span>
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter({ category: cat.slug })}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        currentCategory === cat.slug
                          ? 'bg-brand-blue text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="line-clamp-1">{cat.name}</span>
                      <span className={`text-[11px] ${currentCategory === cat.slug ? 'text-white' : 'text-slate-400'}`}>
                        {cat.productCount}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Brands
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => updateFilter({ brand: 'all' })}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                      currentBrand === 'all' ? 'text-brand-blue font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>All Brands</span>
                    {currentBrand === 'all' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => updateFilter({ brand: brand.slug })}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                        currentBrand === brand.slug ? 'text-brand-blue font-bold bg-blue-50/70' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{brand.name}</span>
                      {currentBrand === brand.slug && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Price Range ($ USD)
                </h4>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <button
                  onClick={handlePriceApply}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  Apply Price
                </button>
              </div>

              {/* Stock Availability Toggle */}
              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-bold text-slate-800">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={currentInStock}
                    onChange={(e) => updateFilter({ inStock: e.target.checked ? 'true' : null })}
                    className="w-4 h-4 rounded text-brand-blue border-slate-300 focus:ring-brand-blue cursor-pointer"
                  />
                </label>
              </div>

              {/* Quick Feature Toggles */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-slate-700">Special Offers Only</span>
                  <input
                    type="checkbox"
                    checked={currentSpecialOffer}
                    onChange={(e) => updateFilter({ specialOffer: e.target.checked ? 'true' : null })}
                    className="w-4 h-4 rounded text-brand-blue border-slate-300 focus:ring-brand-blue cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-slate-700">Best Sellers Only</span>
                  <input
                    type="checkbox"
                    checked={currentBestSeller}
                    onChange={(e) => updateFilter({ bestSeller: e.target.checked ? 'true' : null })}
                    className="w-4 h-4 rounded text-brand-blue border-slate-300 focus:ring-brand-blue cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-slate-700">Latest 2026 Models</span>
                  <input
                    type="checkbox"
                    checked={currentLatestArrival}
                    onChange={(e) => updateFilter({ latestArrival: e.target.checked ? 'true' : null })}
                    className="w-4 h-4 rounded text-brand-blue border-slate-300 focus:ring-brand-blue cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </aside>

          {/* Product Cards Catalog Area */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Loading Products...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <PackageSearch className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">No electronics match your criteria</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1">
                    Try adjusting your filters, clearing your search query, or resetting price thresholds.
                  </p>
                </div>
                <button
                  onClick={clearAllFilters}
                  className="bg-brand-blue text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-blueHover transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
                    <p className="text-xs text-slate-500">
                      Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.totalCount} products)
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateFilter({ page: String(pagination.page - 1) })}
                        disabled={!pagination.hasPrevPage}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>

                      {[...Array(pagination.totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => updateFilter({ page: String(pageNum) })}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                              pagination.page === pageNum
                                ? 'bg-brand-blue text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => updateFilter({ page: String(pagination.page + 1) })}
                        disabled={!pagination.hasNextPage}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Slideover Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="font-bold text-brand-navy text-base">Filter Catalog</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Categories */}
                <div className="py-4 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Category</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        updateFilter({ category: 'all' });
                        setIsMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${currentCategory === 'all' ? 'bg-brand-blue text-white font-bold' : 'text-slate-600'}`}
                    >
                      All Departments
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          updateFilter({ category: c.slug });
                          setIsMobileFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${currentCategory === c.slug ? 'bg-brand-blue text-white font-bold' : 'text-slate-600'}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Brands */}
                <div className="py-4 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Brand</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    <button
                      onClick={() => {
                        updateFilter({ brand: 'all' });
                        setIsMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${currentBrand === 'all' ? 'text-brand-blue font-bold' : 'text-slate-600'}`}
                    >
                      All Brands
                    </button>
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          updateFilter({ brand: b.slug });
                          setIsMobileFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${currentBrand === b.slug ? 'text-brand-blue font-bold' : 'text-slate-600'}`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Price */}
                <div className="py-4 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Price Range ($)</h4>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                  <button
                    onClick={() => {
                      handlePriceApply();
                      setIsMobileFilterOpen(false);
                    }}
                    className="w-full bg-slate-900 text-white py-1.5 rounded-lg text-xs font-semibold"
                  >
                    Apply Price
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-brand-blue text-white py-3 rounded-xl text-xs font-bold"
                >
                  View Results ({pagination.totalCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
