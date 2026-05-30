import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, getDocs, addDoc, deleteDoc, doc, query,
  orderBy, serverTimestamp, writeBatch, where, limit, startAfter
} from 'firebase/firestore';
import { useToast, ToastContainer } from '../hooks/useToast';

export default function AdminNumbers() {
  const { toasts, toast } = useToast();
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkText, setBulkText] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, available: 0, assigned: 0, done: 0 });

  const fetchNumbers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'numbers'), orderBy('createdAt', 'desc'), limit(200)));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNumbers(all);
      setStats({
        total: all.length,
        available: all.filter(n => n.status === 'available').length,
        assigned: all.filter(n => n.status === 'assigned').length,
        done: all.filter(n => n.status === 'done').length,
      });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchNumbers(); }, []);

  const handleBulkAdd = async () => {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return toast.error('أدخل أرقام أولاً');
    setAddLoading(true);
    try {
      const batch = writeBatch(db);
      let count = 0;
      for (const phone of lines) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length >= 7) {
          const ref = doc(collection(db, 'numbers'));
          batch.set(ref, {
            phone: cleaned, status: 'available',
            createdAt: serverTimestamp()
          });
          count++;
        }
      }
      await batch.commit();
      toast.success(`تم إضافة ${count} رقم بنجاح!`);
      setBulkText('');
      fetchNumbers();
    } catch (err) {
      toast.error('حدث خطأ أثناء الإضافة');
    } finally { setAddLoading(false); }
  };

  const handleDeleteDone = async () => {
    if (!confirm('هل تريد حذف كل الأرقام المنجزة؟')) return;
    const doneNums = numbers.filter(n => n.status === 'done');
    const batch = writeBatch(db);
    doneNums.forEach(n => batch.delete(doc(db, 'numbers', n.id)));
    await batch.commit();
    toast.success(`تم حذف ${doneNums.length} رقم منجز`);
    fetchNumbers();
  };

  const filtered = filter === 'all' ? numbers : numbers.filter(n => n.status === filter);

  const statusMap = {
    available: { label: 'متاح', cls: 'badge-green' },
    assigned: { label: 'مخصص', cls: 'badge-yellow' },
    done: { label: 'منجز', cls: 'badge-blue' },
  };

  return (
    <div className="animate-in">
      <ToastContainer toasts={toasts} />

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900' }}>📱 إدارة الأرقام</h1>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        {[
          { label: 'الإجمالي', val: stats.total, color: 'var(--accent)' },
          { label: 'متاحة', val: stats.available, color: 'var(--green)' },
          { label: 'مخصصة', val: stats.assigned, color: 'var(--blue)' },
          { label: 'منجزة', val: stats.done, color: 'var(--text-secondary)' },
        ].map(s => (
          <div className="card" key={s.label} style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '24px', fontWeight: '900', color: s.color }}>{s.val.toLocaleString()}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bulk add */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '14px' }}>➕ إضافة أرقام (Bulk)</div>
        <div className="form-group">
          <label className="label">أدخل الأرقام (رقم واحد في كل سطر)</label>
          <textarea className="input" rows={6} placeholder={`01012345678\n01098765432\n201555123456`}
            value={bulkText} onChange={e => setBulkText(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-success" onClick={handleBulkAdd} disabled={addLoading}>
            {addLoading ? <><span className="spinner" style={{ width: '14px', height: '14px' }} /> جاري الإضافة...</> : '✅ إضافة الأرقام'}
          </button>
          <button className="btn btn-danger" onClick={handleDeleteDone}>
            🗑️ حذف المنجزة ({stats.done})
          </button>
          <button className="btn btn-ghost" onClick={fetchNumbers}>🔄 تحديث</button>
        </div>
      </div>

      {/* Filter + table */}
      <div className="card">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {['all', 'available', 'assigned', 'done'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f)}>
              {f === 'all' ? 'الكل' : f === 'available' ? 'متاحة' : f === 'assigned' ? 'مخصصة' : 'منجزة'}
            </button>
          ))}
          <span style={{ marginRight: 'auto', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '30px' }}>
            {filtered.length} رقم
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ width: '28px', height: '28px', margin: 'auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">📭</div><p>لا توجد أرقام</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>الرقم</th>
                  <th>الحالة</th>
                  <th>تاريخ الإضافة</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((num, i) => {
                  const st = statusMap[num.status] || statusMap.available;
                  return (
                    <tr key={num.id}>
                      <td style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{i + 1}</td>
                      <td style={{ direction: 'ltr', fontWeight: '600', fontFamily: 'monospace', fontSize: '15px' }}>{num.phone}</td>
                      <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      <td style={{ color: 'var(--text-dim)', fontSize: '12px' }}>
                        {num.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length > 100 && (
              <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                يتم عرض أول 100 فقط من {filtered.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
