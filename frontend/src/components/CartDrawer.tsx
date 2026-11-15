import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!user) {
      alert('Please log in to complete your purchase.');
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
      setErrorMessage(err.message || 'Checkout failed. Please check inventory stock.');
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
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col z-10 animate-slide-up">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-400" />
            <h2 className="text-lg font-bold text-white">Your Shopping Cart</h2>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Order Success Screen */}
          {orderSuccess ? (
            <div className="py-10 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-white">Order Placed Successfully!</h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                Thank you, {user?.name}! Your order has been processed atomically and inventory decremented.
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="font-mono font-bold text-brand-400">#{orderSuccess.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Paid:</span>
                  <span className="font-bold text-white">₹{orderSuccess.total_amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-semibold uppercase">{orderSuccess.order_status}</span>
                </div>
              </div>
              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => { handleCloseAndReset(); onNavigate('orders'); }}
                  className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-600/30 transition-all"
                >
                  View Order Timeline
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
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                <ShoppingBag size={28} />
              </div>
              <h3 className="text-base font-semibold text-white">Your cart is currently empty</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Discover modern laptops, smartphones, headphones, and smartwatches.
              </p>
              <button
                onClick={() => { closeCart(); onNavigate('products'); }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
              >
                Browse Catalog <ArrowRight size={14} />
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
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3 group"
                  >
                    <ImageWithFallback
                      src={item.product?.image_url}
                      alt={item.product?.name || 'Product'}
                      categoryName={item.product?.category_name}
                      className="w-16 h-16 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">
                        {item.product?.name || 'Item'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {item.product?.brand || ''}
                      </p>
                      <p className="text-xs font-bold text-brand-400 mt-1">
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

              <div className="pt-2 flex justify-end">
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
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-200 font-semibold">
                  ₹{cart.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-emerald-400 font-semibold">FREE (Special Offer)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold text-white">
                <span>Total Amount</span>
                <span className="text-brand-400">
                  ₹{cart.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {checkingOut ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Simulate Order Checkout</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-500">
              ⚡ ACID Transaction Protected: Live inventory locks and atomic stock decrement.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
