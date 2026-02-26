const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPasswords() {
    const users = [
        { name: 'IT Management', email: 'it-support@studiomystri.com', role: 'SUPER_ADMIN', pass: 'SuperAdmin@1234' },
        { name: 'Vikram Malhotra', email: 'admin@studiomystri.com', role: 'ADMIN', pass: 'Admin@1234' },
        { name: 'Ananya Singh', email: 'designer@studiomystri.com', role: 'DESIGNER', pass: 'Designer@1234' },
        { name: 'Arjun Desai', email: 'architect@studiomystri.com', role: 'ARCHITECT', pass: 'Architect@1234' },
        { name: 'Kabir Khan', email: 'sales@studiomystri.com', role: 'SALES', pass: 'Sales@1234' },
        { name: 'Priya Verma', email: 'finance@studiomystri.com', role: 'FINANCE', pass: 'Finance@1234' },
        { name: 'Neha Kapoor', email: 'hr@studiomystri.com', role: 'HR', pass: 'HR@1234' }
    ];
    for (const user of users) {
        const hash = await bcrypt.hash(user.pass, 12);
        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                name: user.name,
                role: user.role,
                isActive: true,
                refreshToken: null,
                passwordHash: hash
            },
            create: {
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: true,
                refreshToken: null,
                passwordHash: hash
            }
        });
        console.log('Reset password for ' + user.email);
    }
}
resetPasswords().finally(() => prisma.$disconnect());
