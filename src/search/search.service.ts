import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) { }

    async globalSearch(query: string, type: string = 'all') {
        const results: any = {
            songs: [],
            artists: [],
            albums: [],
            playlists: [],
            users: [],
        };

        if (type === 'all' || type === 'songs') {
            results.songs = await this.prisma.song.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { artist: { contains: query, mode: 'insensitive' } },
                        { album: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: 10,
            });
        }

        if (type === 'all' || type === 'albums') {
            results.albums = await this.prisma.album.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { artist: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: 10,
            });
        }

        if (type === 'all' || type === 'playlists') {
            results.playlists = await this.prisma.playlist.findMany({
                where: {
                    AND: [
                        { isPublic: true },
                        {
                            OR: [
                                { name: { contains: query, mode: 'insensitive' } },
                                { description: { contains: query, mode: 'insensitive' } },
                            ],
                        },
                    ],
                },
                take: 10,
                include: {
                    user: {
                        select: {
                            displayName: true,
                            avatar: true,
                        },
                    },
                },
            });
        }

        if (type === 'all' || type === 'users') {
            results.users = await this.prisma.user.findMany({
                where: {
                    OR: [
                        { displayName: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: 10,
                select: {
                    id: true,
                    displayName: true,
                    avatar: true,
                    bio: true,
                },
            });
        }

        if (type === 'all' || type === 'artists') {
            const songs = await this.prisma.song.findMany({
                where: {
                    artist: { contains: query, mode: 'insensitive' },
                },
                select: {
                    artist: true,
                },
                distinct: ['artist'],
                take: 10,
            });
            results.artists = songs.map((s) => s.artist);
        }

        return results;
    }

    async autocomplete(query: string) {
        const songs = await this.prisma.song.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { artist: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 5,
            select: {
                title: true,
                artist: true,
            },
        });

        const suggestions = [
            ...songs.map((s) => s.title),
            ...songs.map((s) => s.artist),
        ];

        return Array.from(new Set(suggestions)).slice(0, 10);
    }
}
