import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  Plus, 
  Minus, 
  ArrowRight, 
  Tag, 
  Truck, 
  ShieldCheck, 
  Lock,
  Heart,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Order } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { PaymentModal } from './PaymentModal';

interface CartDrawerProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, clearCart, refreshCart } = useCart();
  const { user } = useAuth();
  const { openWishlist } = useWishlist();

  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  // Promo code
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('BUYSMART10');
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isOpen) return null;

  const rawSubtotal = cart?.total_amount || 0;
  const freeShippingThreshold = 999;
  const isFreeShipping = rawSubtotal >= freeShippingThreshold;
  const shippingAmountNeeded = Math.max(0, freeShippingThreshold - rawSubtotal);

  // Discount calculation
  const discountPercent = appliedCoupon === 'BUYSMART10' ? 10 : 0;
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const grandTotal = Math.max(0, rawSubtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (code === 'BUYSMART10' || code === 'WELCOME10') {
      setAppliedCoupon('BUYSMART10');
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon. Try code BUYSMART10');
    }
  };

  const handleOpenCheckout = () => {
    if (!user) {
      alert('Please sign in or create an account to proceed to checkout.');
      closeCart();
      onNavigate('login');
      return;
    }
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (order: Order) => {
    setOrderSuccess(order);
    refreshCart();
  };

  const handleCloseAndReset = () => {
    setOrderSuccess(null);
    closeCart();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div 
          onClick={handleCloseAndReset} 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
        />

        {/* Drawer Container (Snitch BAG Style) */}
        <div className="relative w-full max-w-md bg-neutral-950 border-l border-neutral-800 h-full shadow-2xl flex flex-col z-10 animate-slide-up">
          
          {/* Header */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-black">
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={20} className="text-white" />
              <h2 className="text-base font-black tracking-widest uppercase text-white">
                BAG {cart && cart.item_count > 0 ? `(${cart.item_count})` : ''}
              </h2>
            </div>
            <button
              onClick={handleCloseAndReset}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Free Shipping Progress Indicator (Snitch Bar Style) */}
          {cart && cart.items.length > 0 && (
            <div className="bg-neutral-900 border-b border-neutral-800 px-5 py-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-neutral-200">
                  <Truck size={14} className={isFreeShipping ? 'text-emerald-400' : 'text-white'} />
                  {isFreeShipping ? (
                    <span className="text-emerald-400 font-bold">🎉 FREE Express Shipping Unlocked!</span>
                  ) : (
                    <span>Add ₹{shippingAmountNeeded.toLocaleString('en-IN')} more for <strong>FREE Delivery</strong></span>
                  )}
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${isFreeShipping ? 'bg-emerald-500' : 'bg-white'}`}
                  style={{ width: `${Math.min(100, (rawSubtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {!cart || cart.items.length === 0 ? (
              /* Snitch Empty Bag Layout */
              <div className="py-20 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="text-base font-black uppercase tracking-wider text-white">
                  YOUR BAG IS EMPTY
                </h3>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                  Looks like your shopping bag is empty. Explore our trending electronics or pick up from your saved wishlist.
                </p>
                <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
                  <button
                    onClick={() => { closeCart(); onNavigate('products'); }}
                    className="w-full py-3 bg-white text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-lg hover:bg-neutral-200 transition-all"
                  >
                    START SHOPPING
                  </button>
                  <button
                    onClick={() => { closeCart(); openWishlist(); }}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase tracking-wider text-xs rounded-xl border border-neutral-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Heart size={14} className="text-rose-500 fill-rose-500" />
                    <span>VIEW WISHLIST</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Cart Items List */
              <>
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3.5 group hover:border-neutral-700 transition-colors"
                    >
                      <ImageWithFallback
                        src={item.product?.image_url}
                        alt={item.product?.name || 'Product'}
                        categoryName={item.product?.category_name}
                        className="w-16 h-20 rounded-lg object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{item.product?.brand}</span>
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.product?.name || 'Item'}
                        </h4>
                        
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xs font-black text-white">
                            ₹{(item.product?.price || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-neutral-500 line-through">
                            ₹{Math.round((item.product?.price || 0) * 1.25).toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Quantity Selector */}
                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center border border-neutral-800 rounded-lg bg-black overflow-hidden">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.id, item.quantity - 1);
                                } else {
                                  removeItem(item.id);
                                }
                              }}
                              className="px-2 py-1 hover:bg-neutral-800 text-neutral-300"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-white min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={!item.product || item.quantity >= item.product.stock_quantity}
                              className="px-2 py-1 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-neutral-500 hover:text-rose-500 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Section */}
                <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Tag size={13} className="text-amber-400" /> Apply Coupon Code
                  </div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        <span>Code <strong>{appliedCoupon}</strong> Applied (10% OFF)</span>
                      </div>
                      <button 
                        onClick={() => setAppliedCoupon(null)}
                        className="text-[11px] underline hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="BUYSMART10"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 uppercase font-mono focus:outline-none focus:border-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-black uppercase tracking-wider"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-rose-400">{couponError}</p>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-neutral-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Clear all items
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sticky Footer with Totals & Checkout Button */}
          {cart && cart.items.length > 0 && (
            <div className="p-5 border-t border-neutral-800 bg-black space-y-3">
              <div className="space-y-1.5 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">
                    ₹{rawSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Festive Discount (10%)</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-bold">FREE Express Delivery</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-neutral-800 text-base font-black text-white">
                  <span>Estimated Total</span>
                  <span className="text-white">
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* High-Converting Checkout Button */}
              <button
                onClick={handleOpenCheckout}
                className="w-full py-4 bg-white hover:bg-neutral-200 active:scale-95 text-black font-black uppercase tracking-wider text-sm rounded-xl shadow-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Lock size={15} />
                <span>PROCEED TO CHECKOUT • ₹{grandTotal.toLocaleString('en-IN')}</span>
                <ArrowRight size={15} />
              </button>

              <div className="pt-1 flex items-center justify-center gap-3 text-[10px] text-neutral-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" /> 256-Bit SSL
                </span>
                <span>•</span>
                <span>7-Day Replacement</span>
                <span>•</span>
                <span>COD & UPI Supported</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Embedded Real Interactive Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        subtotal={rawSubtotal}
        discount={discountAmount}
        grandTotal={grandTotal}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};
