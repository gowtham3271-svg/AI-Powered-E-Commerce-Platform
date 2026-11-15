import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  X, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Layers, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { Product, Category } from '../types';
import { api } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { useChat } from '../context/ChatContext';

interface ProductsPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialParams?: { category_id?: number; search?: string };
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onNavigate, initialParams }) => {
  const { quickAsk, compareIds, setIsComparing } = useChat();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(initialParams?.category_id);
  const [search, setSearch] = useState<string>(initialParams?.search || '');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const popularBrands = ['Apple', 'ASUS', 'Samsung', 'Acer', 'Lenovo', 'OnePlus', 'Dell', 'Xiaomi', 'Google', 'Sony', 'Bose', 'Anker', 'Logitech', 'HP'];

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialParams?.category_id !== undefined) {
      setSelectedCategory(initialParams.category_id);
    }
    if (initialParams?.search !== undefined) {
      setSearch(initialParams.search);
    }
  }, [initialParams]);

  useEffect(() => {
    setLoading(true);
    api.getProducts({
      category_id: selectedCategory,
      brand: selectedBrand || undefined,
      max_price: maxPrice < 150000 ? maxPrice : undefined,
      search: search || undefined,
      in_stock_only: inStockOnly,
      sort_by: sortBy,
    })
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedBrand, maxPrice, search, inStockOnly, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory(undefined);
    setSelectedBrand('');
    setMaxPrice(150000);
    setSearch('');
    setInStockOnly(false);
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Explore Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse verified electronics with relational schema integrity and live stock counts
          </p>
        </div>

        {/* Global compare button if items selected */}
        {compareIds.length > 0 && (
          <button
            onClick={() => setIsComparing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/30 transition-all animate-fade-in"
          >
            <Layers size={15} />
            <span>Compare Selected ({compareIds.length})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-6 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-brand-400" /> Filters
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-slate-500 hover:text-brand-400 transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider">Category</label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === undefined ? 'bg-brand-500/20 text-brand-400 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat.id ? 'bg-brand-500/20 text-brand-400 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-white uppercase tracking-wider">Max Budget</label>
              <span className="font-mono font-bold text-brand-400">
                {maxPrice >= 150000 ? 'No Limit' : `₹${maxPrice.toLocaleString('en-IN')}`}
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="150000"
              step="2000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹2,000</span>
              <span>₹1,50,000+</span>
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold text-white uppercase tracking-wider">Brand</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedBrand('')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  selectedBrand === '' ? 'bg-brand-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              {popularBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(selectedBrand === b ? '' : b)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                    selectedBrand === b ? 'bg-brand-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500 accent-brand-500"
              />
              <span>In-Stock Items Only</span>
            </label>
          </div>
        </aside>

        {/* Product Catalog Grid & Top Controls */}
        <main className="lg:col-span-3 space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products, keywords, specs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <Search size={14} className="absolute left-3 top-3 text-slate-500" />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort & Mobile Filter Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
                <ArrowUpDown size={13} className="text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="newest" className="bg-slate-900 text-white">Newest First</option>
                  <option value="price_asc" className="bg-slate-900 text-white">Price: Low to High</option>
                  <option value="price_desc" className="bg-slate-900 text-white">Price: High to Low</option>
                </select>
              </div>

              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
              >
                <Filter size={16} />
              </button>
            </div>
          </div>

          {/* Results Summary & Active Pills */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing <strong className="text-white">{products.length}</strong> verified products</span>
            {(selectedCategory || selectedBrand || search || inStockOnly) && (
              <button
                onClick={handleResetFilters}
                className="text-brand-400 hover:underline"
              >
                Clear all active filters
              </button>
            )}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center space-y-3 glass rounded-2xl border border-slate-800 p-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <Search size={28} />
              </div>
              <h3 className="text-base font-bold text-white">No products found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No catalog items match your selected filters. Try broadening your budget range or category selection.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => quickAsk(`Recommend a product similar to ${search || 'electronics'}`)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> Ask Assistant to Search
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={(id) => onNavigate('product-detail', { id })}
                />
              ))}
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
