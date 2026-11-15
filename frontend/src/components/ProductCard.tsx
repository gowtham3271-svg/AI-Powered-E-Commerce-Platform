import React from 'react';
import { ShoppingCart, Sparkles, Layers, Check, Eye } from 'lucide-react';
import { Product } from '../types';
import { StarRating } from './StarRating';
import { useCart } from '../context/CartContext';
import { useChat } from '../context/ChatContext';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const { quickAsk, compareIds, toggleCompare } = useChat();

  const isCompared = compareIds.includes(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
    } catch (err: any) {
      alert(err.message || 'Please log in to add items to your cart.');
    }
  };

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    quickAsk(`Tell me about the ${product.brand} ${product.name}. What are its main technical specifications, pros, and cons?`);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompare(product.id);
  };

  // Extract key specs for mini tags
  const specTags = product.specifications
    ? Object.entries(product.specifications)
        .slice(0, 2)
        .map(([k, v]) => `${k}: ${v}`)
    : [];

  return (
    <div 
      onClick={() => onSelect(product.id)}
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group flex flex-col justify-between border border-slate-800/80 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden flex items-center justify-center">
        <ImageWithFallback
          src={product.image_url}
          alt={product.name}
          categoryName={product.category_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Stock Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-rose-500/90 text-white backdrop-blur-md shadow-md">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-500/90 text-white backdrop-blur-md shadow-md animate-pulse">
              Only {product.stock_quantity} Left
            </span>
          ) : (
            <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-500/90 text-white backdrop-blur-md shadow-md">
              In Stock
            </span>
          )}
        </div>

        {/* Compare Toggle Button */}
        <button
          onClick={handleToggleCompare}
          title={isCompared ? 'Remove from compare' : 'Add to compare matrix'}
          className={`absolute top-3 right-3 p-2 rounded-xl text-xs font-medium transition-all shadow-md z-10 backdrop-blur-md ${
            isCompared 
              ? 'bg-brand-600 text-white ring-2 ring-brand-400' 
              : 'bg-slate-950/70 hover:bg-slate-900 text-slate-300 border border-slate-700/80'
          }`}
        >
          {isCompared ? <Check size={14} className="stroke-[2.5]" /> : <Layers size={14} />}
        </button>

        {/* Quick View Hover Pill */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/95 text-white text-xs font-semibold shadow-xl border border-slate-700 backdrop-blur-md">
            <Eye size={13} className="text-brand-400" /> View Details
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5">
            <span className="uppercase tracking-widest text-brand-400 font-bold">{product.brand}</span>
            <span className="text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full text-[10px]">{product.category_name}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Spec Tags */}
          {specTags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {specTags.map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/70 text-slate-300 border border-slate-700/50 line-clamp-1 max-w-[180px]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Rating */}
          <div className="mt-3 flex items-center gap-1.5">
            <StarRating rating={product.average_rating || 0} size={13} showValue />
            <span className="text-[11px] text-slate-500">
              ({product.review_count || 0} reviews)
            </span>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block leading-tight font-medium">Price</span>
            <span className="text-lg font-black text-white tracking-tight">
              ₹{(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Ask AI button */}
            <button
              onClick={handleAskAI}
              title="Ask AI Shopping Assistant about this product"
              className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles size={16} />
            </button>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                isOutOfStock
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-500 active:scale-95 text-white shadow-lg shadow-brand-600/30 hover:shadow-brand-500/50'
              }`}
              title={isOutOfStock ? 'Currently out of stock' : 'Add to shopping cart'}
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
