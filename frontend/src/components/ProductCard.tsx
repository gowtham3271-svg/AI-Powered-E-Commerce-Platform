import React, { useState } from 'react';
import { ShoppingCart, Sparkles, Layers, Check, Eye, Flame, ShieldCheck, Zap } from 'lucide-react';
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
  const [justAdded, setJustAdded] = useState(false);

  const isCompared = compareIds.includes(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const isBestseller = (product.average_rating || 0) >= 4.5;

  // Calculate realistic retail MRP (M.R.P.) to display strikethrough savings
  const calculateOriginalMRP = (sellingPrice: number): number => {
    // 20% to 28% markup rounded to nearest 99 or 49
    const markupFactor = 1.25;
    const raw = sellingPrice * markupFactor;
    return Math.round(raw / 100) * 100 - 1;
  };

  const mrp = calculateOriginalMRP(product.price);
  const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);
  const savings = mrp - product.price;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    } catch (err: any) {
      alert(err.message || 'Please log in to add items to your cart.');
    }
  };

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    quickAsk(`Tell me about the ${product.brand} ${product.name}. What are its key specifications, pros, and cons compared to alternatives?`);
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
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group flex flex-col justify-between border border-slate-800/80 hover:border-brand-500/60 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 relative bg-slate-900/60"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden flex items-center justify-center">
        <ImageWithFallback
          src={product.image_url}
          alt={product.name}
          categoryName={product.category_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Top Badges Stack */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {/* Bestseller Badge */}
          {isBestseller && !isOutOfStock && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-500 text-slate-950 shadow-md">
              <Flame size={12} className="fill-slate-950" /> Bestseller
            </span>
          )}

          {/* Stock Badges */}
          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-rose-500 text-white shadow-md">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-rose-600/90 text-white shadow-md animate-pulse">
              Only {product.stock_quantity} Left!
            </span>
          ) : null}
        </div>

        {/* Discount Tag */}
        {discountPercent > 0 && !isOutOfStock && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-500 text-slate-950 shadow-md">
              {discountPercent}% OFF
            </span>
          </div>
        )}

        {/* Compare Toggle Button */}
        <button
          onClick={handleToggleCompare}
          title={isCompared ? 'Remove from compare matrix' : 'Add to compare matrix'}
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
            <span className="uppercase tracking-widest text-brand-400 font-bold flex items-center gap-1">
              <ShieldCheck size={12} className="text-brand-400 inline" /> {product.brand}
            </span>
            <span className="text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full text-[10px] font-medium">
              {product.category_name}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
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

          {/* Rating & Social Proof */}
          <div className="mt-2.5 flex items-center gap-1.5">
            <StarRating rating={product.average_rating || 0} size={13} showValue />
            <span className="text-[11px] text-slate-400">
              ({product.review_count || 0} verified)
            </span>
          </div>
        </div>

        {/* Pricing & Commercial CTAs */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80">
          {/* Savings Callout */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-black text-white tracking-tight">
              ₹{(product.price || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500 line-through">
              ₹{mrp.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              Save ₹{savings.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Zap size={11} className="text-amber-400" /> Free Express Delivery
            </span>

            <div className="flex items-center gap-1.5">
              {/* Ask AI button */}
              <button
                onClick={handleAskAI}
                title="Ask AI Shopping Assistant about this product"
                className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 transition-all active:scale-95"
              >
                <Sparkles size={15} />
              </button>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-2 px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30'
                }`}
                title={isOutOfStock ? 'Currently out of stock' : 'Add to shopping cart'}
              >
                {justAdded ? (
                  <>
                    <Check size={14} />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={14} />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
