import React, { useState } from 'react';
import { ShoppingCart, Sparkles, Layers, Check, Eye, Heart, Plus } from 'lucide-react';
import { Product } from '../types';
import { StarRating } from './StarRating';
import { useCart } from '../context/CartContext';
import { useChat } from '../context/ChatContext';
import { useWishlist } from '../context/WishlistContext';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const { quickAsk, compareIds, toggleCompare } = useChat();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isCompared = compareIds.includes(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const isBestseller = (product.average_rating || 0) >= 4.5;

  // Calculate realistic retail MRP
  const calculateOriginalMRP = (sellingPrice: number): number => {
    const markupFactor = 1.25;
    const raw = sellingPrice * markupFactor;
    return Math.round(raw / 100) * 100 - 1;
  };

  const mrp = calculateOriginalMRP(product.price);
  const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1600);
    } catch (err: any) {
      alert(err.message || 'Please log in to add items to your cart.');
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompare(product.id);
  };

  // Key spec highlights
  const specTags = product.specifications
    ? Object.entries(product.specifications)
        .slice(0, 2)
        .map(([k, v]) => String(v))
    : [];

  return (
    <div 
      onClick={() => onSelect(product.id)}
      className="group cursor-pointer flex flex-col justify-between transition-all duration-300 relative bg-transparent"
    >
      {/* Product Image Box (Snitch Vertical Sleek Framing) */}
      <div className="relative aspect-[3/4] bg-neutral-900 rounded-xl overflow-hidden flex items-center justify-center border border-neutral-800/80 group-hover:border-neutral-700 transition-colors">
        <ImageWithFallback
          src={product.image_url}
          alt={product.name}
          categoryName={product.category_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Wishlist Heart Icon (Snitch Top-Right Position) */}
        <button
          onClick={handleWishlistToggle}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md transition-all z-10"
        >
          <Heart 
            size={16} 
            className={`transition-colors ${isWishlisted ? 'text-rose-500 fill-rose-500 scale-110' : 'text-white'}`} 
          />
        </button>

        {/* Top-Left Bestseller or Stock Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {isBestseller && !isOutOfStock && (
            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-white text-black shadow-md">
              BESTSELLER
            </span>
          )}
          {isLowStock && (
            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-rose-600 text-white shadow-md animate-pulse">
              LAST {product.stock_quantity} UNITS
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-neutral-800 text-neutral-400">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Discount Tag */}
        {discountPercent > 0 && !isOutOfStock && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2 py-0.5 text-[10px] font-black rounded bg-emerald-500 text-black shadow-md">
              {discountPercent}% OFF
            </span>
          </div>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <span className="px-3.5 py-1.5 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-wider shadow-2xl">
            Quick View
          </span>
        </div>
      </div>

      {/* Product Metadata & Price (Snitch Clean Typography) */}
      <div className="pt-3 pb-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
            <span>{product.brand}</span>
            <span className="text-neutral-500">{product.category_name}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-bold text-white group-hover:text-neutral-300 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Spec Tags */}
          {specTags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {specTags.map((tag, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 font-mono">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Quick Add (+) Action (Snitch Signature Grid Pattern) */}
        <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-black text-white">
              ₹{(product.price || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-neutral-500 line-through">
              ₹{mrp.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Compare */}
            <button
              onClick={handleToggleCompare}
              title={isCompared ? 'In Compare' : 'Add to Compare'}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isCompared ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Layers size={14} />
            </button>

            {/* Quick Add Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all active:scale-90 ${
                isOutOfStock
                  ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                  : justAdded
                  ? 'bg-emerald-500 text-black'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
              title={isOutOfStock ? 'Sold Out' : 'Quick Add to Bag'}
            >
              {justAdded ? <Check size={14} /> : <Plus size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
