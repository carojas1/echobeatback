import { IsOptional, IsString, IsEnum, IsBoolean, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    BLOCKED = 'BLOCKED',
}

export class UpdateUserAdminDto {
    @ApiPropertyOptional({ description: 'User email' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'Display name' })
    @IsOptional()
    @IsString()
    displayName?: string;

    @ApiPropertyOptional({ description: 'User bio' })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiPropertyOptional({ description: 'Avatar URL' })
    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiPropertyOptional({ enum: UserRole, description: 'User role' })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({ enum: UserStatus, description: 'User status' })
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @ApiPropertyOptional({ description: 'Is verified' })
    @IsOptional()
    @IsBoolean()
    isVerified?: boolean;
}

export class ChangeRoleDto {
    @ApiPropertyOptional({ enum: UserRole, description: 'New role' })
    @IsEnum(UserRole)
    role: UserRole;
}

export class ChangeStatusDto {
    @ApiPropertyOptional({ enum: UserStatus, description: 'New status' })
    @IsEnum(UserStatus)
    status: UserStatus;
}
