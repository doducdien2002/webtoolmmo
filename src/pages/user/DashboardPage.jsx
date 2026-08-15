import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import ProductCard from '../../components/common/ProductCard';
import StatCard from '../../components/common/StatCard';
import { IconWallet, IconKey, IconClock, IconShield, IconHeadset, IconStar, IconBox, IconCheck, IconCode, IconSparkles, IconTerminal } from '../../components/common/Icons';
import { formatVND } from '../../utils/formatters';
import { ORDER_STATUS, CATEGORIES } from '../../utils/constants';

const BENEFITS = [
  ['Tự động kích hoạt', 'Key được xử lý nhanh sau thanh toán', IconCheck],
  ['Hỗ trợ tận tâm', 'Đồng hành trong suốt quá trình sử dụng', IconHeadset],
  ['Thanh toán an toàn', 'Số dư và lịch sử luôn minh bạch', IconShield],
];

const CATEGORY_ICONS = {
  facebook: IconCode,
  tiktok: IconSparkles,
  instagram: IconSparkles,
  telegram: IconTerminal,
  email: IconTerminal,
  ai: IconSparkles,
};

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setProducts(productService.getAll().slice(0, 4));
    if (currentUser) setOrders(orderService.getByUser(currentUser.id));
  }, [currentUser]);

  const activeKeys = orders.filter((o) => o.status === ORDER_STATUS.ACTIVE).length;
  const pendingKeys = orders.filter((o) => o.status === ORDER_STATUS.PENDING).length;
  const categories = CATEGORIES.filter((item) => item.id !== 'all').slice(0, 6);

  return <div className="store-home">
    <section className="store-hero">
      <div className="store-hero__grid" />
      <div className="store-hero__orb store-hero__orb--one" />
      <div className="store-hero__orb store-hero__orb--two" />
      <div className="store-hero__content">
        <span className="hero-eyebrow hero-eyebrow--dark"><span className="pulse-dot" /> Nền tảng tool & phần mềm chọn lọc</span>
        <h1>Giải pháp số cho <span>MMO &amp; Developer</span></h1>
        <p>Khám phá công cụ, source code và workflow được tuyển chọn kỹ — nhanh để bắt đầu, vững để phát triển lâu dài.</p>
        <div className="hero-actions"><Link to="/products" className="btn btn-primary"><IconBox /> Khám phá sản phẩm</Link><Link to="/top-up" className="btn btn-outline hero-outline"><IconWallet /> Nạp số dư</Link></div>
        <div className="store-hero__trust"><span><IconShield /> Thanh toán an toàn</span><span><IconClock /> Kích hoạt nhanh</span><span><IconHeadset /> Hỗ trợ 24/7</span></div>
      </div>
      <div className="store-hero__visual" aria-hidden="true">
        <div className="dashboard-window">
          <div className="window-dots"><i /><i /><i /></div><div className="window-label">TOOLSTORE / LIVE</div>
          <div className="window-chart"><span /><span /><span /><span /><span /><span /><span /></div>
          <div className="window-info"><div><small>Đơn hàng</small><b>1,284</b></div><div><small>Hoạt động</small><b>99.9%</b></div></div>
        </div>
      </div>
    </section>

    <section className="category-strip reveal-stack">
      <div className="category-strip__intro reveal"><span>KHÁM PHÁ THEO</span><b>Danh mục<br />phù hợp với bạn</b><small>Chọn một nhóm tool để bắt đầu nhanh hơn.</small></div>
      {categories.map((category, index) => {
        const Icon = CATEGORY_ICONS[category.id] || IconBox;
        return (
          <Link to={`/products`} key={category.id} className="category-tile reveal" style={{ '--delay': `${index * 70}ms` }}>
            <span className="category-tile__mark"><Icon /></span>
            <span>{category.label}</span>
            <small>Xem công cụ <i>→</i></small>
          </Link>
        );
      })}
    </section>

    {currentUser && (
      <div className="stat-grid store-stats reveal-stack">
        <StatCard icon={IconWallet} label="Số dư hiện tại" value={formatVND(currentUser?.balance || 0)} tone="primary" />
        <StatCard icon={IconKey} label="Key đã kích hoạt" value={activeKeys} tone="success" />
        <StatCard icon={IconClock} label="Key chờ kích hoạt" value={pendingKeys} tone="warning" />
        <StatCard icon={IconBox} label="Sản phẩm đã mua" value={orders.length} tone="accent" />
      </div>
    )}

    <section className="section-head store-section-head reveal">
      <div>
        <span className="section-kicker">ĐƯỢC ĐỀ XUẤT</span>
        <h2>Tool nổi bật cho bạn</h2>
        <p>Sản phẩm phổ biến, rõ ràng về gói dịch vụ và sẵn sàng để bạn bắt đầu.</p>
      </div>
      <Link to="/products" className="btn btn-outline btn-sm">Xem toàn bộ <span>→</span></Link>
    </section>
    <div className="product-grid reveal-stack">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>

    <section className="benefit-panel reveal">
      <div className="benefit-panel__headline">
        <span className="section-kicker">VÌ SAO CHỌN TOOLSTORE</span>
        <h2>Mua tool là một trải nghiệm<br /><em>đơn giản và đáng tin.</em></h2>
        <Link to="/products" className="text-link">Tìm sản phẩm phù hợp →</Link>
      </div>
      <div className="benefit-list reveal-stack">
        {BENEFITS.map(([title, desc, Icon], index) => (
          <div className="benefit-item reveal" key={title} style={{ '--delay': `${index * 90}ms` }}>
            <div className="benefit-item__icon"><Icon /></div>
            <div><b>{title}</b><p>{desc}</p></div>
          </div>
        ))}
      </div>
    </section>
  </div>;
}