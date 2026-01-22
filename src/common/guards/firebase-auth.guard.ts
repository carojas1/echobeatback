import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseAdminService } from '../../firebase/firebase-admin.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private firebaseAdmin: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Robust header reading
    const authHeader = request.headers.authorization || '';

    // 🐛 DEBUG: Log auth header (first 30 chars)
    console.log('📩 AUTH HEADER:', authHeader?.slice(0, 30));

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      console.log('❌ No token found in Authorization header');
      throw new UnauthorizedException('Missing Firebase authentication token');
    }

    try {
      const decodedToken = await this.firebaseAdmin.verifyIdToken(token);

      // 🐛 DEBUG: Log successful verification
      console.log('✅ DECODED UID:', decodedToken.uid);
      console.log('✅ DECODED EMAIL:', decodedToken.email);

      // Attach Firebase user to request
      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        name: decodedToken.name || decodedToken.email || null,
        emailVerified: decodedToken.email_verified || false,
      };

      return true;
    } catch (error) {
      // 🐛 DEBUG: Log exact error message
      console.error('❌ FIREBASE VERIFY ERROR:', error.message);
      console.error('❌ ERROR CODE:', error.code);
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }
  }
}
