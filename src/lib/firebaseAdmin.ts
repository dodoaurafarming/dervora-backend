import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount: any;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production: Baca dari environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Development: Baca dari file lokal
  const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
}

// Inisialisasi Firebase Admin
let app: App;
if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  app = getApps()[0];
}

// Inisialisasi Auth instance
const authInstance = getAuth(app);

export const verifyIdToken = async (token: string) => {
  try {
    const decodedToken = await authInstance.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired Firebase token');
  }
};