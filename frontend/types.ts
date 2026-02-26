
// Domain Models

export interface CompanySettings {
  name: string;
  address: string;
  gstNumber: string;
  logoUrl: string;
  loginBackgroundUrl?: string; // New field for login screen background
  email: string;
  phone: string;
  bankName?: string;
  accountNo?: string;
  ifsc?: string;
  branch?: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Red", "Large"
  price: number;
  stock: number;
  sku: string;
}

export interface ProductMedia {
  type: 'image' | 'video';
  url: string;
  file?: File;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost?: number; // Added cost price
  category: string;
  image: string; // Keep for backward compatibility/thumbnail
  media?: ProductMedia[]; // New field for multiple uploads
  documents?: { name: string; url: string }[]; // New field for manuals
  stock: number;
  description?: string;
  materials?: string;
  dimensions?: string;
  manualUrl?: string;
  barcode?: string;
  variants?: ProductVariant[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface PurchaseHistoryItem {
  id: string;
  date: string;
  total: number;
  items: string[];
  source: 'POS' | 'Website';
}

export interface Customer {
  id: string;
  name: string; // Company Name
  contactName?: string; // Primary Contact Person
  industry?: string;
  phone: string;
  email: string;
  gstNumber?: string;
  lastPurchase?: string;
  totalSpend: number; // LTV
  address?: string;
  shippingAddress?: string;
  notes?: string;
  status?: 'Active' | 'Inactive' | 'Lead' | 'Past Client';
  projectCount?: number;
  activeProjectCount?: number;
  history: PurchaseHistoryItem[];
}

export interface Lead {
  id: string;
  companyName: string;
  pocName: string;
  website?: string;
  phone: string;
  email: string;
  gstNumber?: string;
  status: 'New' | 'Negotiation' | 'Won' | 'Lost';
  type: 'Inbound' | 'Outbound' | 'Referral';
  source: string;
  lastContact: string;
  value: number;
  requirements?: string;
  notes?: string;
  files?: string[];
  brief?: string;
  dateReceived?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'RAW' | 'FINISHED' | 'CONSUMABLE';
  category?: string;
  sku?: string;
  image?: string;
  quantity: number;
  unit: string;
  reorderPoint?: number;
  cost: number;
  location?: string;
  supplierId?: string;
  supplier?: Supplier;
  batchNumber?: string;
  expiryDate?: string;
  barcode?: string;
  bom?: { itemName: string; qty: number }[];
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  description?: string;
}

export interface ProjectPayment {
  id: string;
  amount: number;
  date: string;
  note: string;
  method: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  gstNumber?: string;
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
  payments?: ProjectPayment[];
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
  CUSTOMERS = 'CUSTOMERS',
  TASKS = 'TASKS',
  INVOICE_GEN = 'INVOICE_GEN',
  SCANNER = 'SCANNER',
  ERP = 'ERP',
  MARKETING = 'MARKETING',
  TASKS_MANAGER = 'TASKS_MANAGER'
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
  items?: { desc: string; qty: number; rate: number; total: number; variant?: string; hsn?: string; gstRate?: number }[];

  // Detailed Fields for Tax Invoice
  deliveryType?: 'Standard' | 'Express' | 'Pickup' | 'Free';
  deliveryCost?: number;
  sellerName?: string;
  sellerAddress?: string;
  sellerGst?: string;
  buyerAddress?: string;
  shippingAddress?: string;
  paymentMode?: string;
  referenceNo?: string;
  referenceDate?: string;
  buyerOrderNo?: string;
  dispatchDocNo?: string;
  dispatchThrough?: string;
  destination?: string;
  termsOfDelivery?: string;
  pan?: string;
  declaration?: string;
  jurisdiction?: string;

  // Bank Details Snapshot (to persist even if settings change later)
  bankName?: string;
  accountNo?: string;
  ifsc?: string;
  branch?: string;
}

export interface Employee {
  id: string;
  name: string;
  roleId: string;
  email: string;
  phone: string;
  salary: number;
  joinDate: string;
  department: string;
  status: 'Active' | 'Leave' | 'Terminated' | 'Inactive';
  attendance: 'Present' | 'Absent' | 'Half-Day' | 'Late' | 'Leave';
  role?: string;
  leavePolicy?: number;
  leavesRemaining?: number;
  dob?: string;
  currentAddress?: string;
  permanentAddress?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  idProof?: string;
  notes?: string;
  qualifications?: string;
  documents?: string[];
  credentials?: { username: string; initialPass: string };
}

export interface CompanyPolicy {
  id: string;
  title: string;
  content?: string;
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
  senderId?: string;
  content: string;
  timestamp: string;
  avatar: string;
  type?: 'TEXT' | 'FILE' | 'IMAGE';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mentions?: string[];
  attachments?: string[];
}

export interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  participantIds?: string[];
}

export interface Campaign {
  id: string;
  name: string;
  channel: 'Email' | 'WhatsApp';
  status: 'Active' | 'Paused';
  conversionRate: number;
}
