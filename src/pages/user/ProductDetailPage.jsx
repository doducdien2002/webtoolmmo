import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { IconBox, IconShield, IconCheck, IconHeadset, IconChevronRight, IconEye, IconStar } from '../../components/common/Icons';
import ProductVisual from '../../components/common/ProductVisual';
import { formatVND } from '../../utils/formatters';

const TERMS = [
  {
    icon: IconShield,
    title: 'Hoàn tiền & Đổi sản phẩm',
    desc: 'Hỗ trợ hoàn 80% số tiền hoặc đổi sang tool khác trong vòng 07 ngày nếu sản phẩm phát sinh lỗi kỹ thuật không thể khắc phục.',
  },
  {
    icon: IconCheck,
    title: 'Khuyến nghị xem demo',
    desc: 'Vui lòng đọc kỹ mô tả chức năng và liên hệ hỗ trợ nếu có thắc mắc trước khi thanh toán.',
  },
  {
    icon: IconHeadset,
    title: 'Hỗ trợ kích hoạt',
    desc: 'Sau khi thanh toán, đơn hàng sẽ được gửi tới admin để xét duyệt và kích hoạt key trong thời gian sớm nhất.',
  },
];

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { currentUser, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const p = productService.getById(productId);
    setProduct(p);
    if (p?.packages?.length) {
      setSelectedPkg(p.packages.find((x) => x.best) || p.packages[0]);
    }
    productService.incrementViews(productId);
  }, [productId]);

  if (!product) {
    return <EmptyProduct />;
  }

  function handleConfirmPayment() {
    if (!agreed) return;
    setSubmitting(true);
    try {
      const order = orderService.checkout({ user: currentUser, product, pkg: selectedPkg });
      authService.updateUser(currentUser.id, { balance: currentUser.balance - selectedPkg.price });
      refreshUser();
      showToast('Đặt mua thành công! Đơn hàng đang chờ admin kích hoạt.', 'success');
      setShowTerms(false);
      navigate('/my-keys');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/products">Kho sản phẩm</Link> <IconChevronRight style={{ width: 12, height: 12, display: 'inline' }} /> {product.name}
      </div>

      <div className="detail-grid">
        <div>
          <div className="detail-media">
            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <ProductVisual product={product} large />}
          </div>

          <div className="card" style={{ padding: 22, marginTop: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Mô tả chi tiết</h3>
            <p className="text-muted" style={{ lineHeight: 1.75, fontSize: 14 }}>{product.description}</p>
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 22 }}>
            <div className="product-detail__tags"><span><IconStar /> Sản phẩm nổi bật</span><span><IconEye /> {(product.views || 0).toLocaleString('vi-VN')} lượt xem</span></div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{product.name}</h1>
            <p className="text-muted" style={{ fontSize: 13.5, marginBottom: 18 }}>{product.shortDesc}</p>

            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--color-text-muted)' }}>
              GÓI DỊCH VỤ
            </h4>
            {product.packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`pkg-option ${selectedPkg?.id === pkg.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedPkg(pkg)}
              >
                <div>
                  <div className="pkg-option__name">
                    {pkg.name}
                    {pkg.best && <Badge tone="primary">Best Choice</Badge>}
                  </div>
                  <div className="pkg-option__desc">{pkg.desc}</div>
                </div>
                <div className="pkg-option__price">{formatVND(pkg.price)}</div>
              </div>
            ))}

            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 10 }}
              onClick={() => setShowTerms(true)}
              disabled={!selectedPkg}
            >
              Mua ngay an toàn
            </button>

            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TERMS.map((t) => (
                <div key={t.title} style={{ display: 'flex', gap: 10, fontSize: 12.5 }}>
                  <t.icon style={{ width: 16, height: 16, color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                  <span className="text-muted">{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showTerms && (
        <Modal
          title="Điều khoản & Dịch vụ"
          subtitle="Vui lòng xác nhận điều khoản trước khi thanh toán"
          onClose={() => setShowTerms(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setShowTerms(false)}>Huỷ giao dịch</button>
              <button className="btn btn-primary" disabled={!agreed || submitting} onClick={handleConfirmPayment}>
                {submitting ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
            </>
          }
        >
          {TERMS.map((t) => (
            <div key={t.title} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <t.icon style={{ width: 17, height: 17, color: 'var(--color-primary)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.title}</div>
                <div className="text-muted" style={{ fontSize: 12.5, marginTop: 3, lineHeight: 1.6 }}>{t.desc}</div>
              </div>
            </div>
          ))}

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, marginTop: 6 }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3 }} />
            Tôi đã đọc, hiểu rõ và đồng ý với tất cả các điều khoản sử dụng ở trên.
          </label>

          <div className="card" style={{ marginTop: 16, padding: 14, background: 'var(--color-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
              <span className="text-muted">Gói đã chọn</span>
              <b>{selectedPkg?.name}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginTop: 6 }}>
              <span className="text-muted">Số tiền thanh toán</span>
              <b style={{ color: 'var(--color-primary-dark)' }}>{formatVND(selectedPkg?.price || 0)}</b>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function EmptyProduct() {
  return (
    <div className="empty-state">
      <IconBox />
      <h3>Không tìm thấy sản phẩm</h3>
      <p><Link to="/products">Quay lại kho sản phẩm</Link></p>
    </div>
  );
}
