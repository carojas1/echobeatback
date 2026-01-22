import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserAdminDto, ChangeRoleDto, ChangeStatusDto } from './dto/update-user-admin.dto';
import { CreateSongAdminDto, UpdateSongAdminDto } from './dto/create-song-admin.dto';
import { CreateAlbumAdminDto, UpdateAlbumAdminDto } from './dto/create-album-admin.dto';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) {}

    // ==================== USERS ====================

    async getAllUsers(page: number = 1, limit: number = 20, search?: string) {
        const skip = (page - 1) * limit;
        
        const where = search
            ? {
                OR: [
                    { email: { contains: search, mode: 'insensitive' as const } },
                    { displayName: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                    avatar: true,
                    bio: true,
                    role: true,
                    status: true,
                    isVerified: true,
                    googleId: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            playlists: true,
                            favoriteSongs: true,
                            followers: true,
                            following: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getUserById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                displayName: true,
                avatar: true,
                bio: true,
                role: true,
                status: true,
                isVerified: true,
                googleId: true,
                createdAt: true,
                updatedAt: true,
                playlists: {
                    select: {
                        id: true,
                        name: true,
                        isPublic: true,
                        _count: { select: { songs: true } },
                    },
                },
                favoriteSongs: {
                    select: {
                        song: {
                            select: { id: true, title: true, artist: true },
                        },
                    },
                    take: 10,
                },
                _count: {
                    select: {
                        playlists: true,
                        favoriteSongs: true,
                        followers: true,
                        following: true,
                        playHistory: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateUser(id: string, updateUserDto: UpdateUserAdminDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check email uniqueness if changing email
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existing = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });
            if (existing) {
                throw new ConflictException('Email already in use');
            }
        }

        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                displayName: true,
                avatar: true,
                bio: true,
                role: true,
                status: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async changeUserRole(id: string, changeRoleDto: ChangeRoleDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.user.update({
            where: { id },
            data: { role: changeRoleDto.role as UserRole },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
            },
        });
    }

    async changeUserStatus(id: string, changeStatusDto: ChangeStatusDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.user.update({
            where: { id },
            data: { status: changeStatusDto.status as UserStatus },
            select: {
                id: true,
                email: true,
                displayName: true,
                status: true,
            },
        });
    }

    async deleteUser(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.prisma.user.delete({ where: { id } });
        return { message: 'User deleted successfully', deletedId: id };
    }

    // ==================== SONGS ====================

    async getAllSongs(page: number = 1, limit: number = 20, search?: string) {
        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' as const } },
                    { artist: { contains: search, mode: 'insensitive' as const } },
                    { album: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [songs, total] = await Promise.all([
            this.prisma.song.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    creator: {
                        select: { id: true, displayName: true },
                    },
                    albumRelation: {
                        select: { id: true, title: true },
                    },
                    _count: {
                        select: { favorites: true, playlists: true },
                    },
                },
            }),
            this.prisma.song.count({ where }),
        ]);

        return {
            data: songs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async createSong(createSongDto: CreateSongAdminDto, adminId: string) {
        return this.prisma.song.create({
            data: {
                ...createSongDto,
                createdBy: adminId,
            },
        });
    }

    async updateSong(id: string, updateSongDto: UpdateSongAdminDto) {
        const song = await this.prisma.song.findUnique({ where: { id } });
        if (!song) {
            throw new NotFoundException('Song not found');
        }

        return this.prisma.song.update({
            where: { id },
            data: updateSongDto,
        });
    }

    async deleteSong(id: string) {
        const song = await this.prisma.song.findUnique({ where: { id } });
        if (!song) {
            throw new NotFoundException('Song not found');
        }

        await this.prisma.song.delete({ where: { id } });
        return { message: 'Song deleted successfully', deletedId: id };
    }

    // ==================== ALBUMS ====================

    async getAllAlbums(page: number = 1, limit: number = 20, search?: string) {
        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' as const } },
                    { artist: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [albums, total] = await Promise.all([
            this.prisma.album.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { songs: true } },
                },
            }),
            this.prisma.album.count({ where }),
        ]);

        return {
            data: albums,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async createAlbum(createAlbumDto: CreateAlbumAdminDto) {
        return this.prisma.album.create({
            data: createAlbumDto,
        });
    }

    async updateAlbum(id: string, updateAlbumDto: UpdateAlbumAdminDto) {
        const album = await this.prisma.album.findUnique({ where: { id } });
        if (!album) {
            throw new NotFoundException('Album not found');
        }

        return this.prisma.album.update({
            where: { id },
            data: updateAlbumDto,
        });
    }

    async deleteAlbum(id: string) {
        const album = await this.prisma.album.findUnique({ where: { id } });
        if (!album) {
            throw new NotFoundException('Album not found');
        }

        await this.prisma.album.delete({ where: { id } });
        return { message: 'Album deleted successfully', deletedId: id };
    }

    // ==================== STATISTICS ====================

    async getStats() {
        const [
            totalUsers,
            activeUsers,
            blockedUsers,
            adminUsers,
            totalSongs,
            totalAlbums,
            totalPlaylists,
            totalFavorites,
            totalPlays,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { status: 'ACTIVE' } }),
            this.prisma.user.count({ where: { status: 'BLOCKED' } }),
            this.prisma.user.count({ where: { role: 'ADMIN' } }),
            this.prisma.song.count(),
            this.prisma.album.count(),
            this.prisma.playlist.count(),
            this.prisma.favorite.count(),
            this.prisma.playHistory.count(),
        ]);

        // Get recent users (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentUsers = await this.prisma.user.count({
            where: { createdAt: { gte: sevenDaysAgo } },
        });

        // Get top songs
        const topSongs = await this.prisma.song.findMany({
            orderBy: { playCount: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                artist: true,
                playCount: true,
            },
        });

        // Get most active users
        const mostActiveUsers = await this.prisma.user.findMany({
            orderBy: { playHistory: { _count: 'desc' } },
            take: 5,
            select: {
                id: true,
                displayName: true,
                email: true,
                _count: { select: { playHistory: true } },
            },
        });

        return {
            overview: {
                totalUsers,
                activeUsers,
                blockedUsers,
                adminUsers,
                totalSongs,
                totalAlbums,
                totalPlaylists,
                totalFavorites,
                totalPlays,
                recentUsers,
            },
            topSongs,
            mostActiveUsers,
        };
    }

    async getUserStats() {
        const usersByRole = await this.prisma.user.groupBy({
            by: ['role'],
            _count: { id: true },
        });

        const usersByStatus = await this.prisma.user.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        // Users created per month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const recentUsers = await this.prisma.user.findMany({
            where: { createdAt: { gte: sixMonthsAgo } },
            select: { createdAt: true },
        });

        return {
            byRole: usersByRole,
            byStatus: usersByStatus,
            recentSignups: recentUsers.length,
        };
    }

    async getSongStats() {
        const songsByGenre = await this.prisma.song.groupBy({
            by: ['genre'],
            _count: { id: true },
            _sum: { playCount: true },
        });

        const totalPlayCount = await this.prisma.song.aggregate({
            _sum: { playCount: true },
        });

        return {
            byGenre: songsByGenre,
            totalPlayCount: totalPlayCount._sum.playCount || 0,
        };
    }
}
