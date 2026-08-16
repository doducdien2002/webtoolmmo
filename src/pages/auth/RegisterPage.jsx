import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setLoading(true);
    try {
      const user = await register(form);
      showToast(`Tạo tài khoản thành công! Xin chào ${user.fullName}.`, 'success');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1>Tạo tài khoản</h1>
      <p className="sub">Đăng ký để bắt đầu mua tool và quản lý key của bạn.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Họ và tên</label>
          <input
            className="form-input"
            name="fullName"
            placeholder="Nguyễn Văn A"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            name="email"
            placeholder="ban@email.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Mật khẩu</label>
          <input
            className="form-input"
            type="password"
            name="password"
            placeholder="Tối thiểu 6 ký tự"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Nhập lại mật khẩu</label>
          <input
            className="form-input"
            type="password"
            name="confirm"
            placeholder="••••••••"
            value={form.confirm}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="form-error" style={{ marginBottom: 14 }}>{error}</div>}

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>

      <div className="auth-switch">
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </div>
    </AuthLayout>
  );
}
