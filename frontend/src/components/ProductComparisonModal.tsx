import React, { useState, useEffect } from 'react';
import { X, Layers, Sparkles, ShoppingCart, Trash2, Check, ArrowRight } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import { ProductComparison } from '../types';

export const ProductComparisonModal: React.FC = () => {
  const { compareIds, toggleCompare, clearCompare, isComparing, setIsComparing, quickAsk } = useChat();
  const { addToCart } = useCart();
  const [data, setData] = useState<ProductComparison | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isComparing && compareIds.length >= 2) {
      setLoading(true);
      api.compareProducts(compareIds)
        .then(res => setData(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isComparing, compareIds]);

  if (!isComparing) return null;

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
    } catch (err: any) {
      alert(err.message || 'Please log in to add items to your cart.');
    }
  };

  const handleAskVerdict = () => {
    if (!data || data.products.length < 2) return;
    const names = data.products.map(p => `${p.brand} ${p.name}`).join(' vs ');
    setIsComparing(false);
    quickAsk(`Compare ${names}. Which one offers better value for money and which one should I buy based on specifications?`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => setIsComparing(false)} 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-fade-in">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-brand-400" />
            <h2 className="text-base font-bold text-white">Product Technical Comparison</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {compareIds.length} items selected
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAskVerdict}
              disabled={compareIds.length < 2}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all"
            >
              <Sparkles size={14} />
              <span>Ask AI Verdict</span>
            </button>

            <button
              onClick={clearCompare}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={13} /> Clear
            </button>

            <button
              onClick={() => setIsComparing(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6">
          {compareIds.length < 2 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Layers size={24} />
              </div>
              <p className="text-sm font-semibold text-white">Select at least 2 products to compare</p>
              <p className="text-xs text-slate-400">Click the compare checkbox on any product card in the catalog.</p>
            </div>
          ) : loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading specs comparison matrix...</p>
            </div>
          ) : data && data.products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="p-3 w-40 text-slate-400 font-semibold uppercase text-[11px] bg-slate-950/40">
                      Product
                    </th>
                    {data.products.map(p => (
                      <th key={p.id} className="p-3 min-w-[220px] align-top bg-slate-950/20">
                        <div className="relative group">
                          <button
                            onClick={() => toggleCompare(p.id)}
                            className="absolute -top-1 -right-1 text-slate-500 hover:text-rose-400 p-1"
                            title="Remove from comparison"
                          >
                            <X size={14} />
                          </button>
                          <img
                            src={p.image_url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'}
                            alt={p.name}
                            className="w-full h-32 object-cover rounded-xl bg-slate-900 border border-slate-800 mb-2"
                          />
                          <p className="text-[10px] text-brand-400 uppercase font-bold">{p.brand}</p>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{p.name}</h4>
                          <p className="text-base font-extrabold text-white mt-1">
                            ₹{(p.price || 0).toLocaleString('en-IN')}
                          </p>
                          <button
                            onClick={() => handleAddToCart(p.id)}
                            disabled={p.stock_quantity <= 0}
                            className="mt-2 w-full py-1.5 px-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <ShoppingCart size={13} /> Add to Cart
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60">
                  {/* Stock Row */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40">Inventory Status</td>
                    {data.products.map(p => (
                      <td key={p.id} className="p-3 font-medium">
                        {p.stock_quantity > 0 ? (
                          <span className="text-emerald-400 font-semibold">In Stock ({p.stock_quantity} left)</span>
                        ) : (
                          <span className="text-rose-400 font-semibold">Out of Stock</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Rating Row */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40">Customer Rating</td>
                    {data.products.map(p => (
                      <td key={p.id} className="p-3 font-medium text-slate-200">
                        ⭐ {(p.average_rating || 0).toFixed(1)} / 5.0 ({p.review_count || 0} reviews)
                      </td>
                    ))}
                  </tr>

                  {/* Specifications rows */}
                  {Object.entries(data.differences).map(([specKey, valuesByProduct]) => {
                    if (specKey === 'Price (INR)' || specKey === 'Stock Status') return null;
                    return (
                      <tr key={specKey} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 whitespace-nowrap">
                          {specKey}
                        </td>
                        {data.products.map(p => (
                          <td key={p.id} className="p-3 text-slate-300 leading-relaxed font-mono text-[11px]">
                            {valuesByProduct[p.name] || 'N/A'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
};
