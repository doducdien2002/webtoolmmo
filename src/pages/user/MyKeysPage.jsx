import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { IconKey } from '../../components/common/Icons';
import { formatDateTime, formatVND } from '../../utils/formatters';
import { ORDER_STATUS, ORDER_STATUS_LABEL } from '../../utils/constants';

const STATUS_TONE = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.ACTIVE]: 'success',
  [ORDER_STATUS.REJECTED]: 'danger',
};

export default function MyKeysPage() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let alive = true;
    if (currentUser) {
      orderService.getByUser(currentUser.id)
        .then((items) => { if (alive) setOrders(items); })
        .catch(() => { if (alive) setOrders([]); });
    } else {
      setOrders([]);
    }
    return () => { alive = false; };
  }, [currentUser]);

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Key của tôi</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>
            Danh sách license key theo từng đơn hàng đã mua. Key sẽ hiển thị sau khi admin kích hoạt.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={IconKey} title="Bạn chưa có key nào" desc="Mua sản phẩm để nhận key sử dụng." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Gói</th>
                <th>Giá</th>
                <th>License Key</th>
                <th>Trạng thái</th>
                <th>Ngày mua</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600 }}>{o.productName}</td>
                  <td className="text-muted">{o.packageName}</td>
                  <td>{formatVND(o.price)}</td>
                  <td className="mono">
                    {o.status === ORDER_STATUS.ACTIVE ? o.licenseKey : '••••-••••-••••'}
                  </td>
                  <td><Badge tone={STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge></td>
                  <td className="text-muted">{formatDateTime(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
