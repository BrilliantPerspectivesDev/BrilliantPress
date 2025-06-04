import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import * as path from 'path';
import * as fs from 'fs';

// Initialize Firebase Admin SDK
let adminApp: App;
if (!getApps().length) {
  try {
    // Try to load service account from file
    const serviceAccountPath = path.join(process.cwd(), 'movementpre-firebase-adminsdk-fbsvc-16bcaee544.json');
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: 'movementpre',
      storageBucket: 'movementpre.firebasestorage.app'
    });
  } catch {
    console.error('Service account file not found. Make sure to add the Firebase service account key file to the project root.');
    throw new Error('Firebase Admin SDK initialization failed: Service account file not found');
  }
} else {
  adminApp = getApps()[0];
}

// Initialize Firebase Admin services
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
export const adminAuth = getAuth(adminApp);

// Verify ID token and check admin status
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
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

export default adminApp; 