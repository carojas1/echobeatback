import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService {
  constructor() {
    try {
      // Initialize Firebase Admin if not already initialized
      if (!admin.apps.length) {
        const credentialsJson = process.env.FIREBASE_CREDENTIALS_JSON;

        if (credentialsJson) {
          // Railway/Production: Use JSON from environment variable
          const credentials = JSON.parse(credentialsJson);
          admin.initializeApp({
            credential: admin.credential.cert(credentials),
          });
          console.log('✅ Firebase Admin initialized from FIREBASE_CREDENTIALS_JSON');
        } else {
          // Development: Uses GOOGLE_APPLICATION_CREDENTIALS file path
          admin.initializeApp();
          console.log('✅ Firebase Admin initialized from GOOGLE_APPLICATION_CREDENTIALS');
        }
      }
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error.message);
      console.error(
        '💡 Set FIREBASE_CREDENTIALS_JSON (production) or GOOGLE_APPLICATION_CREDENTIALS (development)',
      );
      throw error;
    }
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }
  }

  getAuth() {
    return admin.auth();
  }
}
