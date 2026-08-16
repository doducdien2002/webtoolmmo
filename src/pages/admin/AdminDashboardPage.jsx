import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { authService } from '../../services/authService';
import { topUpService } from '../../services/topUpService';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { IconWallet, IconInbox, IconBox, IconKey } from '../../components/common/Icons';
import { formatDateTime, formatVND } from '../../utils/formatters';
import { ORDER_STATUS, TOPUP_STATUS } from '../../utils/constants';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ revenue: 0, pending: 0, active: 0, products: 0, users: 0, topups: 0 });
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    let alive = true;
    Promise.all([
      orderService.getAll(),
      productService.getAll(),
      authService.getUsers(),
      topUpService.getAll(),
    ]).then(([orders, products, users, topups]) => {
      if (!alive) return;
      setStats({
        revenue: orders.filter((o) => o.status === ORDER_STATUS.ACTIVE).reduce((sum, o) => sum + Number(o.price || 0), 0),
        pending: orders.filter((o) => o.status === ORDER_STATUS.PENDING).length,
        active: orders.filter((o) => o.status === ORDER_STATUS.ACTIVE).length,
        products: products.length,
        users: users.length,
        topups: topups.filter((item) => item.status === TOPUP_STATUS.PENDING).length,
      });
      setPendingOrders(orders.filter((o) => o.status === ORDER_STATUS.PENDING).slice(0, 6));
    }).catch(console.error);
    return () => { alive = false; };
  }, []);

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Tổng quan quản trị</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Theo dõi doanh thu, đơn hàng, nạp tiền và hệ thống key.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={IconWallet} label="Doanh thu đã kích hoạt" value={formatVND(stats.revenue)} tone="primary" />
        <StatCard icon={IconInbox} label="Đơn chờ kích hoạt" value={stats.pending} tone="warning" />
        <StatCard icon={IconWallet} label="Nạp tiền chờ duyệt" value={stats.topups} tone="warning" />
        <StatCard icon={IconKey} label="Key đã kích hoạt" value={stats.active} tone="success" />
        <StatCard icon={IconBox} label="Sản phẩm" value={stats.products} tone="accent" />
      </div>

      <div className="section-head">
        <div>
          <h2>Yêu cầu kích hoạt gần đây</h2>
          <p>Các đơn hàng mới nhất đang chờ bạn xử lý.</p>
        </div>
        <Link to="/admin/orders" className="btn btn-outline btn-sm">Xem tất cả</Link>
      </div>

      {pendingOrders.length === 0 ? (
        <EmptyState icon={IconInbox} title="Không có yêu cầu nào" desc="Mọi đơn hàng đã được xử lý." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Gói</th>
                <th>Giá</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.userEmail}</td>
                  <td style={{ fontWeight: 600 }}>{o.productName}</td>
                  <td className="text-muted">{o.packageName}</td>
                  <td>{formatVND(o.price)}</td>
                  <td className="text-muted">{formatDateTime(o.createdAt)}</td>
                  <td><Badge tone="warning">Chờ kích hoạt</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
