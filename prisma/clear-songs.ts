import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearSongs() {
  try {
    console.log('🗑️  Eliminando todas las canciones de la base de datos...');

    const result = await prisma.song.deleteMany({});

    console.log(`✅ ${result.count} canciones eliminadas exitosamente`);
    console.log('✅ La tabla Song está vacía y lista para nuevas canciones');
  } catch (error) {
    console.error('❌ Error al limpiar la tabla Song:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearSongs().catch((error) => {
  console.error(error);
  process.exit(1);
});
