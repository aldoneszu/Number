import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy, doc, onSnapshot } from 'firebase/firestore';
import { useToast, ToastContainer } from '../hooks/useToast';

export default function WithdrawPage() {
  const { user } = useAuth();
  const { toasts, toast } = useToast();
  const [stats, setStats] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('vodafone');
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), snap => {
      if (snap.exists()) setStats(snap.data());
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const q = query(
        collection(db, 'withdrawals'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      try {
        const snap = await getDocs(q);
        setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {}
    };
    fetch();
  }, [user]);

  const handleWithdraw = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 20) return toast.error('الحد الأدنى للسحب 20 ج.م');
    if (amt > (stats?.availableBalance || 0)) return toast.error('الرصيد المتاح غير كافي');
    if (!account) return toast.error('أدخل رقم حسابك');
    setLoading(true);
    try {
      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        userName: stats?.name,
        userEmail: stats?.email,
        amount: amt,
        method,
        account,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast.success('تم إرسال طلب السحب بنجاح! انتظر موافقة الأدمن.');
      setAmount('');
      setAccount('');
    } catch (err) {
      toast.error('حدث خطأ، حاول مرة أخرى');
    } finally { setLoading(false); }
  };

  const statusMap = {
    pending: { label: 'قيد المراجعة', cls: 'badge-yellow' },
    approved: { label: 'تمت الموافقة', cls: 'badge-green' },
    rejected: { label: 'مرفوض', cls: 'badge-red' },
  };

  return (
    <div className="animate-in">
      <ToastContainer toasts={toasts} />

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900' }}>💸 سحب الأرباح</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>اطلب سحب رصيدك المتاح</p>
      </div>

      {/* Balance cards */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-glow)', color: 'var(--green)' }}>💰</div>
          <div>
            <div className="stat-value" style={{ color: 'var(--green)', fontSize: '22px' }}>
              {(stats?.availableBalance || 0).toFixed(2)} ج.م
            </div>
            <div className="stat-label">رصيد متاح للسحب</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--blue-glow)', color: 'var(--blue)' }}>⏳</div>
          <div>
            <div className="stat-value" style={{ color: 'var(--blue)', fontSize: '22px' }}>
              {(stats?.pendingBalance || 0).toFixed(2)} ج.م
            </div>
            <div className="stat-label">قيد المراجعة</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>📊</div>
          <div>
            <div className="stat-value" style={{ color: 'var(--accent)', fontSize: '22px' }}>
              {(stats?.earnings || 0).toFixed(2)} ج.م
            </div>
            <div className="stat-label">إجمالي الأرباح</div>
          </div>
        </div>
      </div>

      {/* Withdraw form */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>💳 طلب سحب جديد</div>

        <div className="form-group">
          <label className="label">المبلغ (ج.م) - الحد الأدنى 20 ج.م</label>
          <input className="input" type="number" min="20" placeholder="20"
            value={amount} onChange={e => setAmount(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="label">طريقة الاستلام</label>
          <select className="input" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="vodafone">فودافون كاش</option>
            <option value="instapay">انستاباي</option>
            <option value="bank">تحويل بنكي</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label">
            {method === 'vodafone' ? 'رقم فودافون كاش' :
             method === 'instapay' ? 'رقم انستاباي / IPA' : 'رقم الحساب البنكي'}
          </label>
          <input className="input" placeholder="أدخل رقم حسابك"
            value={account} onChange={e => setAccount(e.target.value)} />
        </div>

        <button className="btn btn-success w-full" onClick={handleWithdraw} disabled={loading}
          style={{ justifyContent: 'center', padding: '14px', fontSize: '15px' }}>
          {loading ? <><span className="spinner" style={{ width: '16px', height: '16px' }} /> جاري الإرسال...</> : '💸 إرسال طلب السحب'}
        </button>
      </div>

      {/* History */}
      <div className="card">
        <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>📋 سجل الطلبات</div>
        {history.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <p>لا توجد طلبات سحب بعد</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>المبلغ</th>
                  <th>الطريقة</th>
                  <th>الحساب</th>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {history.map(w => {
                  const st = statusMap[w.status] || statusMap.pending;
                  return (
                    <tr key={w.id}>
                      <td style={{ fontWeight: '700', color: 'var(--green)' }}>{w.amount} ج.م</td>
                      <td>{w.method}</td>
                      <td style={{ direction: 'ltr' }}>{w.account}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {w.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || ''}
                      </td>
                      <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
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
