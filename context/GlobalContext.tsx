
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Activity, Lead, IntegrationStatus, Notification, Invoice, Employee, InventoryItem, Shipment, User, Order, SystemLog, Product, Customer, ChatMessage, Channel, AppModule, UserRole, CompanyPolicy } from '../types';
import { MOCK_PROJECTS, MOCK_ACTIVITIES, MOCK_LEADS, MOCK_INTEGRATIONS, MOCK_NOTIFICATIONS, MOCK_INVOICES, MOCK_EMPLOYEES, MOCK_INVENTORY, MOCK_SHIPMENTS, MOCK_USERS, MOCK_ORDERS, MOCK_LOGS, MOCK_PRODUCTS, MOCK_CUSTOMERS } from '../constants';

interface GlobalContextType {
  currency: 'INR' | 'USD';
  setCurrency: (c: 'INR' | 'USD') => void;
  formatCurrency: (amount: number) => string;
  
  salesToday: number;
  addSale: (amount: number) => void;
  activities: Activity[];
  addActivity: (message: string, type: Activity['type']) => void;
  projects: Project[];
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;

  userRoles: UserRole[];
  addRole: (role: UserRole) => void;
  
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  isShiftOpen: boolean;
  startShift: (balance: string) => void;
  closeShift: () => void;

  products: Product[];
  deductStock: (items: { id: string; quantity: number }[]) => void; 

  leads: Lead[];
  addLead: (lead: Lead) => void;
  updateLeadStatus: (id: string, newStatus: Lead['status']) => void;
  deleteLead: (id: string) => void;
  
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoicePayment: (id: string, amount: number) => void; 
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  
  employees: Employee[];
  addEmployee: (employee: Employee) => void; 
  policies: CompanyPolicy[];
  
  inventory: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryStock: (id: string, qty: number) => void;
  deleteInventoryItem: (id: string) => void;
  
  systemLogs: SystemLog[];
  logAction: (action: string, details: string, module: string) => void;

  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;

