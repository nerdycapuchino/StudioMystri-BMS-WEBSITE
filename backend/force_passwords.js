const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPasswords() {
    const roles = [
        { email: 'it-support@studiomystri.com', pass: 'SuperAdmin@1234' },
        { email: 'admin@studiomystri.com', pass: 'Admin@1234' },
        { email: 'designer@studiomystri.com', pass: 'Designer@1234' },
        { email: 'architect@studiomystri.com', pass: 'Architect@1234' },
        { email: 'sales@studiomystri.com', pass: 'Sales@1234' },
        { email: 'finance@studiomystri.com', pass: 'Finance@1234' },
        { email: 'hr@studiomystri.com', pass: 'HR@1234' }
    ];
    for (const r of roles) {
        const hash = await bcrypt.hash(r.pass, 12);
        await prisma.user.updateMany({
            where: { email: r.email },
            data: { passwordHash: hash }
        });
        console.log('Reset password for ' + r.email);
    }
}
resetPasswords().finally(() => prisma.$disconnect());
