
import { Product, Lead, InventoryItem, Project, Customer, Shipment, User, IntegrationStatus, Activity, Invoice, Employee, Notification, Order, SystemLog } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Eames Lounge Chair Replica', sku: 'FUR-001', price: 1450, category: 'Furniture', stock: 12, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80' },
  { id: '2', name: 'Minimalist Oak Dining Table', sku: 'FUR-002', price: 2200, category: 'Furniture', stock: 4, image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=400&q=80' },
  { id: '3', name: 'Industrial Pendant Light', sku: 'LIG-001', price: 185, category: 'Lighting', stock: 45, image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=400&q=80' },
  { id: '4', name: 'Hand-Tufted Wool Rug', sku: 'TEX-001', price: 650, category: 'Textiles', stock: 8, image: 'https://images.unsplash.com/photo-1575414723220-29c1c88172b6?auto=format&fit=crop&w=400&q=80' },
  { id: '5', name: 'Ceramic Art Vase', sku: 'DEC-001', price: 95, category: 'Decor', stock: 22, image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=400&q=80' },
  { id: '6', name: 'Velvet Accent Chair (Navy)', sku: 'FUR-003', price: 580, category: 'Furniture', stock: 6, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80' },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Aarav Mehta', phone: '9876543210', email: 'aarav.m@gmail.com', lastPurchase: '2023-11-01', totalSpend: 4500 },
  { id: '2', name: 'Sanya Gupta', phone: '9988776655', email: 'sanya.design@studio.com', lastPurchase: '2023-10-15', totalSpend: 12000 },
];

export const MOCK_LEADS: Lead[] = [
  { id: '1', companyName: 'TechPark Solutions', pocName: 'Vikram Singh', phone: '9898989898', email: 'vikram@techpark.com', website: 'www.techpark.com', status: 'Negotiation', type: 'Inbound', source: 'Referral', lastContact: '2023-11-06', value: 45000, requirements: 'Full office renovation, 12000 sqft', notes: 'Budget flexible, deadline strict.' },
  { id: '2', companyName: 'Iyer Residence', pocName: 'Mrs. Iyer', phone: '7766554433', email: 'iyer@gmail.com', status: 'New', type: 'Referral', source: 'Instagram', lastContact: '2023-11-07', value: 12000, requirements: 'Kitchen and Living Room redesign', notes: 'Likes minimal aesthetics.' },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Teak Wood (Grade A)', type: 'Raw Material', quantity: 45, unit: 'sqft', reorderLevel: 50, cost: 24, location: 'Warehouse A - Bin 12', supplier: 'Timber Mart' },
  { id: '2', name: 'Italian Marble Slab', type: 'Raw Material', quantity: 12, unit: 'slabs', reorderLevel: 5, cost: 450, location: 'Warehouse B - Zone 1', supplier: 'Stone World' },
];

export const MOCK_PROJECTS: Project[] = [
  { 
    id: '1', 
    name: 'Oberoi Sky City Apt', 
    client: 'Mr. & Mrs. Oberoi', 
    stages: ['Concept', 'Design', 'Material Procurement', 'Civil Work', 'Execution', 'Handover'], 
    currentStage: 'Execution', 
    progress: 75, 
    dueDate: '2024-12-20', 
    budget: 5500000, 
    files: ['floor_plan_v2.pdf', 'kitchen_render.jpg', 'electrical_layout.dwg'],
    dimensions: '4BHK - 2400 sqft',
    description: 'Modern minimalist renovation focusing on natural wood and marble finishes.',
    siteAddress: 'Borivali East, Mumbai',
    referenceImages: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1616486341353-c5833211e993?auto=format&fit=crop&w=800'
    ]
  },
  { 
    id: '2', 
    name: 'FinTech HQ Reception', 
    client: 'Razorpay', 
    stages: ['Concept', 'Design', 'Client Approval', 'Construction', 'Finishing'], 
    currentStage: 'Design', 
    progress: 40, 
    dueDate: '2025-02-15', 
    budget: 1500000, 
    files: ['concept_moodboard.png', 'lighting_plan.pdf'],
    dimensions: 'Reception Area - 800 sqft',
    description: 'Tech-forward lobby design with custom parametric wooden ceiling.',
    siteAddress: 'Koramangala, Bangalore',
    referenceImages: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800'
    ]
  },
];

