import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, getDocs, doc, updateDoc, query,
  orderBy, serverTimestamp, where, increment
} from 'firebase/firestore';
import { useToast, ToastContainer } from '../hooks/useToast';

export default function AdminWithdrawals() {
  const { toasts, toast } = useToast();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchData = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc')));
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (w, action) => {
    try {
      await updateDoc(doc(db, 'withdrawals', w.id), {
        status: action,
        reviewedAt: serverTimestamp()
      });

      if (action === 'approved') {
        // Deduct from pendingBalance, deduct from availableBalance
        await updateDoc(doc(db, 'users', w.userId), {
          pendingBalance: increment(-w.amount),
          availableBalance: increment(-w.amount),
        });
        toast.success(`تمت الموافقة على سحب ${w.amount} ج.م`);
      } else if (action === 'rejected') {
        // Refund to available
        await updateDoc(doc(db, 'users', w.userId), {
          pendingBalance: increment(-w.amount),
        });
        toast.info(`تم رفض الطلب`);
      }
      fetchData();
    } catch (err) {
      toast.error('حدث خطأ');
    }
  };

  const statusMap = {
    pending: { label: 'معلق', cls: 'badge-yellow' },
    approved: { label: 'مقبول', cls: 'badge-green' },
    rejected: { label: 'مرفوض', cls: 'badge-red' },
  };

  const methodMap = {
    vodafone: 'فودافون كاش',
    instapay: 'انستاباي',
    bank: 'بنك',
  };

  const filtered = filter === 'all' ? withdrawals : withdrawals.filter(w => w.status === filter);
  const pending = withdrawals.filter(w => w.status === 'pending').length;
  const totalPending = withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + w.amount, 0);

  return (
    <div className="animate-in">
      <ToastContainer toasts={toasts} />

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900' }}>💸 طلبات السحب</h1>
      </div>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: '20px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--red)' }}>{pending}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>طلبات معلقة</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent)' }}>{totalPending.toFixed(0)} ج.م</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>إجمالي المعلق</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--green)' }}>{withdrawals.length}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>إجمالي الطلبات</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}>
            {f === 'all' ? 'الكل' : f === 'pending' ? `معلق (${pending})` : f === 'approved' ? 'مقبول' : 'مرفوض'}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ width: '28px', height: '28px', margin: 'auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">📭</div><p>لا توجد طلبات</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>المبلغ</th>
                  <th>الطريقة</th>
                  <th>الحساب</th>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(w => {
                  const st = statusMap[w.status] || statusMap.pending;
                  return (
                    <tr key={w.id}>
                      <td>
                        <div style={{ fontWeight: '700' }}>{w.userName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{w.userEmail}</div>
                      </td>
                      <td style={{ fontWeight: '900', color: 'var(--accent)', fontSize: '16px' }}>{w.amount} ج.م</td>
                      <td>{methodMap[w.method] || w.method}</td>
                      <td style={{ direction: 'ltr', fontFamily: 'monospace', fontSize: '13px' }}>{w.account}</td>
                      <td style={{ color: 'var(--text-dim)', fontSize: '12px' }}>
                        {w.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || ''}
                      </td>
                      <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      <td>
                        {w.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-sm btn-success" onClick={() => handleAction(w, 'approved')}>✅ قبول</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleAction(w, 'rejected')}>❌ رفض</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
