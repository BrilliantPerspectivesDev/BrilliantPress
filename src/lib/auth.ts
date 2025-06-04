import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { auth } from './firebase';

// Admin email addresses (you can modify this list)
const ADMIN_EMAILS = [
  'admin@brilliantperspectives.com',
  'matt@brilliantperspectives.com',
  // Add more admin emails as needed
];

// Check if user is an admin
export function isAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

// Sign in with email and password
export async function signInAdmin(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (!isAdmin(user)) {
      await signOut(auth);
      throw new Error('Access denied. Admin privileges required.');
    }
    
    return user;
  } catch (error) {
    const authError = error as AuthError;
    
    // Provide user-friendly error messages
    switch (authError.code) {
      case 'auth/user-not-found':
        throw new Error('No account found with this email address.');
      case 'auth/wrong-password':
        throw new Error('Incorrect password.');
      case 'auth/invalid-email':
        throw new Error('Invalid email address.');
      case 'auth/too-many-requests':
        throw new Error('Too many failed attempts. Please try again later.');
      default:
        throw new Error(authError.message || 'Authentication failed.');
    }
  }
}

// Sign out
export async function signOutAdmin(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out.');
  }
}

// Auth state observer
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
} 