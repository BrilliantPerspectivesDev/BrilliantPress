import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getAuth, Auth } from 'firebase-admin/auth';
import * as path from 'path';
import * as fs from 'fs';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminStorage: Storage | null = null;
let adminAuth: Auth | null = null;

// Lazy initialization of Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (adminApp) return adminApp;
  
  if (!getApps().length) {
    try {
      // For production, use environment variables for service account
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: 'movementpre',
          storageBucket: 'movementpre.firebasestorage.app'
        });
      } else {
        // For local development, try to load from file
        const serviceAccountPath = path.join(process.cwd(), 'movementpre-firebase-adminsdk-fbsvc-16bcaee544.json');
        
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
          adminApp = initializeApp({
            credential: cert(serviceAccount),
            projectId: 'movementpre',
            storageBucket: 'movementpre.firebasestorage.app'
          });
        } else {
          throw new Error('Firebase service account not found. Please add FIREBASE_SERVICE_ACCOUNT_KEY environment variable or place the service account file in the project root.');
        }
      }
    } catch (error) {
      console.error('Firebase Admin SDK initialization failed:', error);
      throw error;
    }
  } else {
    adminApp = getApps()[0];
  }
  
  return adminApp;
}

// Lazy getters for Firebase services
export function getAdminDb() {
  if (!adminDb) {
    try {
      const app = initializeFirebaseAdmin();
      adminDb = getFirestore(app);
    } catch (error) {
      console.error('Failed to initialize Firebase Admin DB:', error);
      throw new Error('Firebase Admin SDK not configured');
    }
  }
  return adminDb;
}

export function getAdminStorage() {
  if (!adminStorage) {
    try {
      const app = initializeFirebaseAdmin();
      adminStorage = getStorage(app);
    } catch (error) {
      console.error('Failed to initialize Firebase Admin Storage:', error);
      throw new Error('Firebase Admin SDK not configured');
    }
  }
  return adminStorage;
}

export function getAdminAuth() {
  if (!adminAuth) {
    try {
      const app = initializeFirebaseAdmin();
      adminAuth = getAuth(app);
    } catch (error) {
      console.error('Failed to initialize Firebase Admin Auth:', error);
      throw new Error('Firebase Admin SDK not configured');
    }
  }
  return adminAuth;
}

// Verify ID token and check admin status
export async function verifyIdToken(idToken: string) {
  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
}

// Check if user is admin
export function isAdminUser(email: string): boolean {
  const adminEmails = [
    'admin@brilliantperspectives.com',
    'matt@brilliantperspectives.com'
  ];
  return adminEmails.includes(email.toLowerCase());
}

export default function getAdminApp() {
  return initializeFirebaseAdmin();
} 