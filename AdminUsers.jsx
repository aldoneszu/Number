import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { useToast, ToastContainer } from '../hooks/useToast';

export default function AdminUsers() {
  const { toasts, toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('doneNumbers', 'desc')));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role !== 'admin'));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleBan = async (uid, banned) => {
    await updateDoc(doc(db, 'users', uid), { banned: !banned });
    toast.success(banned ? 'تم فك الحظر' : 'تم الحظر');
    fetchUsers();
  };

  const filtered = search
    ? users.filter(u => u.name?.includes(search) || u.email?.includes(search) || u.phone?.includes(search))
    : users;

  return (
    <div className="animate-in">
      <ToastContainer toasts={toasts} />

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900' }}>👥 إدارة المستخدمين</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{users.length} مستخدم مسجل</p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input className="input" placeholder="ابحث بالاسم أو الإيميل أو رقم الهاتف..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ width: '28px', height: '28px', margin: 'auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">👤</div><p>لا يوجد مستخدمين</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>رقم الهاتف</th>
                  <th>أرقام منجزة</th>
                  <th>الأرباح</th>
                  <th>رصيد متاح</th>
                  <th>الحالة</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: '700' }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.email}</div>
                    </td>
                    <td style={{ direction: 'ltr', fontFamily: 'monospace' }}>{u.phone}</td>
                    <td style={{ fontWeight: '700', color: 'var(--accent)' }}>
                      {(u.doneNumbers || 0).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--green)', fontWeight: '700' }}>
                      {(u.earnings || 0).toFixed(2)} ج.م
                    </td>
                    <td style={{ color: 'var(--blue)' }}>
                      {(u.availableBalance || 0).toFixed(2)} ج.م
                    </td>
                    <td>
                      <span className={`badge ${u.banned ? 'badge-red' : 'badge-green'}`}>
                        {u.banned ? '🚫 محظور' : '✅ نشط'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.banned ? 'btn-success' : 'btn-danger'}`}
                        onClick={() => toggleBan(u.id, u.banned)}>
                        {u.banned ? '✅ فك الحظر' : '🚫 حظر'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
