import { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { orderService } from '../../services/orderService';
import Badge from '../../components/common/Badge';
import { formatDateTime, formatVND } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setUsers(authService.getUsers());
    setOrders(orderService.getAll());
  }, []);

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Người dùng</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Toàn bộ tài khoản đã đăng ký trong hệ thống.</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Số dư</th>
              <th>Số đơn đã mua</th>
              <th>Ngày tham gia</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <Badge tone={u.role === ROLES.ADMIN ? 'primary' : 'neutral'}>
                    {u.role === ROLES.ADMIN ? 'Quản trị viên' : 'Người dùng'}
                  </Badge>
                </td>
                <td>{formatVND(u.balance || 0)}</td>
                <td className="text-muted">{orders.filter((o) => o.userId === u.id).length}</td>
                <td className="text-muted">{formatDateTime(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
