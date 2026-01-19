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
import { TeamHub } from './components/TeamHub';
import { AppModule, Notification } from './types';

const MainLayout: React.FC = () => {
  const { userRole, setUserRole, notifications, markNotificationRead, currency, setCurrency } = useGlobal();
  const [activeModule, setActiveModule] = useState<AppModule>(AppModule.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!userRole) {
     return <Login />;
  }

  // RBAC Filtering & Icon Mapping (Material Symbols)
  const allNavItems = [
    { id: AppModule.DASHBOARD, label: 'Dashboard', icon: 'dashboard', roles: ['Super Admin', 'Architect', 'Sales'] },
    { id: AppModule.POS, label: 'Point of Sale', icon: 'point_of_sale', roles: ['Super Admin', 'Sales'] },
    { id: AppModule.CRM, label: 'CRM & Leads', icon: 'group', roles: ['Super Admin', 'Sales'] },
    { id: AppModule.PROJECTS, label: 'Projects', icon: 'work', roles: ['Super Admin', 'Architect'] },
    { id: AppModule.WAREHOUSE, label: 'Inventory', icon: 'inventory_2', roles: ['Super Admin', 'Logistics', 'Architect'] },
    { id: AppModule.FINANCE, label: 'Finance', icon: 'payments', roles: ['Super Admin'] },
    { id: AppModule.HR, label: 'HR Directory', icon: 'check_circle', roles: ['Super Admin'] },
    { id: AppModule.TEAM, label: 'Team Hub', icon: 'forum', roles: ['Super Admin', 'Architect', 'Sales', 'Logistics', 'HR', 'Finance'] },
    { id: AppModule.LOGISTICS, label: 'Logistics', icon: 'local_shipping', roles: ['Super Admin', 'Sales', 'Logistics'] },
    { id: AppModule.ACTIVITY, label: 'Activity Logs', icon: 'history', roles: ['Super Admin'] },
    { id: AppModule.ADMIN, label: 'Admin', icon: 'settings', roles: ['Super Admin'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

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
      case AppModule.TEAM: return <TeamHub />;
      case AppModule.ACTIVITY: return <ActivityLog />;
      case AppModule.ADMIN: return <Admin />;
      case AppModule.BRIDGE: return <Integrations />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark text-zinc-100 font-display">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 flex flex-col w-72 h-full border-r border-white/5 bg-background-dark shrink-0 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 pb-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-gradient-to-br from-primary to-[#1a2c22] aspect-square rounded-full size-12 flex items-center justify-center shadow-[0_0_15px_rgba(56,224,123,0.3)]">
              <span className="material-symbols-outlined text-[#122017] text-3xl">chair</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-lg font-bold leading-tight tracking-wide">Studio Mystri</h1>
              <p className="text-primary/70 text-xs font-medium tracking-widest uppercase">Luxury BMS</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            {navItems.map(item => {
              const isActive = activeModule === item.id;
              return (
                <div 
                  key={item.id}
                  onClick={() => { setActiveModule(item.id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full cursor-pointer transition-all active:scale-95 group ${isActive ? 'bg-primary text-background-dark shadow-[0_0_20px_rgba(56,224,123,0.2)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <span className={`material-symbols-outlined ${isActive ? 'filled' : 'group-hover:text-primary transition-colors'}`}>{item.icon}</span>
                  <p className={`text-sm font-medium leading-normal ${isActive ? 'font-bold' : ''}`}>{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-auto p-6 pt-0">
          <div className="w-full h-[1px] bg-white/5 mb-4"></div>
          <div 
            onClick={() => setUserRole(null)}
            className="flex items-center gap-3 px-4 py-3 rounded-full text-zinc-400 hover:bg-white/5 hover:text-red-400 cursor-pointer transition-colors group"
          >
            <span className="material-symbols-outlined group-hover:text-red-400 transition-colors">logout</span>
            <p className="text-sm font-medium leading-normal">Sign Out</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
        {/* Mobile Header Overlay */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-white/5 bg-background-dark/50 backdrop-blur-md z-30">
           <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="text-white"><span className="material-symbols-outlined">menu</span></button>
              <h2 className="text-white font-bold">Studio Mystri</h2>
           </div>
           <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
              {userRole?.charAt(0)}
           </div>
        </div>

        {/* Dynamic Module Content */}
        <div className="flex-1 overflow-hidden relative">
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