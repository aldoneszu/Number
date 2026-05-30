import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate(email === 'admin@starko.com' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'خطأ في البيانات');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '20px',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }} className="animate-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚡</div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent)', letterSpacing: '-2px' }}>STARKO</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>منصة مهام الواتساب</div>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>تسجيل الدخول</h2>

          {error && (
            <div style={{
              background: 'var(--red-glow)', border: '1px solid var(--red)',
              borderRadius: 'var(--radius-sm)', padding: '12px 16px',
              color: 'var(--red)', fontSize: '14px', marginBottom: '16px'
            }}>❌ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">البريد الإلكتروني</label>
              <input className="input" type="email" placeholder="example@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">كلمة المرور</label>
              <input className="input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}
              style={{ justifyContent: 'center', padding: '14px', fontSize: '16px', marginTop: '8px' }}>
              {loading ? <><span className="spinner" style={{ width: '16px', height: '16px' }} /> جاري الدخول...</> : '🚀 دخول'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            مش عندك حساب؟{' '}
            <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '700' }}>
              سجل دلوقتي
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
