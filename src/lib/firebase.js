import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config — computer-class-1568d
const firebaseConfig = {
  apiKey: "AIzaSyBdoDjO_KQ-wLHAVY5BrPXo8D-HDrdrJtE",
  authDomain: "computer-class-1568d.firebaseapp.com",
  projectId: "computer-class-1568d",
  storageBucket: "computer-class-1568d.firebasestorage.app",
  messagingSenderId: "34359659476",
  appId: "1:34359659476:web:cf89d0c775a6d4542a2441",
  measurementId: "G-F48BM3CXGQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Cloud Firestore
export const db = getFirestore(app);
