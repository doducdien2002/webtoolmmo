import { useRef, useState } from 'react';
import { mediaService } from '../../services/mediaService';
import { useToast } from '../../context/ToastContext';
import { IconImage, IconPlus, IconTrash } from '../../components/common/Icons';

export default function AdminMediaPage() {
  const { showToast } = useToast();
  const inputRef = useRef(null);
  const [items, setItems] = useState(() => mediaService.getAll());
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  const reload = () => setItems(mediaService.getAll());
  const addUrl = (event) => {
    event.preventDefault();
    if (!url.trim()) return;
    mediaService.create({ name: name.trim() || 'Ảnh từ đường dẫn', url: url.trim() });
    setUrl(''); setName(''); reload(); showToast('Đã thêm ảnh vào thư viện.', 'success');
  };
  const addFiles = (event) => {
    [...event.target.files].forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => { mediaService.create({ name: file.name, url: reader.result, alt: file.name }); reload(); };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  };
  const remove = (item) => {
    if (!confirm(`Xóa ảnh "${item.name}"?`)) return;
    mediaService.remove(item.id); reload(); showToast('Đã xóa ảnh khỏi thư viện.', 'success');
  };

  return <div>
    <div className="page-title-row">
      <div><h1 style={{ fontSize: 24, fontWeight: 800 }}>Thư viện ảnh</h1><p className="text-muted" style={{ marginTop: 4 }}>Tải ảnh lên hoặc lưu URL để dùng cho sản phẩm và trang bán hàng.</p></div>
      <button className="btn btn-primary" onClick={() => inputRef.current?.click()}><IconPlus /> Tải ảnh lên</button>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={addFiles} />
    </div>
    <div className="media-upload-card">
      <div className="media-upload-card__icon"><IconImage /></div>
      <div><b>Kho hình ảnh dùng chung</b><p>Dùng ảnh sản phẩm, banner và thumbnail. Ảnh tải lên được lưu trong trình duyệt hiện tại.</p></div>
    </div>
    <form className="media-url-form" onSubmit={addUrl}>
      <input className="form-input" value={name} placeholder="Tên gợi nhớ (tuỳ chọn)" onChange={(e) => setName(e.target.value)} />
      <input className="form-input" type="url" required value={url} placeholder="Dán URL hình ảnh https://..." onChange={(e) => setUrl(e.target.value)} />
      <button className="btn btn-outline" type="submit"><IconPlus /> Lưu URL</button>
    </form>
    {items.length ? <div className="media-grid">{items.map((item) => <article className="media-card" key={item.id}><img src={item.url} alt={item.alt || item.name} /><div className="media-card__footer"><span title={item.name}>{item.name}</span><button className="icon-btn" aria-label="Xóa ảnh" onClick={() => remove(item)}><IconTrash /></button></div></article>)}</div> : <div className="empty-state"><IconImage /><h3>Thư viện chưa có ảnh</h3><p>Hãy tải ảnh lên hoặc dán một đường dẫn ảnh để bắt đầu.</p></div>}
  </div>;
}
