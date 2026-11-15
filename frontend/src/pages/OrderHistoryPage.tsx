import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, ArrowRight, ShoppingBag, AlertCircle } from 'lucide-react';
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
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <Package size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">Please Sign In</h2>
        <p className="text-xs text-slate-400">Log in to view your past orders, invoices, and shipment status.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Order History & Invoices</h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical orders saved with immutable price snapshots in relational order_items table
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold">
          {orders.length} Orders Placed
        </span>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Fetching order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center space-y-3 glass rounded-2xl border border-slate-800 p-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <ShoppingBag size={28} />
          </div>
          <h3 className="text-base font-bold text-white">No orders found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You haven't placed any orders yet. Discover our latest laptops, smartphones, and accessories.
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            Start Shopping <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-lg"
            >
              {/* Order Header */}
              <div className="p-4 px-6 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Order ID</span>
                    <span className="font-mono font-bold text-brand-400">#{order.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Date Placed</span>
                    <span className="text-slate-300 font-medium">
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
                    <span className="text-slate-500 block text-[10px] uppercase font-bold text-right">Total Amount</span>
                    <span className="text-sm font-extrabold text-white">
                      ₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase flex items-center gap-1">
                    <CheckCircle2 size={12} /> {order.order_status}
                  </span>
                </div>
              </div>

              {/* Order Line Items */}
              <div className="p-4 px-6 divide-y divide-slate-800/60">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <ImageWithFallback
                        src={item.product?.image_url}
                        alt={item.product?.name || 'Product'}
                        categoryName={item.product?.category_name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {item.product?.name || `Product #${item.product_id}`}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Qty: <strong className="text-white">{item.quantity}</strong> × ₹{(item.unit_price || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-white block">
                        ₹{((item.quantity || 1) * (item.unit_price || 0)).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => onNavigate('product-detail', { id: item.product_id })}
                        className="text-[11px] text-brand-400 hover:underline mt-0.5"
                      >
                        Buy Again
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 px-6 bg-slate-950/40 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center">
                <span>Standard Delivery • Express Tracking Enabled</span>
                <span className="text-emerald-400 font-semibold">Payment Completed via Transaction</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
