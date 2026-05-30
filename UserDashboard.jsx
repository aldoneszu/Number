import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export default function UserDashboard() {
  const { user, userDoc } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) setStats(snap.data());
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchLogs = async () => {
      const q = query(
        collection(db, 'logs'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      try {
        const snap = await getDocs(q);
        setRecentLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {}
    };
    fetchLogs();
  }, [user]);

  const earnings = stats?.earnings || 0;
  const done = stats?.doneNumbers || 0;
  const pending = stats?.pendingBalance || 0;
  const available = stats?.availableBalance || 0;
  const progress = done % 100;

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900' }}>
          مرحباً، {stats?.name || 'مستخدم'} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          هنا ملخص نشاطك وأرباحك
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard icon="📱" label="أرقام منجزة" value={done} color="var(--accent)" bg="var(--accent-glow)" />
        <StatCard icon="💰" label="إجمالي الأرباح" value={`${earnings.toFixed(2)} ج.م`} color="var(--green)" bg="var(--green-glow)" />
        <StatCard icon="⏳" label="رصيد قيد المراجعة" value={`${pending.toFixed(2)} ج.م`} color="var(--blue)" bg="var(--blue-glow)" />
        <StatCard icon="✅" label="رصيد متاح للسحب" value={`${available.toFixed(2)} ج.م`} color="var(--purple)" bg="rgba(139,92,246,0.15)" />
      </div>

      {/* Progress to next payout */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="flex justify-between items-center mb-4">
          <div style={{ fontWeight: '700' }}>📈 التقدم نحو الدفعة القادمة</div>
          <div style={{ color: 'var(--accent)', fontWeight: '800' }}>{progress}/100 رقم</div>
        </div>
        <div className="progress-bar" style={{ height: '10px', marginBottom: '8px' }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          كل 100 رقم = 20 ج.م • متبقي {100 - progress} رقم للدفعة القادمة
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <button className="btn btn-primary btn-lg w-full" onClick={() => navigate('/work')}
          style={{ justifyContent: 'center', padding: '18px' }}>
          💼 ابدأ الشغل الآن
        </button>
        <button className="btn btn-ghost btn-lg w-full" onClick={() => navigate('/withdraw')}
          style={{ justifyContent: 'center', padding: '18px', borderColor: 'var(--green)', color: 'var(--green)' }}>
          💸 اسحب أرباحك
        </button>
      </div>

      {/* Recent activity */}
      {recentLogs.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: '700', marginBottom: '16px', fontSize: '16px' }}>⚡ آخر النشاطات</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentLogs.map(log => (
              <div key={log.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                fontSize: '13px'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  ✅ أرسلت للرقم: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{log.phone}</span>
                </span>
                <span style={{ color: 'var(--text-dim)' }}>
                  {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleDateString('ar-EG') : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide card */}
      <div className="card mt-4" style={{ background: 'var(--accent-glow)', borderColor: 'rgba(245,158,11,0.3)' }}>
        <div className="flex items-center gap-3">
          <div style={{ fontSize: '32px' }}>📖</div>
          <div>
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>مش عارف تبدأ؟</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>اقرأ شرح طريقة الشغل خطوة بخطوة</div>
          </div>
          <button className="btn btn-primary btn-sm" style={{ marginRight: 'auto' }}
            onClick={() => navigate('/how-it-works')}>
            اعرف أكتر
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color }}>
        {icon}
      </div>
      <div>
        <div className="stat-value" style={{ color, fontSize: '22px' }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
