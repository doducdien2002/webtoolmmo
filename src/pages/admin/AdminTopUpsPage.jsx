import { useEffect, useMemo, useState } from 'react';
import { topUpService } from '../../services/topUpService';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { IconCheck, IconInbox, IconWallet, IconX } from '../../components/common/Icons';
import { formatDateTime, formatVND } from '../../utils/formatters';
import { TOPUP_STATUS, TOPUP_STATUS_LABEL } from '../../utils/constants';

const TABS = [
  { id: TOPUP_STATUS.PENDING, label: 'Chờ duyệt' },
  { id: TOPUP_STATUS.APPROVED, label: 'Đã cộng tiền' },
  { id: TOPUP_STATUS.REJECTED, label: 'Đã từ chối' },
];

const STATUS_TONE = {
  [TOPUP_STATUS.PENDING]: 'warning',
  [TOPUP_STATUS.APPROVED]: 'success',
  [TOPUP_STATUS.REJECTED]: 'danger',
};

export default function AdminTopUpsPage() {
  const { showToast } = useToast();
  const [topups, setTopups] = useState([]);
  const [tab, setTab] = useState(TOPUP_STATUS.PENDING);

  async function reload() {
    setTopups(await topUpService.getAll());
  }

  useEffect(() => {
    reload().catch((err) => showToast(err.message, 'error'));
  }, []);

  const filtered = useMemo(
    () => topups.filter((item) => item.status === tab).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [topups, tab]
  );

  async function handleApprove(item) {
    try {
      await topUpService.approve(item.id, 'Admin đã xác nhận chuyển khoản.');
      showToast(`Đã cộng ${formatVND(item.amount)} cho ${item.userEmail}.`, 'success');
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleReject(item) {
    if (!confirm(`Từ chối yêu cầu nạp ${formatVND(item.amount)} của ${item.userEmail}?`)) return;
    try {
      await topUpService.reject(item.id, 'Admin từ chối yêu cầu nạp tiền.');
      showToast('Đã từ chối yêu cầu nạp tiền.', 'error');
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Duyệt nạp tiền</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Yêu cầu chuyển khoản của người dùng sẽ hiện ở đây để bạn duyệt tay.</p>
        </div>
      </div>

      <div className="tab-row">
        {TABS.map((t) => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label} ({topups.filter((item) => item.status === t.id).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={IconInbox} title="Không có yêu cầu nào ở trạng thái này" />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Mã chuyển khoản</th>
                <th>Số tiền</th>
                <th>Thời gian gửi</th>
                <th>Trạng thái</th>
                {tab === TOPUP_STATUS.PENDING && <th style={{ textAlign: 'right' }}>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.userEmail}</td>
                  <td className="mono">{item.transferCode}</td>
                  <td style={{ fontWeight: 700 }}><IconWallet style={{ width: 15, height: 15, verticalAlign: -2 }} /> {formatVND(item.amount)}</td>
                  <td className="text-muted">{formatDateTime(item.createdAt)}</td>
                  <td><Badge tone={STATUS_TONE[item.status]}>{TOPUP_STATUS_LABEL[item.status]}</Badge></td>
                  {tab === TOPUP_STATUS.PENDING && (
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(item)}>
                          <IconCheck /> Duyệt cộng tiền
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => handleReject(item)}>
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
