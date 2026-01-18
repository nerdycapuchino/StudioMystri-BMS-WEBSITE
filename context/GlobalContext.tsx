import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Activity, Lead, IntegrationStatus, Notification, Invoice, Employee, InventoryItem, Shipment, User, Order, SystemLog, Product, Policy } from '../types';
import { MOCK_PROJECTS, MOCK_ACTIVITIES, MOCK_LEADS, MOCK_INTEGRATIONS, MOCK_NOTIFICATIONS, MOCK_INVOICES, MOCK_EMPLOYEES, MOCK_INVENTORY, MOCK_SHIPMENTS, MOCK_USERS, MOCK_ORDERS, MOCK_LOGS, MOCK_PRODUCTS } from '../constants';

interface GlobalContextType {
  currency: 'INR' | 'USD';
  setCurrency: (c: 'INR' | 'USD') => void;
  formatCurrency: (amount: number) => string;
  convertAmount: (amount: number) => number; // Helper to get raw converted number
  
  salesToday: number;
  addSale: (amount: number) => void;
  activities: Activity[];
  addActivity: (message: string, type: Activity['type']) => void;
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  userRole: 'Super Admin' | 'Architect' | 'Sales' | null;
  setUserRole: (role: 'Super Admin' | 'Architect' | 'Sales' | null) => void;
  currentUser: string;
  
  // POS Shift State
  isShiftOpen: boolean;
  openingBalance: string;
  cashCollected: number;
  startShift: (balance: string) => void;
  updateCashCollected: (amount: number) => void;
  closeShift: () => void;

  // Products & Stock
  products: Product[];
  addProduct: (product: Product) => void;
  deductStock: (items: { id: string; quantity: number }[]) => void; 

  // Persistent Module State
  leads: Lead[];
  addLead: (lead: Lead) => void;
  updateLeadStatus: (id: string, newStatus: Lead['status']) => void;
  
  integrations: IntegrationStatus[];
  toggleIntegration: (name: string) => void;
  syncIntegrations: () => Promise<void>;
  
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoicePayment: (id: string, amount: number) => void; 
  updateInvoice: (id: string, updates: Partial<Invoice>) => void; 
  
  employees: Employee[];
  addEmployee: (employee: Employee, createSystemUser?: boolean, userRole?: string) => void; // Updated signature
  updateEmployee: (id: string, updates: Partial<Employee>) => void; 
  policies: Policy[];
  addPolicy: (policy: Policy) => void;
  
  inventory: InventoryItem[];
  updateInventoryStock: (id: string, qty: number) => void;
  
  shipments: Shipment[];
  addShipment: (shipment: Shipment) => void;
  updateShipment: (id: string, updates: Partial<Shipment>) => void;
  
  users: User[];
  addUser: (user: User) => void;
  updateUserStatus: (id: string, status: User['status']) => void;
  deleteUser: (id: string) => void;

  orders: Order[];
  addOrder: (order: Order) => void;

