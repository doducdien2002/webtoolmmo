import { useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import { mediaService } from '../../services/mediaService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { IconBox, IconPlus, IconEdit, IconTrash } from '../../components/common/Icons';
import { formatVND } from '../../utils/formatters';
import { CATEGORIES } from '../../utils/constants';

const EMPTY_FORM = {
  name: '',
  category: 'facebook',
  shortDesc: '',
  description: '',
  price: '',
  imageUrl: '',
};

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [media, setMedia] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function reload() {
    const [nextProducts, nextMedia] = await Promise.all([
      productService.getAll(),
      mediaService.getAll().catch(() => []),
    ]);
    setProducts(nextProducts);
    setMedia(nextMedia);
  }

  useEffect(() => {
    reload().catch((err) => showToast(err.message, 'error'));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      shortDesc: product.shortDesc,
      description: product.description,
      price: product.packages?.[0]?.price || '',
      imageUrl: product.imageUrl || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.price) {
      showToast('Vui lòng nhập tên sản phẩm và giá.', 'error');
      return;
    }

    try {
      if (editingId) {
        const existing = products.find((p) => p.id === editingId);
        const packages = existing?.packages?.length
          ? existing.packages.map((pkg, i) => (i === 0 ? { ...pkg, price: Number(form.price) } : pkg))
          : [{ id: 'std', name: 'Gói tiêu chuẩn', desc: 'Gói mặc định', price: Number(form.price) }];

        await productService.update(editingId, {
          name: form.name,
          category: form.category,
          shortDesc: form.shortDesc,
          description: form.description,
          packages,
          imageUrl: form.imageUrl,
        });
        showToast('Đã cập nhật sản phẩm.', 'success');
      } else {
        await productService.create({
          name: form.name,
          category: form.category,
          shortDesc: form.shortDesc,
          description: form.description,
          packages: [{ id: 'std', name: 'Gói tiêu chuẩn', desc: 'Gói mặc định', price: Number(form.price) }],
          imageUrl: form.imageUrl,
        });
        showToast('Đã thêm sản phẩm mới.', 'success');
      }

      setModalOpen(false);
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleDelete(product) {
    if (!confirm(`Xoá sản phẩm "${product.name}"?`)) return;
    try {
      await productService.remove(product.id);
      showToast('Đã xoá sản phẩm.', 'success');
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Quản lý sản phẩm</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Thêm, chỉnh sửa hoặc xoá tool / source code đang bán.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><IconPlus /> Thêm sản phẩm</button>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={IconBox} title="Chưa có sản phẩm nào" />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá thấp nhất</th>
                <th>Lượt xem</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const cheapest = [...(p.packages || [])].sort((a, b) => a.price - b.price)[0];
                const catLabel = CATEGORIES.find((c) => c.id === p.category)?.label || 'Khác';
                return (
                  <tr key={p.id}>
                    <td><div className="admin-product-cell"><div className="admin-product-thumb">{p.imageUrl ? <img src={p.imageUrl} alt="" /> : <IconBox />}</div><span style={{ fontWeight: 650 }}>{p.name}</span></div></td>
                    <td className="text-muted">{catLabel}</td>
                    <td>{cheapest ? formatVND(cheapest.price) : '—'}</td>
                    <td className="text-muted">{(p.views || 0).toLocaleString('vi-VN')}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}><IconEdit /></button>
                        <button className="btn btn-outline btn-sm" onClick={() => handleDelete(p)}><IconTrash /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal
          title={editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Huỷ</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Lưu sản phẩm</button>
            </>
          }
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tên sản phẩm</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Danh mục</label>
              <select className="form-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả ngắn</label>
              <input className="form-input" value={form.shortDesc} onChange={(e) => setForm((f) => ({ ...f, shortDesc: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả chi tiết</label>
              <textarea className="form-textarea" rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Ảnh đại diện sản phẩm</label>
              <input className="form-input" type="url" value={form.imageUrl} placeholder="Dán URL ảnh hoặc chọn từ thư viện" onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
              {form.imageUrl && <div className="product-image-preview"><img src={form.imageUrl} alt="Xem trước" /></div>}
              {media.length > 0 && <div className="image-picker">{media.slice(0, 12).map((item) => <button type="button" className={form.imageUrl === item.url ? 'is-selected' : ''} key={item.id} onClick={() => setForm((f) => ({ ...f, imageUrl: item.url }))}><img src={item.url} alt={item.name} /></button>)}</div>}
              <p className="form-hint">Tải ảnh từ máy tính tại mục Thư viện ảnh.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Giá (VNĐ)</label>
              <input className="form-input" type="number" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
