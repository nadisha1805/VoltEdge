import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { WishlistDrawer } from './WishlistDrawer';

export const StorefrontLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#202B3C]">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Header with Navigation, Logo, Search, Account, Wishlist, Cart */}
      <Header />

      {/* Main Routing Views */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 3. Complete Footer */}
      <Footer />

      {/* Drawers */}
      <CartDrawer />
      <WishlistDrawer />
    </div>
  );
};

