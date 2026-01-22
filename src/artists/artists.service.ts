import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ArtistsService {
    constructor(private prisma: PrismaService) { }

    async getArtistSongs(artistName: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [songs, total] = await Promise.all([
            this.prisma.song.findMany({
                where: {
                    artist: { contains: artistName, mode: 'insensitive' },
                },
                skip,
                take: limit,
                orderBy: { playCount: 'desc' },
            }),
            this.prisma.song.count({
                where: {
                    artist: { contains: artistName, mode: 'insensitive' },
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

    async getArtistAlbums(artistName: string) {
        const albums = await this.prisma.album.findMany({
            where: {
                artist: { contains: artistName, mode: 'insensitive' },
            },
            include: {
                _count: {
                    select: { songs: true },
                },
            },
        });

        return albums;
    }

    async getTrending(limit: number = 20) {
        const songs = await this.prisma.song.groupBy({
            by: ['artist'],
            _sum: {
                playCount: true,
            },
            orderBy: {
                _sum: {
                    playCount: 'desc',
                },
            },
            take: limit,
        });

        return songs.map((item) => ({
            artist: item.artist,
            totalPlays: item._sum.playCount,
        }));
    }
}
