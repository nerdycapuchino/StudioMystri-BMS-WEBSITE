import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Activity, Lead, IntegrationStatus, Notification, Invoice, Employee, InventoryItem, Shipment, User, Order, SystemLog, Product, Policy, Customer, FieldPermission, AccessLevel, ChatMessage, Channel, FileItem } from '../types';
import { MOCK_PROJECTS, MOCK_ACTIVITIES, MOCK_LEADS, MOCK_INTEGRATIONS, MOCK_NOTIFICATIONS, MOCK_INVOICES, MOCK_EMPLOYEES, MOCK_INVENTORY, MOCK_SHIPMENTS, MOCK_USERS, MOCK_ORDERS, MOCK_LOGS, MOCK_PRODUCTS, MOCK_CUSTOMERS } from '../constants';

interface GlobalContextType {
  currency: 'INR' | 'USD';
  setCurrency: (c: 'INR' | 'USD') => void;
  formatCurrency: (amount: number) => string;
  convertAmount: (amount: number) => number;
  
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
  
  isShiftOpen: boolean;
  openingBalance: string;
  cashCollected: number;
  startShift: (balance: string) => void;
  updateCashCollected: (amount: number) => void;
  closeShift: () => void;

  products: Product[];
  addProduct: (product: Product) => void;
  deductStock: (items: { id: string; quantity: number }[]) => void; 

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
  addEmployee: (employee: Employee, createSystemUser?: boolean, userRole?: string) => void; 
  updateEmployee: (id: string, updates: Partial<Employee>) => void; 
  policies: Policy[];
  addPolicy: (policy: Policy) => void;
  
  inventory: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryStock: (id: string, qty: number) => void;
  
  shipments: Shipment[];
  addShipment: (shipment: Shipment) => void;
  updateShipment: (id: string, updates: Partial<Shipment>) => void;
  
  users: User[];
  addUser: (user: User) => void;
  updateUserStatus: (id: string, status: User['status']) => void;
  deleteUser: (id: string) => void;

  customers: Customer[];
  addCustomer: (customer: Customer) => void;

  orders: Order[];
  addOrder: (order: Order) => void;

  systemLogs: SystemLog[];
  logAction: (action: string, details: string, module: string) => void;
  editLog: (id: string, newDetails: string) => void; 

  permissions: FieldPermission[];
  updatePermission: (role: string, field: string, access: AccessLevel) => void;
  checkAccess: (field: string) => AccessLevel;

  teamMessages: ChatMessage[];
  addTeamMessage: (msg: ChatMessage) => void;
  teamChannels: Channel[];
  addTeamChannel: (channel: Channel) => void;
  teamFiles: FileItem[];
  addTeamFile: (file: FileItem) => void;
  
