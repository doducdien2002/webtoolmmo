import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { billingService } from '../../services/billingService';
import { topUpService } from '../../services/topUpService';
import { formatDateTime, formatVND } from '../../utils/formatters';
import { TOPUP_STATUS, TOPUP_STATUS_LABEL } from '../../utils/constants';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { IconWallet, IconCheck, IconClock } from '../../components/common/Icons';

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];
const STATUS_TONE = {
  [TOPUP_STATUS.PENDING]: 'warning',
  [TOPUP_STATUS.APPROVED]: 'success',
  [TOPUP_STATUS.REJECTED]: 'danger',
};

export default function TopUpPage() {
  const { currentUser, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [amount, setAmount] = useState(200000);
  const [custom, setCustom] = useState('');
  const [billing, setBilling] = useState({});
  const [topups, setTopups] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedAmount = useMemo(() => Number(custom) || amount, [amount, custom]);
  const pendingCount = topups.filter((item) => item.status === TOPUP_STATUS.PENDING).length;

  async function reload() {
    const [billingData, topupData] = await Promise.all([
      billingService.get(),
      topUpService.getAll(),
    ]);
    setBilling(billingData);
    setTopups(topupData);
    await refreshUser();
  }

  useEffect(() => {
    reload().catch((err) => showToast(err.message, 'error'));
  }, []);

  async function handleTopUp() {
    if (!selectedAmount || selectedAmount <= 0) {
      showToast('Vui lòng chọn hoặc nhập số tiền hợp lệ.', 'error');
      return;
    }
    setLoading(true);
    try {
      const topup = await topUpService.create({ amount: selectedAmount });
      showToast(`Đã gửi yêu cầu nạp ${formatVND(topup.amount)}. Vui lòng chờ admin duyệt.`, 'success');
      setCustom('');
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Nạp tiền</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Chuyển khoản theo QR, admin xác nhận xong số dư mới được cộng vào tài khoản.</p>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: 15 }}>Chọn mệnh giá</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {QUICK_AMOUNTS.map((v) => (
              <button
                key={v}
                className={`pkg-option ${amount === v && !custom ? 'is-selected' : ''}`}
                style={{ justifyContent: 'center', margin: 0 }}
                onClick={() => { setAmount(v); setCustom(''); }}
              >
                <span className="pkg-option__name" style={{ fontSize: 14 }}>{formatVND(v)}</span>
              </button>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: 20 }}>
            <label className="form-label">Hoặc nhập số tiền khác (VNĐ)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              placeholder="Nhập số tiền..."
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
          </div>

          <div className="transfer-box">
            {billing.qrImageUrl ? <img src={billing.qrImageUrl} alt="QR chuyển khoản" /> : <div className="transfer-box__placeholder">QR</div>}
            <div>
              <b>{billing.bankName || 'Chưa cấu hình ngân hàng'}</b>
              <span>STK: {billing.accountNumber || 'Chưa có'}</span>
              <span>Chủ TK: {billing.accountName || 'Chưa có'}</span>
              <span>Nội dung: <strong>{billing.transferNotePrefix || 'NAP'}-{currentUser?.id?.slice(-6)?.toUpperCase() || 'USER'}</strong></span>
              <span>Số tiền: <strong>{formatVND(selectedAmount || 0)}</strong></span>
            </div>
          </div>

          <button className="btn btn-primary btn-block" onClick={handleTopUp} disabled={loading}>
            <IconWallet /> {loading ? 'Đang gửi yêu cầu...' : 'Tôi đã chuyển khoản'}
          </button>
          <p className="form-hint" style={{ marginTop: 10 }}>
            Sau khi bạn gửi yêu cầu, admin sẽ thấy giao dịch trong khu quản trị và duyệt tay để cộng tiền.
          </p>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: 15 }}>Số dư của bạn</h3>
          <div style={{
            background: 'linear-gradient(160deg, var(--color-primary), var(--color-accent))',
            borderRadius: 14, padding: 22, color: '#fff',
          }}>
            <div style={{ fontSize: 12.5, opacity: 0.85 }}>Số dư hiện tại</div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Sora', marginTop: 6 }}>
              {formatVND(currentUser?.balance || 0)}
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Admin duyệt xong mới cộng tiền', `Yêu cầu đang chờ: ${pendingCount}`, 'Chỉ mua được khi số dư đủ'].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <IconCheck style={{ width: 16, height: 16, color: 'var(--color-success)' }} /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2>Lịch sử nạp tiền</h2>
          <p>Các yêu cầu chuyển khoản bạn đã gửi lên admin.</p>
        </div>
      </div>

      {topups.length === 0 ? (
        <EmptyState icon={IconClock} title="Chưa có yêu cầu nạp tiền" />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã chuyển khoản</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Ngày gửi</th>
                <th>Ghi chú admin</th>
              </tr>
            </thead>
            <tbody>
              {topups.map((item) => (
                <tr key={item.id}>
                  <td className="mono">{item.transferCode}</td>
                  <td>{formatVND(item.amount)}</td>
                  <td><Badge tone={STATUS_TONE[item.status]}>{TOPUP_STATUS_LABEL[item.status]}</Badge></td>
                  <td className="text-muted">{formatDateTime(item.createdAt)}</td>
                  <td className="text-muted">{item.adminNote || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