  systemLogs: SystemLog[];
  logAction: (action: string, details: string, module: string) => void;
  editLog: (id: string, newDetails: string) => void; 
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Helpers
  const getStoredBool = (key: string, def: boolean) => {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === 'true' : def;
  };
  const getStoredNum = (key: string, def: number) => {
    const stored = localStorage.getItem(key);
    return stored !== null ? parseFloat(stored) : def;
  };
  const getStoredStr = (key: string, def: string) => {
    return localStorage.getItem(key) || def;
  };
  const getStoredJSON = <T,>(key: string, def: T): T => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : def;
  };

  // State
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [salesToday, setSalesToday] = useState(() => getStoredNum('salesToday', 12450));
  const [activities, setActivities] = useState<Activity[]>(() => getStoredJSON('activities', MOCK_ACTIVITIES));
  const [projects, setProjects] = useState<Project[]>(() => getStoredJSON('projects', MOCK_PROJECTS));
  const [userRole, setUserRole] = useState<'Super Admin' | 'Architect' | 'Sales' | null>(() => {
    const role = localStorage.getItem('userRole');
    return (role as any) || null;
  });
  const currentUser = userRole === 'Super Admin' ? 'Vikram Malhotra' : userRole === 'Architect' ? 'Ananya Singh' : 'Kabir Khan';

  // POS
  const [isShiftOpen, setIsShiftOpen] = useState(() => getStoredBool('isShiftOpen', false));
  const [openingBalance, setOpeningBalance] = useState(() => getStoredStr('openingBalance', ''));
  const [cashCollected, setCashCollected] = useState(() => getStoredNum('cashCollected', 0));
  const [products, setProducts] = useState<Product[]>(() => getStoredJSON('products', MOCK_PRODUCTS));

  // Modules
  const [leads, setLeads] = useState<Lead[]>(() => getStoredJSON('leads', MOCK_LEADS));
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>(() => getStoredJSON('integrations', MOCK_INTEGRATIONS));
  const [notifications, setNotifications] = useState<Notification[]>(() => getStoredJSON('notifications', MOCK_NOTIFICATIONS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStoredJSON('invoices', MOCK_INVOICES));
  const [employees, setEmployees] = useState<Employee[]>(() => getStoredJSON('employees', MOCK_EMPLOYEES));
  const [policies, setPolicies] = useState<Policy[]>(() => getStoredJSON('policies', [
    { id: 'POL-001', title: 'Standard Leave Policy', category: 'Leave', content: '24 Paid Leaves per year. Approval required 3 days prior.', lastUpdated: '2023-01-01' },
    { id: 'POL-002', title: 'Workplace Conduct', category: 'Conduct', content: 'Professional attire and behavior expected at all client sites.', lastUpdated: '2023-01-01' }
  ]));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getStoredJSON('inventory', MOCK_INVENTORY));
  const [shipments, setShipments] = useState<Shipment[]>(() => getStoredJSON('shipments', MOCK_SHIPMENTS));
  const [users, setUsers] = useState<User[]>(() => getStoredJSON('users', MOCK_USERS));
  const [orders, setOrders] = useState<Order[]>(() => getStoredJSON('orders', MOCK_ORDERS));
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => getStoredJSON('systemLogs', MOCK_LOGS));

  // Effects
  useEffect(() => localStorage.setItem('salesToday', String(salesToday)), [salesToday]);
  useEffect(() => localStorage.setItem('activities', JSON.stringify(activities)), [activities]);
  useEffect(() => localStorage.setItem('projects', JSON.stringify(projects)), [projects]);
  useEffect(() => { if (userRole) localStorage.setItem('userRole', userRole); else localStorage.removeItem('userRole'); }, [userRole]);
  useEffect(() => localStorage.setItem('isShiftOpen', String(isShiftOpen)), [isShiftOpen]);
  useEffect(() => localStorage.setItem('openingBalance', openingBalance), [openingBalance]);
  useEffect(() => localStorage.setItem('cashCollected', String(cashCollected)), [cashCollected]);
  useEffect(() => localStorage.setItem('leads', JSON.stringify(leads)), [leads]);
  useEffect(() => localStorage.setItem('integrations', JSON.stringify(integrations)), [integrations]);
  useEffect(() => localStorage.setItem('notifications', JSON.stringify(notifications)), [notifications]);
  useEffect(() => localStorage.setItem('invoices', JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem('employees', JSON.stringify(employees)), [employees]);
  useEffect(() => localStorage.setItem('policies', JSON.stringify(policies)), [policies]);
  useEffect(() => localStorage.setItem('inventory', JSON.stringify(inventory)), [inventory]);
  useEffect(() => localStorage.setItem('shipments', JSON.stringify(shipments)), [shipments]);
  useEffect(() => localStorage.setItem('users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('systemLogs', JSON.stringify(systemLogs)), [systemLogs]);
  useEffect(() => localStorage.setItem('products', JSON.stringify(products)), [products]);

  // Actions
  const logAction = (action: string, details: string, module: string) => {
    const newLog: SystemLog = {
      id: Math.random().toString(36).substr(2, 9),
      user: currentUser,
      action,
      details,
      timestamp: new Date().toLocaleString(),
      module,
      editHistory: []
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  const editLog = (id: string, newDetails: string) => {
    setSystemLogs(prev => prev.map(log => {
      if (log.id === id) {
        return {
          ...log,
          details: newDetails,
          editHistory: [...(log.editHistory || []), { editedBy: currentUser, timestamp: new Date().toLocaleString(), oldDetails: log.details }]
        };
      }
      return log;
    }));
  };

  // Currency Logic
  const exchangeRate = 84; // 1 USD = 84 INR
  const convertAmount = (amount: number) => {
    if (currency === 'USD') return amount / exchangeRate;
    return amount;
  };
  const formatCurrency = (amount: number) => {
    const converted = convertAmount(amount);
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(converted);
  };

  const addSale = (amount: number) => setSalesToday(prev => prev + amount);
  
  const addActivity = (message: string, type: Activity['type']) => {
    setActivities(prev => [{ id: Math.random().toString(36).substr(2, 9), message, timestamp: 'Just now', type }, ...prev]);
  };

  const addProject = (project: Project) => {
    setProjects(prev => [project, ...prev]);
    logAction('Create Project', `Created project: ${project.name}`, 'PROJECTS');
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    logAction('Update Project', `Updated project ID: ${id}`, 'PROJECTS');
  };

  const startShift = (balance: string) => {
    setOpeningBalance(balance); setCashCollected(0); setIsShiftOpen(true);
    logAction('Start Shift', `Shift started with ${balance}`, 'POS');
  };
  const updateCashCollected = (amount: number) => setCashCollected(prev => prev + amount);
  const closeShift = () => {
    setIsShiftOpen(false); setOpeningBalance(''); setCashCollected(0);
    logAction('End Shift', `Shift ended`, 'POS');
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    logAction('Add Product', `Added product: ${product.name}`, 'POS');
  }

  const deductStock = (items: { id: string; quantity: number }[]) => {
    setProducts(prev => prev.map(p => {
      const item = items.find(i => i.id === p.id);
      return item ? { ...p, stock: p.stock - item.quantity } : p;
    }));
  };

  const addLead = (lead: Lead) => {
    setLeads(prev => [lead, ...prev]);
    logAction('Add Lead', `Added lead: ${lead.companyName}`, 'CRM');
  };
  const updateLeadStatus = (id: string, newStatus: Lead['status']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    logAction('Update Lead', `Updated lead status to ${newStatus}`, 'CRM');
  };

  const toggleIntegration = (name: string) => {
    setIntegrations(prev => prev.map(i => i.name === name ? { ...i, status: i.status === 'Connected' ? 'Disconnected' : 'Connected' } : i));
    logAction('Toggle Integration', `Toggled ${name}`, 'ADMIN');
  };
  const syncIntegrations = async () => {
     return new Promise<void>(resolve => setTimeout(() => {
        setIntegrations(prev => prev.map(i => ({...i, lastSync: 'Just now'})));
        logAction('Sync', 'Synced all integrations', 'ADMIN');
        resolve();
     }, 1500));
  };

  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  
  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    logAction('Create Invoice', `Created ${invoice.type} invoice for ${invoice.client}`, 'FINANCE');
  };

  const updateInvoicePayment = (id: string, amount: number) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const newPaid = inv.paidAmount + amount;
        return {
          ...inv,
          paidAmount: newPaid,
          status: newPaid >= inv.amount ? 'Paid' : 'Partial',
          history: [...inv.history, { date: new Date().toLocaleDateString(), amount, note: 'Partial Payment' }]
        };
      }
      return inv;
    }));
    logAction('Payment', `Recorded payment of $${amount} for Invoice ${id}`, 'FINANCE');
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
    logAction('Edit Invoice', `Edited invoice ${id}`, 'FINANCE');
  };

  const addEmployee = (employee: Employee, createSystemUser?: boolean, userRole?: string) => {
    setEmployees(prev => [employee, ...prev]);
    logAction('Add Employee', `Onboarded ${employee.name}`, 'HR');
    
    if (createSystemUser && userRole) {
      addUser({
        id: Math.random().toString(36).substr(2, 9),
        name: employee.name,
        email: employee.email,
        role: userRole as any,
        status: 'Active',
        linkedEmployeeId: employee.id
      });
    }
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    logAction('Edit Employee', `Updated details for ${id}`, 'HR');
  };

  const addPolicy = (policy: Policy) => {
    setPolicies(prev => [policy, ...prev]);
    logAction('Add Policy', `Added policy: ${policy.title}`, 'HR');
  }

  const updateInventoryStock = (id: string, qty: number) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    logAction('Update Stock', `Updated stock for item ID ${id} to ${qty}`, 'ERP');
  };

  const addShipment = (shipment: Shipment) => {
    setShipments(prev => [shipment, ...prev]);
    logAction('Create Shipment', `Created shipment ${shipment.trackingNumber}`, 'LOGISTICS');
  };

  const updateShipment = (id: string, updates: Partial<Shipment>) => {
    setShipments(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    logAction('Update Shipment', `Updated shipment ${id}`, 'LOGISTICS');
  };

  const addUser = (user: User) => {
    setUsers(prev => [user, ...prev]);
    logAction('Add User', `Created user ${user.email}`, 'ADMIN');
  };
  const updateUserStatus = (id: string, status: User['status']) => {
    setUsers(prev => prev.map(u => u.id === id ? {...u, status} : u));
    logAction('Update User', `Updated user status to ${status}`, 'ADMIN');
  };
  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    logAction('Delete User', `Deleted user ID ${id}`, 'ADMIN');
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    logAction('Create Order', `Order ${order.id} completed`, 'POS');
  };

  return (
    <GlobalContext.Provider value={{ 
      currency, setCurrency, formatCurrency, convertAmount,
      salesToday, addSale, activities, addActivity, projects, addProject, updateProject,
      userRole, setUserRole, currentUser,
      isShiftOpen, openingBalance, cashCollected, startShift, updateCashCollected, closeShift,
      products, addProduct, deductStock,
      leads, addLead, updateLeadStatus,
      integrations, toggleIntegration, syncIntegrations,
      notifications, markNotificationRead,
      invoices, addInvoice, updateInvoicePayment, updateInvoice,
      employees, addEmployee, updateEmployee, policies, addPolicy,
      inventory, updateInventoryStock,
      shipments, addShipment, updateShipment,
      users, addUser, updateUserStatus, deleteUser,
      orders, addOrder,
      systemLogs, logAction, editLog
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};