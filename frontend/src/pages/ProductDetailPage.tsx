import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Plus, 
  Minus,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Product, ProductReview } from '../types';
import { api } from '../api/client';
import { StarRating } from '../components/StarRating';
import { useCart } from '../context/CartContext';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

interface ProductDetailPageProps {
  productId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, onNavigate }) => {
  const { addToCart } = useCart();
  const { quickAsk, compareIds, toggleCompare, setIsComparing } = useChat();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    setQty(1);
    setReviewSuccess(false);
    Promise.all([
      api.getProductById(productId),
      api.getProductReviews(productId)
    ]).then(([prod, revs]) => {
      setProduct(prod);
      setReviews(revs);
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading product specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <button
          onClick={() => onNavigate('products')}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isCompared = compareIds.includes(product.id);
  const isOutOfStock = product.stock_quantity <= 0;

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, qty);
    } catch (err: any) {
      alert(err.message || 'Please log in to add items to your cart.');
    }
  };

  const handleAskAIAboutItem = () => {
    quickAsk(`Analyze the ${product.brand} ${product.name}. Highlight its pros, cons, target audience, and key specs.`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to write a review.');
      return;
    }
    try {
      setSubmittingReview(true);
      const created = await api.addReview(product.id, newRating, newReviewText);
      setReviews(prev => [created, ...prev.filter(r => r.id !== created.id)]);
      const refreshedProduct = await api.getProductById(product.id);
      setProduct(refreshedProduct);
      setReviewSuccess(true);
      setNewReviewText('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const specs = product.specifications || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate('products')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Product Media Column */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {isOutOfStock ? (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-rose-500/90 text-white font-bold text-xs uppercase shadow">
                Out of Stock
              </span>
            ) : product.stock_quantity <= 5 ? (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-amber-500/90 text-white font-bold text-xs uppercase shadow animate-pulse">
                Only {product.stock_quantity} remaining
              </span>
            ) : (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-emerald-500/90 text-white font-bold text-xs uppercase shadow">
                Verified In Stock ({product.stock_quantity} available)
              </span>
            )}
          </div>

          {/* Quick AI Consultation Banner */}
          <div className="p-4 rounded-2xl glass border border-indigo-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Ask BuySmart AI about this product</h4>
                <p className="text-[11px] text-slate-400">Get pros, cons, and performance benchmarks instantly</p>
              </div>
            </div>
            <button
              onClick={handleAskAIAboutItem}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all shrink-0"
            >
              Ask AI
            </button>
          </div>
        </div>

        {/* Product Meta & Purchase Column */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider">
              <span>{product.brand}</span>
              <span>•</span>
              <span className="text-slate-400">{product.category_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {product.name}
            </h1>

            {/* Rating badge */}
            <div className="mt-3 flex items-center gap-2">
              <StarRating rating={product.average_rating || 0} size={16} showValue />
              <span className="text-xs text-slate-400">
                ({reviews.length} customer reviews)
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Selling Price (incl. all taxes)</span>
              <span className="text-3xl font-extrabold text-white tracking-tight">
                ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-400 font-semibold block">⚡ Free Express Shipping</span>
              <span className="text-[11px] text-slate-400">Cash on Delivery Available</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-800 rounded-xl bg-slate-900 overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-2.5 hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 text-sm font-bold text-white min-w-[30px] text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))}
                  disabled={qty >= product.stock_quantity}
                  className="p-2.5 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-6 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <ShoppingCart size={18} />
                <span>{isOutOfStock ? 'Currently Out of Stock' : 'Add to Shopping Cart'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleCompare(product.id)}
                className={`flex-1 py-2 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isCompared 
                    ? 'bg-brand-500/20 text-brand-300 border-brand-500/50' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <Layers size={14} />
                <span>{isCompared ? 'Added to Comparison' : 'Add to Compare Matrix'}</span>
              </button>

              {compareIds.length >= 2 && (
                <button
                  onClick={() => setIsComparing(true)}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  View Matrix ({compareIds.length})
                </button>
              )}
            </div>
          </div>

          {/* Value Props & Store Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <Truck size={18} className="text-brand-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-white block">24h Dispatch</span>
              <span className="text-[9px] text-slate-500">From local warehouse</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <RotateCcw size={18} className="text-indigo-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-white block">7-Day Replacement</span>
              <span className="text-[9px] text-slate-500">Verified diagnostic</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <ShieldCheck size={18} className="text-purple-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-white block">1-Year Warranty</span>
              <span className="text-[9px] text-slate-500">Authorized Brand Care</span>
            </div>
          </div>

        </div>
      </div>

      {/* Specifications Breakdown Table */}
      <section className="space-y-4 pt-8 border-t border-slate-800">
        <h2 className="text-xl font-bold text-white">Technical Specifications</h2>
        
        {Object.keys(specs).length === 0 ? (
          <p className="text-xs text-slate-400">Detailed technical specifications will be uploaded soon.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-slate-800">
                {Object.entries(specs).map(([key, val], idx) => (
                  <tr key={key} className={idx % 2 === 0 ? 'bg-slate-950/30' : 'bg-transparent'}>
                    <td className="p-3.5 px-5 font-semibold text-slate-400 w-1/3 bg-slate-950/50">
                      {key}
                    </td>
                    <td className="p-3.5 px-5 text-slate-200 font-mono">
                      {String(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Customer Reviews & Ratings Section */}
      <section className="space-y-6 pt-8 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Customer Reviews ({reviews.length})</h2>
            <p className="text-xs text-slate-400">Authentic feedback verified by relational database constraints</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Write a Review Box */}
          <div className="p-6 rounded-2xl glass border border-slate-800 space-y-4 h-fit">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <MessageSquare size={16} className="text-brand-400" /> Write a Customer Review
            </h3>

            {reviewSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center space-y-2">
                <CheckCircle2 size={24} className="mx-auto" />
                <p className="font-semibold">Thank you! Your review has been saved.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Your Rating</label>
                  <StarRating rating={newRating} interactive onRate={setNewRating} size={20} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Review Feedback</label>
                  <textarea
                    rows={4}
                    placeholder="Share your experience regarding performance, build quality, or battery life..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview || !newReviewText.trim()}
                  className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </form>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                No reviews submitted yet for this product. Be the first to share your thoughts!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-brand-400 font-bold text-xs flex items-center justify-center uppercase">
                        {rev.user_name.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-white">{rev.user_name}</span>
                    </div>
                    <StarRating rating={rev.rating} size={13} />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rev.review_text}
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    Verified Purchase • {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

    </div>
  );
};
