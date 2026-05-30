import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0, totalNumbers: 0, availableNumbers: 0,
    doneNumbers: 0, pendingWithdrawals: 0, totalEarned: 0
  });
  const [topUsers, setTopUsers] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnap, numbersSnap, withdrawSnap, logsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'numbers')),
          getDocs(query(collection(db, 'withdrawals'), where('status', '==', 'pending'))),
          getDocs(query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(10))),
        ]);

        const users = usersSnap.docs.map(d => d.data()).filter(u => u.role !== 'admin');
        const numbers = numbersSnap.docs.map(d => d.data());
        const totalEarned = users.reduce((s, u) => s + (u.earnings || 0), 0);

        setStats({
          totalUsers: users.length,
          totalNumbers: numbers.length,
          availableNumbers: numbers.filter(n => n.status === 'available').length,
          doneNumbers: numbers.filter(n => n.status === 'done').length,
          pendingWithdrawals: withdrawSnap.size,
          totalEarned
        });

        setTopUsers([...users].sort((a, b) => (b.doneNumbers || 0) - (a.doneNumbers || 0)).slice(0, 5));
        setRecentLogs(logsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ width: '32px', height: '32px', margin: 'auto' }} /></div>;

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900' }}>🔑 لوحة التحكم</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="live-dot" /> مباشر
        </p>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatCard icon="👥" label="المستخدمين" value={stats.totalUsers} color="var(--blue)" bg="var(--blue-glow)" />
        <StatCard icon="📱" label="إجمالي الأرقام" value={stats.totalNumbers.toLocaleString()} color="var(--accent)" bg="var(--accent-glow)" />
        <StatCard icon="✅" label="أرقام مُنجزة" value={stats.doneNumbers.toLocaleString()} color="var(--green)" bg="var(--green-glow)" />
        <StatCard icon="⏳" label="أرقام متاحة" value={stats.availableNumbers.toLocaleString()} color="var(--purple)" bg="rgba(139,92,246,0.15)" />
        <StatCard icon="💸" label="طلبات سحب معلقة" value={stats.pendingWithdrawals} color="var(--red)" bg="var(--red-glow)" />
        <StatCard icon="💰" label="إجمالي الأرباح الموزعة" value={`${stats.totalEarned.toFixed(0)} ج.م`} color="var(--accent)" bg="var(--accent-glow)" />
      </div>

      <div className="grid-2">
        {/* Top users */}
        <div className="card">
          <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>🏆 أفضل المستخدمين</div>
          {topUsers.length === 0 ? (
            <div className="empty-state"><p>لا يوجد مستخدمين بعد</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topUsers.map((u, i) => (
                <div key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '28px', height: '28px', flexShrink: 0,
                    background: i === 0 ? 'var(--accent)' : 'var(--border)',
                    color: i === 0 ? '#000' : 'var(--text-secondary)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: '900'
                  }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.doneNumbers || 0} رقم</div>
                  </div>
                  <div style={{ color: 'var(--green)', fontWeight: '700', fontSize: '14px' }}>
                    {(u.earnings || 0).toFixed(0)} ج.م
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="card">
          <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚡ آخر النشاطات <span className="live-dot" />
          </div>
          {recentLogs.length === 0 ? (
            <div className="empty-state"><p>لا يوجد نشاط بعد</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentLogs.map(log => (
                <div key={log.id} style={{
                  padding: '8px 12px', background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)', fontSize: '13px',
                  display: 'flex', justifyContent: 'space-between'
                }}>
                  <span>{log.userName} → <span style={{ color: 'var(--accent)', direction: 'ltr', display: 'inline-block' }}>{log.phone}</span></span>
                  <span style={{ color: 'var(--text-dim)' }}>
                    {log.timestamp?.toDate?.()?.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) || ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color }}>{icon}</div>
      <div>
        <div className="stat-value" style={{ color, fontSize: '22px' }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
