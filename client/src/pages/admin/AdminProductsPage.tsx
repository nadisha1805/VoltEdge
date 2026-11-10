import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Upload,
  X,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Eye,
  Star,
} from 'lucide-react';
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  uploadProductImages,
  getAdminCategories,
  getAdminBrands,
} from '../../services/adminApi';
import { Product, Category, Brand } from '../../types';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    brandId: '',
    categoryId: '',
    description: '',
    shortDescription: '',
    sellingPrice: '',
    costPrice: '',
    originalPrice: '',
    stockQuantity: '15',
    warrantyInfo: '1 Year Brand Warranty',
    primaryImage: '',
    images: [] as string[],
    tags: '',
    specifications: {} as Record<string, string>,
    isFeatured: false,
    isBestSeller: false,
    isLatestArrival: false,
    isSpecialOffer: false,
  });

  // Specs helper inputs
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  const fetchDropdowns = async () => {
    try {
      const [cats, brs] = await Promise.all([getAdminCategories(), getAdminBrands()]);
      setCategories(cats);
      setBrands(brs);
    } catch (e) {
      console.error('Failed to load categories/brands:', e);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const res = await getAdminProducts({
        search,
        category: selectedCategory,
        brand: selectedBrand,
        stockStatus: selectedStockStatus,
        sort: sortBy,
        page,
        limit: 10,
      });
      setProducts(res.data);
      setTotalCount(res.pagination.totalCount);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory, selectedBrand, selectedStockStatus, sortBy, page]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingProductId(null);
    setFormData({
      name: '',
      slug: '',
      sku: `VOLT-${Date.now().toString().slice(-5)}`,
      brandId: brands[0]?.id || '',
      categoryId: categories[0]?.id || '',
      description: '',
      shortDescription: '',
      sellingPrice: '',
      costPrice: '',
      originalPrice: '',
      stockQuantity: '15',
      warrantyInfo: '1 Year Official Brand Warranty',
      primaryImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'],
      tags: 'premium, showroom, flagship',
      specifications: { Connectivity: 'Wireless & Bluetooth', Color: 'Matte Titanium' },
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: true,
      isSpecialOffer: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setIsEditing(true);
    setEditingProductId(p.id);

    let parsedSpecs: Record<string, string> = {};
    if (typeof p.specifications === 'object') {
      parsedSpecs = p.specifications as Record<string, string>;
    }

    setFormData({
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      brandId: p.brandId,
      categoryId: p.categoryId,
      description: p.description,
      shortDescription: p.shortDescription || '',
      sellingPrice: p.sellingPrice.toString(),
      costPrice: (p as any).costPrice?.toString() || Math.round(p.sellingPrice * 0.72).toString(),
      originalPrice: p.originalPrice ? p.originalPrice.toString() : '',
      stockQuantity: p.stockQuantity.toString(),
      warrantyInfo: (p as any).warrantyInfo || '1 Year Official Brand Warranty',
      primaryImage: p.primaryImage,
      images: Array.isArray(p.images) ? p.images : [p.primaryImage],
      tags: p.tags || '',
      specifications: parsedSpecs,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isLatestArrival: p.isLatestArrival,
      isSpecialOffer: p.isSpecialOffer,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.brandId || !formData.categoryId || !formData.sellingPrice) {
      alert('Please fill out all mandatory fields (Name, SKU, Brand, Category, Price).');
      return;
    }

    try {
      setIsSaving(true);
      if (isEditing && editingProductId) {
        await updateAdminProduct(editingProductId, formData);
      } else {
        await createAdminProduct(formData);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      const res = await deleteAdminProduct(deleteId);
      setDeleteId(null);
      if (res.archived) {
        alert('Product has historical order references and was safely archived.');
      }
      loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddSpec = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim(),
        },
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const handleRemoveSpec = (keyToRemove: string) => {
    setFormData((prev) => {
      const nextSpecs = { ...prev.specifications };
      delete nextSpecs[keyToRemove];
      return { ...prev, specifications: nextSpecs };
    });
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()],
        primaryImage: prev.primaryImage || imageUrlInput.trim(),
      }));
      setImageUrlInput('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingImages(true);
      const uploadedUrls = await uploadProductImages(Array.from(files));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
        primaryImage: prev.primaryImage || uploadedUrls[0],
      }));
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'Error'));
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Product Catalog Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Displaying {products.length} of {totalCount} showroom electronics models.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blueHover text-white text-xs font-bold shadow-md shadow-brand-blue/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, SKU, brand..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-medium"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Brand Filter */}
        <select
          value={selectedBrand}
          onChange={(e) => {
            setSelectedBrand(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-medium"
        >
          <option value="all">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Stock Status Filter */}
        <select
          value={selectedStockStatus}
          onChange={(e) => {
            setSelectedStockStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-medium"
        >
          <option value="all">All Stock Statuses</option>
          <option value="IN_STOCK">In Stock (&gt; 5)</option>
          <option value="LOW_STOCK">Low Stock (1 - 5)</option>
          <option value="OUT_OF_STOCK">Out of Stock (0)</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-medium"
        >
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="stock-desc">Stock: High to Low</option>
          <option value="stock-asc">Stock: Low to High</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Stock Qty</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-blue" />
                    Loading product catalog...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.primaryImage}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-slate-900 truncate" title={p.name}>
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            {p.isFeatured && (
                              <span className="text-amber-600 font-bold flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-500" /> Featured
                              </span>
                            )}
                            <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600">{p.sku}</td>
                    <td className="py-3 px-4 font-medium">{p.brand?.name}</td>
                    <td className="py-3 px-4 font-medium">{p.category?.name}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{p.sellingPrice.toLocaleString()}
                      {p.originalPrice && p.originalPrice > p.sellingPrice && (
                        <span className="block text-[10px] text-slate-400 line-through">
                          ₹{p.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{p.stockQuantity}</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.stockStatus} type="stock" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/product/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View on Storefront"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Product"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(p.id);
                            setDeleteName(p.name);
                          }}
                          title="Delete or Archive Product"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No products matched your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page <strong className="text-slate-800">{page}</strong> of{' '}
            <strong className="text-slate-800">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  {isEditing ? 'Edit Product Profile' : 'Add New Showroom Product'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure hardware details, pricing, stock levels, and gallery images.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apple MacBook Pro 16 M3 Max"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. APL-MBP16-01"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    URL Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-if-empty"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Brand *
                  </label>
                  <select
                    required
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none font-medium"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none font-medium"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="349990"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="250000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none bg-white"
                  />
                  <span className="text-[10px] text-slate-400">For inventory valuation</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Compare Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="399990"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="15"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none bg-white font-bold"
                  />
                </div>
              </div>

              {/* Warranty & Short Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Warranty Information
                  </label>
                  <input
                    type="text"
                    value={formData.warrantyInfo}
                    onChange={(e) => setFormData({ ...formData, warrantyInfo: e.target.value })}
                    placeholder="e.g. 2 Years AppleCare+ included"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="gaming, 4k, oled, premium"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Short Summary (Hero / Catalog Subtitle)
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief 1-line feature highlight for showroom display cards"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Comprehensive product specifications, features, and in-box items..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-brand-blue outline-none"
                  />
                </div>
              </div>

              {/* Hardware Specifications Manager */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Hardware Specifications Key-Values
                </span>
                <div className="flex flex-wrap gap-2 mb-3">
                  {Object.entries(formData.specifications).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <strong className="text-slate-800">{k}:</strong>
                      <span className="text-slate-600">{v}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(k)}
                        className="text-slate-400 hover:text-rose-600 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    placeholder="Spec Name (e.g. RAM, GPU, Battery)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white outline-none"
                  />
                  <input
                    type="text"
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    placeholder="Spec Value (e.g. 64GB Unified, RTX 4090)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Image Management */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Gallery & Primary Images
                  </span>
                  <label className="cursor-pointer text-xs font-semibold text-brand-blue hover:underline flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Local Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadingImages && (
                  <div className="p-2 bg-blue-50 text-brand-blue text-xs rounded-lg flex items-center gap-2 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading image files to static storage...
                  </div>
                )}

                {/* Image Previews */}
                <div className="flex flex-wrap gap-3">
                  {formData.images.map((imgUrl, i) => (
                    <div
                      key={i}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 group ${
                        formData.primaryImage === imgUrl ? 'border-brand-blue ring-2 ring-brand-blue/30' : 'border-slate-200'
                      }`}
                    >
                      <img src={imgUrl} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                      {formData.primaryImage === imgUrl && (
                        <span className="absolute bottom-1 left-1 right-1 bg-brand-blue text-white text-[8px] font-bold text-center py-0.5 rounded shadow">
                          PRIMARY
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, primaryImage: imgUrl })}
                          title="Set as Primary"
                          className="p-1 bg-brand-blue text-white rounded text-[10px]"
                        >
                          <Star className="w-3 h-3 fill-white" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              images: formData.images.filter((_, idx) => idx !== i),
                              primaryImage:
                                formData.primaryImage === imgUrl
                                  ? formData.images.filter((_, idx) => idx !== i)[0] || ''
                                  : formData.primaryImage,
                            })
                          }
                          title="Remove Image"
                          className="p-1 bg-rose-600 text-white rounded text-[10px]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Image via URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Or paste external image URL (https://...)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Showroom Marketing Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-brand-blue"
                  />
                  <span className="text-xs font-semibold text-slate-700">Featured</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="rounded text-brand-blue"
                  />
                  <span className="text-xs font-semibold text-slate-700">Best Seller</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isLatestArrival}
                    onChange={(e) => setFormData({ ...formData, isLatestArrival: e.target.checked })}
                    className="rounded text-brand-blue"
                  />
                  <span className="text-xs font-semibold text-slate-700">Latest Tech</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSpecialOffer}
                    onChange={(e) => setFormData({ ...formData, isSpecialOffer: e.target.checked })}
                    className="rounded text-brand-blue"
                  />
                  <span className="text-xs font-semibold text-slate-700">Special Offer</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-brand-blueHover rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Confirm Product Deletion / Archival"
        message={`Are you sure you want to remove "${deleteName}"? If this item has existing customer order records, it will be safely soft-archived rather than permanently deleted.`}
        confirmLabel={isDeleting ? 'Processing...' : 'Proceed with Removal'}
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

