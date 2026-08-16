import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { IconDashboard, IconBox, IconKey, IconWallet } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Điều hướng',
    items: [
      { to: '/', label: 'Bảng điều khiển', icon: IconDashboard, end: true },
      { to: '/products', label: 'Kho sản phẩm', icon: IconBox },
      { to: '/my-keys', label: 'Key của tôi', icon: IconKey },
    ],
  },
  {
    label: 'Thanh toán',
    items: [{ to: '/top-up', label: 'Nạp tiền', icon: IconWallet }],
  },
];

export default function UserLayout() {
  const { isAdmin, isReady } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 960
  );

  if (isReady && isAdmin && location.pathname === '/') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        groups={NAV_GROUPS}
        brandSubtitle="Kho tool & source code"
        collapsed={collapsed}
        onNavigate={() => setCollapsed(true)}
      />
      {!collapsed && (
        <div className="sidebar-backdrop" onClick={() => setCollapsed(true)} />
      )}
      <div className={`main-area ${collapsed ? 'is-expanded' : ''}`}>
        <Topbar onToggleSidebar={() => setCollapsed((v) => !v)} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
