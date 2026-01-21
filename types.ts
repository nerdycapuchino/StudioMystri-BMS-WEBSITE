
// Domain Models

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number; 
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
  notes?: string;
  status?: 'Active' | 'Inactive';
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
  requirements?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'Raw Material' | 'Finished Good';
  quantity: number;
  unit: string;
  reorderLevel: number;
  cost: number;
  location?: string;
  supplier?: string;
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
  dimensions?: string;
  description?: string;
  referenceImages?: string[];
  siteAddress?: string;
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

export enum AppModule {
  DASHBOARD = 'DASHBOARD',
  POS = 'POS',
  CRM = 'CRM',
  PROJECTS = 'PROJECTS',
  WAREHOUSE = 'WAREHOUSE',
  LOGISTICS = 'LOGISTICS',
  FINANCE = 'FINANCE',
  HR = 'HR',
  ADMIN = 'ADMIN',
  BRIDGE = 'BRIDGE',
  ACTIVITY = 'ACTIVITY',
  TEAM = 'TEAM',
  CUSTOMERS = 'CUSTOMERS'
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  allowedModules: AppModule[];
}

export interface User {
  id: string;
  name: string;
  roleId: string; 
  email: string;
  status: 'Active' | 'Inactive';
  role?: string;
  linkedEmployeeId?: string;
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
  paidAmount: number;
  type: 'Income' | 'Expense';
  date: string;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  currency: 'INR' | 'USD';
  history: { date: string; amount: number; note: string }[];
  baseAmount?: number;
  taxAmount?: number;
  taxRate?: number;
  gstNumber?: string;
}

export interface Employee {
  id: string;
  name: string;
  roleId: string; 
  email: string;
  phone: string;
  salary: number;
  joinDate: string;
  status: 'Active' | 'Leave' | 'Terminated';
  attendance: 'Present' | 'Absent' | 'Half-Day';
  role?: string;
  leavePolicy?: number;
  leavesRemaining?: number;
  dob?: string;
  address?: string;
  emergencyContact?: string;
  qualifications?: string;
  documents?: string[];
}

export interface CompanyPolicy {
  id: string;
  title: string;
  category: 'General' | 'Conduct' | 'Benefits' | 'Safety';
  lastUpdated: string;
  size: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: string;
}

export interface Order {
  id: string;
  customerName: string;
  date: string;
  total: number;
  items: number;
  status: 'Completed' | 'Refunded';
  paymentMethod?: string;
  currency?: string;
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

export interface Activity {
  id: string;
  message: string;
  timestamp: string;
  type: 'sale' | 'lead' | 'project' | 'alert';
}

export type AccessLevel = 'read-write' | 'read-only' | 'hidden';

export interface FieldPermission {
  roleId: string;
  field: string;
  access: AccessLevel;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  sender: string;
  content: string;
  timestamp: string;
  avatar: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  participantIds?: string[]; // Used primarily for DM and private
}
