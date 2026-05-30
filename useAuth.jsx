import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Admin email - change this to your admin email
const ADMIN_EMAIL = 'admin@starko.com';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (snap.exists()) setUserDoc(snap.data());
      } else {
        setUser(null);
        setUserDoc(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    await setPersistence(auth, browserLocalPersistence);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    if (snap.exists()) {
      const data = snap.data();
      if (data.banned) throw new Error('تم حظر حسابك. تواصل مع الإدارة.');
      setUserDoc(data);
    }
    return cred;
  };

  const register = async (email, password, name, phone) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userData = {
      uid: cred.user.uid,
      name,
      email,
      phone,
      role: email === ADMIN_EMAIL ? 'admin' : 'user',
      banned: false,
      doneNumbers: 0,
      earnings: 0,
      pendingBalance: 0,
      availableBalance: 0,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), userData);
    setUserDoc(userData);
    return cred;
  };

  const logout = () => signOut(auth);

  const isAdmin = userDoc?.role === 'admin' || user?.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
