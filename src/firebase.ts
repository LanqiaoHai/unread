import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "unread-app-20260411v2",
  appId: "1:169675948384:web:9d394ec0c903538d599e05",
  storageBucket: "unread-app-20260411v2.firebasestorage.app",
  apiKey: "AIzaSyD-VI6fYe3kwIgy50URPg-hf_FXINrKx8A",
  authDomain: "unread-app-20260411v2.firebaseapp.com",
  messagingSenderId: "169675948384",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
