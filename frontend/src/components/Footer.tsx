import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Mail, 
  ArrowRight,
  MapPin,
  Phone
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 mt-20 text-slate-400 text-xs">
      {/* Top Value Assurance Ribbon */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h5 className="text-white font-bold text-xs">Free Express Delivery</h5>
              <p className="text-[11px] text-slate-400">On all orders above ₹499</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h5 className="text-white font-bold text-xs">100% Genuine Products</h5>
              <p className="text-[11px] text-slate-400">Direct authorized brand warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <RotateCcw size={20} />
            </div>
            <div>
              <h5 className="text-white font-bold text-xs">7-Day Easy Replacement</h5>
              <p className="text-[11px] text-slate-400">Doorstep pickup & diagnostic</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h5 className="text-white font-bold text-xs">256-Bit SSL Secured</h5>
              <p className="text-[11px] text-slate-400">Bank-grade encryption payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand & Story */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <Sparkles size={20} />
              </div>
              <span className="text-lg font-black tracking-tight text-white">BuySmart</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-500/10 text-brand-400 rounded-full border border-brand-500/20">
                Official Store
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs pr-4">
              India's premier AI-guided electronics shopping destination. We bridge verified flagship hardware with transparent pricing, zero markups, and instant expert recommendations.
            </p>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-brand-400 shrink-0" />
                <span>Tech Park, Koramangala, Bengaluru, Karnataka 560034</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-brand-400 shrink-0" />
                <span>1800-420-SMART (Toll-free 9 AM – 9 PM IST)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-brand-400 shrink-0" />
                <span>care@buysmart.in</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">Shop Categories</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><a href="#products" className="hover:text-brand-400 transition-colors">Flagship Smartphones</a></li>
              <li><a href="#products" className="hover:text-brand-400 transition-colors">High-Performance Laptops</a></li>
              <li><a href="#products" className="hover:text-brand-400 transition-colors">Wireless ANC Headphones</a></li>
              <li><a href="#products" className="hover:text-brand-400 transition-colors">Smart Fitness Watches</a></li>
              <li><a href="#products" className="hover:text-brand-400 transition-colors">Fast Chargers & Tech Accessories</a></li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">Customer Support</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><a href="#orders" className="hover:text-brand-400 transition-colors">Track Your Order</a></li>
              <li><span className="hover:text-brand-400 cursor-pointer transition-colors">Return & Replacement Policy</span></li>
              <li><span className="hover:text-brand-400 cursor-pointer transition-colors">Warranty Claim & Service Centers</span></li>
              <li><span className="hover:text-brand-400 cursor-pointer transition-colors">Shipping & Delivery Rates</span></li>
              <li><span className="hover:text-brand-400 cursor-pointer transition-colors">Terms of Service & Privacy Policy</span></li>
            </ul>
          </div>

          {/* Newsletter & Promo */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">Get ₹500 Off</h4>
            <p className="text-xs text-slate-400">
              Subscribe to unlock member-only flash drops and instant discount coupons.
            </p>
            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Coupon code sent! Use code <strong>BUYSMART500</strong></span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-3 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to newsletter"
                    className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 block">No spam. Unsubscribe at any time.</span>
              </form>
            )}
          </div>

        </div>

        {/* Payment Methods & Safe Checkout Banner */}
        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Accepted Payment Modes:</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">UPI (GPay / PhonePe / Paytm)</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">Visa</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">Mastercard</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">RuPay</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">NetBanking</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">Cash on Delivery</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>100% Safe & PCI-DSS Compliant Checkout</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} BuySmart Electronics Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Use</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Practices</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
