import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Injectable()
export class PlaylistsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createPlaylistDto: CreatePlaylistDto) {
        const playlist = await this.prisma.playlist.create({
            data: {
                ...createPlaylistDto,
                userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        avatar: true,
                    },
                },
            },
        });

        return playlist;
    }

    async findAll(userId: string) {
        const playlists = await this.prisma.playlist.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { songs: true },
                },
            },
        });

        return playlists;
    }

    async findById(id: string) {
        const playlist = await this.prisma.playlist.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        avatar: true,
                    },
                },
                songs: {
                    include: {
                        song: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });

        if (!playlist) {
            throw new NotFoundException('Playlist not found');
        }

        return playlist;
    }

    async update(id: string, userId: string, updatePlaylistDto: UpdatePlaylistDto) {
        const playlist = await this.prisma.playlist.findUnique({
            where: { id },
        });

        if (!playlist) {
            throw new NotFoundException('Playlist not found');
        }

        if (playlist.userId !== userId) {
            throw new ForbiddenException('You do not have permission to update this playlist');
        }

        return this.prisma.playlist.update({
            where: { id },
            data: updatePlaylistDto,
        });
    }

    async delete(id: string, userId: string) {
        const playlist = await this.prisma.playlist.findUnique({
            where: { id },
        });

        if (!playlist) {
            throw new NotFoundException('Playlist not found');
        }

        if (playlist.userId !== userId) {
            throw new ForbiddenException('You do not have permission to delete this playlist');
        }

        await this.prisma.playlist.delete({
            where: { id },
        });

        return { message: 'Playlist deleted successfully' };
    }

    async addSong(playlistId: string, songId: string, userId: string) {
        const playlist = await this.prisma.playlist.findUnique({
            where: { id: playlistId },
            include: { songs: true },
        });

        if (!playlist) {
            throw new NotFoundException('Playlist not found');
        }

        if (playlist.userId !== userId) {
            throw new ForbiddenException('You do not have permission to modify this playlist');
        }

        const song = await this.prisma.song.findUnique({
            where: { id: songId },
        });

        if (!song) {
            throw new NotFoundException('Song not found');
        }

        const maxOrder = playlist.songs.length > 0
            ? Math.max(...playlist.songs.map((s) => s.order))
            : 0;

        await this.prisma.playlistSong.create({
            data: {
                playlistId,
                songId,
                order: maxOrder + 1,
            },
        });

        return { message: 'Song added to playlist' };
    }

    async removeSong(playlistId: string, songId: string, userId: string) {
        const playlist = await this.prisma.playlist.findUnique({
            where: { id: playlistId },
        });

        if (!playlist) {
            throw new NotFoundException('Playlist not found');
        }

        if (playlist.userId !== userId) {
            throw new ForbiddenException('You do not have permission to modify this playlist');
        }

        const playlistSong = await this.prisma.playlistSong.findFirst({
            where: {
                playlistId,
                songId,
            },
        });

        if (!playlistSong) {
            throw new NotFoundException('Song not in playlist');
        }

        await this.prisma.playlistSong.delete({
            where: { id: playlistSong.id },
        });

        return { message: 'Song removed from playlist' };
    }

    async getUserPlaylists(userId: string) {
        const playlists = await this.prisma.playlist.findMany({
            where: {
                OR: [
                    { userId },
                    { isPublic: true },
                ],
            },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: { songs: true },
                },
            },
        });

        return playlists;
    }
}
