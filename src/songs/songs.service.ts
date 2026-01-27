import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UploadSongDto } from './dto/upload-song.dto';

@Injectable()
export class SongsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async uploadSong(file: any, uploadSongDto: UploadSongDto, firebaseUser?: any) {
    // Subir a Cloudinary
    const uploadResult = await this.cloudinaryService.uploadAudio(file, 'songs');
    const fileUrl = uploadResult.secure_url;

    console.log('✅ Song uploaded to Cloudinary:', fileUrl);

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
