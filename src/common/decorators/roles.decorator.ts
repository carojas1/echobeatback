import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Decorator para especificar roles requeridos
// Uso: @Roles('ADMIN', 'USER')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
