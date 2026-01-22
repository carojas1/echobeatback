import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';
// import { FirebaseAdminService } from '../firebase/firebase-admin.config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    private transporter;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        // private firebaseAdmin: FirebaseAdminService,
    ) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASSWORD'),
            },
        });
    }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const verificationToken = uuidv4();

        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                displayName: registerDto.displayName,
                verificationToken,
            },
        });

        await this.sendVerificationEmail(user.email, verificationToken);

        const tokens = await this.generateTokens(user);

        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens(user);

        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }

    async googleLogin(profile: any) {
        let user = await this.prisma.user.findUnique({
            where: { googleId: profile.googleId },
        });

        if (!user) {
            user = await this.prisma.user.findUnique({
                where: { email: profile.email },
            });

            if (user) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { googleId: profile.googleId },
                });
            } else {
                user = await this.prisma.user.create({
                    data: {
                        email: profile.email,
                        displayName: profile.displayName,
                        avatar: profile.avatar,
                        googleId: profile.googleId,
                        isVerified: true,
                    },
                });
            }
        }

        const tokens = await this.generateTokens(user);

        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const tokens = await this.generateTokens(user);
            return tokens;
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return { message: 'If email exists, password reset link has been sent' };
        }

        const resetToken = uuidv4();
        const resetExpires = new Date(Date.now() + 3600000);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetExpires,
            },
        });

        await this.sendPasswordResetEmail(user.email, resetToken);

        return { message: 'If email exists, password reset link has been sent' };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });

        return { message: 'Password reset successful' };
    }

    async verifyEmail(token: string) {
        const user = await this.prisma.user.findFirst({
            where: { verificationToken: token },
        });

        if (!user) {
            throw new BadRequestException('Invalid verification token');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
            },
        });

        return { message: 'Email verified successfully' };
    }

    private async generateTokens(user: any) {
        const payload = {
            email: user.email,
            sub: user.id,
            displayName: user.displayName,
            role: user.role, // RBAC
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRATION'),
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
        });

        return { accessToken, refreshToken };
    }

    private sanitizeUser(user: any) {
        const { password, resetPasswordToken, verificationToken, resetPasswordExpires, ...sanitizedUser } = user;
        return {
            ...sanitizedUser,
            role: user.role, // Include role for frontend
        };
    }

    private async sendVerificationEmail(email: string, token: string) {
        const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;

        await this.transporter.sendMail({
            from: this.configService.get('SMTP_USER'),
            to: email,
            subject: 'Verify your EchoBeat account',
            html: `
        <h1>Welcome to EchoBeat!</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `,
        });
    }

    private async sendPasswordResetEmail(email: string, token: string) {
        const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

        await this.transporter.sendMail({
            from: this.configService.get('SMTP_USER'),
            to: email,
            subject: 'Reset your EchoBeat password',
            html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
        });
    }

    /*
    async syncFirebaseUser(firebaseToken: string) {
        // Verificar token con Firebase Admin
        const decodedToken = await this.firebaseAdmin.verifyIdToken(firebaseToken);
        const { uid, email, name, picture } = decodedToken;

        if (!email) {
            throw new BadRequestException('Email not found in Firebase token');
        }

        // Determinar role - ADMIN para Carolina
        const { UserRole, UserStatus } = await import('@prisma/client');
        const role = email === 'carojas@sudamericano.edu.ec' 
            ? UserRole.ADMIN 
            : UserRole.USER;

        // Crear o actualizar usuario en Neon
        const user = await this.prisma.user.upsert({
            where: { email },
            update: {
                displayName: name || email.split('@')[0],
                avatar: picture,
                googleId: uid,
                role,
            },
            create: {
                email,
                googleId: uid,
                displayName: name || email.split('@')[0],
                avatar: picture,
                role,
                status: UserStatus.ACTIVE,
                isVerified: true,
            },
        });

        // Generar JWT del backend
        const tokens = await this.generateTokens(user);

        // Retornar usuario + tokens
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    */

    async syncFirebaseUser(firebaseData: {
        uid: string;
        email: string;
        displayName?: string;
        photoURL?: string;
    }) {
        const { uid, email, displayName, photoURL } = firebaseData;

        if (!email) {
            throw new BadRequestException('Email is required');
        }

        // Determinar role - ADMIN para el email específico
        const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
        const role = email === adminEmail 
            ? UserRole.ADMIN 
            : UserRole.USER;

        // Crear o actualizar usuario en la base de datos
        const user = await this.prisma.user.upsert({
            where: { email },
            update: {
                displayName: displayName || email.split('@')[0],
                avatar: photoURL,
                googleId: uid,
                role,
            },
            create: {
                email,
                googleId: uid,
                displayName: displayName || email.split('@')[0],
                avatar: photoURL,
                role,
                status: UserStatus.ACTIVE,
                isVerified: true,
            },
        });

        // Generar JWT del backend
        const tokens = await this.generateTokens(user);

        // Retornar usuario + tokens
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
}
