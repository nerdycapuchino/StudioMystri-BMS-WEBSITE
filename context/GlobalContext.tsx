
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Activity, Lead, IntegrationStatus, Notification, Invoice, Employee, InventoryItem, Shipment, User, Order, SystemLog, Product, Customer, ChatMessage, Channel, AppModule, UserRole, CompanyPolicy, Task, CompanySettings, Campaign } from '../types';
import { MOCK_PROJECTS, MOCK_ACTIVITIES, MOCK_LEADS, MOCK_INTEGRATIONS, MOCK_NOTIFICATIONS, MOCK_INVOICES, MOCK_EMPLOYEES, MOCK_INVENTORY, MOCK_SHIPMENTS, MOCK_USERS, MOCK_ORDERS, MOCK_LOGS, MOCK_PRODUCTS, MOCK_CUSTOMERS, MOCK_CAMPAIGNS } from '../constants';

interface GlobalContextType {
  currency: 'INR' | 'USD';
  setCurrency: (c: 'INR' | 'USD') => void;
  formatCurrency: (amount: number) => string;
  
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;

  salesToday: number;
  addSale: (amount: number, customerId?: string, items?: any[]) => void;
  activities: Activity[];
  addActivity: (message: string, type: Activity['type']) => void;
  
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  userRoles: UserRole[];
  addRole: (role: UserRole) => void;
  
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  isShiftOpen: boolean;
  startShift: (balance: string) => void;
  closeShift: () => void;

  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deductStock: (items: { id: string; quantity: number; sku?: string; name?: string; selectedVariant?: any }[]) => void; 

  leads: Lead[];
  addLead: (lead: Lead) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
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
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  policies: CompanyPolicy[];
  updatePolicy: (id: string, data: Partial<CompanyPolicy>) => void;
  
  inventory: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryStock: (id: string, qty: number) => void;
  deleteInventoryItem: (id: string) => void;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => void;
  manufactureProduct: (itemId: string, qty: number) => { success: boolean; message: string };
  
  systemLogs: SystemLog[];
  logAction: (action: string, details: string, module: string) => void;
  editLog: (id: string, newDetails: string) => void;

  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;

  shipments: Shipment[];
  addShipment: (s: Shipment) => void;
  updateShipment: (id: string, s: Partial<Shipment>) => void;

  users: User[];
  addUser: (u: User) => void;
  deleteUser: (id: string) => void;
  updateUserStatus: (id: string, status: 'Active' | 'Inactive') => void;

  teamMessages: ChatMessage[];
  addTeamMessage: (msg: ChatMessage) => void;
  teamChannels: Channel[];
  addTeamChannel: (channel: Channel) => void;

  tasks: Task[];
  addTask: (t: Task) => void;
  updateTask: (id: string, t: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  permissions: any[];
  updatePermission: (role: string, field: string, access: any) => void;

  campaigns: Campaign[];
  toggleCampaignStatus: (id: string) => void;

  integrations: IntegrationStatus[];
  toggleIntegration: (name: string) => void;
  syncIntegrations: () => Promise<void>;
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
  
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => getStoredJSON('companySettings', {
      name: 'Studio Mystri',
      address: '901 E and 901 F, Sakar -9, Ashram Road, Ahmedabad',
      gstNumber: '24AAJFE7254K1Z6',
      logoUrl: '',
      loginBackgroundUrl: '',
      email: 'admin@studiomystri.com',
      phone: '+91 98765 43210'
  }));

  const [salesToday, setSalesToday] = useState(() => Number(localStorage.getItem('salesToday')) || 12450);
  const [activities, setActivities] = useState<Activity[]>(() => getStoredJSON('activities', MOCK_ACTIVITIES));
  const [projects, setProjects] = useState<Project[]>(() => getStoredJSON('projects', MOCK_PROJECTS));
  
