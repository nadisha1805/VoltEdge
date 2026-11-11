import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowLeft, ShoppingCart, Check, X, Shield } from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 py-24 px-4 flex items-center justify-center text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-white mb-2">No Products in Comparison</h2>
          <p className="text-xs text-slate-400 mb-6">
            Compare specs, pricing, and warranties side-by-side to find the perfect electronics for your setup.
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl text-xs"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // Gather unique specification keys across compared products
  const allSpecKeys = Array.from(
    new Set(
      compareList.flatMap((p) => (p.specifications ? Object.keys(p.specifications) : []))
    )
  );

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-semibold mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Product Comparison Matrix ({compareList.length}/4)
            </h1>
          </div>

          <button
            onClick={clearCompare}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
          >
            Clear All
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-4 w-48 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60 sticky left-0">
                  Feature / Spec
                </th>
                {compareList.map((prod) => (
                  <th key={prod.id} className="p-4 min-w-[220px] text-left align-top">
                    <div className="relative">
                      <button
                        onClick={() => removeFromCompare(prod.id)}
                        className="absolute top-0 right-0 p-1 text-slate-400 hover:text-rose-400"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="w-24 h-24 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden mb-3">
                        <img
                          src={prod.primaryImage}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="text-xs text-cyan-400 font-semibold uppercase">{prod.brand?.name}</div>
                      <Link
                        to={`/product/${prod.slug}`}
                        className="text-sm font-bold text-white hover:text-cyan-400 line-clamp-2 mt-0.5"
                      >
                        {prod.name}
                      </Link>

                      <div className="text-base font-black text-white mt-2">
                        ₹{prod.sellingPrice.toLocaleString('en-IN')}
                      </div>

                      <button
                        onClick={() => addToCart(prod)}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-xs">
              {/* Category */}
              <tr>
                <td className="p-4 font-bold text-slate-300 bg-slate-950/40 sticky left-0">Category</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-4 text-slate-300">
                    {p.category?.name || 'Electronics'}
                  </td>
                ))}
              </tr>

              {/* SKU */}
              <tr>
                <td className="p-4 font-bold text-slate-300 bg-slate-950/40 sticky left-0">SKU / Model</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-4 text-slate-400 font-mono">
                    {p.sku}
                  </td>
                ))}
              </tr>

              {/* Availability */}
              <tr>
                <td className="p-4 font-bold text-slate-300 bg-slate-950/40 sticky left-0">Availability</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-4">
                    {p.stockQuantity > 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <Check className="w-3.5 h-3.5" /> In Stock ({p.stockQuantity} units)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                        <X className="w-3.5 h-3.5" /> Out of Stock
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr>
                <td className="p-4 font-bold text-slate-300 bg-slate-950/40 sticky left-0">Rating</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-4 text-slate-300">
                    ⭐ {p.rating} / 5 ({p.reviewCount} reviews)
                  </td>
                ))}
              </tr>

              {/* Dynamic Technical Specifications */}
              {allSpecKeys.map((key) => (
                <tr key={key}>
                  <td className="p-4 font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40 sticky left-0">
                    {key}
                  </td>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-4 text-slate-300">
                      {p.specifications?.[key] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

