import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AlbumsService {
    constructor(private prisma: PrismaService) { }

    async findById(id: string) {
        const album = await this.prisma.album.findUnique({
            where: { id },
            include: {
                songs: true,
            },
        });

        if (!album) {
            throw new NotFoundException('Album not found');
        }

        return album;
    }

    async getAlbumSongs(id: string) {
        const album = await this.prisma.album.findUnique({
            where: { id },
            include: {
                songs: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!album) {
            throw new NotFoundException('Album not found');
        }

        return album.songs;
    }

    async getTrending(limit: number = 20) {
        const albums = await this.prisma.album.findMany({
            take: limit,
            include: {
                songs: {
                    select: {
                        playCount: true,
                    },
                },
            },
        });

        const albumsWithPlayCount = albums.map((album) => ({
            ...album,
            totalPlays: album.songs.reduce((sum, song) => sum + song.playCount, 0),
        }));

        albumsWithPlayCount.sort((a, b) => b.totalPlays - a.totalPlays);

        return albumsWithPlayCount.slice(0, limit);
    }
}
