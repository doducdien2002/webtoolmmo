import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <div style={{ fontSize: 64, fontWeight: 800, fontFamily: 'Sora', color: 'var(--color-primary)' }}>404</div>
      <p className="text-muted">Trang bạn tìm không tồn tại.</p>
      <Link to="/" className="btn btn-primary">Về trang chủ</Link>
    </div>
  );
}
