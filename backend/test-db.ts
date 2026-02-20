const { PrismaClient } = require('@prisma/client');

(async () => {
    try {
        let u = "postgresql://studiomystri:studiomystri_dev_2025@localhost:5432/studiomystri_db?schema=public";
        const prisma = new PrismaClient({ datasources: { db: { url: u } } });
        await prisma.$connect();
        console.log('SUCCESS LOCAL DB CONNECTION');
        process.exit(0);
    } catch (e) {
        console.error('FAILED:', e.message);
        process.exit(1);
    }
})();
