import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
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
    <footer className="w-full border-t border-neutral-800 bg-black text-neutral-400 text-xs font-sans">
      
      {/* 1. Value Assurance Strip (Snitch Style) */}
      <div className="border-b border-neutral-800/80 bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h5 className="text-white font-black uppercase tracking-wider text-xs">Free Express Shipping</h5>
              <p className="text-[11px] text-neutral-400">On all prepaid orders over ₹499</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
              <RotateCcw size={20} />
            </div>
            <div>
              <h5 className="text-white font-black uppercase tracking-wider text-xs">7-Day Replacement</h5>
              <p className="text-[11px] text-neutral-400">Instant doorstep exchange guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h5 className="text-white font-black uppercase tracking-wider text-xs">100% Genuine Care</h5>
              <p className="text-[11px] text-neutral-400">Official manufacturer warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h5 className="text-white font-black uppercase tracking-wider text-xs">256-Bit SSL Secured</h5>
              <p className="text-[11px] text-neutral-400">Bank-grade PCI-DSS compliance</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-2">
            <div>
              <span className="text-xl font-black tracking-[0.25em] uppercase text-white">BUYSMART</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-0.5">
                OFFICIAL ELECTRONICS D2C STORE
              </p>
            </div>
            <p className="text-neutral-400 leading-relaxed text-xs pr-6">
              India's modern AI-guided shopping platform for high-performance laptops, flagship smartphones, and premium audio. We partner directly with authorized brands to deliver certified authentic hardware at honest prices.
            </p>
            <div className="space-y-1 text-xs text-neutral-400 font-medium">
              <p>📍 Tech Park, Koramangala, Bengaluru, Karnataka 560034</p>
              <p>📞 1800-420-SMART (Toll-Free 9 AM - 9 PM IST)</p>
              <p>✉️ care@buysmart.in</p>
            </div>
          </div>

          {/* Shop Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-black text-xs tracking-widest uppercase">SHOP</h4>
            <ul className="space-y-2.5 text-neutral-400 text-xs uppercase tracking-wider font-medium">
              <li><a href="#products" className="hover:text-white transition-colors">Laptops & Ultrabooks</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Flagship Smartphones</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Wireless ANC Headphones</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Smart Watches</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Tech Accessories</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-white font-black text-xs tracking-widest uppercase">HELP & SUPPORT</h4>
            <ul className="space-y-2.5 text-neutral-400 text-xs uppercase tracking-wider font-medium">
              <li><a href="#orders" className="hover:text-white transition-colors">Track Your Order</a></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Returns & Exchanges</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Warranty Claims</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Shipping & Delivery Rates</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h4 className="text-white font-black text-xs tracking-widest uppercase">STAY IN TOUCH</h4>
            <p className="text-xs text-neutral-400">
              Subscribe for VIP member drops, early sale access, and instant discount vouchers.
            </p>
            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Coupon sent! Use code <strong>BUYSMART10</strong></span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="ENTER YOUR EMAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-white placeholder-neutral-500 uppercase tracking-wider focus:outline-none focus:border-white transition-colors"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 transition-colors"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Payment Partner Logos Strip */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
            <span className="font-bold text-neutral-300 uppercase tracking-wider">100% SECURE PAYMENTS:</span>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-white font-mono text-[10px]">UPI</span>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-white font-mono text-[10px]">Google Pay</span>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-white font-mono text-[10px]">PhonePe</span>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-white font-mono text-[10px]">Paytm</span>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-white font-mono text-[10px]">Visa</span>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-white font-mono text-[10px]">Mastercard</span>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-white font-mono text-[10px]">RuPay</span>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-white font-mono text-[10px]">NetBanking</span>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-white font-mono text-[10px]">Cash on Delivery</span>
          </div>

          <span className="text-[11px] text-neutral-400 font-mono">
            SSL 256-BIT ENCRYPTION
          </span>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-500 uppercase tracking-wider">
          <p>© {new Date().getFullYear()} BUYSMART ELECTRONICS PVT. LTD. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-neutral-300 cursor-pointer">PRIVACY</span>
            <span>•</span>
            <span className="hover:text-neutral-300 cursor-pointer">TERMS</span>
            <span>•</span>
            <span className="hover:text-neutral-300 cursor-pointer">SECURITY</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
