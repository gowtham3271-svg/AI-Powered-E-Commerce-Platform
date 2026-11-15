import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  X, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Layers, 
  Check, 
  Sparkles,
  ArrowRight
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

  const popularBrands = ['Apple', 'ASUS', 'Samsung', 'Acer', 'Lenovo', 'OnePlus', 'Dell', 'Sony', 'Bose', 'Logitech', 'HP'];

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      
      {/* Top Banner & Header (Snitch Category Banner Style) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-white">
            ALL PRODUCTS ({products.length})
          </h1>
          <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
            Certified authentic electronics with 100% manufacturer warranty & express dispatch
          </p>
        </div>

        {/* Global compare button if items selected */}
        {compareIds.length > 0 && (
          <button
            onClick={() => setIsComparing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:bg-neutral-200 transition-all animate-fade-in"
          >
            <Layers size={14} />
            <span>COMPARE ({compareIds.length})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-6 bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800 h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <SlidersHorizontal size={14} /> FILTERS
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-neutral-400 hover:text-white transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-black text-white uppercase tracking-wider">Category</label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  selectedCategory === undefined ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    selectedCategory === cat.id ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Brands */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <label className="text-xs font-black text-white uppercase tracking-wider">Brand</label>
            <div className="flex flex-wrap gap-1.5">
              {popularBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(selectedBrand === b ? '' : b)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-all ${
                    selectedBrand === b
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <div className="flex justify-between items-center text-xs">
              <label className="font-black text-white uppercase tracking-wider">Max Price</label>
              <span className="font-mono text-white font-bold">
                ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={150000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-white bg-neutral-800 h-1 rounded-lg cursor-pointer"
            />
          </div>

          {/* In Stock Only Toggle */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider">In Stock Only</span>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded accent-white cursor-pointer"
            />
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Controls Bar: Search, Mobile Filter, Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products, specs (e.g. 16GB, OLED)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-neutral-500" />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-neutral-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold border border-neutral-800"
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-black border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300">
                <ArrowUpDown size={13} className="text-neutral-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer text-xs uppercase font-bold"
                >
                  <option value="newest" className="bg-neutral-900">Newest First</option>
                  <option value="price_asc" className="bg-neutral-900">Price: Low to High</option>
                  <option value="price_desc" className="bg-neutral-900">Price: High to Low</option>
                  <option value="rating_desc" className="bg-neutral-900">Customer Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters Pill Bar */}
          {(selectedCategory !== undefined || selectedBrand || search || inStockOnly || maxPrice < 150000) && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-neutral-500 text-[11px] uppercase font-bold">Active:</span>
              {selectedBrand && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 text-white text-[11px]">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('')}><X size={12} /></button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 text-white text-[11px]">
                  Search: "{search}"
                  <button onClick={() => setSearch('')}><X size={12} /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 text-white text-[11px]">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)}><X size={12} /></button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-neutral-400 hover:text-white underline text-[11px] ml-1"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid (Snitch High Aspect Ratio Cards) */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-neutral-900 border border-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center space-y-3">
              <p className="text-sm font-bold text-white uppercase tracking-wider">No products match your current filters</p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Try widening your price range, clearing brand filters, or asking our AI shopping advisor.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-white text-black rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-200"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
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
