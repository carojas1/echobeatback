import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminEmailGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.email) {
      throw new ForbiddenException('User information not found');
    }

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      throw new ForbiddenException('Admin email not configured in environment');
    }

    if (user.email !== adminEmail) {
      throw new ForbiddenException(
        `Access denied. Admin privileges required. Only ${adminEmail} is allowed.`,
      );
    }

    return true;
  }
}
