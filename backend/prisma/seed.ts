import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    // ─── Company Settings ──────────────────────────────────
    const settings = await prisma.companySettings.upsert({
        where: { id: 'default-settings' },
        update: {},
        create: {
            id: 'default-settings',
            name: 'Studio Mystri',
            address: '901 E and 901 F, Sakar -9, Ashram Road, Ahmedabad',
            gstin: '24AAJFE7254K1Z6',
            email: 'admin@studiomystri.com',
            phone: '+91 98765 43210',
            currency: 'INR',
        },
    });
    console.log('✅ Company Settings created');

    // ─── Users ─────────────────────────────────────────────
    const superAdminHash = await bcrypt.hash('SuperAdmin@1234', 12);
    const adminHash = await bcrypt.hash('Admin@1234', 12);
    const salesHash = await bcrypt.hash('Sales@1234', 12);
    const designerHash = await bcrypt.hash('Designer@1234', 12);
    const architectHash = await bcrypt.hash('Architect@1234', 12);
    const financeHash = await bcrypt.hash('Finance@1234', 12);
    const hrHash = await bcrypt.hash('HR@1234', 12);

    const superAdminUser = await prisma.user.upsert({
        where: { email: 'it-support@studiomystri.com' },
        update: {},
        create: {
            name: 'IT Management',
            email: 'it-support@studiomystri.com',
            passwordHash: superAdminHash,
            role: 'SUPER_ADMIN',
            isActive: true,
        },
    });

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@studiomystri.com' },
        update: {},
        create: {
            name: 'Vikram Malhotra',
            email: 'admin@studiomystri.com',
            passwordHash: adminHash,
            role: 'ADMIN',
            isActive: true,
        },
    });

    const designerUser = await prisma.user.upsert({
        where: { email: 'designer@studiomystri.com' },
        update: {},
        create: {
            name: 'Ananya Singh',
            email: 'designer@studiomystri.com',
            passwordHash: designerHash,
            role: 'DESIGNER',
            isActive: true,
        },
    });

    const architectUser = await prisma.user.upsert({
        where: { email: 'architect@studiomystri.com' },
        update: {},
        create: {
            name: 'Arjun Desai',
            email: 'architect@studiomystri.com',
            passwordHash: architectHash,
            role: 'ARCHITECT',
            isActive: true,
        },
    });

    const salesUser = await prisma.user.upsert({
        where: { email: 'sales@studiomystri.com' },
        update: {},
        create: {
            name: 'Kabir Khan',
            email: 'sales@studiomystri.com',
            passwordHash: salesHash,
            role: 'SALES',
            isActive: true,
        },
    });

    const financeUser = await prisma.user.upsert({
        where: { email: 'finance@studiomystri.com' },
        update: {},
        create: {
            name: 'Priya Verma',
            email: 'finance@studiomystri.com',
            passwordHash: financeHash,
            role: 'FINANCE',
            isActive: true,
        },
    });

    const hrUser = await prisma.user.upsert({
        where: { email: 'hr@studiomystri.com' },
        update: {},
        create: {
            name: 'Neha Kapoor',
            email: 'hr@studiomystri.com',
            passwordHash: hrHash,
            role: 'HR',
            isActive: true,
        },
    });

    console.log(`✅ Users: Super Admin, Admin, Designer, Architect, Sales, Finance, HR created successfully.`);

    // ─── Employees ─────────────────────────────────────────
    await prisma.employee.createMany({
        data: [
            {
                name: 'Vikram Malhotra',
                email: 'vikram@studiomystri.com',
                phone: '9998887776',
                role: 'Principal Architect',
                department: 'Architecture',
                salary: 150000,
                joinDate: new Date('2020-01-15'),
                userId: adminUser.id,
                leavePolicy: 30,
                leavesRemaining: 15,
                qualifications: 'M.Arch',
            },
            {
                name: 'Ananya Singh',
                email: 'ananya@studiomystri.com',
                phone: '8887776665',
                role: 'Senior Designer',
                department: 'Design',
                salary: 95000,
                joinDate: new Date('2021-03-10'),
                leavePolicy: 24,
                leavesRemaining: 20,
                qualifications: 'B.Des',
            },
            {
                name: 'Kabir Khan',
                email: 'kabir@studiomystri.com',
                phone: '7776665554',
                role: 'Sales Manager',
                department: 'Sales',
                salary: 85000,
                joinDate: new Date('2022-06-01'),
                userId: salesUser.id,
                leavePolicy: 20,
                leavesRemaining: 18,
                qualifications: 'MBA Sales',
            },
        ],
        skipDuplicates: true,
    });
    console.log('✅ Employees seeded (3)');

    // ─── Customers ─────────────────────────────────────────
    const customers = await Promise.all([
        prisma.customer.create({
            data: {
                name: 'Aarav Mehta',
                email: 'aarav.m@gmail.com',
                phone: '9876543210',
                address: '12, Palm Grove, Juhu, Mumbai',
                gstin: '27ABCDE1234F1Z5',
                totalSpent: 4500,
                totalOrders: 3,
            },
        }),
        prisma.customer.create({
            data: {
                name: 'Sanya Gupta',
                email: 'sanya.design@studio.com',
                phone: '9988776655',
                address: '45, Green Park, Delhi',
                totalSpent: 12000,
                totalOrders: 5,
            },
        }),
        prisma.customer.create({
            data: {
                name: 'Mr. & Mrs. Oberoi',
                email: 'oberoi@email.com',
                phone: '9123456789',
                address: 'Borivali East, Mumbai',
                totalSpent: 5500000,
                totalOrders: 1,
            },
        }),
        prisma.customer.create({
            data: {
                name: 'Priya Sharma',
                email: 'priya.sharma@corp.com',
                phone: '9876501234',
                address: '78, MG Road, Bangalore',
                company: 'Sharma Interiors',
                totalSpent: 25000,
                totalOrders: 2,
            },
        }),
        prisma.customer.create({
            data: {
                name: 'Rajiv Patel',
                email: 'rajiv.p@enterprise.in',
                phone: '9090909090',
                address: 'CG Road, Ahmedabad',
                company: 'Patel Enterprises',
                gstin: '24BBBBB5678G1Z3',
                totalSpent: 180000,
                totalOrders: 8,
            },
        }),
    ]);
    console.log(`✅ Customers seeded (${customers.length})`);

    // ─── Leads ─────────────────────────────────────────────
    await prisma.lead.createMany({
        data: [
            {
                companyName: 'TechPark Solutions',
                pocName: 'Vikram Singh',
                phone: '9898989898',
                email: 'vikram@techpark.com',
                website: 'www.techpark.com',
                stage: 'NEGOTIATION',
                type: 'INBOUND',
                source: 'Referral',
                value: 45000,
                requirements: 'Full office renovation, 12000 sqft',
                notes: 'Budget flexible, deadline strict.',
                brief: 'Modern open layout required.',
                assignedToId: salesUser.id,
            },
            {
                companyName: 'Iyer Residence',
                pocName: 'Mrs. Iyer',
                phone: '7766554433',
                email: 'iyer@gmail.com',
                stage: 'NEW',
                type: 'REFERRAL',
                source: 'Instagram',
                value: 12000,
                requirements: 'Kitchen and Living Room redesign',
                notes: 'Likes minimal aesthetics.',
                brief: 'Pastel colors preferred.',
            },
            {
                companyName: 'Zenith Corp',
                pocName: 'Arjun Reddy',
                phone: '8877665544',
                email: 'arjun@zenith.com',
                stage: 'CONTACTED',
                type: 'OUTBOUND',
                source: 'LinkedIn',
                value: 95000,
                requirements: 'Complete corporate office fitout',
                assignedToId: adminUser.id,
            },
        ],
    });
    console.log('✅ Leads seeded (3)');

    // ─── Products ──────────────────────────────────────────
    const products = await Promise.all([
        prisma.product.create({
            data: {
                name: 'Eames Lounge Chair Replica',
                sku: 'FUR-001',
                category: 'Furniture',
                price: 1450,
                cost: 870,
                stock: 12,
                images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80'],
                variants: {
                    create: [
                        { name: 'Black Leather', sku: 'FUR-001-BLK', price: 1450, stock: 5 },
                        { name: 'Tan Leather', sku: 'FUR-001-TAN', price: 1550, stock: 7 },
                    ],
                },
            },
        }),
        prisma.product.create({
            data: {
                name: 'Minimalist Oak Dining Table',
                sku: 'FUR-002',
                category: 'Furniture',
                price: 2200,
                cost: 1320,
                stock: 4,
                images: ['https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=400&q=80'],
                variants: {
                    create: [
                        { name: '6 Seater', sku: 'FUR-002-6', price: 2200, stock: 2 },
                        { name: '8 Seater', sku: 'FUR-002-8', price: 2800, stock: 2 },
                    ],
                },
            },
        }),
        prisma.product.create({
            data: {
                name: 'Industrial Pendant Light',
                sku: 'LIG-001',
                category: 'Lighting',
                price: 185,
                cost: 95,
                stock: 45,
                images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=400&q=80'],
            },
        }),
        prisma.product.create({
            data: {
                name: 'Hand-Tufted Wool Rug',
                sku: 'TEX-001',
                category: 'Textiles',
                price: 650,
                cost: 340,
                stock: 8,
                images: ['https://images.unsplash.com/photo-1575414723220-29c1c88172b6?auto=format&fit=crop&w=400&q=80'],
            },
        }),
        prisma.product.create({
            data: {
                name: 'Ceramic Art Vase',
                sku: 'DEC-001',
                category: 'Decor',
                price: 95,
                cost: 40,
                stock: 22,
                images: ['https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=400&q=80'],
            },
        }),
        prisma.product.create({
            data: {
                name: 'Velvet Accent Chair (Navy)',
                sku: 'FUR-003',
                category: 'Furniture',
                price: 580,
                cost: 310,
                stock: 6,
                images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80'],
            },
        }),
        prisma.product.create({
            data: {
                name: 'Brass Table Lamp',
                sku: 'LIG-002',
                category: 'Lighting',
                price: 245,
                cost: 120,
                stock: 18,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Marble Coffee Table',
                sku: 'FUR-004',
                category: 'Furniture',
                price: 1800,
                cost: 950,
                stock: 3,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Linen Curtain Set',
                sku: 'TEX-002',
                category: 'Textiles',
                price: 320,
                cost: 160,
                stock: 25,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Wooden Wall Shelf',
                sku: 'DEC-002',
                category: 'Decor',
                price: 420,
                cost: 195,
                stock: 14,
            },
        }),
    ]);
    console.log(`✅ Products seeded (${products.length}) with variants`);

    // ─── Inventory Items ───────────────────────────────────
    const supplier = await prisma.supplier.create({
        data: {
            name: 'Timber Mart',
            contactPerson: 'Rajesh Kumar',
            email: 'rajesh@timbermart.in',
            phone: '9898001234',
            address: 'GIDC, Ahmedabad',
        },
    });

    const supplier2 = await prisma.supplier.create({
        data: {
            name: 'Stone World',
            contactPerson: 'Manoj Shah',
            email: 'manoj@stoneworld.in',
            phone: '9898005678',
            address: 'Makarpura, Vadodara',
        },
    });

    await prisma.inventoryItem.createMany({
        data: [
            {
                name: 'Teak Wood (Grade A)',
                sku: 'RM-001',
                type: 'RAW',
                category: 'Wood',
                quantity: 45,
                unit: 'sqft',
                reorderPoint: 50,
                cost: 24,
                location: 'Warehouse A - Bin 12',
                supplierId: supplier.id,
            },
            {
                name: 'Italian Marble Slab',
                sku: 'RM-002',
                type: 'RAW',
                category: 'Stone',
                quantity: 12,
                unit: 'slabs',
                reorderPoint: 5,
                cost: 450,
                location: 'Warehouse B - Zone 1',
                supplierId: supplier2.id,
            },
            {
                name: 'Brass Hardware Set',
                sku: 'RM-003',
                type: 'RAW',
                category: 'Hardware',
                quantity: 100,
                unit: 'sets',
                reorderPoint: 20,
                cost: 35,
                location: 'Warehouse A - Bin 5',
                supplierId: supplier.id,
            },
            {
                name: 'Plywood 18mm',
                sku: 'RM-004',
                type: 'RAW',
                category: 'Wood',
                quantity: 30,
                unit: 'sheets',
                reorderPoint: 15,
                cost: 85,
                location: 'Warehouse A - Zone 2',
                supplierId: supplier.id,
            },
            {
                name: 'Glass Panes (Tempered)',
                sku: 'RM-005',
                type: 'RAW',
                category: 'Glass',
                quantity: 20,
                unit: 'pcs',
                reorderPoint: 8,
                cost: 200,
                location: 'Warehouse B - Zone 3',
                supplierId: supplier2.id,
            },
        ],
    });
    console.log('✅ Inventory items seeded (5) + 2 Suppliers');

    // ─── Projects ──────────────────────────────────────────
    await prisma.project.create({
        data: {
            name: 'Oberoi Sky City Apt',
            customerId: customers[2].id,
            stage: 'EXECUTION',
            currentStage: 'Execution',
            progress: 75,
            budget: 5500000,
            spent: 4100000,
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-12-20'),
            dimensions: '4BHK - 2400 sqft',
            description: 'Modern minimalist renovation focusing on natural wood and marble finishes.',
            siteAddress: 'Borivali East, Mumbai',
            files: ['floor_plan_v2.pdf', 'kitchen_render.jpg', 'electrical_layout.dwg'],
            referenceImages: [
                'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800',
                'https://images.unsplash.com/photo-1616486341353-c5833211e993?auto=format&fit=crop&w=800',
            ],
            payments: {
                create: [
                    { amount: 2000000, method: 'BANK_TRANSFER', note: 'Initial advance', date: new Date('2024-06-15') },
                    { amount: 2100000, method: 'CHEQUE', note: 'Second milestone', date: new Date('2024-09-01') },
                ],
            },
        },
    });

    await prisma.project.create({
        data: {
            name: 'FinTech HQ Reception',
            stage: 'DESIGN',
            currentStage: 'Design',
            progress: 40,
            budget: 1500000,
            spent: 200000,
            startDate: new Date('2024-11-01'),
            endDate: new Date('2025-02-15'),
            dimensions: 'Reception Area - 800 sqft',
            description: 'Tech-forward lobby design with custom parametric wooden ceiling.',
            siteAddress: 'Koramangala, Bangalore',
            files: ['concept_moodboard.png', 'lighting_plan.pdf'],
            referenceImages: [
                'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800',
            ],
        },
    });
    console.log('✅ Projects seeded (2) with payments');

    console.log('\n🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
