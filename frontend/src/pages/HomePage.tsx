import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Search,
  CheckCircle2, 
  TrendingUp,
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  HardDrive,
  Flame,
  Clock,
  Star,
  Zap,
  Check,
  Award
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
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');

  // Deal of the day countdown simulation
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 47, seconds: 32 });

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
      api.getProducts({ limit: 8 }),
      api.getCategories()
    ]).then(([prods, cats]) => {
      setFeaturedProducts(prods);
      setCategories(cats);
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onNavigate('products', { search: heroSearch.trim() });
    }
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    'Smartphones': <Smartphone size={22} />,
    'Laptops': <Laptop size={22} />,
    'Headphones': <Headphones size={22} />,
    'Smartwatches': <Watch size={22} />,
    'Accessories': <HardDrive size={22} />
  };

  const samplePrompts = [
    { title: "💻 Laptops under ₹60,000 for Coding & ML", query: "I need a high-performance laptop under ₹60,000 for coding, machine learning, and multitasking." },
    { title: "📱 Best Camera Phone under ₹25,000", query: "Which smartphone offers the best camera, battery life, and 5G performance under ₹25,000?" },
    { title: "🎧 Sony WH-1000XM5 vs Bose QC45", query: "Compare Sony WH-1000XM5 and Bose QuietComfort 45 in terms of ANC, comfort, and audio quality." },
    { title: "🛡️ Store Warranty & Return Policy", query: "What is your return, replacement, and manufacturer warranty policy for electronics?" }
  ];

  const testimonials = [
    {
      name: "Aditya Sharma",
      role: "Software Engineer, Bengaluru",
      rating: 5,
      comment: "Asked the AI for a coding laptop under ₹60k with 16GB RAM. It recommended the Acer Swift Go 14. Ordered it and received it in 24 hours in pristine condition with official brand warranty!",
      product: "Acer Swift Go 14"
    },
    {
      name: "Pooja Hegde",
      role: "Product Designer, Mumbai",
      rating: 5,
      comment: "The comparison tool is brilliant. Being able to ask questions about battery life and screen accuracy saved me hours of YouTube reviews. Best electronics shopping experience.",
      product: "Apple MacBook Air M2"
    },
    {
      name: "Rohit Verma",
      role: "Audio Enthusiast, Delhi",
      rating: 5,
      comment: "Got genuine Sony WH-1000XM5 headphones with a flat ₹1,500 bank discount and free express shipping. 100% authentic seal verified.",
      product: "Sony WH-1000XM5"
    }
  ];

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section with Glassmorphic Luxury Gradient */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-brand-600/20 blur-[140px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 w-[420px] h-[280px] bg-indigo-600/15 blur-[110px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Trust Authority Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-bold animate-fade-in shadow-inner">
            <Award size={14} className="text-amber-400" />
            <span>INDIA'S PREMIER AI TECH STORE • 100% AUTHORIZED BRAND PARTNER</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.12]">
            Next-Generation Electronics. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Intelligently Curated.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Shop flagship laptops, smartphones, and audio gear with verified manufacturer warranties, instant bank discounts, and unbiased AI technical guidance.
          </p>

          {/* Hero Search Bar */}
          <form onSubmit={handleHeroSearchSubmit} className="max-w-2xl mx-auto relative group">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search products or ask e.g. 'Laptop under 60k with 16GB RAM'..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="w-full bg-slate-900/90 border-2 border-slate-700/80 hover:border-slate-600 rounded-2xl py-4 pl-12 pr-32 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition-all shadow-xl"
              />
              <Search size={20} className="absolute left-4 text-slate-400 group-hover:text-brand-400 transition-colors" />
              
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/30 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <span>Search</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>

          {/* Suggested Assistant Query Chips */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
              <Sparkles size={13} className="text-brand-400" /> Ask AI:
            </span>
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => quickAsk(p.query)}
                className="px-3 py-1 rounded-full text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-brand-500/40 transition-all shadow-sm flex items-center gap-1"
              >
                <span>{p.title}</span>
              </button>
            ))}
          </div>

          {/* Social Proof Counter Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-800/80">
            <div className="text-center">
              <span className="text-lg sm:text-xl font-black text-white block">15,000+</span>
              <span className="text-[11px] text-slate-400 font-medium">Happy Buyers (4.9/5 ⭐)</span>
            </div>
            <div className="text-center">
              <span className="text-lg sm:text-xl font-black text-emerald-400 block">100%</span>
              <span className="text-[11px] text-slate-400 font-medium">Genuine Brand Warranty</span>
            </div>
            <div className="text-center">
              <span className="text-lg sm:text-xl font-black text-brand-400 block">24-48h</span>
              <span className="text-[11px] text-slate-400 font-medium">Express Free Dispatch</span>
            </div>
            <div className="text-center">
              <span className="text-lg sm:text-xl font-black text-indigo-400 block">7 Days</span>
              <span className="text-[11px] text-slate-400 font-medium">Hassle-Free Replacement</span>
            </div>
          </div>

        </div>
      </section>

      {/* Limited Time Flash Sale Countdown Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-900/90 via-indigo-900/80 to-purple-900/90 border border-brand-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider">
              <Flame size={14} className="fill-slate-950" /> Festive Tech Fest: Up to 35% Off
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Limited-Time Super Deals
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Extra 10% instant discount at checkout with code <strong className="text-amber-300 font-mono">BUYSMART10</strong>. Applicable on Apple, Asus, Samsung, and Sony.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-3 z-10 shrink-0">
            <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[64px]">
              <span className="text-xl sm:text-2xl font-black text-white font-mono">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Hours</span>
            </div>
            <span className="text-2xl font-bold text-slate-600">:</span>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[64px]">
              <span className="text-xl sm:text-2xl font-black text-white font-mono">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Mins</span>
            </div>
            <span className="text-2xl font-bold text-slate-600">:</span>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[64px]">
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Secs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Browse by Category
            </h2>
            <p className="text-xs text-slate-400">Direct manufacturer warranty on all top brands</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('products', { category_id: cat.id })}
              className="glass-card rounded-2xl p-5 text-center cursor-pointer group flex flex-col items-center justify-center gap-3 border border-slate-800/80 hover:border-brand-500/60"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-brand-400 group-hover:text-white group-hover:bg-brand-600 transition-all flex items-center justify-center shadow-lg group-hover:scale-110">
                {categoryIcons[cat.name] || <HardDrive size={22} />}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-400 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-500 block mt-0.5">Explore Deals</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Trending Flagship Deals</h2>
              <p className="text-xs text-slate-400">Hand-picked bestsellers with maximum buyer satisfaction</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
          >
            View all ({featuredProducts.length}+) <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(id) => onNavigate('product-detail', { id })}
              />
            ))}
          </div>
        )}
      </section>

      {/* Customer Trust & Experience Section (Replacing Academic Disclaimers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl glass border border-slate-800 p-8 sm:p-12 relative overflow-hidden bg-slate-900/50">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                <Sparkles size={14} />
                <span>Next-Gen Shopping Intelligence</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Never Regret an Electronics Purchase Again
              </h2>
              
              <p className="text-sm text-slate-300 leading-relaxed">
                Most shoppers waste hours reading contradictory tech reviews and comparing confusing spec sheets. BuySmart's integrated AI Assistant analyzes verified benchmark data, real-time prices, and your specific requirements to find your ideal match in seconds.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="text-white">Unbiased Technical Guidance:</strong> Tailored recommendations for programming, graphic design, battery longevity, or gaming.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="text-white">Side-by-Side Comparison Matrix:</strong> Compare any two laptops or phones in a structured technical spec view.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <strong className="text-white">Zero Inflated Markups:</strong> Live synchronized catalog with authorized brand MRP and genuine discount rates.
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => quickAsk("Compare Acer Swift Go 14 vs ASUS TUF F15")}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Sparkles size={14} /> Try AI Tech Comparison
                </button>
                <button
                  onClick={() => onNavigate('products')}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                >
                  Explore All Products
                </button>
              </div>
            </div>

            {/* Live Interactive Advisor Preview */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                    <Sparkles size={14} />
                  </div>
                  <span className="text-white font-bold text-xs">BuySmart AI Advisor</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live & Ready
                </span>
              </div>

              <div className="space-y-3 font-sans">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-slate-300">
                  <span className="text-brand-400 font-bold block text-[11px] mb-1">Customer Question:</span>
                  "Which laptop is best for coding and ML under ₹60k with at least 16GB RAM?"
                </div>

                <div className="p-3 rounded-xl bg-brand-950/40 border border-brand-500/30 text-slate-200 space-y-2">
                  <span className="text-indigo-400 font-bold block text-[11px]">AI Advisor Answer:</span>
                  <p className="text-[11px] leading-relaxed">
                    Based on your requirements, the <strong className="text-white">Acer Swift Go 14 (₹57,999)</strong> is the top pick: Intel Core i5-13500H, 16GB LPDDR5 RAM, and a stunning 2.8K OLED display for coding comfort. If you also need dedicated GPU power for PyTorch/TensorFlow, look at the <strong className="text-white">ASUS TUF F15 (₹54,990)</strong> with RTX 3050.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800">
                <span>Verified Stock: 12 Units</span>
                <span className="text-emerald-400 font-semibold">100% Genuine Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews & Social Proof Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
            <Star size={13} className="fill-amber-400 text-amber-400" /> 4.9/5 Average Customer Rating
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Loved by 15,000+ Tech Enthusiasts
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            See how real buyers are making smarter choices with BuySmart
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{t.name}</h4>
                  <p className="text-[10px] text-slate-400">{t.role}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Store Guarantees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 flex items-center gap-4 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Express Nationwide Shipping</h3>
              <p className="text-xs text-slate-400 mt-0.5">24-48 hour delivery to all major cities with real-time tracking.</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 flex items-center gap-4 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <RotateCcw size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">7-Day Doorstep Replacement</h3>
              <p className="text-xs text-slate-400 mt-0.5">Zero hassle replacement if any manufacturing defect is found.</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 flex items-center gap-4 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">100% Genuine Brand Warranty</h3>
              <p className="text-xs text-slate-400 mt-0.5">Direct manufacturer warranty valid at all official service centers.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
