import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const roles: UserRole[] = [
        'SUPER_ADMIN',
        'ADMIN',
        'DESIGNER',
        'ARCHITECT',
        'SALES',
        'FINANCE',
        'HR',
        'CUSTOMER',
    ];

    const passwordHash = await bcrypt.hash('password123', 10);

    console.log('Seeding users for roles...');

    for (const role of roles) {
        const email = `${role.toLowerCase()}@studiomystri.com`;
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                passwordHash,
                role,
                isActive: true,
            },
            create: {
                email,
                name: `Test ${role}`,
                passwordHash,
                role,
                isActive: true,
            },
        });
        console.log(`Upserted user: ${user.email} (Role: ${user.role})`);
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
