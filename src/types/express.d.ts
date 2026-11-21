import { JWTPayload } from '../lib/auth.js'; // Sesuaikan path jika perlu

export interface FirebaseUserData {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
}

declare global {
  namespace Express {
    interface Request {
      // req.user bisa berupa Payload Admin ATAU Data User Firebase
      user?: JWTPayload | FirebaseUserData;
    }
  }
}