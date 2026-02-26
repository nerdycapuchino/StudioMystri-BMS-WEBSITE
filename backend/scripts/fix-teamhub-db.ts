import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Truncating messages to resolve foreign key constraint issues...');
        // We use raw query if the model is in a broken state, but let's try deleteMany first
        await prisma.$executeRawUnsafe('TRUNCATE TABLE messages CASCADE;');

        console.log('Creating default "general" channel...');
        await prisma.$executeRawUnsafe(`
      INSERT INTO channels (id, name, type, "createdAt", "updatedAt")
      VALUES ('general', 'general', 'public', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

        console.log('Database synced successfully.');
    } catch (err) {
        console.error('Error fixing database:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
