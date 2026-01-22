import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ActivityService {
    constructor(private prisma: PrismaService) { }

    async getPlayHistory(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [history, total] = await Promise.all([
            this.prisma.playHistory.findMany({
                where: { userId },
                include: {
                    song: true,
                },
                orderBy: {
                    playedAt: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.playHistory.count({
                where: { userId },
            }),
        ]);

        return {
            history,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getRecentlyPlayed(userId: string, limit: number = 20) {
        const history = await this.prisma.playHistory.findMany({
            where: { userId },
            include: {
                song: true,
            },
            orderBy: {
                playedAt: 'desc',
            },
            take: limit,
            distinct: ['songId'],
        });

        return history.map((h) => h.song);
    }

    async getListeningStats(userId: string) {
        const totalPlays = await this.prisma.playHistory.count({
            where: { userId },
        });

        const topSongs = await this.prisma.playHistory.groupBy({
            by: ['songId'],
            where: { userId },
            _count: {
                songId: true,
            },
            orderBy: {
                _count: {
                    songId: 'desc',
                },
            },
            take: 5,
        });

        const topSongsWithDetails = await Promise.all(
            topSongs.map(async (item) => {
                const song = await this.prisma.song.findUnique({
                    where: { id: item.songId },
                });
                return {
                    song,
                    playCount: item._count.songId,
                };
            }),
        );

        const favoritesCount = await this.prisma.favorite.count({
            where: { userId },
        });

        const playlistsCount = await this.prisma.playlist.count({
            where: { userId },
        });

        return {
            totalPlays,
            topSongs: topSongsWithDetails,
            favoritesCount,
            playlistsCount,
        };
    }

    async getFeed(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });

        const followingIds = following.map((f) => f.followingId);

        const [activities, total] = await Promise.all([
            this.prisma.playHistory.findMany({
                where: {
                    userId: { in: followingIds },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            displayName: true,
                            avatar: true,
                        },
                    },
                    song: true,
                },
                orderBy: {
                    playedAt: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.playHistory.count({
                where: {
                    userId: { in: followingIds },
                },
            }),
        ]);

        return {
            activities,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
