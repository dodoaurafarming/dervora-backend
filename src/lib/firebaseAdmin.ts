import { initializeApp, cert, getApps, type App, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

const loadServiceAccount = (): ServiceAccount => {
  const rawEnv =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT;

  if (rawEnv) {
    const parsed = JSON.parse(rawEnv);
    if (typeof parsed.private_key === 'string') {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }
    return parsed as ServiceAccount;
  }

  const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
  return JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')) as ServiceAccount;
};

const app: App =
  getApps().length === 0
    ? initializeApp({
        credential: cert(loadServiceAccount()),
      })
    : getApps()[0];

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