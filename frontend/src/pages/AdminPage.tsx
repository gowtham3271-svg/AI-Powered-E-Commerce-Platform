import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Package, 
  DollarSign, 
  ShoppingBag, 
  Cpu, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import { AdminStats, Product, Category } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface AdminPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'ingest'>('products');
  const [loading, setLoading] = useState(true);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdCatId, setNewProdCatId] = useState<number>(1);
  const [newProdPrice, setNewProdPrice] = useState<number>(49999);
  const [newProdStock, setNewProdStock] = useState<number>(15);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdSpecs, setNewProdSpecs] = useState('{"RAM": "16GB", "Storage": "512GB SSD", "Processor": "Intel Core i5"}');
  const [productSuccess, setProductSuccess] = useState<string | null>(null);

  // Knowledge Ingestion Form State
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('policy');
  const [docSource, setDocSource] = useState('manuals/custom_policy.md');
  const [docContent, setDocContent] = useState('');
  const [ingestSuccess, setIngestSuccess] = useState<string | null>(null);
  const [ingesting, setIngesting] = useState(false);

  const refreshStats = () => {
    api.getAdminStats().then(setStats).catch(console.error);
  };

  useEffect(() => {
    if (isAdmin) {
      Promise.all([
        api.getAdminStats(),
        api.getProducts({ limit: 100 }),
        api.getCategories()
      ]).then(([st, prods, cats]) => {
        setStats(st);
        setProducts(prods);
        setCategories(cats);
        if (cats.length > 0) setNewProdCatId(cats[0].id);
      }).catch(console.error).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400">
          This portal allows inventory adjustments, catalog creation, and RAG document ingestion.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-3 bg-white text-black font-black uppercase tracking-wider text-xs rounded-xl hover:bg-neutral-200 transition-all shadow-xl"
        >
          Sign in as Admin (admin@buysmart.com)
        </button>
      </div>
    );
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedSpecs = {};
      try {
        parsedSpecs = JSON.parse(newProdSpecs);
      } catch {
        parsedSpecs = { details: newProdSpecs };
      }

      const created = await api.createProduct({
        category_id: Number(newProdCatId),
        name: newProdName,
        brand: newProdBrand,
        description: newProdDesc,
        price: Number(newProdPrice),
        stock_quantity: Number(newProdStock),
        specifications: parsedSpecs,
        image_url: newProdImage || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'
      });

      setProducts(prev => [created, ...prev]);
      setProductSuccess(`Product '${created.name}' created successfully!`);
      setNewProdName('');
      setNewProdDesc('');
      refreshStats();
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    }
  };

  const handleStockUpdate = async (productId: number, newStock: number) => {
    if (newStock < 0) return;
    try {
      const updated = await api.updateProduct(productId, { stock_quantity: newStock });
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
      refreshStats();
    } catch (err: any) {
      alert(err.message || 'Stock update failed');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      refreshStats();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleIngestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIngesting(true);
      setIngestSuccess(null);
      const res = await api.ingestDocument({
        title: docTitle,
        document_type: docType,
        source: docSource,
        content: docContent
      });
      setIngestSuccess(`Document '${res.title}' ingested into ${res.chunks_created} vector chunks!`);
      setDocTitle('');
      setDocContent('');
      refreshStats();
    } catch (err: any) {
      alert(err.message || 'Ingestion failed');
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold uppercase">
              Admin Portal
            </span>
            <span className="text-xs text-slate-400">• Authenticated as {user?.email}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Store & RAG Knowledge Management
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="p-1 rounded-xl bg-neutral-900 border border-neutral-800 flex text-xs font-black uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'products' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Package size={14} /> Catalog & Stock
          </button>
          <button
            onClick={() => setActiveTab('ingest')}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'ingest' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Cpu size={14} /> RAG Knowledge Base
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 uppercase font-black tracking-wider block">Total Revenue</span>
            <span className="text-lg font-black text-white mt-1 block">
              ₹{stats.total_revenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 uppercase font-black tracking-wider block">Total Orders</span>
            <span className="text-lg font-black text-white mt-1 block">
              {stats.total_orders}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Catalog Products</span>
            <span className="text-lg font-extrabold text-white mt-1 block">
              {stats.total_products}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Vector Chunks</span>
            <span className="text-lg font-extrabold text-indigo-400 mt-1 block">
              {stats.vector_chunks_indexed}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Low Stock</span>
            <span className="text-lg font-extrabold text-amber-400 mt-1 block">
              {stats.low_stock_products}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Out of Stock</span>
            <span className="text-lg font-extrabold text-rose-400 mt-1 block">
              {stats.out_of_stock_products}
            </span>
          </div>
        </div>
      )}

      {/* Tab 1: Product & Stock Management */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Product Form */}
          <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 h-fit shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Plus size={16} className="text-white" /> Add Catalog Product
            </h3>

            {productSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {productSuccess}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dell XPS 13 Plus"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Dell"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newProdCatId}
                    onChange={(e) => setNewProdCatId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Marketing overview and key highlights..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Specifications (JSON format)</label>
                <textarea
                  rows={3}
                  value={newProdSpecs}
                  onChange={(e) => setNewProdSpecs(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-black uppercase tracking-wider shadow-xl transition-all mt-3"
              >
                Create Product Item
              </button>
            </form>
          </div>

          {/* Catalog & Inventory Table */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Catalog Inventory ({products.length} products)</span>
              <span className="text-xs text-slate-400 font-normal">Adjust stock or remove items</span>
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock Count</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-white line-clamp-1">{p.name}</p>
                        <span className="text-[10px] text-slate-400">{p.brand}</span>
                      </td>
                      <td className="p-3 text-slate-300">{p.category_name}</td>
                      <td className="p-3 font-mono font-bold text-white">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStockUpdate(p.id, p.stock_quantity - 1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className={`px-2 font-mono font-bold ${
                            p.stock_quantity === 0 ? 'text-rose-400' : p.stock_quantity <= 5 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {p.stock_quantity}
                          </span>
                          <button
                            onClick={() => handleStockUpdate(p.id, p.stock_quantity + 1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: RAG Knowledge Ingestion */}
      {activeTab === 'ingest' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl glass border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Cpu size={20} className="text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">Ingest Knowledge Base Document</h3>
                <p className="text-xs text-slate-400">
                  Recursive chunking, sentence-transformers vector generation, and pgvector relational persistence.
                </p>
              </div>
            </div>

            {ingestSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{ingestSuccess}</span>
              </div>
            )}

            <form onSubmit={handleIngestDocument} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Festival Exchange & Cashback Offer Policy"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  >
                    <option value="policy" className="bg-slate-900 text-white">Store Policy</option>
                    <option value="faq" className="bg-slate-900 text-white">Product FAQ</option>
                    <option value="guide" className="bg-slate-900 text-white">Buying Guide</option>
                    <option value="spec_sheet" className="bg-slate-900 text-white">Technical Spec Sheet</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Source Reference</label>
                  <input
                    type="text"
                    value={docSource}
                    onChange={(e) => setDocSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Full Document Text Content</label>
                <textarea
                  rows={8}
                  placeholder="Paste Markdown or plaintext policy, terms, FAQs, or specs..."
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-[11px] leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={ingesting || !docContent.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                {ingesting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Cpu size={15} />
                    <span>Chunk, Embed & Ingest Document</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
