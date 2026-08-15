import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Chỉ cho phép tài khoản có role = admin truy cập khu vực quản trị */
export default function AdminRoute() {
  const { isAuthenticated, isAdmin, isReady } = useAuth();

  if (!isReady) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
