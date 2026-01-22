import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FavoritesService {
    constructor(private prisma: PrismaService) { }

    async addFavorite(userId: string, songId: string) {
        const song = await this.prisma.song.findUnique({
            where: { id: songId },
        });

        if (!song) {
            throw new NotFoundException('Song not found');
        }

        const existing = await this.prisma.favorite.findUnique({
            where: {
                userId_songId: {
                    userId,
                    songId,
                },
            },
        });

        if (existing) {
            throw new ConflictException('Song already in favorites');
        }

        await this.prisma.favorite.create({
            data: {
                userId,
                songId,
            },
        });

        return { message: 'Song added to favorites' };
    }

    async removeFavorite(userId: string, songId: string) {
        const favorite = await this.prisma.favorite.findUnique({
            where: {
                userId_songId: {
                    userId,
                    songId,
                },
            },
        });

        if (!favorite) {
            throw new NotFoundException('Song not in favorites');
        }

        await this.prisma.favorite.delete({
            where: {
                userId_songId: {
                    userId,
                    songId,
                },
            },
        });

        return { message: 'Song removed from favorites' };
    }

    async getFavoriteSongs(userId: string) {
        const favorites = await this.prisma.favorite.findMany({
            where: { userId },
            include: {
                song: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return favorites.map((f) => f.song);
    }
}
