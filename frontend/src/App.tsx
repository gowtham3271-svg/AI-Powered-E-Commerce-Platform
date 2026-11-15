import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ChatProvider } from './context/ChatContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { ChatDrawer } from './components/ChatDrawer';
import { ProductComparisonModal } from './components/ProductComparisonModal';

import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';

export function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'products':
        return <ProductsPage onNavigate={handleNavigate} initialParams={pageParams} />;
      case 'product-detail':
        return <ProductDetailPage productId={pageParams.id} onNavigate={handleNavigate} />;
      case 'orders':
        return <OrderHistoryPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-white selection:text-black font-sans antialiased">
      {/* Global Navbar with Snitch Top Bar */}
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      {/* Main Content View with Smooth Fade Transition */}
      <main className="flex-1 animate-fade-in">
        {renderPage()}
      </main>

      {/* Shopping Bag Drawer (Snitch Style) */}
      <CartDrawer onNavigate={handleNavigate} />

      {/* Wishlist Drawer (Snitch Style) */}
      <WishlistDrawer onNavigate={handleNavigate} />

      {/* Global AI Assistant Floating Widget & Drawer */}
      <ChatDrawer onNavigate={handleNavigate} />

      {/* Product Comparison Modal */}
      <ProductComparisonModal />

      {/* Global Snitch-Style Monochrome Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
