import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || 'AIzaSyC4UVA9e1d8PEaw0ow8e4QvYgm7AKPzaro',
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || 'skillbank-app.firebaseapp.com',
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || 'skillbank-app',
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || 'skillbank-app.firebasestorage.app',
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '836647588245',
  appId: metaEnv.VITE_FIREBASE_APP_ID || '1:836647588245:web:f1b0a4eb18d07b34e0669c',
};

// Initialize Firebase safely
let appInstance: any = null;
let authInstance: any = null;
let dbInstance: any = null;
let isConfigured = false;

try {
  appInstance = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance);
  isConfigured = true;
} catch (err) {
  console.warn('Firebase initialization notice:', err);
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const isFirebaseConfigured = isConfigured;
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User
};
