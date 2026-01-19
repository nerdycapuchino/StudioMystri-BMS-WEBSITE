import React from 'react';
import { useGlobal } from '../context/GlobalContext';
import { MOCK_SHIPMENTS } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export const Dashboard: React.FC = () => {
  const { salesToday, projects, activities, inventory, updateInventoryStock, leads, currency, formatCurrency } = useGlobal();

  const lowStockItems = inventory.filter(i => i.quantity <= i.reorderLevel);
  const pendingShipments = MOCK_SHIPMENTS.filter(s => s.status === 'Pending').length;
  const newLeadsToday = leads.filter(l => l.status === 'New').length;
  
  // Chart Data
  const chartData = [
    { day: 'Jan', pos: 4000, web: 2400 },
    { day: 'Feb', pos: 3000, web: 1398 },
    { day: 'Mar', pos: 2000, web: 9800 },
    { day: 'Apr', pos: 2780, web: 3908 },
    { day: 'May', pos: 1890, web: 4800 },
    { day: 'Jun', pos: salesToday || 2390, web: 3800 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-[#0f1512]">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-background-dark/50 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-6 flex-1">
          <h2 className="text-white text-xl font-bold tracking-tight hidden sm:block">Command Center</h2>
          {/* Search */}
          <div className="flex items-center bg-surface-dark border border-white/5 rounded-full px-4 h-11 w-full max-w-md focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-inner">
            <span className="material-symbols-outlined text-zinc-500">search</span>
            <input class="bg-transparent border-none text-white placeholder-zinc-500 focus:ring-0 w-full ml-2 text-sm font-medium focus:outline-none" placeholder="Search orders, clients, stock..." type="text"/>
            <div className="flex gap-1 text-[10px] text-zinc-600 font-mono border border-white/5 px-1.5 py-0.5 rounded bg-white/5">
              <span>⌘</span><span>K</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2.5 rounded-full bg-surface-dark hover:bg-white/5 text-zinc-400 hover:text-white transition-colors border border-white/5">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2.5 size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(56,224,123,0.8)]"></span>
          </button>
          <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-white leading-tight group-hover:text-primary transition-colors">Alex Mystri</p>
              <p className="text-xs text-zinc-500">Lead Designer</p>
            </div>
            <div className="size-10 rounded-full bg-cover bg-center ring-2 ring-white/5 group-hover:ring-primary/50 transition-all bg-zinc-700 flex items-center justify-center text-white font-bold">
               AM
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 scroll-smooth">
          {/* KPI Section */}        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="relative overflow-hidden p-6 rounded-[2rem] bg-surface-dark border border-white/5 group hover:border-primary/20 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-primary">attach_money</span>
            </div>
            <p className="text-zinc-400 text-sm font-medium mb-1">Total Revenue</p>
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(salesToday)}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-0.5 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> 12%
              </span>
              <span className="text-xs text-zinc-500">vs last month</span>
            </div>
          </div>

          <div className="relative overflow-hidden p-6 rounded-[2rem] bg-surface-dark border border-white/5 group hover:border-primary/20 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-white">work</span>
            </div>
            <p className="text-zinc-400 text-sm font-medium mb-1">Active Projects</p>
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-3xl font-bold text-white tracking-tight">{projects.length}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-0.5 text-xs font-bold text-zinc-300 bg-white/5 px-2 py-0.5 rounded-full">High Priority</span>
            </div>
          </div>

          <div className="relative overflow-hidden p-6 rounded-[2rem] bg-surface-dark border border-white/5 group hover:border-primary/20 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-white">local_shipping</span>
            </div>
            <p className="text-zinc-400 text-sm font-medium mb-1">Pending Shipments</p>
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-3xl font-bold text-white tracking-tight">{pendingShipments}</h3>
              <span class="text-sm font-medium text-zinc-500">units</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Next dispatch: <span className="text-white">Today, 4PM</span></span>
            </div>
          </div>

          <div className="relative overflow-hidden p-6 rounded-[2rem] bg-surface-dark border border-white/5 group hover:border-primary/20 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-primary">person_add</span>
            </div>
            <p className="text-zinc-400 text-sm font-medium mb-1">New Leads</p>
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-3xl font-bold text-white tracking-tight">{newLeadsToday}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-0.5 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> 5%
              </span>
              <span className="text-xs text-zinc-500">this week</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 p-6 md:p-8 rounded-[2rem] bg-surface-dark border border-white/5 flex flex-col h-[420px]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Middle Section: Chart & Alerts */}                <h3 className="text-white text-lg font-bold">Revenue Trends</h3>
                <p className="text-zinc-500 text-sm">POS vs Web Sales • Last 6 Months</p>
              </div>
              <div className="flex items-center gap-2 bg-background-dark/50 p-1 rounded-full border border-white/5">
                <button className="px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold shadow-sm">6 Months</button>
                <button className="px-4 py-1.5 rounded-full text-zinc-400 hover:text-white text-xs font-bold transition-colors">YTD</button>
              </div>
            </div>
            <div className="flex-1 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#38e07b" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#38e07b" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#1a261e', borderRadius: '12px', border: '1px solid #38e07b30' }}
                        itemStyle={{ color: '#fff' }}
                     />
                     <Area type="monotone" dataKey="pos" stroke="#38e07b" strokeWidth={3} fillOpacity={1} fill="url(#colorPos)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-[2rem] bg-[#2a1515] border border-red-500/20 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 size-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="bg-red-500/10 p-3 rounded-full text-red-400 shrink-0">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-base mb-1">Low Stock Alert</h4>
                  {lowStockItems.length > 0 ? (
                     <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                        <span className="text-white font-semibold">{lowStockItems[0].name}</span> stock is critically low.
                        Only <span className="text-red-400 font-bold">{lowStockItems[0].quantity}</span> remaining.
                     </p>
                  ) : (
                     <p className="text-zinc-400 text-sm mb-4 leading-relaxed">All inventory levels are healthy.</p>
                  )}
                  <button className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 px-4 rounded-full transition-colors">
                    Restock Now
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 rounded-[2rem] bg-surface-dark border border-white/5 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg font-bold">System Logs</h3>
                <button className="text-primary text-xs font-bold hover:underline">View All</button>
              </div>
              <div className="space-y-0 relative">
                <div className="absolute left-[19px] top-2 bottom-4 w-[2px] bg-white/5"></div>
                {activities.slice(0, 4).map((act, i) => (
                   <div key={act.id} className="flex gap-4 relative pb-6 last:pb-0">
                      <div className={`size-2.5 rounded-full mt-1.5 ring-4 ring-surface-dark z-10 shrink-0 ml-4 ${
                         act.type === 'sale' ? 'bg-primary' : act.type === 'alert' ? 'bg-red-500' : 'bg-zinc-600'
                      }`}></div>
                      <div>
                         <p className="text-white text-sm font-medium">{act.message}</p>
                         <p className="text-zinc-500 text-xs mt-0.5">{act.timestamp}</p>
                      </div>
                   </div>
                ))}
              </div>
            </div>
          </div>
        </section>

          {/* Bottom Section: Project Health */}        <section className="rounded-[2rem] bg-surface-dark border border-white/5 overflow-hidden">
          <div className="p-6 md:px-8 md:py-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">construction</span>
              <h3 className="text-white text-lg font-bold">Project Health</h3>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-500 text-[18px]">filter_list</span>
                <select className="bg-background-dark border border-white/10 text-white text-sm rounded-full pl-9 pr-8 py-2 focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer">
                  <option>All Projects</option>
                  <option>In Production</option>
                  <option>Polishing</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="hidden md:flex items-center px-8 py-3 bg-white/5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <div className="w-1/3">Project Details</div>
              <div className="w-1/6">Client</div>
              <div className="w-1/6">Status</div>
              <div className="w-1/4">Progress</div>
              <div className="w-20 text-right">Action</div>
            </div>
            {projects.map(p => (
               <div key={p.id} className="flex flex-col md:flex-row md:items-center px-6 md:px-8 py-4 border-b border-white/5 hover:bg-white/5 transition-colors gap-4 md:gap-0">
                  <div className="w-full md:w-1/3 flex items-center gap-4">
                     <div className="size-12 rounded-xl bg-surface-dark-lighter border border-white/5 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-zinc-500">work</span>
                     </div>
                     <div>
                        <p className="text-white text-base font-bold">{p.name}</p>
                        <p className="text-zinc-500 text-xs">Due: {p.dueDate}</p>
                     </div>
                  </div>
                  <div className="w-full md:w-1/6 flex md:block items-center justify-between">
                     <span className="md:hidden text-zinc-500 text-sm">Client:</span>
                     <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">{p.client.charAt(0)}</div>
                        <span className="text-zinc-300 text-sm font-medium">{p.client}</span>
                     </div>
                  </div>
                  <div className="w-full md:w-1/6 flex md:block items-center justify-between">
                     <span className="md:hidden text-zinc-500 text-sm">Status:</span>
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${p.currentStage === 'Handover' ? 'bg-primary/20 text-primary border-primary/20' : 'bg-bronze/20 text-bronze border-bronze/20'}`}>
                        {p.currentStage}
                     </span>
                  </div>
                  <div className="w-full md:w-1/4 flex flex-col justify-center gap-1.5">
                     <div className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-400">Completion</span>
                        <span className="text-white">{p.progress}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-surface-dark-lighter rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{width: `${p.progress}%`}}></div>
                     </div>
                  </div>
                  <div className="w-full md:w-20 flex justify-end">
                     <button className="text-zinc-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                     </button>
                  </div>
               </div>
            ))}
          </div>
        </section>
        <div className="h-4"></div>
      </div>
    </div>
  );
};
