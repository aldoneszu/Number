import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const adminNav = [
  { to: '/admin', icon: '📊', label: 'لوحة التحكم', exact: true },
  { to: '/admin/numbers', icon: '📱', label: 'الأرقام' },
  { to: '/admin/users', icon: '👥', label: 'المستخدمين' },
  { to: '/admin/withdrawals', icon: '💸', label: 'طلبات السحب' },
  { to: '/admin/settings', icon: '⚙️', label: 'الإعدادات' },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: '240px', flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', height: '100vh', right: 0, top: 0,
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--purple)', letterSpacing: '-1px' }}>
            🔑 STARKO
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>لوحة الأدمن</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {adminNav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 20px', textDecoration: 'none',
                color: isActive ? 'var(--purple)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(139,92,246,0.1)' : 'transparent',
                borderRight: isActive ? '3px solid var(--purple)' : '3px solid transparent',
                fontSize: '14px', fontWeight: '600', transition: 'all 0.2s',
              })}>
              {item.icon} {item.label}
            </NavLink>
          ))}
          <NavLink to="/dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 20px', textDecoration: 'none',
              color: 'var(--accent)', fontSize: '14px', fontWeight: '600',
              marginTop: '8px', borderTop: '1px solid var(--border)' }}>
            ← العودة للموقع
          </NavLink>
        </nav>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm"
          style={{ margin: '16px', justifyContent: 'center' }}>
          🚪 تسجيل خروج
        </button>
      </aside>
      <main style={{ marginRight: '240px', flex: 1, padding: '28px', maxWidth: 'calc(100vw - 240px)' }}>
        <Outlet />
      </main>
    </div>
  );
}
