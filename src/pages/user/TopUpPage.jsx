import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { formatVND } from '../../utils/formatters';
import { IconWallet, IconCheck } from '../../components/common/Icons';

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function TopUpPage() {
  const { currentUser, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [amount, setAmount] = useState(200000);
  const [custom, setCustom] = useState('');

  function handleTopUp() {
    const value = Number(custom) || amount;
    if (!value || value <= 0) {
      showToast('Vui lòng chọn hoặc nhập số tiền hợp lệ.', 'error');
      return;
    }
    authService.updateUser(currentUser.id, { balance: (currentUser.balance || 0) + value });
    refreshUser();
    showToast(`Nạp thành công ${formatVND(value)} vào tài khoản!`, 'success');
    setCustom('');
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Nạp tiền</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Nạp số dư để mua tool &amp; source code trong hệ thống.</p>
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

          <button className="btn btn-primary btn-block" onClick={handleTopUp}>
            <IconWallet /> Xác nhận nạp tiền
          </button>
          <p className="form-hint" style={{ marginTop: 10 }}>
            * Đây là môi trường demo — số dư được cộng trực tiếp, không cần cổng thanh toán thật.
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
            {['Cộng số dư tức thì', 'Không giới hạn số lần nạp', 'Áp dụng cho mọi sản phẩm'].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <IconCheck style={{ width: 16, height: 16, color: 'var(--color-success)' }} /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
