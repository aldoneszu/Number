export default function HowItWorks() {
  const steps = [
    { n: '1', icon: '📱', title: 'تسجيل الدخول', desc: 'ادخل على حسابك في منصة Starko وتأكد إن حسابك نشط.' },
    { n: '2', icon: '💼', title: 'ابدأ الشغل', desc: 'اضغط على "ابدأ الشغل" في صفحة الشغل. هيتخصصلك 50 رقم تبدأ بيهم.' },
    { n: '3', icon: '📨', title: 'افتح واتساب', desc: 'هيظهرلك رقم واحد في كل مرة. اضغط "فتح واتساب" وسيتفتح واتساب ويكتبلك الرسالة تلقائياً.' },
    { n: '4', icon: '✅', title: 'أرسل الرسالة', desc: 'بس اضغط إرسال في واتساب. الرسالة جاهزة ومكتوبة. مش محتاج تعدل حاجة.' },
    { n: '5', icon: '🔄', title: 'اضغط "تم"', desc: 'بعد ما ترسل الرسالة ارجع للتطبيق واضغط "تم" وسينتقل للرقم الجاي تلقائياً.' },
    { n: '6', icon: '💰', title: 'اجمع أرباحك', desc: 'كل 100 رقم = 20 جنيه مصري. الأرباح بتتحدث تلقائياً بعد كل 100 رقم.' },
  ];

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900' }}>📖 فهم الشغل</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>اقرأ كويس قبل ما تبدأ</p>
      </div>

      {/* Salary card */}
      <div className="card" style={{
        background: 'var(--accent-glow)', borderColor: 'rgba(245,158,11,0.4)',
        marginBottom: '24px', padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '48px' }}>💰</div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--accent)' }}>20 ج.م</div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>مقابل كل 100 رقم</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
              يعني: 200 ج.م مقابل 1000 رقم | 400 ج.م مقابل 2000 رقم
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="section-title" style={{ marginBottom: '20px' }}>الخطوات</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
        {steps.map(step => (
          <div key={step.n} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              width: '36px', height: '36px', flexShrink: 0,
              background: 'var(--accent)', color: '#000',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '900', fontSize: '16px'
            }}>{step.n}</div>
            <div>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                {step.icon} {step.title}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7' }}>
                {step.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Important tips */}
      <div className="section-title">⚠️ تنبيهات مهمة</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          { icon: '📱', text: 'استخدم رقم واتساب غير أساسي أو رقم منفصل عن رقمك الشخصي. ده أفضل وأأمن.' },
          { icon: '⏰', text: 'لا ترسل أكثر من 100-150 رسالة في اليوم من نفس الرقم لتفادي الحظر.' },
          { icon: '📸', text: 'حتفضل مطلوب منك screenshots كإثبات أداء - الأدمن ممكن يطلبها في أي وقت.' },
          { icon: '🚫', text: 'لا تعدل في الرسالة. الرسالة محددة من الأدمن وأي تعديل ممكن يؤثر على شغلك.' },
          { icon: '✅', text: 'لا تضغط "تم" إلا بعد ما ترسل الرسالة فعلاً. التسجيل بيعتمد على ضغطتك.' },
        ].map((tip, i) => (
          <div key={i} className="card" style={{
            display: 'flex', gap: '12px',
            background: 'var(--bg-secondary)', borderColor: 'var(--border)'
          }}>
            <span style={{ fontSize: '20px' }}>{tip.icon}</span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
