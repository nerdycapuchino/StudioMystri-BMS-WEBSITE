import React, { useState } from 'react';
import { GlobalProvider, useGlobal } from './context/GlobalContext';
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
import { Integrations } from './components/Integrations';
import { ActivityLog } from './components/ActivityLog';
import { AppModule, Notification } from './types';
import { LayoutDashboard, ShoppingCart, Users, HardHat, Truck, Settings, Share2, LogOut, Bell, DollarSign, UserCheck, X, FileText, Menu, ChevronLeft, ChevronRight, Package, Box } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { userRole, setUserRole, notifications, markNotificationRead, currency, setCurrency } = useGlobal();
  const [activeModule, setActiveModule] = useState<AppModule>(AppModule.DASHBOARD);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!userRole) {
     return <Login />;
  }

  // RBAC Filtering
  const allNavItems = [
    { id: AppModule.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Architect', 'Sales'] },
    { id: AppModule.POS, label: 'Point of Sale', icon: ShoppingCart, roles: ['Super Admin', 'Sales'] },
    { id: AppModule.CRM, label: 'CRM & Sales', icon: Users, roles: ['Super Admin', 'Sales'] },
    { id: AppModule.FINANCE, label: 'Finance', icon: DollarSign, roles: ['Super Admin'] },
    { id: AppModule.HR, label: 'HR & Team', icon: UserCheck, roles: ['Super Admin'] },
    { id: AppModule.WAREHOUSE, label: 'Warehouse', icon: Box, roles: ['Super Admin', 'Logistics', 'Architect'] },
    { id: AppModule.PROJECTS, label: 'Projects', icon: HardHat, roles: ['Super Admin', 'Architect'] },
    { id: AppModule.LOGISTICS, label: 'Logistics', icon: Truck, roles: ['Super Admin', 'Sales', 'Logistics'] },
    { id: AppModule.ACTIVITY, label: 'Activity Logs', icon: FileText, roles: ['Super Admin'] },
    { id: AppModule.ADMIN, label: 'Admin & RBAC', icon: Settings, roles: ['Super Admin'] },
    { id: AppModule.BRIDGE, label: 'Integrations', icon: Share2, roles: ['Super Admin'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (n: Notification) => {
    markNotificationRead(n.id);
    setShowNotifications(false);
    
    // Deep Linking Logic
    if (n.type === 'order') setActiveModule(AppModule.POS);
    else if (n.type === 'lead') setActiveModule(AppModule.CRM);
    else if (n.message.includes('stock')) setActiveModule(AppModule.WAREHOUSE);
  };

  const renderModule = () => {
    switch (activeModule) {
      case AppModule.DASHBOARD: return <Dashboard />;
      case AppModule.POS: return <POS />;
      case AppModule.CRM: return <CRM />;
      case AppModule.FINANCE: return <Finance />;
      case AppModule.HR: return <HR />;
      case AppModule.WAREHOUSE: return <Warehouse />;
      case AppModule.PROJECTS: return <Projects />;
      case AppModule.LOGISTICS: return <Logistics />;
      case AppModule.ACTIVITY: return <ActivityLog />;
      case AppModule.ADMIN: return <Admin />;
      case AppModule.BRIDGE: return <Integrations />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative bg-slate-900 text-slate-300 flex flex-col shadow-xl z-40 h-full transition-all duration-300 ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'} ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <div className={`p-6 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">M</div>
            {!isCollapsed && (
              <div>
                <h1 className="text-white font-bold text-lg tracking-tight">Studio Mystri</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Enterprise BMS</p>
              </div>
            )}
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400"><X className="w-6 h-6" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveModule(item.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                activeModule === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                  : 'hover:bg-slate-800 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className={`w-5 h-5 transition-colors ${activeModule === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setUserRole(null)}
            className={`flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors w-full rounded-lg hover:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex mt-4 w-full items-center justify-center p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              {navItems.find(n => n.id === activeModule)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
             <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button 
                  onClick={() => setCurrency('INR')} 
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${currency === 'INR' ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`}
                >INR</button>
                <button 
                  onClick={() => setCurrency('USD')} 
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${currency === 'USD' ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`}
                >USD</button>
             </div>

             <div className="relative">
               <button 
                 onClick={() => setShowNotifications(!showNotifications)}
                 className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}
               >
                 <Bell className="w-5 h-5" />
                 {unreadCount > 0 && (
                   <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                 )}
               </button>

               {/* Notifications Dropdown */}
               {showNotifications && (
                 <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                       <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                       <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                       {notifications.length === 0 ? (
                         <div className="p-4 text-center text-slate-400 text-sm">No new notifications</div>
                       ) : (
                         notifications.map(n => (
                           <div 
                             key={n.id} 
                             onClick={() => handleNotificationClick(n)}
                             className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-indigo-50/50' : ''}`}
                           >
                              <div className="flex justify-between items-start mb-1">
                                 <h4 className={`text-sm ${!n.read ? 'font-bold text-indigo-900' : 'font-medium text-slate-700'}`}>{n.title}</h4>
                                 <span className="text-[10px] text-slate-400">{n.time}</span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                           </div>
                         ))
                       )}
                    </div>
                 </div>
               )}
             </div>

             <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
               <div className="text-right hidden md:block leading-tight">
                 <p className="text-sm font-bold text-slate-800">{userRole}</p>
                 <p className="text-[10px] text-slate-500 font-medium tracking-wide">ONLINE</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-md">
                 {userRole?.charAt(0)}
               </div>
             </div>
          </div>
        </header>

        {/* Module Content */}
        <div className="flex-1 overflow-hidden p-4 md:p-6 bg-slate-50 relative">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <GlobalProvider>
      <MainLayout />
    </GlobalProvider>
  );
};

export default App;