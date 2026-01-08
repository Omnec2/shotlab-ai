import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// CONFIGURATION FIREBASE RÉELLE DE SHOTLAB-AI
const firebaseConfig = {
  apiKey: "AIzaSyAZ65TLj8JynWk4vj4t-mvL0yneDS7mOEQ",
  authDomain: "shotlab-ai.firebaseapp.com",
  projectId: "shotlab-ai",
  storageBucket: "shotlab-ai.firebasestorage.app",
  messagingSenderId: "685199857484",
  appId: "1:685199857484:web:fe725361193410a4b061e9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();