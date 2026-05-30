import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import {
  collection, query, where, getDocs, doc, runTransaction,
  serverTimestamp, updateDoc, increment, addDoc, getDoc, limit, orderBy
} from 'firebase/firestore';
import { useToast, ToastContainer } from '../hooks/useToast';

const BATCH_SIZE = 50;

export default function WorkPage() {
  const { user, userDoc } = useAuth();
  const { toasts, toast } = useToast();
  const [assignment, setAssignment] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | working | done
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // Load existing assignment on mount
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const q = query(
        collection(db, 'assignments'),
        where('userId', '==', user.uid),
        where('status', '==', 'active'),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setAssignment({ id: snap.docs[0].id, ...data });
        const doneCount = data.numbers?.filter(n => n.status === 'done').length || 0;
        const remaining = data.numbers?.filter(n => n.status === 'pending') || [];
        const nextIdx = data.numbers?.findIndex(n => n.status === 'pending');
        setCurrentIdx(nextIdx >= 0 ? nextIdx : 0);
        setProgress({ done: doneCount, total: data.numbers?.length || 0 });
        setPhase('working');
      }
      // Load message from settings
      const settSnap = await getDoc(doc(db, 'settings', 'main'));
      if (settSnap.exists()) setMessage(settSnap.data().defaultMessage || '');
    };
    load();
  }, [user]);

  const startWork = async () => {
    setLoading(true);
    try {
      let assignmentId = null;
      let assignedNumbers = [];

      await runTransaction(db, async (tx) => {
        // Get available numbers
        const q = query(
          collection(db, 'numbers'),
          where('status', '==', 'available'),
          limit(BATCH_SIZE)
        );
        const snap = await getDocs(q);
        if (snap.empty) throw new Error('لا توجد أرقام متاحة حالياً، تواصل مع الأدمن');

        assignedNumbers = snap.docs.slice(0, BATCH_SIZE).map(d => ({
          numberId: d.id,
          phone: d.data().phone,
          status: 'pending'
        }));

        // Mark numbers as assigned
        for (const num of assignedNumbers) {
          tx.update(doc(db, 'numbers', num.numberId), {
            status: 'assigned',
            assignedTo: user.uid,
            assignedAt: serverTimestamp()
          });
        }

        // Create assignment doc
        const aRef = doc(collection(db, 'assignments'));
        assignmentId = aRef.id;
        tx.set(aRef, {
          id: aRef.id,
          userId: user.uid,
          userName: userDoc?.name || '',
          numbers: assignedNumbers,
          status: 'active',
          startedAt: serverTimestamp(),
          doneCount: 0,
          totalCount: assignedNumbers.length,
        });
      });

      // Load settings message
      const settSnap = await getDoc(doc(db, 'settings', 'main'));
      if (settSnap.exists()) setMessage(settSnap.data().defaultMessage || '');

      const aSnap = await getDoc(doc(db, 'assignments', assignmentId));
      setAssignment({ id: assignmentId, ...aSnap.data() });
      setCurrentIdx(0);
      setProgress({ done: 0, total: assignedNumbers.length });
      setPhase('working');
      toast.success(`تم تخصيص ${assignedNumbers.length} رقم لك!`);
    } catch (err) {
      toast.error(err.message || 'حدث خطأ');
    } finally { setLoading(false); }
  };

  const openWhatsapp = () => {
    const current = assignment?.numbers?.[currentIdx];
    if (!current) return;
    const cleaned = current.phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setSending(true);
  };

  const markDone = async () => {
    const current = assignment?.numbers?.[currentIdx];
    if (!current) return;

    try {
      // Update number status in assignment
      const updatedNumbers = [...assignment.numbers];
      updatedNumbers[currentIdx] = { ...current, status: 'done' };

      // Update number doc
      await updateDoc(doc(db, 'numbers', current.numberId), {
        status: 'done', doneBy: user.uid, doneAt: serverTimestamp()
      });

      // Update assignment
      await updateDoc(doc(db, 'assignments', assignment.id), {
        numbers: updatedNumbers,
        doneCount: increment(1)
      });

      // Log it
      await addDoc(collection(db, 'logs'), {
        userId: user.uid,
        userName: userDoc?.name,
        phone: current.phone,
        action: 'sent',
        timestamp: serverTimestamp(),
        assignmentId: assignment.id
      });

      // Update user stats
      const newDone = (userDoc?.doneNumbers || 0) + 1;
      const newEarnings = Math.floor(newDone / 100) * 20;
      const prevEarnings = Math.floor((userDoc?.doneNumbers || 0) / 100) * 20;
      const earnedNow = newEarnings - prevEarnings;

      await updateDoc(doc(db, 'users', user.uid), {
        doneNumbers: increment(1),
        earnings: increment(earnedNow > 0 ? earnedNow : 0),
        pendingBalance: increment(earnedNow > 0 ? earnedNow : 0),
        lastActive: serverTimestamp()
      });

      const newProgress = { done: progress.done + 1, total: progress.total };
      setProgress(newProgress);
      setAssignment({ ...assignment, numbers: updatedNumbers });
      setSending(false);

      // Move to next
      const nextIdx = updatedNumbers.findIndex((n, i) => i > currentIdx && n.status === 'pending');
      if (nextIdx >= 0) {
        setCurrentIdx(nextIdx);
        if (earnedNow > 0) toast.success(`🎉 ربحت ${earnedNow} ج.م!`);
      } else {
        // Check if all done
        const allDone = updatedNumbers.every(n => n.status === 'done');
        if (allDone) {
          await updateDoc(doc(db, 'assignments', assignment.id), { status: 'completed', completedAt: serverTimestamp() });
          setPhase('done');
        }
      }
    } catch (err) {
      toast.error('حدث خطأ، حاول تاني');
    }
  };

  const current = assignment?.numbers?.[currentIdx];
  const pendingNums = assignment?.numbers?.filter(n => n.status === 'pending') || [];
  const progressPct = progress.total > 0 ? (progress.done / progress.total) * 100 : 0;

  return (
    <div className="animate-in">
      <ToastContainer toasts={toasts} />

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900' }}>💼 منطقة الشغل</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>أرسل الرسائل واكسب الأرباح</p>
      </div>

      {/* Idle state */}
      {phase === 'idle' && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚀</div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>جاهز تبدأ؟</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.8' }}>
            هيتخصصلك {BATCH_SIZE} رقم<br />
            كل 100 رقم = <span style={{ color: 'var(--accent)', fontWeight: '700' }}>20 ج.م</span>
          </p>
          <button className="btn btn-primary btn-lg" onClick={startWork} disabled={loading}
            style={{ fontSize: '18px', padding: '16px 40px' }}>
            {loading ? <><span className="spinner" /> جاري التحضير...</> : '⚡ ابدأ الشغل'}
          </button>
        </div>
      )}

      {/* Working state */}
      {phase === 'working' && current && (
        <div>
          {/* Progress */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: '700' }}>📊 تقدمك</div>
              <div style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '18px' }}>
                {progress.done} / {progress.total}
              </div>
            </div>
            <div className="progress-bar" style={{ height: '12px' }}>
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>أرباح: <strong style={{ color: 'var(--green)' }}>{(Math.floor(progress.done / 100) * 20).toFixed(0)} ج.م</strong></span>
              <span>متبقي: {pendingNums.length} رقم</span>
            </div>
          </div>

          {/* Current number card */}
          <div className="card" style={{
            textAlign: 'center', padding: '40px 32px',
            borderColor: sending ? 'var(--green)' : 'var(--border)',
            background: sending ? 'rgba(16,185,129,0.05)' : 'var(--bg-card)'
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '600' }}>
              الرقم الحالي
            </div>
            <div style={{
              fontSize: '36px', fontWeight: '900', letterSpacing: '3px',
              color: 'var(--accent)', marginBottom: '8px', direction: 'ltr'
            }}>
              {current.phone}
            </div>

            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
              padding: '14px', margin: '20px 0', fontSize: '14px',
              color: 'var(--text-secondary)', lineHeight: '1.8', textAlign: 'right',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '8px' }}>
                📝 الرسالة المطلوب إرسالها:
              </div>
              {message || 'لم يتم تحديد رسالة من الأدمن بعد'}
            </div>

            {!sending ? (
              <button className="btn btn-success btn-lg" onClick={openWhatsapp}
                style={{ fontSize: '18px', padding: '16px 40px', gap: '10px' }}>
                <span>📱</span> فتح واتساب
              </button>
            ) : (
              <div>
                <div style={{
                  background: 'var(--green-glow)', border: '1px solid var(--green)',
                  borderRadius: 'var(--radius-sm)', padding: '14px', marginBottom: '16px',
                  color: 'var(--green)', fontSize: '14px'
                }}>
                  ✅ تم فتح واتساب — أرسل الرسالة ثم اضغط "تم"
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className="btn btn-success btn-lg" onClick={markDone}
                    style={{ fontSize: '16px', padding: '14px 32px' }}>
                    ✅ تم الإرسال
                  </button>
                  <button className="btn btn-ghost" onClick={() => setSending(false)}>
                    رجوع
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Done state */}
      {phase === 'done' && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px', color: 'var(--green)' }}>
            أنجزت كل الأرقام!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            عظيم! ربحت <strong style={{ color: 'var(--accent)' }}>{(Math.floor(progress.done / 100) * 20)} ج.م</strong> من هذه الجلسة
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => { setPhase('idle'); setAssignment(null); setCurrentIdx(0); setProgress({ done: 0, total: 0 }); }}>
            🔄 خذ batch جديد
          </button>
        </div>
      )}
    </div>
  );
}
