import { Link } from 'react-router-dom';
import { IconEye, IconStar } from './Icons';
import ProductVisual from './ProductVisual';
import { formatVND } from '../../utils/formatters';
import { CATEGORIES } from '../../utils/constants';

export default function ProductCard({ product }) {
  const cheapest = [...(product.packages || [])].sort((a, b) => a.price - b.price)[0];
  const catLabel = CATEGORIES.find((c) => c.id === product.category)?.label || 'Khác';

  return (
    <Link to={`/products/${product.id}`} className="product-card reveal">
      <div className="product-card__media">
        {product.imageUrl ? <img src={product.imageUrl} loading="lazy" /> : <ProductVisual product={product} />}
      </div>
      <div className="product-card__body">
        <span className="product-card__cat">{catLabel}</span>
        <div className="product-card__name">{product.name}</div>

        <div className="product-card__price-row">
          <span className="product-card__price">
            {cheapest ? ` ${formatVND(cheapest.price)}` : 'Liên hệ'}
          </span>
          {product.soldCount != null && (
            <span className="product-card__rating">
              <IconStar />
              {product.soldCount.toLocaleString('vi-VN')} đã bán
            </span>
          )}
        </div>

        <div className="product-card__meta">
          <IconEye style={{ width: 14, height: 14 }} />
          {(product.views || 0).toLocaleString('vi-VN')} lượt xem
        </div>
        <div className="product-card__footer">
          <span className="text-muted" style={{ fontSize: 12.5 }}>
            {product.packages?.length || 0} gói dịch vụ
          </span>
          <span className="product-card__amount">Xem chi tiết →</span>
        </div>
      </div>
    </Link>
  );
}