import React from 'react';
import { ShoppingCart, Sparkles, Layers, Check, Eye } from 'lucide-react';
import { Product } from '../types';
import { StarRating } from './StarRating';
import { useCart } from '../context/CartContext';
import { useChat } from '../context/ChatContext';

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
    quickAsk(`Tell me about the ${product.brand} ${product.name}. What are its main pros, cons, and key specifications?`);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompare(product.id);
  };

  return (
    <div 
      onClick={() => onSelect(product.id)}
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group flex flex-col justify-between"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] bg-slate-900/80 overflow-hidden flex items-center justify-center">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Stock Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-rose-500/90 text-white shadow-md">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-500/90 text-white shadow-md animate-pulse">
              Only {product.stock_quantity} left
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-500/90 text-white shadow-md">
              In Stock
            </span>
          )}
        </div>

        {/* Compare Checkbox Button */}
        <button
          onClick={handleToggleCompare}
          title={isCompared ? 'Remove from compare' : 'Add to compare'}
          className={`absolute top-3 right-3 p-1.5 rounded-lg text-xs font-medium transition-all shadow-md ${
            isCompared 
              ? 'bg-brand-600 text-white ring-2 ring-brand-400' 
              : 'bg-slate-950/70 hover:bg-slate-900 text-slate-300 border border-slate-700/80'
          }`}
        >
          {isCompared ? <Check size={14} /> : <Layers size={14} />}
        </button>

        {/* Quick View overlay hover pill */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-lg border border-slate-700">
            <Eye size={13} /> View Specs
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
            <span className="uppercase tracking-wider text-brand-400 font-semibold">{product.brand}</span>
            <span>{product.category_name}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Rating */}
          <div className="mt-2.5 flex items-center gap-1.5">
            <StarRating rating={product.average_rating || 0} size={13} showValue />
            <span className="text-[11px] text-slate-500">
              ({product.review_count || 0})
            </span>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block leading-tight">Price</span>
            <span className="text-base sm:text-lg font-bold text-white tracking-tight">
              ₹{(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Ask AI button */}
            <button
              onClick={handleAskAI}
              title="Ask AI Shopping Assistant about this item"
              className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors"
            >
              <Sparkles size={16} />
            </button>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                isOutOfStock
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-500 active:scale-95 text-white shadow-md shadow-brand-600/30'
              }`}
              title={isOutOfStock ? 'Currently out of stock' : 'Add to cart'}
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
