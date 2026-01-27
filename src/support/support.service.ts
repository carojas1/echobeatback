import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createMessage(dto: CreateSupportMessageDto, user: any) {
    const message = await this.prisma.supportMessage.create({
      data: {
        userId: user.uid || user.id,
        userEmail: user.email,
        userName: user.name || user.displayName || user.email,
        message: dto.message,
      },
    });

    return {
      id: message.id,
      message: message.message,
      createdAt: message.createdAt,
    };
  }

  async getAllMessages(page: number = 1, limit: number = 50, unreadOnly: boolean = false) {
    const skip = (page - 1) * limit;

    const where = unreadOnly ? { isRead: false } : {};

    const [messages, total, unread] = await Promise.all([
      this.prisma.supportMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supportMessage.count({ where }),
      this.prisma.supportMessage.count({ where: { isRead: false } }),
    ]);

    return {
      messages,
      total,
      unread,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(id: string) {
    await this.prisma.supportMessage.update({
      where: { id },
      data: { isRead: true },
    });

    return { success: true, message: 'Message marked as read' };
  }
}
