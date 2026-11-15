import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Cpu, 
  Search,
  CheckCircle2,
  TrendingUp,
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  HardDrive
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
    'Smartphones': <Smartphone size={20} />,
    'Laptops': <Laptop size={20} />,
    'Headphones': <Headphones size={20} />,
    'Smartwatches': <Watch size={20} />,
    'Accessories': <HardDrive size={20} />
  };

  const samplePrompts = [
    { title: "Laptops under ₹60,000 for ML & Coding", query: "I need a laptop under ₹60,000 for programming, machine learning, and occasional gaming." },
    { title: "Best Camera Phone under ₹25,000", query: "Which phone has the best camera and battery under ₹25,000?" },
    { title: "Compare Flagship Audio", query: "Compare Sony WH-1000XM5 vs Bose QuietComfort 45 for office work and ANC." },
    { title: "Store Return Policy", query: "What is the return and replacement policy for electronics?" }
  ];

  return (
    <div className="space-y-16">
      
      {/* Hero Section with Glassmorphic Gradient */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-600/20 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-indigo-600/15 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold animate-fade-in">
            <Sparkles size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
            <span>Next-Gen AI Shopping Assistant with RAG & PostgreSQL</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Shop Smarter with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Verified Technical AI
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Ask in natural language. Get grounded recommendations backed by live PostgreSQL inventory, normalized DBMS schemas, and real-time specifications. Zero hallucinated prices.
          </p>

          {/* Hero Search Bar */}
          <form onSubmit={handleHeroSearchSubmit} className="max-w-2xl mx-auto relative group">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask e.g. 'Laptop under 60k with 16GB RAM' or search products..."
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
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Sparkles size={13} className="text-brand-400" /> Try Asking:
            </span>
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => quickAsk(p.query)}
                className="px-3 py-1 rounded-full text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-brand-500/40 transition-all shadow-sm"
              >
                {p.title}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Category Pills Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Browse by Category</h2>
            <p className="text-xs text-slate-400">Discover premium electronics with guaranteed warranty</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            All Products <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('products', { category_id: cat.id })}
              className="glass-card rounded-2xl p-4 text-center cursor-pointer group flex flex-col items-center justify-center gap-2.5"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-brand-400 group-hover:text-white group-hover:bg-brand-600 transition-all flex items-center justify-center shadow-md">
                {categoryIcons[cat.name] || <HardDrive size={20} />}
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-brand-400 transition-colors">
                {cat.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={22} className="text-brand-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Trending AI Recommendations</h2>
              <p className="text-xs text-slate-400">Live catalog items filtered and verified by relational SQL</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
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

      {/* RAG & DBMS Architectural Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl glass border border-slate-800 p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Academic DBMS & AI Integration
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                How BuySmart AI Prevents E-Commerce Hallucinations
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Generic LLMs often invent non-existent discount prices or outdated inventory numbers. BuySmart pairs <strong>LangChain RAG semantic search</strong> with an <strong>ACID-compliant PostgreSQL relational database</strong>:
              </p>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Deterministic SQL Filtering</strong>: Prices and stock levels are verified live from relational tables using B-Tree indexed queries.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Vector Distance Ranking</strong>: Chunks of manuals and policies are retrieved via 384-dimensional dense embeddings in pgvector.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Strict Grounding</strong>: The LLM context is constrained to factual catalog data with transparent source citations.</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => quickAsk("Compare Acer Swift Go 14 vs ASUS TUF F15")}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all"
                >
                  <Sparkles size={14} /> Try Live Comparison
                </button>
                <button
                  onClick={() => onNavigate('products')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                >
                  Explore Catalog
                </button>
              </div>
            </div>

            {/* Architecture Card Visual */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                <span className="flex items-center gap-1.5 text-brand-400 font-bold">
                  <Cpu size={14} /> RAG Pipeline Trace
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                  200 OK
                </span>
              </div>
              <p className="text-slate-400">
                <span className="text-purple-400">Query:</span> "Laptop under ₹60k for programming and ML"
              </p>
              <p className="text-slate-400">
                <span className="text-amber-400">SQL Step:</span> SELECT * FROM products WHERE price &lt;= 60000 AND category_id = 2;
              </p>
              <p className="text-slate-400">
                <span className="text-cyan-400">Vector Step:</span> ORDER BY embedding &lt;=&gt; query_vector LIMIT 4;
              </p>
              <p className="text-slate-400">
                <span className="text-emerald-400">Grounded LLM:</span> 2 candidates verified: [Acer Swift Go 14, ASUS TUF F15].
              </p>
              <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800 flex justify-between">
                <span>Latency: 42ms</span>
                <span>Hallucination Risk: 0.0%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Express Fast Delivery</h3>
              <p className="text-xs text-slate-400 mt-0.5">24-48 hour delivery to metro hubs with live tracking.</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <RotateCcw size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">7-Day Free Replacement</h3>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free verified returns on all electronics.</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">100% Genuine Brand Warranty</h3>
              <p className="text-xs text-slate-400 mt-0.5">Official manufacturer warranty and authorized repair.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
