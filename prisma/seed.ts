import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('antonella123.0', 10);

    // Create ADMIN user
    const admin = await prisma.user.upsert({
        where: { email: 'carojas@sudamericano.edu.ec' },
        update: {},
        create: {
            email: 'carojas@sudamericano.edu.ec',
            password: adminPassword,
            displayName: 'Cristian Rojas',
            bio: 'System Administrator',
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            isVerified: true,
        },
    });

    const user1 = await prisma.user.upsert({
        where: { email: 'john@echobeat.com' },
        update: {},
        create: {
            email: 'john@echobeat.com',
            password: hashedPassword,
            displayName: 'John Doe',
            bio: 'Music lover and playlist curator',
            role: UserRole.USER,
            status: UserStatus.ACTIVE,
            isVerified: true,
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'jane@echobeat.com' },
        update: {},
        create: {
            email: 'jane@echobeat.com',
            password: hashedPassword,
            displayName: 'Jane Smith',
            bio: 'Rock enthusiast',
            role: UserRole.USER,
            status: UserStatus.ACTIVE,
            isVerified: true,
        },
    });

    console.log('✅ Admin user created:', admin.email);

    const album1 = await prisma.album.create({
        data: {
            title: 'Greatest Hits',
            artist: 'Queen',
            releaseYear: 1981,
            genre: 'Rock',
        },
    });

    const song1 = await prisma.song.create({
        data: {
            title: 'Bohemian Rhapsody',
            artist: 'Queen',
            album: 'A Night at the Opera',
            duration: 354,
            fileUrl: 'https://example.com/songs/bohemian-rhapsody.mp3',
            genre: 'Rock',
            albumId: album1.id,
        },
    });

    const song2 = await prisma.song.create({
        data: {
            title: 'We Will Rock You',
            artist: 'Queen',
            album: 'News of the World',
            duration: 122,
            fileUrl: 'https://example.com/songs/we-will-rock-you.mp3',
            genre: 'Rock',
        },
    });

    const song3 = await prisma.song.create({
        data: {
            title: 'Imagine',
            artist: 'John Lennon',
            album: 'Imagine',
            duration: 183,
            fileUrl: 'https://example.com/songs/imagine.mp3',
            genre: 'Pop',
        },
    });

    await prisma.playlist.create({
        data: {
            name: 'My Favorites',
            description: 'Collection of my favorite songs',
            isPublic: true,
            userId: user1.id,
            songs: {
                create: [
                    { songId: song1.id, order: 1 },
                    { songId: song2.id, order: 2 },
                ],
            },
        },
    });

    await prisma.favorite.create({
        data: {
            userId: user1.id,
            songId: song1.id,
        },
    });

    await prisma.follow.create({
        data: {
            followerId: user1.id,
            followingId: user2.id,
        },
    });

    console.log('✅ Database seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
