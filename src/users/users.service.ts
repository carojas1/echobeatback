import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                displayName: true,
                avatar: true,
                bio: true,
                createdAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        playlists: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                displayName: true,
                avatar: true,
                bio: true,
                createdAt: true,
            },
        });

        return user;
    }

    async followUser(followerId: string, followingId: string) {
        if (followerId === followingId) {
            throw new ConflictException('Cannot follow yourself');
        }

        const followingUser = await this.prisma.user.findUnique({
            where: { id: followingId },
        });

        if (!followingUser) {
            throw new NotFoundException('User to follow not found');
        }

        const existingFollow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        if (existingFollow) {
            throw new ConflictException('Already following this user');
        }

        await this.prisma.follow.create({
            data: {
                followerId,
                followingId,
            },
        });

        return { message: 'User followed successfully' };
    }

    async unfollowUser(followerId: string, followingId: string) {
        const follow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        if (!follow) {
            throw new NotFoundException('Not following this user');
        }

        await this.prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        return { message: 'User unfollowed successfully' };
    }

    async getFollowers(userId: string) {
        const followers = await this.prisma.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: {
                        id: true,
                        displayName: true,
                        avatar: true,
                    },
                },
            },
        });

        return followers.map((f) => f.follower);
    }

    async getFollowing(userId: string) {
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: {
                        id: true,
                        displayName: true,
                        avatar: true,
                    },
                },
            },
        });

        return following.map((f) => f.following);
    }
}
