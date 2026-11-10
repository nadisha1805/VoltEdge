import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Customer Layout & Pages
import { StorefrontLayout } from './components/StorefrontLayout';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

// Admin Components & Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminBrandsPage } from './pages/admin/AdminBrandsPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminMovementsPage } from './pages/admin/AdminMovementsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminStaffPage } from './pages/admin/AdminStaffPage';
import { AdminEnquiriesPage } from './pages/admin/AdminEnquiriesPage';
import { AdminNewsletterPage } from './pages/admin/AdminNewsletterPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <AdminAuthProvider>
            <Router>
              <Routes>
                {/* 1. Customer-Facing Storefront Routes (Milestone 1 Preserved) */}
                <Route element={<StorefrontLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                </Route>

                {/* 2. Admin Authentication Route */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* 3. Protected Admin Management Routes (Milestone 2) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminOverviewPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="brands" element={<AdminBrandsPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                  <Route path="inventory/movements" element={<AdminMovementsPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="coupons" element={<AdminCouponsPage />} />
                  <Route
                    path="staff"
                    element={
                      <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                        <AdminStaffPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="enquiries" element={<AdminEnquiriesPage />} />
                  <Route path="newsletter" element={<AdminNewsletterPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route
                    path="settings"
                    element={
                      <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                        <AdminSettingsPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Catch-all redirect to homepage */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </AdminAuthProvider>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
};

export default App;