  teamMessages: ChatMessage[];
  addTeamMessage: (msg: ChatMessage) => void;
  teamChannels: Channel[];
  addTeamChannel: (channel: Channel) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getStoredJSON = <T,>(key: string, def: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : def;
    } catch (e) { return def; }
  };

  const [currency, setCurrency] = useState<'INR' | 'USD'>(() => (localStorage.getItem('currency') as any) || 'INR');
  const [salesToday, setSalesToday] = useState(() => Number(localStorage.getItem('salesToday')) || 12450);
  const [activities, setActivities] = useState<Activity[]>(() => getStoredJSON('activities', MOCK_ACTIVITIES));
  const [projects, setProjects] = useState<Project[]>(() => getStoredJSON('projects', MOCK_PROJECTS));
  
  const [userRoles, setUserRoles] = useState<UserRole[]>(() => getStoredJSON('userRoles', [
    { id: 'admin', name: 'Super Admin', description: 'Full access to all modules', allowedModules: Object.values(AppModule) },
    { id: 'sales', name: 'Sales Representative', description: 'Access to POS and CRM', allowedModules: [AppModule.DASHBOARD, AppModule.POS, AppModule.CRM, AppModule.TEAM, AppModule.CUSTOMERS] },
    { id: 'worker', name: 'Factory Worker', description: 'Access to Inventory and Team Hub', allowedModules: [AppModule.DASHBOARD, AppModule.WAREHOUSE, AppModule.TEAM] }
  ]));

  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredJSON('currentUser', null));

  const [isShiftOpen, setIsShiftOpen] = useState(() => localStorage.getItem('isShiftOpen') === 'true');
  const [products, setProducts] = useState<Product[]>(() => getStoredJSON('products', MOCK_PRODUCTS));
  const [leads, setLeads] = useState<Lead[]>(() => getStoredJSON('leads', MOCK_LEADS));
  const [notifications, setNotifications] = useState<Notification[]>(() => getStoredJSON('notifications', MOCK_NOTIFICATIONS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStoredJSON('invoices', MOCK_INVOICES));
  const [employees, setEmployees] = useState<Employee[]>(() => getStoredJSON('employees', MOCK_EMPLOYEES));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getStoredJSON('inventory', MOCK_INVENTORY));
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => getStoredJSON('systemLogs', MOCK_LOGS));
  const [customers, setCustomers] = useState<Customer[]>(() => getStoredJSON('customers', MOCK_CUSTOMERS));

  // Policies (Mock Data)
  const policies: CompanyPolicy[] = [
     { id: '1', title: 'Code of Conduct', category: 'Conduct', lastUpdated: '2023-10-01', size: '2.4 MB' },
     { id: '2', title: 'Leave & Attendance Policy', category: 'Benefits', lastUpdated: '2023-11-15', size: '1.1 MB' },
     { id: '3', title: 'Workplace Safety Guidelines', category: 'Safety', lastUpdated: '2023-08-20', size: '3.5 MB' },
     { id: '4', title: 'IT & Data Security', category: 'General', lastUpdated: '2023-12-01', size: '1.8 MB' }
  ];

  const [teamMessages, setTeamMessages] = useState<ChatMessage[]>(() => getStoredJSON('teamMessages', [
    { id: '1', channelId: 'general', sender: 'Vikram', content: 'Welcome to the team!', timestamp: '10:00 AM', avatar: 'V' }
  ]));
  const [teamChannels, setTeamChannels] = useState<Channel[]>(() => getStoredJSON('teamChannels', [
    { id: 'general', name: 'general', type: 'public' },
    { id: 'procurement', name: 'procurement', type: 'public' },
    { id: 'sales', name: 'sales-leads', type: 'private' }
  ]));

  useEffect(() => {
    localStorage.setItem('currency', currency);
    localStorage.setItem('salesToday', salesToday.toString());
    localStorage.setItem('activities', JSON.stringify(activities));
    localStorage.setItem('projects', JSON.stringify(projects));
    localStorage.setItem('userRoles', JSON.stringify(userRoles));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('isShiftOpen', isShiftOpen.toString());
    localStorage.setItem('leads', JSON.stringify(leads));
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('invoices', JSON.stringify(invoices));
    localStorage.setItem('employees', JSON.stringify(employees));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('systemLogs', JSON.stringify(systemLogs));
    localStorage.setItem('teamMessages', JSON.stringify(teamMessages));
    localStorage.setItem('teamChannels', JSON.stringify(teamChannels));
  }, [currency, salesToday, activities, projects, userRoles, currentUser, isShiftOpen, leads, notifications, invoices, employees, inventory, products, customers, systemLogs, teamMessages, teamChannels]);

  const exchangeRate = 84;
  const formatCurrency = (amount: number) => {
    const val = currency === 'USD' ? amount / exchangeRate : amount;
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency', currency: currency, minimumFractionDigits: 2
    }).format(val);
  };

  const logAction = (action: string, details: string, module: string) => {
    const newLog: SystemLog = {
      id: Math.random().toString(36).substr(2, 9),
      user: currentUser?.name || 'System',
      action, details, timestamp: new Date().toLocaleString(), module
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  const addRole = (role: UserRole) => setUserRoles(prev => [...prev, role]);
  const addSale = (amount: number) => setSalesToday(prev => prev + amount);
  const addActivity = (message: string, type: Activity['type']) => setActivities(prev => [{ id: Math.random().toString(36).substr(2, 9), message, timestamp: new Date().toLocaleTimeString(), type }, ...prev]);
  const addProject = (project: Project) => { setProjects(prev => [project, ...prev]); logAction('Create Project', `Added ${project.name}`, 'PROJECTS'); };
  const deleteProject = (id: string) => setProjects(prev => prev.filter(p => p.id !== id));
  const startShift = (balance: string) => { setIsShiftOpen(true); logAction('Shift Start', `Opened register with ${balance}`, 'POS'); };
  const closeShift = () => { setIsShiftOpen(false); logAction('Shift End', 'Register closed', 'POS'); };
  const deductStock = (items: { id: string; quantity: number }[]) => {
    setProducts(prev => prev.map(p => {
      const item = items.find(i => i.id === p.id);
      return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
    }));
  };
  const addLead = (l: Lead) => { setLeads(prev => [l, ...prev]); logAction('New Lead', `Captured: ${l.companyName}`, 'CRM'); };
  const updateLeadStatus = (id: string, status: Lead['status']) => setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  const deleteLead = (id: string) => setLeads(prev => prev.filter(l => l.id !== id));
  const addInvoice = (inv: Invoice) => { setInvoices(prev => [inv, ...prev]); logAction('Billing', `Generated: ${inv.id}`, 'FINANCE'); };
  const updateInvoicePayment = (id: string, amount: number) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const newPaid = inv.paidAmount + amount;
        return { ...inv, paidAmount: newPaid, status: newPaid >= inv.amount ? 'Paid' : 'Partial', history: [...inv.history, { date: new Date().toLocaleDateString(), amount, note: 'Partial Payment' }] };
      }
      return inv;
    }));
  };
  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...data } : inv));
    logAction('Billing', `Updated Invoice ${id}`, 'FINANCE');
  };
  const deleteInvoice = (id: string) => setInvoices(prev => prev.filter(inv => inv.id !== id));
  const addEmployee = (emp: Employee) => { setEmployees(prev => [emp, ...prev]); logAction('HR', `Onboarded ${emp.name}`, 'HR'); };
  const addInventoryItem = (item: InventoryItem) => { setInventory(prev => [item, ...prev]); logAction('Stock', `Added: ${item.name}`, 'ERP'); };
  const updateInventoryStock = (id: string, qty: number) => setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  const deleteInventoryItem = (id: string) => setInventory(prev => prev.filter(i => i.id !== id));
  const addCustomer = (c: Customer) => setCustomers(prev => [...prev, c]);
  const updateCustomer = (id: string, data: Partial<Customer>) => setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const addTeamMessage = (msg: ChatMessage) => setTeamMessages(prev => [...prev, msg]);
  const addTeamChannel = (channel: Channel) => setTeamChannels(prev => [...prev, channel]);

  return (
    <GlobalContext.Provider value={{
      currency, setCurrency, formatCurrency,
      salesToday, addSale, activities, addActivity, projects, addProject, deleteProject,
      userRoles, addRole, currentUser, setCurrentUser,
      isShiftOpen, startShift, closeShift,
      products, deductStock,
      leads, addLead, updateLeadStatus, deleteLead,
      notifications, markNotificationRead,
      invoices, addInvoice, updateInvoicePayment, updateInvoice, deleteInvoice,
      employees, addEmployee, policies,
      inventory, addInventoryItem, updateInventoryStock, deleteInventoryItem,
      systemLogs, logAction,
      customers, addCustomer, updateCustomer,
      teamMessages, addTeamMessage, teamChannels, addTeamChannel
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobal must be used within a GlobalProvider');
  return context;
};
