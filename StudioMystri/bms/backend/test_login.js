const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { email: 'designer@studiomystri.com' } })
    .then(console.log)
    .finally(() => prisma.$disconnect());