export const MOCK_SHIPMENTS: Shipment[] = [
  { id: '1', orderId: 'ORD-8821', customer: 'Aarav Mehta', status: 'In Transit', courier: 'BlueDart', trackingNumber: 'BD-445566', trackingUrl: 'https://bluedart.com/track/BD-445566', eta: '2023-11-09' },
];

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Vikram Malhotra', role: 'Super Admin', roleId: 'admin', email: 'admin@studiomystri.com', status: 'Active', linkedEmployeeId: '1' },
  { id: '2', name: 'Ananya Singh', role: 'Architect', roleId: 'admin', email: 'ananya@studiomystri.com', status: 'Active', linkedEmployeeId: '2' },
  { id: '3', name: 'Kabir Khan', role: 'Sales', roleId: 'sales', email: 'kabir@studiomystri.com', status: 'Active', linkedEmployeeId: '3' },
];

export const MOCK_INTEGRATIONS: IntegrationStatus[] = [
  { name: 'Shopify', status: 'Connected', lastSync: '10 mins ago', icon: 'ShoppingBag' },
  { name: 'WordPress', status: 'Connected', lastSync: '1 hour ago', icon: 'Wordpress' },
  { name: 'QuickBooks', status: 'Connected', lastSync: '1 hour ago', icon: 'Terminal' },
  { name: 'Shiprocket', status: 'Connected', lastSync: 'Real-time', icon: 'Truck' },
];

export const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', message: 'Invoice #INV-204 generated', timestamp: '10 mins ago', type: 'sale' },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-201', client: 'Oberoi Project', amount: 25000, baseAmount: 21186.44, taxAmount: 3813.56, taxRate: 18, gstNumber: '27AAAAA0000A1Z5', paidAmount: 25000, type: 'Income', date: '2023-11-01', status: 'Paid', currency: 'INR', history: [] },
  { id: 'EXP-001', client: 'Timber Mart', amount: 8000, baseAmount: 6779.66, taxAmount: 1220.34, taxRate: 18, paidAmount: 8000, type: 'Expense', date: '2023-11-02', status: 'Paid', currency: 'INR', history: [] },
  { id: 'INV-202', client: 'Razorpay', amount: 75000, baseAmount: 63559.32, taxAmount: 11440.68, taxRate: 18, gstNumber: '29ABCDE1234F2Z5', paidAmount: 0, type: 'Income', date: '2023-11-05', status: 'Pending', currency: 'INR', history: [] },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Vikram Malhotra', role: 'Principal Architect', roleId: 'admin', email: 'vikram@studio.com', phone: '9998887776', salary: 150000, joinDate: '2020-01-15', status: 'Active', attendance: 'Present', leavePolicy: 30, leavesRemaining: 15, dob: '1985-05-15', address: 'Mumbai', emergencyContact: 'Wife: 9999999999', qualifications: 'M.Arch', documents: [] },
  { id: '2', name: 'Ananya Singh', role: 'Senior Designer', roleId: 'admin', email: 'ananya@studio.com', phone: '8887776665', salary: 95000, joinDate: '2021-03-10', status: 'Active', attendance: 'Present', leavePolicy: 24, leavesRemaining: 20, dob: '1992-08-20', address: 'Delhi', emergencyContact: 'Father: 8888888888', qualifications: 'B.Des', documents: [] },
  { id: '3', name: 'Kabir Khan', role: 'Sales Manager', roleId: 'sales', email: 'kabir@studiomystri.com', phone: '7776665554', salary: 85000, joinDate: '2022-06-01', status: 'Active', attendance: 'Present', leavePolicy: 20, leavesRemaining: 18, dob: '1995-02-10', address: 'Bangalore', emergencyContact: 'Mother: 7777777777', qualifications: 'MBA Sales', documents: [] },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'New Web Order', message: 'Order #ORD-8825 received', time: '2m ago', read: false, type: 'order' },
];

export const MOCK_ORDERS: Order[] = [
  { id: 'ORD-8820', customerName: 'Aarav Mehta', date: '2023-11-01', total: 1450, items: 1, status: 'Completed', paymentMethod: 'Card', currency: 'INR' },
  { id: 'ORD-8819', customerName: 'Walk-in Customer', date: '2023-10-30', total: 320, items: 2, status: 'Completed', paymentMethod: 'Cash', currency: 'INR' },
];

export const MOCK_LOGS: SystemLog[] = [
  { id: '1', user: 'Vikram Malhotra', action: 'Login', details: 'Successful login from IP 192.168.1.1', timestamp: '2023-11-08 09:00 AM', module: 'Auth' },
  { id: '2', user: 'Kabir Khan', action: 'Create Lead', details: 'Added lead "TechPark Solutions"', timestamp: '2023-11-08 10:30 AM', module: 'CRM' },
];
