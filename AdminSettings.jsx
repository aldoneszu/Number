import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast, ToastContainer } from '../hooks/useToast';

export default function AdminSettings() {
  const { toasts, toast } = useToast();
  const [message, setMessage] = useState('');
  const [batchSize, setBatchSize] = useState(50);
  const [ratePerHundred, setRatePerHundred] = useState(20);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'settings', 'main'));
      if (snap.exists()) {
        const d = snap.data();
        setMessage(d.defaultMessage || '');
        setBatchSize(d.batchSize || 50);
        setRatePerHundred(d.ratePerHundred || 20);
      }
      setLoading(false);
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'main'), {
        defaultMessage: message,
        batchSize: parseInt(batchSize),
        ratePerHundred: parseFloat(ratePerHundred),
        updatedAt: serverTimestamp()
      });
      toast.success('تم حفظ الإعدادات بنجاح!');
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ width: '28px', height: '28px', margin: 'auto' }} /></div>;

  return (
    <div className="animate-in">
      <ToastContainer toasts={toasts} />

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900' }}>⚙️ الإعدادات</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>إعدادات المنصة العامة</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '20px' }}>🔧 إعدادات المنصة</div>

        <div className="form-group">
          <label className="label">📝 الرسالة الافتراضية (يراها المستخدمون)</label>
          <textarea className="input" rows={5}
            placeholder="أكتب الرسالة اللي هيبعتها المستخدمين..."
            value={message} onChange={e => setMessage(e.target.value)} />
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            هذه الرسالة ستظهر تلقائياً عند فتح واتساب
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="label">📦 حجم الـ Batch (أرقام لكل مستخدم)</label>
            <input className="input" type="number" min="10" max="200"
              value={batchSize} onChange={e => setBatchSize(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">💰 العائد لكل 100 رقم (ج.م)</label>
            <input className="input" type="number" min="1"
              value={ratePerHundred} onChange={e => setRatePerHundred(e.target.value)} />
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
          padding: '14px 16px', marginBottom: '20px', fontSize: '14px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '6px', color: 'var(--accent)' }}>📊 ملخص الإعدادات</div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: '2' }}>
            • كل مستخدم يأخذ <strong style={{ color: 'var(--text-primary)' }}>{batchSize}</strong> رقم في كل جلسة<br />
            • مقابل كل <strong style={{ color: 'var(--text-primary)' }}>100</strong> رقم يكسب <strong style={{ color: 'var(--accent)' }}>{ratePerHundred} ج.م</strong><br />
            • يعني مقابل كل <strong style={{ color: 'var(--text-primary)' }}>1000</strong> رقم يكسب <strong style={{ color: 'var(--accent)' }}>{ratePerHundred * 10} ج.م</strong>
          </div>
        </div>

        <button className="btn btn-primary" onClick={save} disabled={saving}
          style={{ padding: '12px 28px', fontSize: '15px' }}>
          {saving ? <><span className="spinner" style={{ width: '14px', height: '14px' }} /> جاري الحفظ...</> : '💾 حفظ الإعدادات'}
        </button>
      </div>

      {/* Admin credentials reminder */}
      <div className="card mt-4" style={{ maxWidth: '600px', background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.3)' }}>
        <div style={{ fontWeight: '700', marginBottom: '10px', color: 'var(--purple)' }}>🔑 بيانات الأدمن</div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '2' }}>
          إيميل الأدمن: <strong style={{ color: 'var(--text-primary)' }}>admin@starko.com</strong><br />
          لتغيير هذا الإيميل، عدّل في ملف <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>src/hooks/useAuth.jsx</code><br />
          في المتغير <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>ADMIN_EMAIL</code>
        </div>
      </div>
    </div>
  );
}
