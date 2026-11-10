import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#202B3C]">
              {/* 1. Announcement Bar */}
              <AnnouncementBar />

              {/* 2-7. Header with Navigation, Logo, Search, Account, Wishlist, Cart placeholders */}
              <Header />

              {/* Main Routing Views */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* 18. Complete Footer */}
              <Footer />

              {/* Drawers */}
              <CartDrawer />
              <WishlistDrawer />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
};

export default App;
