import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('كلمتا المرور غير متطابقتين');
    if (form.password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, form.phone);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'حدث خطأ');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '20px',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%)'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }} className="animate-in">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent)' }}>⚡ STARKO</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>إنشاء حساب جديد</div>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>تسجيل حساب</h2>

          {error && (
            <div style={{
              background: 'var(--red-glow)', border: '1px solid var(--red)',
              borderRadius: 'var(--radius-sm)', padding: '12px 16px',
              color: 'var(--red)', fontSize: '14px', marginBottom: '16px'
            }}>❌ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">الاسم الكامل</label>
              <input className="input" placeholder="محمد أحمد" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="label">رقم الهاتف</label>
              <input className="input" type="tel" placeholder="01xxxxxxxxx" value={form.phone} onChange={set('phone')} required />
            </div>
            <div className="form-group">
              <label className="label">البريد الإلكتروني</label>
              <input className="input" type="email" placeholder="example@email.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">كلمة المرور</label>
                <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
              </div>
              <div className="form-group">
                <label className="label">تأكيد كلمة المرور</label>
                <input className="input" type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required />
              </div>
            </div>
            <button type="submit" className="btn btn-success w-full" disabled={loading}
              style={{ justifyContent: 'center', padding: '14px', fontSize: '16px', marginTop: '8px' }}>
              {loading ? <><span className="spinner" style={{ width: '16px', height: '16px' }} /> جاري التسجيل...</> : '✅ إنشاء حساب'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            عندك حساب بالفعل؟{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '700' }}>
              سجل دخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
