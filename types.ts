// Domain Models

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number; // Stored in Base Currency (INR)
  category: string;
  image: string;
  stock: number;
  description?: string;
  materials?: string;
  dimensions?: string;
  manualUrl?: string; 
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastPurchase?: string;
  totalSpend: number;
  address?: string;
}

export interface Lead {
  id: string;
  companyName: string;
  pocName: string;
  website?: string;
  phone: string;
  email: string;
  status: 'New' | 'Negotiation' | 'Won' | 'Lost';
  type: 'Inbound' | 'Outbound' | 'Referral';
  source: string;
  lastContact: string;
  value: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'Raw Material' | 'Finished Good';
  quantity: number;
  unit: string;
  reorderLevel: number;
  cost: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  stages: string[];
  currentStage: string;
  progress: number;
  dueDate: string;
  budget: number;
  files: string[];
}

export interface Shipment {
  id: string;
  orderId: string;
  customer: string;
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Returned';
  courier: string;
  trackingNumber: string;
  trackingUrl?: string;
  eta: string;
}

export interface User {
  id: string;
  name: string;
  role: 'Super Admin' | 'Architect' | 'Sales' | 'Logistics' | 'HR' | 'Finance';
  email: string;
  status: 'Active' | 'Inactive';
  linkedEmployeeId?: string; // Link to HR
}

export interface IntegrationStatus {
  name: string;
  status: 'Connected' | 'Disconnected' | 'Error';
  lastSync: string;
  icon: string;
}

export interface Invoice {
  id: string;
  client: string;
  amount: number; 
  baseAmount: number; 
  taxAmount: number; 
  paidAmount: number;
  type: 'Income' | 'Expense';
  date: string;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  currency: 'INR' | 'USD';
  history: { date: string; amount: number; note: string }[];
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  salary: number;
  joinDate: string;
  status: 'Active' | 'Leave' | 'Terminated';
  attendance: 'Present' | 'Absent' | 'Half-Day';
  leavePolicy: number; 
  leavesRemaining: number;
  dob: string;
  address: string;
  emergencyContact: string;
  qualifications: string;
  documents: { name: string; url: string; date: string }[]; // New
}

export interface Policy {
  id: string;
  title: string;
  category: 'Leave' | 'Conduct' | 'Safety' | 'IT';
  content: string;
  lastUpdated: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  date: string;
  total: number;
  items: number;
  status: 'Completed' | 'Refunded';
  paymentMethod: string;
  currency: 'INR' | 'USD'; // Track currency at time of sale
}

export interface SystemLog {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
  module: string;
  editHistory?: { editedBy: string; timestamp: string; oldDetails: string }[];
}

export enum AppModule {
  DASHBOARD = 'DASHBOARD',
  POS = 'POS',
  CRM = 'CRM',
  PROJECTS = 'PROJECTS',
  LOGISTICS = 'LOGISTICS',
  FINANCE = 'FINANCE',
  HR = 'HR',
  ADMIN = 'ADMIN',
  BRIDGE = 'BRIDGE',
  ACTIVITY = 'ACTIVITY'
}

export interface Activity {
  id: string;
  message: string;
  timestamp: string;
  type: 'sale' | 'lead' | 'project' | 'alert';
}