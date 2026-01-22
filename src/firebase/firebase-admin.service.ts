import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService {
  constructor() {
    try {
      // Initialize Firebase Admin if not already initialized
      if (!admin.apps.length) {
        // Uses GOOGLE_APPLICATION_CREDENTIALS environment variable
        admin.initializeApp();
        console.log('✅ Firebase Admin initialized successfully');
      }
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error.message);
      console.error(
        '💡 Make sure GOOGLE_APPLICATION_CREDENTIALS is set to your service account JSON file path',
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
