import React, { useState } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Search, 
  LogOut, 
  Package, 
  ShieldCheck, 
  Menu, 
  X,
  Truck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useChat } from '../context/ChatContext';

interface NavbarProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { openChat, compareIds, setIsComparing } = useChat();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('products', { search: searchQuery.trim() });
      setSearchOpen(false);
    }
  };

  const navCategories = [
    { label: 'ALL PRODUCTS', query: {} },
    { label: 'LAPTOPS', query: { category_id: 2 } },
    { label: 'SMARTPHONES', query: { category_id: 1 } },
    { label: 'AUDIO & ANC', query: { category_id: 3 } },
    { label: 'SMARTWATCHES', query: { category_id: 4 } },
  ];

  return (
    <header className="sticky top-0 z-40 w-full flex flex-col font-sans">
      
      {/* 1. Snitch Top Marquee Announcement Ribbon */}
      <div className="w-full bg-white text-black py-1 px-4 text-[11px] font-black tracking-widest uppercase flex items-center justify-center overflow-hidden border-b border-neutral-200">
        <div className="flex items-center gap-6 animate-pulse">
          <span className="flex items-center gap-1.5">
            <Truck size={13} /> FREE EXPRESS SHIPPING ON ALL ORDERS OVER ₹499
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">USE CODE: <strong>BUYSMART10</strong> FOR FLAT 10% OFF</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">100% BRAND AUTHORIZED WARRANTY</span>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Clean Minimal Snitch Monochrome) */}
      <div className="w-full bg-black/95 backdrop-blur-md border-b border-neutral-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Hamburger & Desktop Links */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Navigation Menu"
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <Menu size={22} />
            </button>

            {/* Desktop Category Links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold tracking-wider uppercase text-neutral-400">
              {navCategories.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate('products', item.query)}
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Center: Signature Bold Monochrome Brand Logo */}
          <div 
            onClick={() => onNavigate('home')} 
            className="cursor-pointer text-center group"
          >
            <h1 className="text-xl sm:text-2xl font-black tracking-[0.25em] uppercase text-white group-hover:text-neutral-300 transition-colors">
              BUYSMART
            </h1>
          </div>

          {/* Right: Search, Wishlist, Bag, Auth & AI */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Ask AI Pill Button */}
            <button
              onClick={openChat}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold border border-neutral-700 transition-all active:scale-95"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Ask AI</span>
            </button>

            {/* Compare pill (if items active) */}
            {compareIds.length > 0 && (
              <button
                onClick={() => setIsComparing(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-200 text-xs font-bold border border-neutral-700"
              >
                <Layers size={13} />
                <span>({compareIds.length})</span>
              </button>
            )}

            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Wishlist Heart Icon */}
            <button
              onClick={openWishlist}
              aria-label="Wishlist"
              className="relative p-1.5 rounded-lg text-neutral-300 hover:text-white transition-colors"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-fade-in">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Icon */}
            <button
              onClick={openCart}
              aria-label="Shopping Bag"
              className="relative p-1.5 rounded-lg text-neutral-300 hover:text-white transition-colors"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-fade-in">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold text-xs uppercase hover:border-neutral-500 transition-colors"
                >
                  {user.name.charAt(0)}
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-2 z-50 animate-fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-neutral-800">
                      <p className="text-[11px] text-neutral-400">Signed in as</p>
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    </div>

                    <button
                      onClick={() => { onNavigate('orders'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
                    >
                      <Package size={14} /> My Orders
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => { onNavigate('admin'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-indigo-400 hover:bg-neutral-800 flex items-center gap-2 font-bold"
                      >
                        <ShieldCheck size={14} /> Admin Portal
                      </button>
                    )}

                    <button
                      onClick={() => { logout(); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-neutral-800 flex items-center gap-2 mt-1 border-t border-neutral-800"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="p-1.5 text-neutral-300 hover:text-white transition-colors"
                title="Sign In"
              >
                <UserIcon size={20} />
              </button>
            )}

          </div>

        </div>
      </div>

      {/* 3. Search Slide-down Dropdown (Snitch Search Experience) */}
      {searchOpen && (
        <div className="w-full bg-neutral-950 border-b border-neutral-800 p-4 animate-slide-up">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto relative flex items-center">
            <Search size={18} className="absolute left-4 text-neutral-500" />
            <input
              type="text"
              autoFocus
              placeholder="SEARCH BY PRODUCT, SPEC, BRAND (E.G. OLED, RTX 4060, MACBOOK)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-full py-3 pl-12 pr-28 text-xs sm:text-sm text-white placeholder-neutral-500 uppercase tracking-wider focus:outline-none focus:border-white transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-1.5 bg-white text-black font-black uppercase text-xs rounded-full hover:bg-neutral-200 transition-colors"
            >
              SEARCH
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="ml-3 p-2 text-neutral-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </form>
        </div>
      )}

      {/* 4. Left Hamburger Slide-in Navigation Drawer (Snitch Style) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            onClick={() => setMobileMenuOpen(false)} 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
          />
          <div className="relative w-72 max-w-[80vw] bg-black border-r border-neutral-800 h-full p-6 flex flex-col justify-between z-10 animate-slide-up">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <span className="text-lg font-black tracking-widest uppercase text-white">MENU</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="p-1 rounded-lg text-neutral-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-bold tracking-widest uppercase text-neutral-300">
                {navCategories.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => { onNavigate('products', item.query); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 hover:text-white border-b border-neutral-900 flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <ArrowRight size={14} className="text-neutral-600" />
                  </button>
                ))}
                <button
                  onClick={() => { onNavigate('orders'); setMobileMenuOpen(false); }}
                  className="w-full text-left py-2 hover:text-white border-b border-neutral-900 flex items-center justify-between"
                >
                  <span>TRACK ORDERS</span>
                  <ArrowRight size={14} className="text-neutral-600" />
                </button>
                <button
                  onClick={() => { openWishlist(); setMobileMenuOpen(false); }}
                  className="w-full text-left py-2 hover:text-white border-b border-neutral-900 flex items-center justify-between"
                >
                  <span>SAVED WISHLIST ({wishlistCount})</span>
                  <Heart size={14} className="text-rose-500" />
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800 space-y-3">
              <button
                onClick={() => { openChat(); setMobileMenuOpen(false); }}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-neutral-800"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>CONSULT AI ADVISOR</span>
              </button>
              <p className="text-[10px] text-neutral-500 text-center uppercase tracking-wider">
                BUYSMART TECH D2C INDIA
              </p>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