  campaigns: any[];
  toggleCampaignStatus: (id: string) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getStoredBool = (key: string, def: boolean) => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? stored === 'true' : def;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return def;
    }
  };
  
  const getStoredNum = (key: string, def: number) => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null && !isNaN(parseFloat(stored)) ? parseFloat(stored) : def;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return def;
    }
  };
  
  const getStoredStr = (key: string, def: string) => {
    try {
      return localStorage.getItem(key) || def;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return def;
    }
  };
  
  function getStoredJSON<T>(key: string, def: T): T {
    try {
      const stored = localStorage.getItem(key);
      // Check for undefined string or null
      if (!stored || stored === 'undefined' || stored === 'null') return def;
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Error parsing ${key} from localStorage`, e);
      // If error, clear the corrupted key so it doesn't crash next time
      localStorage.removeItem(key);
      return def;
    }
  }

  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [salesToday, setSalesToday] = useState(() => getStoredNum('salesToday', 12450));
  const [activities, setActivities] = useState<Activity[]>(() => getStoredJSON('activities', MOCK_ACTIVITIES));
  const [projects, setProjects] = useState<Project[]>(() => getStoredJSON('projects', MOCK_PROJECTS));
  const [userRole, setUserRole] = useState<'Super Admin' | 'Architect' | 'Sales' | null>(() => {
    try {
      const role = localStorage.getItem('userRole');
      if (role === 'null' || role === 'undefined') return null;
      return (role as any) || null;
    } catch (e) {
      return null;
    }
  });
  
  const currentUser = userRole === 'Super Admin' ? 'Vikram Malhotra' : userRole === 'Architect' ? 'Ananya Singh' : 'Kabir Khan';

  const [isShiftOpen, setIsShiftOpen] = useState(() => getStoredBool('isShiftOpen', false));
  const [openingBalance, setOpeningBalance] = useState(() => getStoredStr('openingBalance', ''));
  const [cashCollected, setCashCollected] = useState(() => getStoredNum('cashCollected', 0));
  const [products, setProducts] = useState<Product[]>(() => getStoredJSON('products', MOCK_PRODUCTS));

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
  const [customers, setCustomers] = useState<Customer[]>(() => getStoredJSON('customers', MOCK_CUSTOMERS));
  const [orders, setOrders] = useState<Order[]>(() => getStoredJSON('orders', MOCK_ORDERS));
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => getStoredJSON('systemLogs', MOCK_LOGS));

  const [permissions, setPermissions] = useState<FieldPermission[]>(() => getStoredJSON('permissions', [
    { role: 'Sales', field: 'salary', access: 'hidden' },
    { role: 'Sales', field: 'costPrice', access: 'hidden' },
    { role: 'Architect', field: 'salary', access: 'hidden' },
    { role: 'Architect', field: 'costPrice', access: 'read-only' },
    { role: 'Super Admin', field: 'salary', access: 'read-write' },
    { role: 'Super Admin', field: 'costPrice', access: 'read-write' }
  ]));

  const [teamMessages, setTeamMessages] = useState<ChatMessage[]>(() => getStoredJSON('teamMessages', [
    { id: '1', channelId: 'general', sender: 'Ananya Singh', content: 'Has the updated floor plan for Oberoi been approved?', timestamp: '10:30 AM', avatar: 'A' },
    { id: '2', channelId: 'general', sender: 'Vikram Malhotra', content: 'Yes, just signed off. Proceed with procurement.', timestamp: '10:32 AM', avatar: 'V' },
    { id: '3', channelId: 'general', sender: 'Kabir Khan', content: 'Great, I will update the client.', timestamp: '10:35 AM', avatar: 'K' }
  ]));
  const [teamChannels, setTeamChannels] = useState<Channel[]>(() => getStoredJSON('teamChannels', [
    { id: 'general', name: 'general', type: 'public' },
    { id: 'design-team', name: 'design-team', type: 'public' },
    { id: 'sales-leads', name: 'sales-leads', type: 'private' },
    { id: 'procurement', name: 'procurement', type: 'public' }
  ]));
  const [teamFiles, setTeamFiles] = useState<FileItem[]>(() => getStoredJSON('teamFiles', [
    { id: '1', name: 'Oberoi_Project_Specs.pdf', type: 'pdf', size: '2.4 MB', date: '2023-11-01', owner: 'Ananya' },
    { id: '2', name: 'Q3_Budget_Forecast.xlsx', type: 'sheet', size: '1.1 MB', date: '2023-10-28', owner: 'Vikram' },
    { id: '3', name: 'Site_Photos_Nov.jpg', type: 'image', size: '4.5 MB', date: '2023-11-05', owner: 'Kabir' },
    { id: '4', name: 'Vendor_Contracts.docx', type: 'doc', size: '800 KB', date: '2023-11-02', owner: 'Admin' }
  ]));

  const [campaigns, setCampaigns] = useState<any[]>(() => getStoredJSON('campaigns', [
    { id: '1', name: 'Diwali Sale', status: 'Active', channel: 'Email', conversionRate: 12.5 },
    { id: '2', name: 'New Collection Launch', status: 'Paused', channel: 'WhatsApp', conversionRate: 8.2 }
  ]));

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
  useEffect(() => localStorage.setItem('customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('systemLogs', JSON.stringify(systemLogs)), [systemLogs]);
  useEffect(() => localStorage.setItem('products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('permissions', JSON.stringify(permissions)), [permissions]);
  
  useEffect(() => localStorage.setItem('teamMessages', JSON.stringify(teamMessages)), [teamMessages]);
  useEffect(() => localStorage.setItem('teamChannels', JSON.stringify(teamChannels)), [teamChannels]);
  useEffect(() => localStorage.setItem('teamFiles', JSON.stringify(teamFiles)), [teamFiles]);
  useEffect(() => localStorage.setItem('campaigns', JSON.stringify(campaigns)), [campaigns]);

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

  const exchangeRate = 84;
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

  const addInventoryItem = (item: InventoryItem) => {
    setInventory(prev => [item, ...prev]);
    logAction('Add Stock', `Added master stock: ${item.name}`, 'ERP');
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

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
    logAction('Add Customer', `Added customer ${customer.name}`, 'POS');
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    logAction('Create Order', `Order ${order.id} completed`, 'POS');
  };

  const updatePermission = (role: string, field: string, access: AccessLevel) => {
    setPermissions(prev => {
      const filtered = prev.filter(p => !(p.role === role && p.field === field));
      return [...filtered, { role, field, access }];
    });
    logAction('Update Permission', `Changed ${field} access for ${role} to ${access}`, 'ADMIN');
  };

  const checkAccess = (field: string): AccessLevel => {
    if (!userRole) return 'hidden';
    const perm = permissions.find(p => p.role === userRole && p.field === field);
    return perm ? perm.access : 'read-write';
  };

  const addTeamMessage = (msg: ChatMessage) => {
    setTeamMessages(prev => [...prev, msg]);
  };
  const addTeamChannel = (channel: Channel) => {
    setTeamChannels(prev => [...prev, channel]);
    logAction('Create Channel', `Created channel #${channel.name}`, 'TEAM');
  };
  const addTeamFile = (file: FileItem) => {
    setTeamFiles(prev => [file, ...prev]);
    logAction('Upload File', `Uploaded file ${file.name}`, 'TEAM');
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? 'Paused' : 'Active' } : c));
    logAction('Toggle Campaign', `Toggled campaign status for ID: ${id}`, 'MARKETING');
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
      inventory, addInventoryItem, updateInventoryStock,
      shipments, addShipment, updateShipment,
      users, addUser, updateUserStatus, deleteUser,
      customers, addCustomer,
      orders, addOrder,
      systemLogs, logAction, editLog,
      permissions, updatePermission, checkAccess,
      teamMessages, addTeamMessage, teamChannels, addTeamChannel, teamFiles, addTeamFile,
      campaigns, toggleCampaignStatus
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