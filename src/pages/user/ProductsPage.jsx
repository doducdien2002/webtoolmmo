import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import ProductCard from '../../components/common/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import { IconBox } from '../../components/common/Icons';
import { CATEGORIES } from '../../utils/constants';

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setAllProducts(productService.getAll());
  }, []);
  useEffect(() => {
    const applySearch = (event) => setKeyword(event.detail || '');
    window.addEventListener('toolstore-search', applySearch);
    setKeyword(searchParams.get('q') || '');
    return () => window.removeEventListener('toolstore-search', applySearch);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = allProducts;
    if (activeCategory !== 'all') list = list.filter((p) => p.category === activeCategory);
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(kw));
    }
    return list;
  }, [allProducts, activeCategory, keyword]);

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Kho sản phẩm</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Tool được chọn lọc, thông tin minh bạch và sẵn sàng để bạn triển khai.</p>
        </div>
        <input
          className="form-input"
          style={{ maxWidth: 260 }}
          placeholder="Tìm sản phẩm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="catalogue-summary"><span><b>{filtered.length}</b> sản phẩm đang sẵn sàng</span><span>Thanh toán an toàn · Kích hoạt nhanh · Hỗ trợ 24/7</span></div>

      <div className="tab-row">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`tab-btn ${activeCategory === c.id ? 'is-active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={IconBox} title="Không tìm thấy sản phẩm" desc="Thử đổi danh mục hoặc từ khoá tìm kiếm khác." />
      ) : (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
