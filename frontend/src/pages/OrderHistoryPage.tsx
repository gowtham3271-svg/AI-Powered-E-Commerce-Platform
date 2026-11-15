import React, { useState, useEffect } from 'react';
import { Package, CheckCircle2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Order } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface OrderHistoryPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.getOrders()
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center mx-auto shadow-2xl">
          <Package size={28} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">Please Sign In</h2>
        <p className="text-xs text-neutral-400">Log in to view your orders, doorstep replacements, and invoices.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-3 bg-white text-black font-black uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all shadow-xl"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      
      {/* Header (Snitch Minimalist Style) */}
      <div className="pb-4 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Order History & Invoices</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Track your deliveries, download GST invoices, and manage 7-day replacements
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-neutral-900 text-white border border-neutral-800 font-bold uppercase tracking-wider">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Placed
        </span>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-neutral-700 border-t-white rounded-full animate-spin" />
          <p className="text-xs text-neutral-400 uppercase tracking-widest">Fetching orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-neutral-950 rounded-2xl border border-neutral-800 p-8 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
            <ShoppingBag size={26} />
          </div>
          <h3 className="text-base font-black uppercase tracking-wider text-white">No orders found</h3>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            You haven't placed any orders yet. Discover our curated electronics catalog with instant checkout.
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="mt-3 inline-flex items-center gap-1.5 px-6 py-2.5 bg-white text-black font-black uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all shadow-xl"
          >
            Start Shopping <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-2xl"
            >
              {/* Order Header */}
              <div className="p-4 px-6 bg-black border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-bold tracking-wider">Order ID</span>
                    <span className="font-mono font-bold text-white">#{order.id}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-bold tracking-wider">Date Placed</span>
                    <span className="text-neutral-300 font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-bold text-right tracking-wider">Total Amount</span>
                    <span className="text-sm font-black text-white">
                      ₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={12} /> {order.order_status}
                  </span>
                </div>
              </div>

              {/* Order Line Items */}
              <div className="p-4 px-6 divide-y divide-neutral-900">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <ImageWithFallback
                        src={item.product?.image_url}
                        alt={item.product?.name || 'Product'}
                        categoryName={item.product?.category_name}
                        className="w-12 h-14 rounded-lg object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.product?.name || `Product #${item.product_id}`}
                        </h4>
                        <p className="text-[11px] text-neutral-400">
                          Qty: <strong className="text-white">{item.quantity}</strong> × ₹{(item.unit_price || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-white block">
                        ₹{((item.quantity || 1) * (item.unit_price || 0)).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => onNavigate('product-detail', { id: item.product_id })}
                        className="text-[11px] text-white hover:underline font-bold uppercase tracking-wider mt-0.5 inline-block"
                      >
                        Buy Again →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 px-6 bg-black border-t border-neutral-800 text-[11px] text-neutral-500 flex justify-between items-center">
                <span>Free Express Shipping • 7-Day Replacement Active</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Payment Verified</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};