  const [userRoles, setUserRoles] = useState<UserRole[]>(() => getStoredJSON('userRoles', [
    { id: 'admin', name: 'Super Admin', description: 'Full access to all modules', allowedModules: Object.values(AppModule) },
    { id: 'sales', name: 'Sales Representative', description: 'Access to POS and CRM', allowedModules: [AppModule.DASHBOARD, AppModule.POS, AppModule.CRM, AppModule.TEAM, AppModule.CUSTOMERS] },
    { id: 'worker', name: 'Factory Worker', description: 'Access to Inventory and Team Hub', allowedModules: [AppModule.DASHBOARD, AppModule.WAREHOUSE, AppModule.TEAM] }
  ]));

  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredJSON('currentUser', null));
  const [users, setUsers] = useState<User[]>(() => getStoredJSON('users', MOCK_USERS));

  const [isShiftOpen, setIsShiftOpen] = useState(() => localStorage.getItem('isShiftOpen') === 'true');
  const [products, setProducts] = useState<Product[]>(() => getStoredJSON('products', MOCK_PRODUCTS));
  const [leads, setLeads] = useState<Lead[]>(() => getStoredJSON('leads', MOCK_LEADS));
  const [notifications, setNotifications] = useState<Notification[]>(() => getStoredJSON('notifications', MOCK_NOTIFICATIONS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStoredJSON('invoices', MOCK_INVOICES));
  const [employees, setEmployees] = useState<Employee[]>(() => getStoredJSON('employees', MOCK_EMPLOYEES));
  
  // Data Logic: Initialize Inventory with Finished Goods from POS if missing
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
      const stored = getStoredJSON('inventory', MOCK_INVENTORY) as InventoryItem[];
      // Sync logic: Add existing products to inventory if not present
      const existingIds = new Set(stored.map(i => i.id));
      const finishedGoods = MOCK_PRODUCTS.map(p => ({
          id: p.id,
          name: p.name,
          type: 'Finished Good' as const,
          quantity: p.stock,
          unit: 'pcs',
          reorderLevel: 2,
          cost: p.price * 0.6, // Estimated cost
          location: 'Showroom'
      })).filter(item => !existingIds.has(item.id));
      
      return [...stored, ...finishedGoods];
  });

  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => getStoredJSON('systemLogs', MOCK_LOGS));
  const [customers, setCustomers] = useState<Customer[]>(() => getStoredJSON('customers', MOCK_CUSTOMERS));
  const [shipments, setShipments] = useState<Shipment[]>(() => getStoredJSON('shipments', MOCK_SHIPMENTS));
  const [tasks, setTasks] = useState<Task[]>(() => getStoredJSON('tasks', []));
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => getStoredJSON('campaigns', MOCK_CAMPAIGNS));
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>(() => getStoredJSON('integrations', MOCK_INTEGRATIONS));

  // Policies (Mock Data)
  const [policies, setPolicies] = useState<CompanyPolicy[]>(() => getStoredJSON('policies', [
     { id: '1', title: 'Code of Conduct', category: 'Conduct', lastUpdated: '2023-10-01', size: '2.4 MB', content: 'Standard code of conduct content...' },
     { id: '2', title: 'Leave & Attendance Policy', category: 'Benefits', lastUpdated: '2023-11-15', size: '1.1 MB', content: 'Leave entitlement details...' },
     { id: '3', title: 'Workplace Safety Guidelines', category: 'Safety', lastUpdated: '2023-08-20', size: '3.5 MB', content: 'Safety protocols...' },
     { id: '4', title: 'IT & Data Security', category: 'General', lastUpdated: '2023-12-01', size: '1.8 MB', content: 'Data protection rules...' }
  ]));

  const [teamMessages, setTeamMessages] = useState<ChatMessage[]>(() => getStoredJSON('teamMessages', [
    { id: '1', channelId: 'general', sender: 'Vikram', content: 'Welcome to the team!', timestamp: '10:00 AM', avatar: 'V' }
  ]));
  const [teamChannels, setTeamChannels] = useState<Channel[]>(() => getStoredJSON('teamChannels', [
    { id: 'general', name: 'general', type: 'public' },
    { id: 'procurement', name: 'procurement', type: 'public' },
    { id: 'sales', name: 'sales-leads', type: 'private' }
  ]));

  const [permissions, setPermissions] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
    localStorage.setItem('companySettings', JSON.stringify(companySettings));
    localStorage.setItem('salesToday', salesToday.toString());
    localStorage.setItem('activities', JSON.stringify(activities));
    localStorage.setItem('projects', JSON.stringify(projects));
    localStorage.setItem('userRoles', JSON.stringify(userRoles));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('users', JSON.stringify(users));
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
    localStorage.setItem('shipments', JSON.stringify(shipments));
    localStorage.setItem('policies', JSON.stringify(policies));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('campaigns', JSON.stringify(campaigns));
    localStorage.setItem('integrations', JSON.stringify(integrations));
  }, [currency, companySettings, salesToday, activities, projects, userRoles, currentUser, users, isShiftOpen, leads, notifications, invoices, employees, inventory, products, customers, systemLogs, teamMessages, teamChannels, shipments, policies, tasks, campaigns, integrations]);

  const updateCompanySettings = (settings: Partial<CompanySettings>) => setCompanySettings(prev => ({ ...prev, ...settings }));

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

  const editLog = (id: string, newDetails: string) => {
    if (currentUser?.roleId !== 'admin') return; 
    setSystemLogs(prev => prev.map(log => {
      if (log.id === id) {
        return {
          ...log,
          details: newDetails,
          editHistory: [...(log.editHistory || []), { editedBy: currentUser.name, timestamp: new Date().toLocaleString(), oldDetails: log.details }]
        };
      }
      return log;
    }));
  };

  const addRole = (role: UserRole) => setUserRoles(prev => [...prev, role]);
  
  const addSale = (amount: number, customerId?: string, items?: any[]) => {
    setSalesToday(prev => prev + amount);
    if (customerId) {
        setCustomers(prev => prev.map(c => {
            if (c.id === customerId) {
                return {
                    ...c,
                    totalSpend: c.totalSpend + amount,
                    lastPurchase: new Date().toLocaleDateString(),
                    history: [...(c.history || []), {
                        id: `PUR-${Math.random().toString(36).substr(2, 6)}`,
                        date: new Date().toLocaleDateString(),
                        total: amount,
                        items: items?.map(i => i.name) || [],
                        source: 'POS'
                    }]
                };
            }
            return c;
        }));
    }
  };

  const addActivity = (message: string, type: Activity['type']) => setActivities(prev => [{ id: Math.random().toString(36).substr(2, 9), message, timestamp: new Date().toLocaleTimeString(), type }, ...prev]);
  
  const addProject = (project: Project) => { setProjects(prev => [project, ...prev]); logAction('Create Project', `Added ${project.name}`, 'PROJECTS'); };
  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };
  const deleteProject = (id: string) => setProjects(prev => prev.filter(p => p.id !== id));

  const startShift = (balance: string) => { setIsShiftOpen(true); logAction('Shift Start', `Opened register with ${balance}`, 'POS'); };
  const closeShift = () => { setIsShiftOpen(false); logAction('Shift End', 'Register closed', 'POS'); };
  
  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
    
    // Updated Logic: If product has variants, add each variant as a separate inventory item
    if (product.variants && product.variants.length > 0) {
        const variantItems: InventoryItem[] = product.variants.map(v => ({
            id: `${product.id}-${v.id}`, // Unique ID linking variant
            name: `${product.name} (${v.name})`, // Friendly Name
            type: 'Finished Good',
            quantity: v.stock,
            unit: 'pcs',
            reorderLevel: 5,
            cost: (product.cost || v.price * 0.6), // Use base cost or estimate
            location: 'Showroom'
        }));
        setInventory(prev => [...prev, ...variantItems]);
    } else {
        // Fallback for single products
        setInventory(prev => [...prev, {
            id: product.id,
            name: product.name,
            type: 'Finished Good',
            quantity: product.stock,
            unit: 'pcs',
            reorderLevel: 5,
            cost: product.cost || product.price * 0.6,
            location: 'Showroom'
        }]);
    }
    
    logAction('Inventory', `Added Product ${product.name}`, 'POS');
  };
  
  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    // Sync updates to Inventory (simplified, assumes 1-to-1 link for base products)
    setInventory(prev => prev.map(i => i.id === id ? { ...i, name: data.name || i.name, quantity: data.stock !== undefined ? data.stock : i.quantity } : i));
  };
  
  // FIXED: Deduct stock from BOTH Products list and Inventory Warehouse
  const deductStock = (items: { id: string; quantity: number; sku?: string; name?: string; selectedVariant?: any }[]) => {
    // 1. Update Products (POS View)
    setProducts(prev => prev.map(p => {
      const saleItem = items.find(i => i.id === p.id);
      
      if (saleItem) {
        if (saleItem.selectedVariant && p.variants) {
           // Update specific variant stock
           const updatedVariants = p.variants.map(v => 
             v.id === saleItem.selectedVariant.id ? { ...v, stock: Math.max(0, v.stock - saleItem.quantity) } : v
           );
           return { ...p, variants: updatedVariants };
        } else {
           // Update base stock
           return { ...p, stock: Math.max(0, p.stock - saleItem.quantity) };
        }
      }
      return p;
    }));

    // 2. Sync with Warehouse Inventory (ERP View)
    setInventory(prevInv => prevInv.map(invItem => {
       // Check for exact ID match (Variant ID) OR Product ID match
       const saleItem = items.find(i => {
           if (i.selectedVariant) {
               return invItem.id === `${i.id}-${i.selectedVariant.id}`;
           }
           return i.id === invItem.id;
       });

       if (saleItem) {
           return { ...invItem, quantity: Math.max(0, invItem.quantity - saleItem.quantity) };
       }
       return invItem;
    }));
  };

  const addLead = (l: Lead) => { 
      setLeads(prev => [l, ...prev]); 
      logAction('New Lead', `Captured: ${l.companyName}`, 'CRM'); 
  };
  
  const updateLead = (id: string, data: Partial<Lead>) => {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
      logAction('Update Lead', `Updated details for ${id}`, 'CRM');
  };

  const updateLeadStatus = (id: string, status: Lead['status']) => {
    setLeads(prev => prev.map(l => {
        if(l.id === id) {
            return { ...l, status };
        }
        return l;
    }));
  };
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
  const updateEmployee = (id: string, data: Partial<Employee>) => {
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
      logAction('HR', `Updated details for ${id}`, 'HR');
  };
  
  const updatePolicy = (id: string, data: Partial<CompanyPolicy>) => setPolicies(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));

  const addInventoryItem = (item: InventoryItem) => { setInventory(prev => [item, ...prev]); logAction('Stock', `Added: ${item.name}`, 'ERP'); };
  const updateInventoryStock = (id: string, qty: number) => setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  const updateInventoryItem = (id: string, data: Partial<InventoryItem>) => {
      setInventory(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
      // Also sync product price if item is linked to a product
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: data.quantity || p.stock, price: data.cost ? data.cost * 1.5 : p.price } : p));
  };
  const deleteInventoryItem = (id: string) => setInventory(prev => prev.filter(i => i.id !== id));
  
  // Production Logic
  const manufactureProduct = (itemId: string, qty: number): { success: boolean; message: string } => {
      const item = inventory.find(i => i.id === itemId);
      if (!item || !item.bom || item.bom.length === 0) return { success: false, message: 'Item has no BOM configured.' };

      // 1. Check raw material availability
      const materialsNeeded: { item: InventoryItem; needed: number }[] = [];
      
      for (const bomItem of item.bom) {
          const rawMaterial = inventory.find(i => i.name === bomItem.itemName); // Matching by name for now as BOM stores name
          if (!rawMaterial) return { success: false, message: `Raw material "${bomItem.itemName}" not found in inventory.` };
          
          const totalNeeded = bomItem.qty * qty;
          if (rawMaterial.quantity < totalNeeded) {
              return { success: false, message: `Insufficient stock for ${rawMaterial.name}. Need ${totalNeeded}, have ${rawMaterial.quantity}.` };
          }
          materialsNeeded.push({ item: rawMaterial, needed: totalNeeded });
      }

      // 2. Deduct Materials and Add Finished Good
      setInventory(prev => prev.map(invItem => {
          // Increase stock of finished good
          if (invItem.id === itemId) return { ...invItem, quantity: invItem.quantity + qty };
          
          // Decrease stock of raw materials
          const material = materialsNeeded.find(m => m.item.id === invItem.id);
          if (material) return { ...invItem, quantity: invItem.quantity - material.needed };
          
          return invItem;
      }));

      // Also update Product list for POS sync
      setProducts(prev => prev.map(p => p.id === itemId ? { ...p, stock: p.stock + qty } : p));

      logAction('Production', `Manufactured ${qty} units of ${item.name}`, 'WAREHOUSE');
      return { success: true, message: `Successfully produced ${qty} ${item.name}(s)` };
  };

  const addCustomer = (c: Customer) => setCustomers(prev => [...prev, c]);
  const updateCustomer = (id: string, data: Partial<Customer>) => setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  
  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const addTeamMessage = (msg: ChatMessage) => setTeamMessages(prev => [...prev, msg]);
  const addTeamChannel = (channel: Channel) => setTeamChannels(prev => [...prev, channel]);

  const addShipment = (s: Shipment) => setShipments(prev => [s, ...prev]);
  const updateShipment = (id: string, s: Partial<Shipment>) => setShipments(prev => prev.map(sh => sh.id === id ? { ...sh, ...s } : sh));

  const addUser = (u: User) => setUsers(prev => [...prev, u]);
  const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));
  const updateUserStatus = (id: string, status: 'Active' | 'Inactive') => setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));

  const addTask = (t: Task) => setTasks(prev => [...prev, t]);
  const updateTask = (id: string, t: Partial<Task>) => setTasks(prev => prev.map(task => task.id === id ? { ...task, ...t } : task));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const updatePermission = (role: string, field: string, access: any) => {
      const permId = `${role}-${field}`;
      setPermissions(prev => {
          const exists = prev.find(p => p.id === permId);
          if (exists) return prev.map(p => p.id === permId ? { ...p, access } : p);
          return [...prev, { id: permId, role, field, access }];
      });
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? 'Paused' : 'Active' } : c));
  };

  const toggleIntegration = (name: string) => {
      setIntegrations(prev => prev.map(i => i.name === name ? { ...i, status: i.status === 'Connected' ? 'Disconnected' : 'Connected' } : i));
  };

  const syncIntegrations = async () => {
      // Mock sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIntegrations(prev => prev.map(i => ({...i, lastSync: 'Just now'})));
  };

  return (
    <GlobalContext.Provider value={{
      currency, setCurrency, formatCurrency, companySettings, updateCompanySettings,
      salesToday, addSale, activities, addActivity, projects, addProject, updateProject, deleteProject,
      userRoles, addRole, currentUser, setCurrentUser,
      isShiftOpen, startShift, closeShift,
      products, addProduct, updateProduct, deductStock,
      leads, addLead, updateLead, updateLeadStatus, deleteLead,
      notifications, markNotificationRead,
      invoices, addInvoice, updateInvoicePayment, updateInvoice, deleteInvoice,
      employees, addEmployee, updateEmployee, policies, updatePolicy,
      inventory, addInventoryItem, updateInventoryStock, deleteInventoryItem, updateInventoryItem, manufactureProduct,
      systemLogs, logAction, editLog,
      customers, addCustomer, updateCustomer,
      teamMessages, addTeamMessage, teamChannels, addTeamChannel,
      shipments, addShipment, updateShipment,
      users, addUser, deleteUser, updateUserStatus,
      tasks, addTask, updateTask, deleteTask,
      permissions, updatePermission,
      campaigns, toggleCampaignStatus,
      integrations, toggleIntegration, syncIntegrations
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
