import { useEffect, useMemo, useState } from 'react';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { IconInbox, IconCheck, IconX } from '../../components/common/Icons';
import { formatDateTime, formatVND } from '../../utils/formatters';
import { ORDER_STATUS, ORDER_STATUS_LABEL } from '../../utils/constants';

const TABS = [
  { id: ORDER_STATUS.PENDING, label: 'Chờ kích hoạt' },
  { id: ORDER_STATUS.ACTIVE, label: 'Đã kích hoạt' },
  { id: ORDER_STATUS.REJECTED, label: 'Đã từ chối' },
];

const STATUS_TONE = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.ACTIVE]: 'success',
  [ORDER_STATUS.REJECTED]: 'danger',
};

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState(ORDER_STATUS.PENDING);

  async function reload() {
    setOrders(await orderService.getAll());
  }

  useEffect(() => {
    reload().catch((err) => showToast(err.message, 'error'));
  }, []);

  const filtered = useMemo(
    () => orders.filter((o) => o.status === tab).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders, tab]
  );

  async function handleApprove(order) {
    try {
      await orderService.approve(order.id, 'Đã xác nhận thanh toán & kích hoạt key.');
      showToast(`Đã kích hoạt key cho ${order.userEmail}.`, 'success');
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleReject(order) {
    if (!confirm(`Từ chối đơn hàng của ${order.userEmail}?`)) return;
    try {
      await orderService.reject(order.id, 'Admin từ chối kích hoạt.');
      showToast('Đã từ chối đơn hàng.', 'error');
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Yêu cầu kích hoạt key</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>
            Khi người dùng mua sản phẩm bằng số dư, đơn hàng sẽ xuất hiện tại đây để bạn xét duyệt và kích hoạt key.
          </p>
        </div>
      </div>

      <div className="tab-row">
        {TABS.map((t) => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label} ({orders.filter((o) => o.status === t.id).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={IconInbox} title="Không có đơn hàng nào ở trạng thái này" />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Sản phẩm / Gói</th>
                <th>Giá</th>
                <th>License Key</th>
                <th>Thời gian mua</th>
                <th>Trạng thái</th>
                {tab === ORDER_STATUS.PENDING && <th style={{ textAlign: 'right' }}>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>{o.userEmail}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.productName}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{o.packageName}</div>
                  </td>
                  <td>{formatVND(o.price)}</td>
                  <td className="mono">{o.licenseKey}</td>
                  <td className="text-muted">{formatDateTime(o.createdAt)}</td>
                  <td><Badge tone={STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge></td>
                  {tab === ORDER_STATUS.PENDING && (
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(o)}>
                          <IconCheck /> Kích hoạt
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => handleReject(o)}>
                          <IconX /> Từ chối
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
