import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { IconSearch, IconBell, IconGlobe, IconLogout, IconMenu, IconDashboard } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onToggleSidebar, searchPlaceholder = 'Tìm kiếm sản phẩm, tool...' }) {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  function submitSearch(e) {
    e.preventDefault();
    const keyword = query.trim();
    if (location.pathname === '/products') window.dispatchEvent(new CustomEvent('toolstore-search', { detail: keyword }));
    else navigate(`/products?q=${encodeURIComponent(keyword)}`);
  }

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const initials = currentUser?.fullName
    ? currentUser.fullName.trim().charAt(0).toUpperCase()
    : '?';

  return (
    <header className="topbar">
      <button className="icon-btn" onClick={onToggleSidebar} aria-label="Menu">
        <IconMenu />
      </button>

      <form className="topbar-search" onSubmit={submitSearch}>
        <IconSearch style={{ width: 16, height: 16 }} />
        <input placeholder={searchPlaceholder} value={query} onChange={(e) => setQuery(e.target.value)} />
      </form>

      <div className="topbar-actions">
        <button className="icon-btn"><IconGlobe /></button>

        {isAuthenticated ? (
          <>
            <button className="icon-btn"><IconBell /></button>
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button className="avatar" onClick={() => setMenuOpen((v) => !v)}>
                {initials}
              </button>
              {menuOpen && (
                <div
                  className="card"
                  style={{
                    position: 'absolute', right: 0, top: 50, width: 220, padding: 8, zIndex: 50,
                  }}
                >
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--color-border)', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{currentUser?.fullName}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{currentUser?.email}</div>
                  </div>
                  {isAdmin && (
                    <button
                      className="btn btn-ghost btn-block"
                      style={{ justifyContent: 'flex-start' }}
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/admin');
                      }}
                    >
                      <IconDashboard /> Khu quản trị
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-block"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={async () => {
                      await logout();
                      navigate('/login');
                    }}
                  >
                    <IconLogout /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline btn-sm">Đăng nhập</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
          </>
        )}
      </div>
    </header>
  );
}
