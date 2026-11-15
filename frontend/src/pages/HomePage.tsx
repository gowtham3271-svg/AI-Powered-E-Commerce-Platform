import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Search, 
  Flame, 
  Star, 
  Layers, 
  Tag, 
  Heart, 
  Check, 
  Clock 
} from 'lucide-react';
import { Product, Category } from '../types';
import { api } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { useChat } from '../context/ChatContext';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { quickAsk } = useChat();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('ALL');

  // Flash sale countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 6, minutes: 24, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.all([
      api.getProducts({ limit: 40 }),
      api.getCategories()
    ]).then(([prods, cats]) => {
      setAllProducts(prods);
      setCategories(cats);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  // Filter products by active Snitch tab
  const filteredProducts = selectedCategoryName === 'ALL'
    ? allProducts
    : allProducts.filter(p => p.category_name?.toUpperCase() === selectedCategoryName.toUpperCase());

  const categoryTabs = ['ALL', 'LAPTOPS', 'SMARTPHONES', 'HEADPHONES', 'SMARTWATCHES', 'ACCESSORIES'];

  return (
    <div className="space-y-16 pb-16 font-sans">
      
      {/* 1. Snitch Editorial Hero Section */}
      <section className="relative overflow-hidden bg-black text-white border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col md:flex-row items-center justify-between gap-10">
          
          <div className="space-y-6 max-w-xl text-center md:text-left">
            <span className="inline-block text-[11px] font-black uppercase tracking-[0.25em] text-neutral-400 bg-neutral-900 border border-neutral-800 px-3.5 py-1.5 rounded-full">
              NEW SEASON DROPS 2026
            </span>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-[1.05]">
              UP TO 35% OFF <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
                BESTSELLERS
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-lg">
              Next-generation laptops, flagship smartphones, and noise-cancelling audio curated for modern creators and tech power-users.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                onClick={() => onNavigate('products')}
                className="px-8 py-3.5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-all shadow-2xl active:scale-95"
              >
                EXPLORE COLLECTION
              </button>
              <button
                onClick={() => quickAsk("Compare top laptops for coding and machine learning under ₹70,000")}
                className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase text-xs tracking-wider rounded-xl border border-neutral-700 transition-all flex items-center gap-2"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>CONSULT AI GUIDE</span>
              </button>
            </div>
          </div>

          {/* Hero Visual Spotlight */}
          <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/60 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80"
              alt="Flagship Tech"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/70 backdrop-blur-md border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">SPOTLIGHT DROP</span>
                <h4 className="text-xs font-bold text-white">Apple MacBook Air M2</h4>
              </div>
              <span className="text-xs font-black text-white">₹89,900</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Snitch Trending Tab Section (ALL | LAPTOPS | PHONES | AUDIO...) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6 pb-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-white">
              TRENDING
            </h2>
            <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
              Top curated tech essentials with authorized manufacturer warranty
            </p>
          </div>

          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-black uppercase tracking-wider text-neutral-300 hover:text-white flex items-center gap-1"
          >
            <span>VIEW ALL ({allProducts.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Snitch Signature Category Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto border-b border-neutral-800 pb-2 mb-8 no-scrollbar">
          {categoryTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedCategoryName(tab)}
              className={`text-xs font-black tracking-widest uppercase pb-2 transition-all shrink-0 ${
                selectedCategoryName === tab
                  ? 'text-white border-b-2 border-white'
                  : 'text-neutral-500 hover:text-neutral-300 border-b-2 border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Snitch Vertical Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-neutral-900 border border-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.slice(0, 12).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(id) => onNavigate('product-detail', { id })}
              />
            ))}
          </div>
        )}

      </section>

      {/* 3. Snitch Limited-Time Flash Sale Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
          <div className="space-y-2 text-center md:text-left z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black font-black text-[10px] uppercase tracking-wider">
              <Flame size={13} className="text-rose-500 fill-rose-500" /> FLASH SALE ENDS SOON
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
              EXTRA 10% OFF PREPAID ORDERS
            </h3>
            <p className="text-xs text-neutral-400 max-w-md">
              Use promo coupon code <strong className="text-white font-mono uppercase underline">BUYSMART10</strong> at checkout for an instant flat 10% discount on all flagship electronics.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-3 z-10 shrink-0">
            <div className="flex flex-col items-center p-3 rounded-xl bg-black border border-neutral-800 min-w-[60px]">
              <span className="text-xl font-black text-white font-mono">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-neutral-400 uppercase font-bold">HOURS</span>
            </div>
            <span className="text-xl font-bold text-neutral-600">:</span>
            <div className="flex flex-col items-center p-3 rounded-xl bg-black border border-neutral-800 min-w-[60px]">
              <span className="text-xl font-black text-white font-mono">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-neutral-400 uppercase font-bold">MINS</span>
            </div>
            <span className="text-xl font-bold text-neutral-600">:</span>
            <div className="flex flex-col items-center p-3 rounded-xl bg-black border border-neutral-800 min-w-[60px]">
              <span className="text-xl font-black text-rose-500 font-mono animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-neutral-400 uppercase font-bold">SECS</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Snitch Store Guarantees Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Free Express Delivery</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Complimentary express shipping on all orders over ₹499.</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
              <RotateCcw size={22} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">7-Day Doorstep Replacement</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Instant verified exchange if any defect is identified.</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">100% Brand Authorized</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Direct manufacturer warranty valid at all service centers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-white">
            15,000+ VERIFIED BUYERS
          </h2>
          <p className="text-xs text-neutral-400 uppercase tracking-wider">
            Rated 4.9/5 Across Top Tech Communities in India
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Aditya Sharma",
              city: "Bengaluru",
              comment: "The AI recommendation matched me to the Acer Swift Go 14. Clean website, super fast 24h express delivery, and original brand warranty seal intact.",
              rating: 5
            },
            {
              name: "Ananya Roy",
              city: "Mumbai",
              comment: "Loved the smooth checkout with UPI QR. No hassles, verified tracking updates on WhatsApp, and genuine Sony WH-1000XM5 headphones.",
              rating: 5
            },
            {
              name: "Karan Patel",
              city: "Ahmedabad",
              comment: "The side-by-side spec comparison is a game changer. Snappy UI, great bank discount with code BUYSMART10, and zero hidden charges.",
              rating: 5
            }
          ].map((t, i) => (
            <div key={i} className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed italic">
                "{t.comment}"
              </p>
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white">{t.name}</h5>
                  <span className="text-[10px] text-neutral-500">{t.city}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  VERIFIED BUYER
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
