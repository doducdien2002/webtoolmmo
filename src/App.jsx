import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import DashboardPage from './pages/user/DashboardPage';
import ProductsPage from './pages/user/ProductsPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import MyKeysPage from './pages/user/MyKeysPage';
import TopUpPage from './pages/user/TopUpPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminMediaPage from './pages/admin/AdminMediaPage';
import AdminTopUpsPage from './pages/admin/AdminTopUpsPage';
import AdminBillingPage from './pages/admin/AdminBillingPage';

import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Public - ai cũng xem được, không cần đăng nhập */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:productId" element={<ProductDetailPage />} />
            </Route>

            {/* Private - bắt buộc đăng nhập */}
            <Route element={<ProtectedRoute />}>
              <Route element={<UserLayout />}>
                <Route path="/my-keys" element={<MyKeysPage />} />
                <Route path="/top-up" element={<TopUpPage />} />
              </Route>
            </Route>

            {/* Khu vực quản trị (yêu cầu role = admin) */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/products" element={<AdminProductsPage />} />
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/media" element={<AdminMediaPage />} />
                <Route path="/admin/topups" element={<AdminTopUpsPage />} />
                <Route path="/admin/billing" element={<AdminBillingPage />} />
              </Route>
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
