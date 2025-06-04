import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBKE8KzyMFuqvUnusE2-VyPrTIxRO-nIGI",
  authDomain: "movementpre.firebaseapp.com",
  projectId: "movementpre",
  storageBucket: "movementpre.firebasestorage.app",
  messagingSenderId: "817184453509",
  appId: "1:817184453509:web:d1cb3f75b6ad4f0b3f8aec",
  measurementId: "G-9YLP6W34VG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app; 