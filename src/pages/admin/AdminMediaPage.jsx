import { useEffect, useRef, useState } from 'react';
import { mediaService } from '../../services/mediaService';
import { useToast } from '../../context/ToastContext';
import { IconImage, IconPlus, IconTrash } from '../../components/common/Icons';

export default function AdminMediaPage() {
  const { showToast } = useToast();
  const inputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);

  async function reload() {
    setItems(await mediaService.getAll());
  }

  useEffect(() => {
    reload().catch((err) => showToast(err.message, 'error'));
  }, []);

  async function addUrl(event) {
    event.preventDefault();
    if (!url.trim()) return;
    try {
      await mediaService.create({ name: name.trim() || 'Ảnh từ đường dẫn', url: url.trim() });
      setUrl('');
      setName('');
      await reload();
      showToast('Đã thêm ảnh vào thư viện.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function addFiles(event) {
    const files = [...event.target.files].filter((file) => file.type.startsWith('image/'));
    event.target.value = '';
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        await mediaService.uploadFile(file);
      }
      await reload();
      showToast('Đã tải ảnh lên Firebase Storage.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function remove(item) {
    if (!confirm(`Xóa ảnh "${item.name}"?`)) return;
    try {
      await mediaService.remove(item.id);
      await reload();
      showToast('Đã xóa ảnh khỏi thư viện.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return <div>
    <div className="page-title-row">
      <div><h1 style={{ fontSize: 24, fontWeight: 800 }}>Thư viện ảnh</h1><p className="text-muted" style={{ marginTop: 4 }}>Tải ảnh lên Firebase Storage hoặc lưu URL để dùng cho sản phẩm và trang bán hàng.</p></div>
      <button className="btn btn-primary" onClick={() => inputRef.current?.click()} disabled={uploading}><IconPlus /> {uploading ? 'Đang tải...' : 'Tải ảnh lên'}</button>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={addFiles} />
    </div>
    <div className="media-upload-card">
      <div className="media-upload-card__icon"><IconImage /></div>
      <div><b>Kho hình ảnh dùng chung</b><p>Ảnh tải lên được lưu ở Firebase Storage, metadata lưu ở Firestore.</p></div>
    </div>
    <form className="media-url-form" onSubmit={addUrl}>
      <input className="form-input" value={name} placeholder="Tên gợi nhớ (tuỳ chọn)" onChange={(e) => setName(e.target.value)} />
      <input className="form-input" type="url" required value={url} placeholder="Dán URL hình ảnh https://..." onChange={(e) => setUrl(e.target.value)} />
      <button className="btn btn-outline" type="submit"><IconPlus /> Lưu URL</button>
    </form>
    {items.length ? <div className="media-grid">{items.map((item) => <article className="media-card" key={item.id}><img src={item.url} alt={item.alt || item.name} /><div className="media-card__footer"><span title={item.name}>{item.name}</span><button className="icon-btn" aria-label="Xóa ảnh" onClick={() => remove(item)}><IconTrash /></button></div></article>)}</div> : <div className="empty-state"><IconImage /><h3>Thư viện chưa có ảnh</h3><p>Hãy tải ảnh lên hoặc dán một đường dẫn ảnh để bắt đầu.</p></div>}
  </div>;
}
