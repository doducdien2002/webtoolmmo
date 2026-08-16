import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { IconDashboard, IconBox, IconInbox, IconUsers, IconImage, IconWallet } from '../common/Icons';

const NAV_GROUPS = [
  {
    label: 'Quản trị',
    items: [
      { to: '/admin', label: 'Tổng quan', icon: IconDashboard, end: true },
      { to: '/admin/products', label: 'Sản phẩm', icon: IconBox },
      { to: '/admin/media', label: 'Thư viện ảnh', icon: IconImage },
      { to: '/admin/topups', label: 'Duyệt nạp tiền', icon: IconWallet },
      { to: '/admin/billing', label: 'Mã QR CK', icon: IconWallet },
      { to: '/admin/orders', label: 'Yêu cầu kích hoạt', icon: IconInbox },
      { to: '/admin/users', label: 'Người dùng', icon: IconUsers },
    ],
  },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar groups={NAV_GROUPS} brandSubtitle="Khu vực quản trị" collapsed={collapsed} />
      <div className="main-area">
        <Topbar onToggleSidebar={() => setCollapsed((v) => !v)} searchPlaceholder="Tìm đơn hàng, người dùng..." />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
