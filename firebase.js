import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDtyoR3uh3Cb9jPy2nAvw2_4Ine6KVeeaw",
  authDomain: "adminscriptstarko.firebaseapp.com",
  databaseURL: "https://adminscriptstarko-default-rtdb.firebaseio.com",
  projectId: "adminscriptstarko",
  storageBucket: "adminscriptstarko.appspot.com",
  messagingSenderId: "310036534754",
  appId: "1:310036534754:android:ba27e270c322f0164e15bb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export default app;
