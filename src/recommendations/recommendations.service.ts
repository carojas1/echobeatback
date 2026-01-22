import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RecommendationsService {
    constructor(private prisma: PrismaService) { }

    async getRecommendedSongs(userId: string, limit: number = 20) {
        const favorites = await this.prisma.favorite.findMany({
            where: { userId },
            include: {
                song: true,
            },
            take: 5,
        });

        const favoriteGenres = favorites
            .map((f) => f.song.genre)
            .filter((g) => g !== null);

        const favoriteArtists = favorites
            .map((f) => f.song.artist)
            .filter((a) => a !== null);

        const recommendations = await this.prisma.song.findMany({
            where: {
                OR: [
                    { genre: { in: favoriteGenres } },
                    { artist: { in: favoriteArtists } },
                ],
                NOT: {
                    id: { in: favorites.map((f) => f.songId) },
                },
            },
            take: limit,
            orderBy: { playCount: 'desc' },
        });

        return recommendations;
    }

    async getSimilarArtists(artistName: string, limit: number = 10) {
        const artistSongs = await this.prisma.song.findMany({
            where: {
                artist: { contains: artistName, mode: 'insensitive' },
            },
            select: { genre: true },
        });

        const genres = artistSongs
            .map((s) => s.genre)
            .filter((g) => g !== null);

        const similarArtists = await this.prisma.song.findMany({
            where: {
                AND: [
                    { genre: { in: genres } },
                    { NOT: { artist: { contains: artistName, mode: 'insensitive' } } },
                ],
            },
            select: {
                artist: true,
            },
            distinct: ['artist'],
            take: limit,
        });

        return similarArtists.map((s) => s.artist);
    }

    async getPersonalizedPlaylists(userId: string) {
        const recentPlays = await this.prisma.playHistory.findMany({
            where: { userId },
            include: {
                song: true,
            },
            orderBy: {
                playedAt: 'desc',
            },
            take: 20,
        });

        const genres = recentPlays
            .map((p) => p.song.genre)
            .filter((g) => g !== null);

        const genreCount: { [key: string]: number } = {};
        genres.forEach((genre) => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
        });

        const topGenre = Object.keys(genreCount).sort(
            (a, b) => genreCount[b] - genreCount[a],
        )[0];

        const discoverWeekly = await this.prisma.song.findMany({
            where: {
                genre: topGenre,
                NOT: {
                    id: { in: recentPlays.map((p) => p.songId) },
                },
            },
            take: 30,
            orderBy: { createdAt: 'desc' },
        });

        return {
            discoverWeekly: {
                name: 'Discover Weekly',
                description: `New ${topGenre} songs just for you`,
                songs: discoverWeekly,
            },
        };
    }
}
