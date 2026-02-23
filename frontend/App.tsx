import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { CRM } from './components/CRM';
import { Projects } from './components/Projects';
import { Logistics } from './components/Logistics';
import { Warehouse } from './components/Warehouse';
import { Admin } from './components/Admin';
import { Finance } from './components/Finance';
import { HR } from './components/HR';
import { Customers } from './components/Customers';
import { Integrations } from './components/Integrations';
import { ActivityLog } from './components/ActivityLog';
import { TeamHub } from './components/TeamHub';
import { InvoiceGenerator } from './components/InvoiceGenerator';
import { Scanner } from './components/Scanner';
import { GlobalSearch } from './components/GlobalSearch';
import { ERP } from './components/ERP';
import { Marketing } from './components/Marketing';
import { TaskManager } from './components/TaskManager';
import { PageLoader } from './components/ui/Skeleton';
import { useUnreadCount } from './hooks/useNotifications';
import { AppModule } from './types';
import { Menu, MenuSquare, LogOut, LayoutDashboard, Store, Users, Briefcase, Box, Wallet, BadgeCheck, MessageSquare, Truck, ClipboardList, Settings, Contact, Receipt, ScanLine, Megaphone, GanttChart, ListTodo, Bell } from 'lucide-react';
import { getSocket } from './services/socket';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAppSocketEvents } from './hooks/useAppSocketEvents';

const MainLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeModule, setActiveModule] = useState<AppModule>(AppModule.DASHBOARD);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currency, setCurrency] = useState<'INR' | 'USD'>(() => (localStorage.getItem('currency') as 'INR' | 'USD') || 'INR');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: unreadCount } = useUnreadCount();
  const qc = useQueryClient();

  // Global real-time sync for orders, inventory, ERP, and settings
  useAppSocketEvents(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    let socket: ReturnType<typeof getSocket> | null = null;
    try {
      socket = getSocket();
    } catch {
      return;
    }
    if (!socket) return;

    if (socket.connected) {
      socket.emit('notifications:ping');
    }

    socket.on('notifications:count', ({ unread }: { unread: number }) => {
      qc.setQueryData(['notifications', 'unread'], unread);
    });

    socket.on('notification:new', (notification: any) => {
      qc.setQueryData(['notifications', undefined], (old: any) => ({
        ...old,
        data: [notification, ...(old?.data || [])]
      }));
      toast(notification?.title || 'New notification', { icon: '🔔' });
    });

    return () => {
      socket?.off('notifications:count');
      socket?.off('notification:new');
    };
  }, [isAuthenticated, qc]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated || !user) return <Login />;

  const allNavItems = [
    { id: AppModule.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppModule.POS, label: 'Store POS', icon: Store },
    { id: AppModule.SCANNER, label: 'Scanner', icon: ScanLine },
    { id: AppModule.INVOICE_GEN, label: 'Invoice Gen', icon: Receipt },
    { id: AppModule.CRM, label: 'CRM Leads', icon: Users },
    { id: AppModule.CUSTOMERS, label: 'Customers', icon: Contact },
    { id: AppModule.PROJECTS, label: 'Projects', icon: Briefcase },
    { id: AppModule.WAREHOUSE, label: 'Inventory', icon: Box },
    { id: AppModule.ERP, label: 'ERP', icon: GanttChart },
    { id: AppModule.FINANCE, label: 'Finance', icon: Wallet },
    { id: AppModule.HR, label: 'HR & Roles', icon: BadgeCheck },
    { id: AppModule.TEAM, label: 'Team Hub', icon: MessageSquare },
    { id: AppModule.LOGISTICS, label: 'Logistics', icon: Truck },
    { id: AppModule.MARKETING, label: 'Marketing', icon: Megaphone },
    { id: AppModule.TASKS_MANAGER, label: 'Tasks', icon: ListTodo },
    { id: AppModule.ACTIVITY, label: 'Audit Logs', icon: ClipboardList },
    { id: AppModule.ADMIN, label: 'Admin', icon: Settings },
  ];

  const navItems = allNavItems;

  const renderModule = () => {
    switch (activeModule) {
      case AppModule.DASHBOARD: return <Dashboard changeModule={setActiveModule} />;
      case AppModule.POS: return <POS />;
      case AppModule.CRM: return <CRM />;
      case AppModule.CUSTOMERS: return <Customers />;
      case AppModule.FINANCE: return <Finance />;
      case AppModule.HR: return <HR />;
      case AppModule.WAREHOUSE: return <Warehouse />;
      case AppModule.PROJECTS: return <Projects />;
      case AppModule.LOGISTICS: return <Logistics />;
      case AppModule.TEAM: return <TeamHub />;
      case AppModule.ACTIVITY: return <ActivityLog />;
      case AppModule.ADMIN: return <Admin />;
      case AppModule.INVOICE_GEN: return <InvoiceGenerator />;
      case AppModule.SCANNER: return <Scanner />;
      case AppModule.ERP: return <ERP />;
      case AppModule.MARKETING: return <Marketing />;
      case AppModule.TASKS_MANAGER: return <TaskManager />;
      default: return <Dashboard changeModule={setActiveModule} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 overflow-hidden font-display">
      {/* Sidebar Rail / Expandable Drawer */}
      <aside
        className={`
          flex flex-col h-full bg-white/80 backdrop-blur-xl border-r border-slate-200/60 transition-all duration-300 ease-in-out z-[100] shadow-lg shadow-slate-200/50
          ${isMobile
            ? (sidebarExpanded ? 'w-72 fixed inset-y-0 left-0 translate-x-0' : 'w-0 fixed inset-y-0 left-0 -translate-x-full')
            : (sidebarExpanded ? 'w-64' : 'w-20')}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center h-20 border-b border-slate-200/60 justify-between md:justify-center overflow-hidden shrink-0">
          <div className={`flex items-center gap-3 transition-all duration-300 ${sidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 hidden'}`}>
            <div className="size-8 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-sm">
              <img src="https://via.placeholder.com/100/667eea/ffffff?text=L" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-lg tracking-tighter whitespace-nowrap text-slate-800">MYSTRI</span>
          </div>
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={`p-2.5 hover:bg-slate-100 rounded-full text-primary transition-transform active:scale-90 ${!sidebarExpanded && !isMobile ? 'translate-x-0' : ''}`}
          >
            {sidebarExpanded ? <MenuSquare className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-4 custom-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                if (isMobile) setSidebarExpanded(false);
              }}
              className={`
                  w-full flex items-center gap-4 px-6 py-3.5 transition-all hover:bg-primary-50 group relative
                  ${activeModule === item.id ? 'text-primary bg-primary-50' : 'text-slate-500 hover:text-slate-800'}
                `}
              title={!sidebarExpanded ? item.label : ''}
            >
              <item.icon className={`w-5 h-5 transition-transform group-active:scale-90 ${activeModule === item.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className={`
                  text-sm font-bold whitespace-nowrap transition-all duration-300
                  ${sidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none absolute'}
                `}>
                {item.label}
              </span>
              {activeModule === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-glow" />
              )}
            </button>
          ))}
        </nav>

        {/* Global Controls & User Profile */}
        <div className="p-4 border-t border-slate-200/60 space-y-4 shrink-0 bg-slate-50/80">
          {/* Notification Badge */}
          {sidebarExpanded && (
            <button
              onClick={() => setActiveModule(AppModule.DASHBOARD)}
              className="w-full flex items-center gap-3 p-2 rounded-xl bg-white/80 border border-slate-200 hover:border-primary/30 transition-colors animate-fade-in shadow-sm"
            >
              <div className="relative">
                <Bell className="w-4 h-4 text-slate-500" />
                {typeof unreadCount === 'number' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-3.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-600">Notifications</span>
            </button>
          )}

          {/* Currency Toggles */}
          {sidebarExpanded && (
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 animate-fade-in">
              <button onClick={() => setCurrency('INR')} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${currency === 'INR' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>₹</button>
              <button onClick={() => setCurrency('USD')} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${currency === 'USD' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>$</button>
            </div>
          )}

          {/* User Profile */}
          {sidebarExpanded && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/80 border border-slate-200 overflow-hidden animate-fade-in shadow-sm">
              <div className="size-8 rounded-full bg-gradient-to-br from-primary to-secondary border border-white flex items-center justify-center text-white font-bold shadow-inner text-xs shrink-0">
                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.role || 'Staff'}</p>
              </div>
            </div>
          )}

          {/* Log Out Button */}
          <button
            onClick={logout}
            className={`w-full flex items-center gap-4 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors group ${!sidebarExpanded ? 'justify-center' : ''}`}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {sidebarExpanded && <span className="text-xs font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative bg-gradient-to-br from-slate-50/50 to-blue-50/50">
        {/* Mobile Header Bar */}
        {isMobile && (
          <header className="h-16 flex items-center px-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shrink-0 z-50 justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarExpanded(true)} className="p-2 text-primary">
                <Menu className="w-6 h-6" />
              </button>
              <span className="font-black tracking-tighter text-lg uppercase text-slate-800">{activeModule}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-500" />
                {typeof unreadCount === 'number' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-3.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </div>
              <div className="size-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-xs font-bold text-white border border-white shadow-sm">
                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
            </div>
          </header>
        )}

        {/* Backdrop for Mobile Sidebar */}
        {isMobile && sidebarExpanded && (
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[90]"
            onClick={() => setSidebarExpanded(false)}
          />
        )}

        <div className="flex-1 overflow-hidden relative">
          {renderModule()}
          <GlobalSearch onClose={() => setIsSearchOpen(false)} onChangeModule={setActiveModule} />
        </div>
      </main>
    </div>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-8">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-10 max-w-md text-center shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-4">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button onClick={() => window.location.reload()} className="btn-primary px-6 py-3 text-sm font-bold rounded-xl">
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
