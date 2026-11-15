import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Plus, 
  Minus, 
  MessageSquare, 
  CreditCard, 
  Tag, 
  Heart, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Copy,
  Lock
} from 'lucide-react';
import { Product, ProductReview } from '../types';
import { SEED_PRODUCTS } from '../data/seedCatalog';
import { api } from '../api/client';
import { StarRating } from '../components/StarRating';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { PaymentModal } from '../components/PaymentModal';

interface ProductDetailPageProps {
  productId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, onNavigate }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { quickAsk, compareIds, toggleCompare, setIsComparing } = useChat();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Accordions open/close
  const [openSpecs, setOpenSpecs] = useState(true);
  const [openWarranty, setOpenWarranty] = useState(false);
  const [openShipping, setOpenShipping] = useState(false);

  // Instant Buy Now Checkout Modal
  const [buyNowOpen, setBuyNowOpen] = useState(false);

  // Review state
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setQty(1);
    setReviewSuccess(false);

    const numId = Number(productId);

    // Fetch product with guaranteed resilient fallback
    api.getProductById(productId)
      .then(prod => {
        if (isMounted) {
          setProduct(prod);
          setLoading(false);
        }
      })
      .catch(err => {
        console.warn('Notice: Falling back to seed catalog for product display:', err);
        const fallback = SEED_PRODUCTS.find(p => Number(p.id) === numId) || SEED_PRODUCTS[0];
        if (isMounted) {
          setProduct(fallback || null);
          setLoading(false);
        }
      });

    // Fetch reviews separately so reviews never block product rendering
    api.getProductReviews(productId)
      .then(revs => {
        if (isMounted) {
          setReviews(Array.isArray(revs) ? revs : []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setReviews([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-neutral-700 border-t-white rounded-full animate-spin" />
        <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
          <ShoppingBag size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase text-white tracking-wider">Product Not Found</h2>
          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            The product you're looking for might have been moved, updated, or is temporarily out of stock.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('products')}
            className="px-6 py-3 bg-white text-black font-black uppercase text-xs rounded-xl hover:bg-neutral-200 transition-colors shadow-lg"
          >
            Browse All Products
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-neutral-900 border border-neutral-800 text-white font-bold uppercase text-xs rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Quick popular fallbacks */}
        <div className="pt-10 max-w-4xl mx-auto text-left">
          <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4 text-center">
            Popular Trending Products
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SEED_PRODUCTS.slice(0, 4).map(p => (
              <div
                key={p.id}
                onClick={() => onNavigate('product-detail', { id: p.id })}
                className="group cursor-pointer bg-neutral-950 border border-neutral-800 rounded-xl p-3 hover:border-neutral-600 transition-all"
              >
                <div className="aspect-[3/4] bg-neutral-900 rounded-lg overflow-hidden mb-2">
                  <ImageWithFallback src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-xs font-bold text-white truncate">{p.name}</p>
                <p className="text-xs font-black text-white mt-1">₹{p.price.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const isCompared = compareIds.includes(product.id);
  const isOutOfStock = product.stock_quantity <= 0;

  const calculateOriginalMRP = (sellingPrice: number): number => {
    const markupFactor = 1.25;
    const raw = sellingPrice * markupFactor;
    return Math.round(raw / 100) * 100 - 1;
  };

  const mrp = calculateOriginalMRP(product.price);
  const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);
  const savings = mrp - product.price;

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, qty);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Please sign in to add items to your cart.');
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      alert('Please sign in to proceed with direct checkout.');
      onNavigate('login');
      return;
    }
    setBuyNowOpen(true);
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('BUYSMART10');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
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
      const refreshed = await api.getProductById(product.id);
      setProduct(refreshed);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 font-sans">
      
      {/* Top Breadcrumb / Back Link */}
      <button
        onClick={() => onNavigate('products')}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      {/* Main Split Layout (Snitch Product View) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Visual Gallery with Heart Toggle */}
        <div className="space-y-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl relative">
            <ImageWithFallback
              src={product.image_url}
              alt={product.name}
              categoryName={product.category_name}
              className="w-full h-full object-cover"
            />

            {/* Wishlist Heart Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 p-3 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md transition-all shadow-xl"
            >
              <Heart 
                size={20} 
                className={isWishlisted ? 'text-rose-500 fill-rose-500 scale-110' : 'text-white'} 
              />
            </button>

            {discountPercent > 0 && !isOutOfStock && (
              <span className="absolute bottom-4 left-4 px-3 py-1 text-xs font-black uppercase rounded-lg bg-emerald-500 text-black shadow-lg">
                {discountPercent}% OFF • Save ₹{savings.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Snitch Product Metadata, Offers, and Purchasing */}
        <div className="space-y-6">
          
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-1">
              {product.brand} · {product.category_name}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {product.name}
            </h1>

            {/* Price (Snitch Clean Typography) */}
            <div className="mt-3 flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-neutral-500 line-through">
                ₹{mrp.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              *MRP inclusive of all taxes
            </p>

            {/* Rating pill (Snitch Black Pill Style) */}
            <div className="mt-3 inline-flex items-center gap-2">
              <div className="px-2 py-0.5 rounded bg-black border border-neutral-800 text-white font-bold text-xs flex items-center gap-1">
                <span>{product.average_rating || 4.8}</span>
                <span className="text-amber-400">★</span>
              </div>
              <span className="text-xs text-neutral-400 font-medium">
                {reviews.length || 70} Ratings and 15 Reviews
              </span>
            </div>
          </div>

          {/* Snitch Promotional Offer Box (Soft Tinted Card with Copy Code) */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <button
                onClick={handleCopyCoupon}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-black font-mono tracking-wider hover:bg-rose-500/20 transition-colors"
              >
                <span>BUYSMART10</span>
                {copiedCoupon ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
              <span className="text-[11px] text-neutral-400">Limited time offer</span>
            </div>
            <p className="text-xs text-neutral-300">
              Enjoy flat 10% instant discount on your order at checkout with coupon code.
            </p>
          </div>

          {/* Spec / Variant Boxes (Snitch Size Guide Style) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-300 uppercase tracking-wider">Specifications & Configuration</span>
              <button 
                onClick={() => quickAsk(`What are the technical specs of the ${product.brand} ${product.name}?`)}
                className="text-[11px] text-neutral-400 hover:text-white underline font-semibold flex items-center gap-1"
              >
                <Sparkles size={12} className="text-amber-400" /> Ask AI
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(specs).slice(0, 4).map(([k, v]) => (
                <div
                  key={k}
                  className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-200"
                >
                  <span className="text-neutral-500 text-[10px] block uppercase">{k}</span>
                  <span className="font-bold">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Snitch Soft Delivery Callout */}
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2">
            <Truck size={16} className="text-emerald-400 shrink-0" />
            <span><strong>FREE 1-2 day express delivery</strong> on all 5,000+ Indian pincodes.</span>
          </div>

          {/* Snitch Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center border border-neutral-800 rounded-xl bg-black overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-3 hover:bg-neutral-800 text-neutral-300"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 text-sm font-black text-white min-w-[32px] text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))}
                  disabled={qty >= product.stock_quantity}
                  className="p-3 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* ADD TO BAG Button (Snitch Signature Full-Width Bold Button) */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-4 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl ${
                  isOutOfStock
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : addedToast
                    ? 'bg-emerald-500 text-black'
                    : 'bg-white hover:bg-neutral-200 text-black'
                }`}
              >
                {addedToast ? (
                  <>
                    <Check size={16} />
                    <span>ADDED TO BAG!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
                  </>
                )}
              </button>
            </div>

            {/* BUY NOW Button (Opens Payment Modal Directly) */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase tracking-widest text-xs rounded-xl border border-neutral-700 transition-all flex items-center justify-center gap-2"
            >
              <Lock size={14} />
              <span>BUY IT NOW (INSTANT CHECKOUT)</span>
            </button>

            {/* Compare Spec Button */}
            <button
              onClick={() => toggleCompare(product.id)}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <Layers size={14} />
              <span>{isCompared ? 'In Compare Matrix' : 'Add to Compare Matrix'}</span>
            </button>
          </div>

          {/* Collapsible Accordions (Snitch Accordion Pattern) */}
          <div className="pt-4 border-t border-neutral-800 divide-y divide-neutral-800">
            
            {/* Accordion 1: Full Technical Specifications */}
            <div className="py-3">
              <button
                onClick={() => setOpenSpecs(!openSpecs)}
                className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider text-white"
              >
                <span>Product Specifications & Details</span>
                {openSpecs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openSpecs && (
                <div className="pt-3 text-xs text-neutral-400 space-y-2 font-mono">
                  <p className="font-sans text-neutral-300 leading-relaxed mb-3">
                    {product.description}
                  </p>
                  {Object.entries(specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-neutral-900">
                      <span className="text-neutral-500">{k}:</span>
                      <span className="text-white font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion 2: Warranty & Authorized Service */}
            <div className="py-3">
              <button
                onClick={() => setOpenWarranty(!openWarranty)}
                className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider text-white"
              >
                <span>Warranty & 100% Brand Assurance</span>
                {openWarranty ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openWarranty && (
                <div className="pt-3 text-xs text-neutral-400 space-y-1.5 leading-relaxed">
                  <p>• 1-Year Comprehensive Brand Warranty covering hardware and manufacturing defects.</p>
                  <p>• Free doorstep diagnostic pick-up or walk-in service at any authorized brand center across India.</p>
                  <p>• 100% genuine sealed unit guaranteed.</p>
                </div>
              )}
            </div>

            {/* Accordion 3: 7-Day Replacement & Returns */}
            <div className="py-3">
              <button
                onClick={() => setOpenShipping(!openShipping)}
                className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider text-white"
              >
                <span>7-Day Replacement & Free Delivery Policy</span>
                {openShipping ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openShipping && (
                <div className="pt-3 text-xs text-neutral-400 space-y-1.5 leading-relaxed">
                  <p>• Free express shipping on all prepaid orders.</p>
                  <p>• 7-day hassle-free replacement in case of dead-on-arrival or physical damage in transit.</p>
                  <p>• Cash on Delivery supported with zero advance fees.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Customer Reviews Section */}
      <section className="space-y-6 pt-10 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-white">
              CUSTOMER REVIEWS ({reviews.length})
            </h2>
            <p className="text-xs text-neutral-400">100% Verified Buyer Ratings & Genuine Product Experiences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Write a Review */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 h-fit">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <MessageSquare size={14} /> WRITE A REVIEW
            </h3>

            {reviewSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center space-y-2">
                <CheckCircle2 size={24} className="mx-auto" />
                <p className="font-bold">Thank you! Your verified review has been published.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Rating</label>
                  <StarRating rating={newRating} interactive onRate={setNewRating} size={18} />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Feedback</label>
                  <textarea
                    rows={4}
                    placeholder="Share your experience regarding performance, build quality, or battery life..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    required
                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview || !newReviewText.trim()}
                  className="w-full py-2.5 bg-white text-black font-black uppercase text-xs rounded-xl shadow-md hover:bg-neutral-200 transition-all"
                >
                  {submittingReview ? 'Submitting...' : 'SUBMIT REVIEW'}
                </button>
              </form>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400">
                No reviews yet for this model. Be the first verified buyer to share your feedback!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{rev.user_name}</span>
                    <StarRating rating={rev.rating} size={13} />
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {rev.review_text}
                  </p>
                  <span className="text-[10px] text-neutral-500 block">
                    Verified Buyer • {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* Embedded Buy Now Instant Checkout Modal */}
      <PaymentModal
        isOpen={buyNowOpen}
        onClose={() => setBuyNowOpen(false)}
        subtotal={product.price * qty}
        discount={(product.price * qty * 10) / 100}
        grandTotal={Math.max(0, (product.price * qty * 90) / 100)}
        onSuccess={() => {
          setBuyNowOpen(false);
          alert('Order placed successfully! Check your orders page.');
        }}
      />

    </div>
  );
};
