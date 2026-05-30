import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'الرئيسية' },
  { to: '/work', icon: '💼', label: 'ابدأ الشغل' },
  { to: '/how-it-works', icon: '📖', label: 'فهم الشغل' },
  { to: '/withdraw', icon: '💸', label: 'سحب الأرباح' },
];

export default function Layout() {
  const { userDoc, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', height: '100vh', right: 0, top: 0,
        zIndex: 100,
        transform: menuOpen ? 'translateX(0)' : undefined,
      }} className="sidebar">
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--accent)', letterSpacing: '-1px' }}>
            ⚡ STARKO
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>منصة المهام</div>
        </div>

        {/* User info */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'var(--accent-glow)',
            border: '1px solid var(--accent)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', marginBottom: '8px'
          }}>👤</div>
          <div style={{ fontWeight: '700', fontSize: '14px' }}>{userDoc?.name || 'مستخدم'}</div>
          <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}>
            💰 {userDoc?.availableBalance?.toFixed(2) || '0.00'} ج.م
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 20px', textDecoration: 'none',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                borderRight: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                fontSize: '14px', fontWeight: '600',
                transition: 'all 0.2s',
              })}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink to="/admin"
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 20px', textDecoration: 'none',
                color: 'var(--purple)',
                fontSize: '14px', fontWeight: '600',
                marginTop: '8px', borderTop: '1px solid var(--border)',
              }}>
              <span>🔑</span><span>لوحة الأدمن</span>
            </NavLink>
          )}
        </nav>

        {/* Logout */}
        <button onClick={handleLogout} className="btn btn-ghost btn-sm"
          style={{ margin: '16px', justifyContent: 'center' }}>
          🚪 تسجيل خروج
        </button>
      </aside>

      {/* Main */}
      <main style={{ marginRight: '240px', flex: 1, padding: '28px', maxWidth: 'calc(100vw - 240px)' }}>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { width: 100%; height: auto; position: relative; }
          main { margin-right: 0 !important; max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
