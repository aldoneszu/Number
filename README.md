# ⚡ Starko - منصة مهام الواتساب

منصة ويب كاملة لإدارة توزيع مهام إرسال رسائل واتساب على مستخدمين مع نظام أرباح كامل.

---

## 🚀 بدء سريع

### 1. تثبيت الـ Dependencies

```bash
npm install
```

### 2. تشغيل محلي

```bash
npm run dev
```

افتح: http://localhost:3000

### 3. بناء للنشر

```bash
npm run build
```

---

## 🔥 إعداد Firebase

المشروع متصل بـ Firebase بالفعل. البيانات موجودة في `src/firebase.js`.

### Firestore Collections المطلوبة:

يتم إنشاؤها تلقائياً عند أول استخدام:
- `users` - بيانات المستخدمين
- `numbers` - الأرقام المخزنة
- `assignments` - توزيع الأرقام على المستخدمين
- `logs` - سجل النشاط
- `withdrawals` - طلبات السحب
- `settings` - إعدادات المنصة

### Firestore Rules:

انسخ محتوى `firestore.rules` إلى Firebase Console → Firestore → Rules

---

## 🔑 حساب الأدمن

- **الإيميل:** `admin@starko.com`
- **كلمة المرور:** حددها أنت عند التسجيل لأول مرة

> لتغيير إيميل الأدمن: عدّل `ADMIN_EMAIL` في `src/hooks/useAuth.jsx`

---

## 📱 كيف تعمل المنصة

### المستخدم:
1. يسجل حساب ويدخل
2. يضغط "ابدأ الشغل" ← يتخصص له 50 رقم
3. لكل رقم: يضغط "فتح واتساب" ← يرسل الرسالة ← يضغط "تم"
4. كل 100 رقم = 20 ج.م أرباح
5. يطلب سحب أرباحه

### الأدمن:
1. يدخل على `/admin`
2. يضيف الأرقام (Bulk Upload)
3. يحدد الرسالة الافتراضية
4. يراقب نشاط المستخدمين
5. يوافق أو يرفض طلبات السحب

---

## 🌐 النشر على Firebase Hosting

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# البناء
npm run build

# النشر
firebase deploy --only hosting
```

---

## 📦 هيكل المشروع

```
src/
├── firebase.js          # إعداد Firebase
├── App.jsx              # Router الرئيسي
├── main.jsx             # Entry point
├── hooks/
│   ├── useAuth.jsx      # Authentication context
│   └── useToast.jsx     # Toast notifications
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── UserDashboard.jsx
│   ├── WorkPage.jsx          # ← الشغل الأساسي
│   ├── HowItWorks.jsx
│   ├── WithdrawPage.jsx
│   ├── AdminDashboard.jsx
│   ├── AdminNumbers.jsx
│   ├── AdminUsers.jsx
│   ├── AdminWithdrawals.jsx
│   └── AdminSettings.jsx
├── components/
│   ├── shared/
│   │   ├── Layout.jsx
│   │   └── LoadingScreen.jsx
│   └── admin/
│       └── AdminLayout.jsx
└── styles/
    └── global.css
```

---

## 💰 نظام الأرباح

```
كل 100 رقم = 20 ج.م
E = (N / 100) × 20
```

- يتم احتساب الأرباح تلقائياً
- تُضاف للـ `pendingBalance` حتى الموافقة
- بعد الموافقة تُنقل لـ `availableBalance`

---

## ⚠️ ملاحظات مهمة

1. **Firestore Indexes**: قد تحتاج إنشاء Composite Indexes في Firebase Console لبعض الـ queries
2. **Firebase Auth**: تأكد من تفعيل Email/Password في Authentication
3. **CORS**: Firebase Hosting يحل مشكلة CORS تلقائياً

---

Made with ⚡ by Starko Team
