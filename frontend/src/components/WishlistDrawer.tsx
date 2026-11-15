import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { api } from '../api/client';
import { ImageWithFallback } from './ImageWithFallback';

interface WishlistDrawerProps {
  onNavigate: (page: string, params?: any) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ onNavigate }) => {
  const { wishlistIds, isInWishlist, toggleWishlist, isOpen, closeWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && wishlistIds.length > 0) {
      setLoading(true);
      api.getProducts({ limit: 50 })
        .then(allProds => {
          const filtered = allProds.filter(p => wishlistIds.includes(p.id));
          setProducts(filtered);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (wishlistIds.length === 0) {
      setProducts([]);
    }
  }, [isOpen, wishlistIds]);

  if (!isOpen) return null;

  const handleMoveToBag = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      toggleWishlist(product.id);
    } catch (err: any) {
      alert(err.message || 'Please sign in to add items to your cart.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={closeWishlist} 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-neutral-950 border-l border-neutral-800 h-full shadow-2xl flex flex-col z-10 animate-slide-up">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart size={20} className="text-rose-500 fill-rose-500" />
            <h2 className="text-base font-black uppercase tracking-wider text-white">
              WISHLIST ({wishlistIds.length})
            </h2>
          </div>
          <button
            onClick={closeWishlist}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {wishlistIds.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                <Heart size={28} />
              </div>
              <h3 className="text-base font-bold uppercase tracking-wide text-white">Your Wishlist is Empty</h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Explore our trending laptops, smartphones, and audio gear and tap the heart icon to save your favorites.
              </p>
              <button
                onClick={() => { closeWishlist(); onNavigate('products'); }}
                className="mt-2 px-6 py-2.5 bg-white text-black font-black uppercase text-xs rounded-lg hover:bg-neutral-200 transition-all shadow-md"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map(product => (
                <div 
                  key={product.id} 
                  className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3.5 group hover:border-neutral-700 transition-colors"
                >
                  <div 
                    onClick={() => { closeWishlist(); onNavigate('product-detail', { id: product.id }); }}
                    className="w-16 h-20 rounded-lg overflow-hidden bg-neutral-950 shrink-0 cursor-pointer"
                  >
                    <ImageWithFallback
                      src={product.image_url}
                      alt={product.name}
                      categoryName={product.category_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{product.brand}</span>
                    <h4 
                      onClick={() => { closeWishlist(); onNavigate('product-detail', { id: product.id }); }}
                      className="text-xs font-bold text-white truncate cursor-pointer hover:underline"
                    >
                      {product.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xs font-black text-white">
                        ₹{(product.price || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-neutral-500 line-through">
                        ₹{Math.round(product.price * 1.25).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleMoveToBag(product)}
                        className="px-3 py-1.5 rounded-lg bg-white text-black text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-neutral-200 transition-all active:scale-95"
                      >
                        <ShoppingBag size={12} /> Move to Bag
                      </button>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-500 hover:bg-neutral-800 transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

