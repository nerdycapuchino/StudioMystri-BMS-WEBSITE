
import React, { useState, useEffect } from 'react';
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
import { Customers } from './components/Customers';
import { Integrations } from './components/Integrations';
import { ActivityLog } from './components/ActivityLog';
import { TeamHub } from './components/TeamHub';
import { AppModule } from './types';
import { Menu, MenuSquare, LogOut, ChevronRight, LayoutDashboard, Store, Users, Briefcase, Box, Wallet, BadgeCheck, MessageSquare, Truck, ClipboardList, Settings, UserCircle, Contact } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, setCurrentUser, currency, setCurrency, userRoles } = useGlobal();
  const [activeModule, setActiveModule] = useState<AppModule>(AppModule.DASHBOARD);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!currentUser) return <Login />;

  const userRoleObj = userRoles.find(r => r.id === currentUser.roleId);
  const allowedModules = userRoleObj?.allowedModules || [AppModule.DASHBOARD];

  const allNavItems = [
    { id: AppModule.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppModule.POS, label: 'Store POS', icon: Store },
    { id: AppModule.CRM, label: 'CRM Leads', icon: Users },
    { id: AppModule.CUSTOMERS, label: 'Customers', icon: Contact },
    { id: AppModule.PROJECTS, label: 'Projects', icon: Briefcase },
    { id: AppModule.WAREHOUSE, label: 'Inventory', icon: Box },
    { id: AppModule.FINANCE, label: 'Finance', icon: Wallet },
    { id: AppModule.HR, label: 'HR & Roles', icon: BadgeCheck },
    { id: AppModule.TEAM, label: 'Team Hub', icon: MessageSquare },
    { id: AppModule.LOGISTICS, label: 'Logistics', icon: Truck },
    { id: AppModule.ACTIVITY, label: 'Audit Logs', icon: ClipboardList },
    { id: AppModule.ADMIN, label: 'Admin', icon: Settings },
  ];

  const navItems = allNavItems.filter(item => allowedModules.includes(item.id));

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
      default: return <Dashboard changeModule={setActiveModule} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background-dark text-zinc-100 overflow-hidden font-display">
      {/* Sidebar Rail / Expandable Drawer */}
      <aside 
        className={`
          flex flex-col h-full bg-surface-darker border-r border-white/5 transition-all duration-300 ease-in-out z-[100]
          ${isMobile 
            ? (sidebarExpanded ? 'w-72 fixed inset-y-0 left-0 translate-x-0' : 'w-0 fixed inset-y-0 left-0 -translate-x-full') 
            : (sidebarExpanded ? 'w-72' : 'w-20')}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center h-20 border-b border-white/5 justify-between md:justify-center overflow-hidden shrink-0">
           <div className={`flex items-center gap-3 transition-all duration-300 ${sidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 md:hidden'}`}>
             <div className="bg-primary size-10 rounded-full flex items-center justify-center text-black font-black shadow-glow">M</div>
             <span className="font-black text-xl tracking-tighter">MYSTRI</span>
           </div>
           <button 
             onClick={() => setSidebarExpanded(!sidebarExpanded)} 
             className={`p-2.5 hover:bg-white/5 rounded-full text-primary transition-transform active:scale-90 ${!sidebarExpanded && !isMobile ? 'translate-x-0' : ''}`}
           >
             {sidebarExpanded ? <MenuSquare className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
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
                  w-full flex items-center gap-4 px-6 py-4 transition-all hover:bg-white/5 group relative
                  ${activeModule === item.id ? 'text-primary' : 'text-zinc-500 hover:text-white'}
                `}
                title={!sidebarExpanded ? item.label : ''}
             >
                <item.icon className={`w-6 h-6 transition-transform group-active:scale-90 ${activeModule === item.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className={`
                  text-sm font-bold whitespace-nowrap transition-all duration-300
                  ${sidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none absolute'}
                `}>
                  {item.label}
                </span>
                {activeModule === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-glow" />
                )}
             </button>
           ))}
        </nav>

        {/* Global Controls & User Profile */}
        <div className="p-4 border-t border-white/5 space-y-4 shrink-0 bg-[#090e0b]">
           {/* Currency Toggles */}
           <div className={`bg-black/40 p-1 rounded-xl flex gap-1 ${!sidebarExpanded ? 'flex-col' : 'flex-row'}`}>
             <button onClick={() => setCurrency('INR')} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${currency === 'INR' ? 'bg-primary text-black' : 'text-zinc-600 hover:text-zinc-400'}`}>₹</button>
             <button onClick={() => setCurrency('USD')} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${currency === 'USD' ? 'bg-primary text-black' : 'text-zinc-600 hover:text-zinc-400'}`}>$</button>
           </div>
           
           {/* User Profile with Hover Details */}
           <div className="relative group">
              <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors ${!sidebarExpanded ? 'justify-center' : ''}`}>
                 <div className="size-10 rounded-full bg-surface-highlight border border-white/10 flex items-center justify-center text-primary font-bold shadow-inner">
                    {currentUser.name.substring(0,2).toUpperCase()}
                 </div>
                 {sidebarExpanded && (
                    <div className="overflow-hidden">
                       <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                       <p className="text-[10px] text-zinc-500 truncate">{currentUser.role || 'Staff'}</p>
                    </div>
                 )}
              </div>
              
              {/* Profile Hover Tooltip */}
              <div className={`
                 absolute left-full bottom-0 ml-3 w-64 bg-surface-dark border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-[200]
                 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 translate-x-2 group-hover:translate-x-0
              `}>
                 <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
                    <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-lg border border-primary/20">
                       {currentUser.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                       <p className="font-bold text-white">{currentUser.name}</p>
                       <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{currentUser.role}</p>
                    </div>
                 </div>
                 <p className="text-xs text-zinc-400 font-mono mb-4 break-all">{currentUser.email}</p>
                 <button 
                   onClick={() => setCurrentUser(null)} 
                   className="w-full py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                 >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                 </button>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative bg-[#0b100d]">
         {/* Mobile Header Bar */}
         {isMobile && (
            <header className="h-16 flex items-center px-4 border-b border-white/5 bg-surface-dark shrink-0 z-50">
               <button onClick={() => setSidebarExpanded(true)} className="p-2 text-primary">
                  <Menu className="w-6 h-6" />
               </button>
               <span className="ml-4 font-black tracking-tighter text-lg uppercase">{activeModule}</span>
            </header>
         )}

         {/* Backdrop for Mobile Sidebar */}
         {isMobile && sidebarExpanded && (
           <div 
             className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]"
             onClick={() => setSidebarExpanded(false)}
           />
         )}

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
