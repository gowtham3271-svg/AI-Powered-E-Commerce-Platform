import React, { useState } from 'react';
import { 
  Sparkles, 
  ShoppingCart, 
  Layers, 
  User as UserIcon, 
  Search, 
  LogOut, 
  Package, 
  ShieldCheck, 
  Menu, 
  X,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useChat } from '../context/ChatContext';

interface NavbarProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, openCart } = useCart();
  const { openChat, compareIds, setIsComparing } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('products', { search: searchQuery.trim() });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent">
              BuySmart
            </span>
            <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-brand-500/10 text-brand-400 rounded border border-brand-500/20">
              AI Powered
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search laptops, phones, specs (e.g. 16GB RAM, OLED)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
          <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
        </form>

        {/* Nav Links & Action Triggers */}
        <div className="flex items-center gap-3">
          
          {/* Catalog Link */}
          <button
            onClick={() => onNavigate('products')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              currentPage === 'products' ? 'text-brand-400 bg-brand-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Explore Catalog
          </button>

          {/* AI Shopping Assistant Pill Button */}
          <button
            onClick={openChat}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles size={15} />
            <span>Ask AI</span>
          </button>

          {/* Compare Pill (if items selected) */}
          {compareIds.length > 0 && (
            <button
              onClick={() => setIsComparing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-full border border-slate-700 transition-all animate-bounce"
            >
              <Layers size={14} className="text-brand-400" />
              <span>Compare ({compareIds.length})</span>
            </button>
          )}

          {/* Shopping Cart Drawer Trigger */}
          <button
            onClick={openCart}
            aria-label="View Shopping Cart"
            className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-600 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 animate-fade-in">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth State */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs font-medium text-slate-200"
              >
                <span className="hidden sm:inline font-semibold">{user.name.split(' ')[0]}</span>
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                  {user.name.charAt(0)}
                </div>
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-xl glass-dropdown shadow-2xl py-2 z-50 animate-fade-in"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-xs font-bold text-white truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-semibold uppercase">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => { onNavigate('orders'); setUserDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <Package size={14} /> My Orders
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => { onNavigate('admin'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-indigo-400 hover:bg-slate-800 flex items-center gap-2 transition-colors font-semibold"
                    >
                      <ShieldCheck size={14} /> Admin Dashboard
                    </button>
                  )}

                  <button
                    onClick={() => { logout(); setUserDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors mt-1 border-t border-slate-800/80"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-all"
            >
              <UserIcon size={14} />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 border-t border-slate-800 bg-slate-950/95">
          <form onSubmit={handleSearchSubmit} className="relative mt-2">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-sm text-slate-200"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
          </form>
          <button
            onClick={() => { onNavigate('products'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 rounded-lg"
          >
            All Products
          </button>
          <button
            onClick={() => { onNavigate('orders'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 rounded-lg"
          >
            Order History
          </button>
        </div>
      )}
    </header>
  );
};
