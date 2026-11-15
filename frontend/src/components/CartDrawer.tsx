import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  Plus, 
  Minus, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Truck, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Order } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface CartDrawerProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, clearCart, refreshCart } = useCart();
  const { user } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Promo code support
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
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (code === 'BUYSMART10' || code === 'WELCOME10') {
      setAppliedCoupon('BUYSMART10');
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try code BUYSMART10');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Please sign in or create an account to complete your secure purchase.');
      closeCart();
      onNavigate('login');
      return;
    }

    try {
      setCheckingOut(true);
      setErrorMessage(null);
      const confirmedOrder = await api.checkout();
      setOrderSuccess(confirmedOrder);
      await refreshCart();
    } catch (err: any) {
      setErrorMessage(err.message || 'Checkout failed. Please check product stock or try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCloseAndReset = () => {
    setOrderSuccess(null);
    setErrorMessage(null);
    closeCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={handleCloseAndReset} 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" 
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col z-10 animate-slide-up">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">Your Shopping Cart</h2>
            {cart && cart.item_count > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-semibold">
                {cart.item_count} items
              </span>
            )}
          </div>
          <button
            onClick={handleCloseAndReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {cart && cart.items.length > 0 && !orderSuccess && (
          <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-2.5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Truck size={14} className={isFreeShipping ? 'text-emerald-400' : 'text-brand-400'} />
                {isFreeShipping ? (
                  <span className="text-emerald-400 font-bold">🎉 You've Unlocked FREE Express Delivery!</span>
                ) : (
                  <span>Add ₹{shippingAmountNeeded.toLocaleString('en-IN')} more for <strong>FREE Delivery</strong></span>
                )}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isFreeShipping ? 'bg-emerald-500' : 'bg-brand-500'}`}
                style={{ width: `${Math.min(100, (rawSubtotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Order Success Screen */}
          {orderSuccess ? (
            <div className="py-10 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-white">Order Confirmed!</h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                Thank you, {user?.name}! Your order has been placed successfully. A tracking link will be dispatched to your email.
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order Reference:</span>
                  <span className="font-mono font-bold text-brand-400">#ORD-{orderSuccess.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-bold text-white">₹{orderSuccess.total_amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <span className="text-emerald-400 font-semibold uppercase">Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Delivery:</span>
                  <span className="text-slate-200 font-medium">Tomorrow by 5 PM</span>
                </div>
              </div>
              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => { handleCloseAndReset(); onNavigate('orders'); }}
                  className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-600/30 transition-all"
                >
                  Track Order Status
                </button>
                <button
                  onClick={handleCloseAndReset}
                  className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            /* Empty Cart */
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-base font-bold text-white">Your cart is empty</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Explore our curated catalog of flagship laptops, smartphones, and wireless earbuds.
              </p>
              <button
                onClick={() => { closeCart(); onNavigate('products'); }}
                className="mt-3 inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Start Shopping <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            /* Cart Item List */
            <>
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3 group"
                  >
                    <ImageWithFallback
                      src={item.product?.image_url}
                      alt={item.product?.name || 'Product'}
                      categoryName={item.product?.category_name}
                      className="w-16 h-16 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.product?.name || 'Item'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {item.product?.brand || ''}
                      </p>
                      <p className="text-xs font-extrabold text-brand-400 mt-1">
                        ₹{(item.product?.price || 0).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="flex items-center border border-slate-800 rounded-lg bg-slate-900 overflow-hidden">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.id, item.quantity - 1);
                            } else {
                              removeItem(item.id);
                            }
                          }}
                          className="p-1 hover:bg-slate-800 text-slate-300"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-semibold text-white min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={!item.product || item.quantity >= item.product.stock_quantity}
                          className="p-1 hover:bg-slate-800 text-slate-300 disabled:opacity-40"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Tag size={13} className="text-brand-400" /> Apply Coupon Code
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      <span>Code <strong>{appliedCoupon}</strong> Applied (10% OFF)</span>
                    </div>
                    <button 
                      onClick={handleRemoveCoupon}
                      className="text-[11px] underline hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. BUYSMART10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 uppercase font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-400">{couponError}</p>
                )}
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  onClick={clearCart}
                  className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} /> Clear all items
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer with Totals & Checkout Button */}
        {cart && cart.items.length > 0 && !orderSuccess && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-200 font-semibold">
                  ₹{rawSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Special Festive Discount (10%)</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-emerald-400 font-semibold">FREE Express Shipping</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-800 text-base font-extrabold text-white">
                <span>Grand Total</span>
                <span className="text-brand-400">
                  ₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {checkingOut ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={15} />
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Trust Assurance in Checkout Drawer */}
            <div className="pt-1 flex items-center justify-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" /> 256-Bit SSL
              </span>
              <span>•</span>
              <span>7-Day Replacement</span>
              <span>•</span>
              <span>UPI & Cards</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
