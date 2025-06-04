import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin SDK configuration
const firebaseAdminConfig = {
  type: "service_account",
  project_id: "movementpre",
  private_key_id: "16bcaee544da24945e63471b56f5ddba1822cfea",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCn2ItZTrA/Pd65\na91QEhxmTQbGo8QZmYH1Ih/3tEsUlL8oFW4faKKTsxpnTZ38Z3I2qfRXwsW2+UIh\nU94pmC3jLfbHT++77S+wEZKYAb1mwnhwLsjndgPwuXZn+ELUlcDff+1amcZxXyTo\nG38cwDPcf1vGzQXZwOekx3N+Ga6Cw+mR2CA+xLi9JBnUES5uoF4FRxH0eCVnRbyF\n7jM+HxT5aCstqQYRB4v2/IxpYREKHL1YdYuIMlAsQoNddhHe6U9tKX8FfZq1CgBc\nas6pVFz/D+rr6IAI9PcnRZSV5Xp+WjQDZvGEnpJQLpNme5w6Q1Jxvxbhg9lcml7t\nmO5ci3g9AgMBAAECggEAQU4cscvPAVw2O1i/jDbvu9H+b+0qEHfMu67iV0Nb7w8M\n7TChXzEcCHGoNUdaz+kD5EbuHfNXcCC9XTA/gVmHiRvKJ7RvZ2QaqNu9eM08fy3t\nJGDfpEcjs1bFviA3CHWXzJ3+oMCyGExXlMOWCn6x7vnSoKAGxbmrp04/HnIplxC3\nSxmYanUCf1bj/Lwpgn+uY75pyKLDejsklVxGbinv1bFjmVeDUzlbAGlNIN7SdOFx\nO0HlaiIiwtHuVVLI3FsHqg3eyaKOYmsKFFMh4lnkttFbSbfG8J25aYLVnW/VCxX6\nDYqdgQ3Gdh6TkC7/bRTwYQFEQJ1pstO55ia/SO7ktQKBgQDb4h5aj8fsf8IyZwG/\noQxvDy+RW5OX3b9SEr4NabjHQ+Lwfdtjz6bQpIcNvOUiesrwEf/4kzFY8cWA1MrQ\nn+WaN0q/WGmLEwDXEdvChSU3O6aYR842YirRaI9VRUa5khUbFVRVclNoLPmYunrG\nOawZo9oJjxmxfo3ZYbCp33MiSwKBgQDDak2KP5+2BMPjJySYB3G6x/tbI5MPa3Cu\nkt1NknSuJzyhQQuPvCU5hbfZ6Xmo3ivw/TgTH1XU5LkYbX2VNLwqV3o0IWdjvrwa\nMCHlCtD5rqs7Vp3Hp5sxIKVUThXt0iWKn5OJsTfDTYiXnQx0qE8K4jftKo+PZ0k+\ndQ+JwU/6lwKBgDrrP0jzCBZGMapB0cUgiW1k+1EO4eCqya5bWVPMxXeXqELa5qO7\nK67yt0GmIRv5HVHw8M8R2gJEXrDj1CjM/8AwGrZlIXrjr7DxlxprhQpk0IIzk30d\nFu4f/3BQ7N+i1kb4ky2GQfVDP+p95ZIiOAxyzGUNVEwsZiQeujD6sCY7AoGAM4ok\n+1J+iB5Hn/Ch+Sr1dwLpq4b9cXKv3ItFrQD0nz4gApPKPdWsp7g53lJy0PQP+NaA\nZKK+G5FbtDKkjabD/hLmWzt4LlmO+QU621L3/PJxnQviP1dYWiO3Fz4lEH19g0tF\nOWqxP2SCoyI7t8TwW/mAMKAqDvN54Ow09eszce8CgYA0uilbbDdVEurJ3i3O0eS7\ni7EnhhJUsO4RwOXYbalKlPzFRNx4IGjl2LZo2pwpG8a9VPMX+F09rxh8Q7u0kOAv\njZK6v0OEs9tobiVfMcvNdwtRSMxjmprjEUkjkxr2gcbKS5IVND+e59t2YNrNZblu\nOu7n33StD1JubAz8sgLWuA==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@movementpre.iam.gserviceaccount.com",
  client_id: "112887237318747330353",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40movementpre.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Admin email addresses
const ADMIN_EMAILS = [
  'admin@brilliantperspectives.com',
  'matt@brilliantperspectives.com',
];

// Initialize Firebase Admin SDK
let adminApp;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert(firebaseAdminConfig as any),
    projectId: 'movementpre',
    storageBucket: 'movementpre.firebasestorage.app'
  });
} else {
  adminApp = getApps()[0];
}

// Initialize Firebase Admin services
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
export const adminAuth = getAuth(adminApp);

// Verify ID token and check admin status
export async function verifyAdminToken(idToken: string): Promise<boolean> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email;
    
    if (!email) return false;
    
    return ADMIN_EMAILS.includes(email.toLowerCase());
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}

export default adminApp; 