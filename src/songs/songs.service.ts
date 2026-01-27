import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { UploadSongDto } from './dto/upload-song.dto';

@Injectable()
export class SongsService {
  private s3: S3;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  async uploadSong(file: any, uploadSongDto: UploadSongDto, firebaseUser?: any) {
    const fs = require('fs');
    const path = require('path');

    const filename = `${uuidv4()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'uploads', 'songs');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    // URL para acceder al archivo (siempre absoluta)
    const baseUrl =
      this.configService.get('PUBLIC_BASE_URL') ||
      this.configService.get('APP_URL') ||
      'http://localhost:3000';
    const fileUrl = `${baseUrl}/uploads/songs/${filename}`;

    const song = await this.prisma.song.create({
      data: {
        title: uploadSongDto.title,
        artist: uploadSongDto.artist,
        album: uploadSongDto.album,
        duration: Number(uploadSongDto.duration),
        genre: uploadSongDto.genre,
        mood: uploadSongDto.mood,
        fileUrl,
        ownerUid: firebaseUser?.uid,
        ownerEmail: firebaseUser?.email,
      },
    });

    return song;
  }

  async findById(id: string) {
    const song = await this.prisma.song.findUnique({
      where: { id },
      include: {
        albumRelation: true,
      },
    });

    if (!song) {
      throw new NotFoundException('Song not found');
    }

    return song;
  }

  async search(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [songs, total] = await Promise.all([
      this.prisma.song.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { artist: { contains: query, mode: 'insensitive' } },
            { album: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
        orderBy: { playCount: 'desc' },
      }),
      this.prisma.song.count({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { artist: { contains: query, mode: 'insensitive' } },
            { album: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      songs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async incrementPlayCount(songId: string, userId?: string) {
    await this.prisma.song.update({
      where: { id: songId },
      data: { playCount: { increment: 1 } },
    });

    if (userId) {
      await this.prisma.playHistory.create({
        data: {
          userId,
          songId,
        },
      });
    }

    return { message: 'Play count incremented' };
  }

  async getTrending(limit: number = 20) {
    const songs = await this.prisma.song.findMany({
      take: limit,
      orderBy: { playCount: 'desc' },
    });

    return songs;
  }

  async getRecent(limit: number = 20) {
    const songs = await this.prisma.song.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return songs;
  }

  getStreamUrl(songId: string) {
    return { streamUrl: `/api/v1/songs/${songId}/stream` };
  }
}
