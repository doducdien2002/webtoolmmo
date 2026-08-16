import { useEffect, useRef, useState } from 'react';
import { billingService } from '../../services/billingService';
import { mediaService } from '../../services/mediaService';
import { useToast } from '../../context/ToastContext';
import { IconImage, IconWallet } from '../../components/common/Icons';

const EMPTY = {
  bankName: '',
  accountNumber: '',
  accountName: '',
  qrImageUrl: '',
  transferNotePrefix: 'NAP',
};

export default function AdminBillingPage() {
  const { showToast } = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    billingService.get()
      .then((data) => setForm({ ...EMPTY, ...data }))
      .catch((err) => showToast(err.message, 'error'));
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const media = await mediaService.uploadFile(file);
      updateField('qrImageUrl', media.url);
      showToast('Đã tải QR lên Firebase Storage.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const billing = await billingService.update(form);
      setForm({ ...EMPTY, ...billing });
      showToast('Đã lưu cấu hình chuyển khoản.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Cấu hình QR chuyển khoản</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Thông tin này sẽ hiện ở trang nạp tiền của người dùng.</p>
        </div>
      </div>

      <div className="detail-grid">
        <form className="card" style={{ padding: 24 }} onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Ngân hàng</label>
            <input className="form-input" value={form.bankName} onChange={(e) => updateField('bankName', e.target.value)} placeholder="VD: Vietcombank" />
          </div>
          <div className="form-group">
            <label className="form-label">Số tài khoản</label>
            <input className="form-input" value={form.accountNumber} onChange={(e) => updateField('accountNumber', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Chủ tài khoản</label>
            <input className="form-input" value={form.accountName} onChange={(e) => updateField('accountName', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Tiền tố nội dung chuyển khoản</label>
            <input className="form-input" value={form.transferNotePrefix} onChange={(e) => updateField('transferNotePrefix', e.target.value.toUpperCase())} />
          </div>
          <div className="form-group">
            <label className="form-label">URL ảnh QR</label>
            <input className="form-input" type="url" value={form.qrImageUrl} onChange={(e) => updateField('qrImageUrl', e.target.value)} placeholder="https://..." />
            <p className="form-hint">Bạn có thể dán URL hoặc tải ảnh QR lên Firebase Storage.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="submit" disabled={saving}><IconWallet /> {saving ? 'Đang lưu...' : 'Lưu cấu hình'}</button>
            <button className="btn btn-outline" type="button" onClick={() => fileRef.current?.click()} disabled={uploading}><IconImage /> {uploading ? 'Đang tải...' : 'Tải QR lên'}</button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} />
          </div>
        </form>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: 15 }}>Xem trước</h3>
          <div className="transfer-box transfer-box--preview">
            {form.qrImageUrl ? <img src={form.qrImageUrl} alt="QR chuyển khoản" /> : <div className="transfer-box__placeholder">QR</div>}
            <div>
              <b>{form.bankName || 'Tên ngân hàng'}</b>
              <span>STK: {form.accountNumber || '0000000000'}</span>
              <span>Chủ TK: {form.accountName || 'TEN CHU TAI KHOAN'}</span>
              <span>Nội dung: <strong>{form.transferNotePrefix || 'NAP'}-USER</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
