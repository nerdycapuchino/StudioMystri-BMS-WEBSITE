const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Renaming LeadStage enum values...');
    try {
        await prisma.$executeRawUnsafe(`ALTER TYPE "LeadStage" RENAME VALUE 'NEW' TO 'NEW_LEAD';`);
        console.log('Renamed NEW -> NEW_LEAD');
    } catch (e) {
        console.log('NEW might already be renamed or not exist:', e.message);
    }

    try {
        await prisma.$executeRawUnsafe(`ALTER TYPE "LeadStage" RENAME VALUE 'WON' TO 'CLOSED_WON';`);
        console.log('Renamed WON -> CLOSED_WON');
    } catch (e) {
        console.log('WON might already be renamed or not exist:', e.message);
    }

    try {
        await prisma.$executeRawUnsafe(`ALTER TYPE "LeadStage" RENAME VALUE 'LOST' TO 'CLOSED_LOST';`);
        console.log('Renamed LOST -> CLOSED_LOST');
    } catch (e) {
        console.log('LOST might already be renamed or not exist:', e.message);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
        console.log('Done!');
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
