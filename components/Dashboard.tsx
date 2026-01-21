import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { AppModule } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export const Dashboard: React.FC<{ changeModule: (m: AppModule) => void }> = ({ changeModule }) => {
  const { salesToday, projects, activities, inventory, leads, formatCurrency, notifications, markNotificationRead } = useGlobal();
  const [showNotifications, setShowNotifications] = useState(false);

  const lowStockItems = inventory.filter(i => i.quantity <= i.reorderLevel);
  const chartData = [
    { day: 'Jan', pos: 4000 }, { day: 'Feb', pos: 3000 }, { day: 'Mar', pos: 2000 },
    { day: 'Apr', pos: 2780 }, { day: 'May', pos: 1890 }, { day: 'Jun', pos: salesToday || 2390 }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-background-dark/50 backdrop-blur-md z-10">
        <h2 className="text-white text-xl font-bold tracking-tight">Command Center</h2>
        <div className="flex items-center gap-4 relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2.5 rounded-full bg-surface-dark border border-white/5 text-zinc-400 hover:text-white">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {notifications.some(n => !n.read) && <span className="absolute top-2 right-2.5 size-2 bg-primary rounded-full animate-pulse shadow-glow"></span>}
          </button>
          
          {showNotifications && (
            <div className="absolute top-14 right-0 w-80 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold text-white text-sm">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-zinc-500 hover:text-white"><span className="material-symbols-outlined text-[16px]">close</span></button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? <div className="p-4 text-center text-zinc-500 text-xs">Clear</div> : 
                  notifications.map(n => (
                    <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${n.read ? 'opacity-50' : ''}`}>
                      <p className="text-white text-xs font-bold">{n.title}</p>
                      <p className="text-zinc-400 text-xs">{n.message}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          <div className="size-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold">VM</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-surface-dark border border-white/5">
            <p className="text-zinc-400 text-sm font-medium mb-1">Total Revenue</p>
            <h3 className="text-3xl font-bold text-white">{formatCurrency(salesToday)}</h3>
          </div>
          <div className="p-6 rounded-2xl bg-surface-dark border border-white/5">
            <p className="text-zinc-400 text-sm font-medium mb-1">Active Projects</p>
            <h3 className="text-3xl font-bold text-white">{projects.length}</h3>
          </div>
          <div className="p-6 rounded-2xl bg-surface-dark border border-white/5">
            <p className="text-zinc-400 text-sm font-medium mb-1">Low Stock SKU</p>
            <h3 className="text-3xl font-bold text-amber-500">{lowStockItems.length}</h3>
          </div>
          <div className="p-6 rounded-2xl bg-surface-dark border border-white/5">
            <p className="text-zinc-400 text-sm font-medium mb-1">New Leads</p>
            <h3 className="text-3xl font-bold text-primary">{leads.filter(l => l.status === 'New').length}</h3>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 p-8 rounded-2xl bg-surface-dark border border-white/5 h-[400px]">
             <h3 className="text-white text-lg font-bold mb-6">Revenue Analysis</h3>
             <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={chartData}>
                   <defs><linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#38e07b" stopOpacity={0.3}/><stop offset="95%" stopColor="#38e07b" stopOpacity={0}/></linearGradient></defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                   <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#71717a'}} />
                   <YAxis hide />
                   <Tooltip contentStyle={{backgroundColor: '#1a261e', border: 'none', borderRadius: '12px'}} />
                   <Area type="monotone" dataKey="pos" stroke="#38e07b" strokeWidth={3} fill="url(#colorPos)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
              <h4 className="text-white font-bold mb-2">Inventory Alert</h4>
              <p className="text-zinc-400 text-sm mb-4">You have {lowStockItems.length} items below reorder level.</p>
              <button onClick={() => changeModule(AppModule.WAREHOUSE)} className="w-full py-2 bg-red-500 text-white rounded-xl font-bold text-sm">Restock Now</button>
            </div>
            <div className="p-6 rounded-2xl bg-surface-dark border border-white/5 flex flex-col flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold">Activity</h3>
                <button onClick={() => changeModule(AppModule.ACTIVITY)} className="text-primary text-xs font-bold underline">View All</button>
              </div>
              <div className="space-y-4">
                {activities.slice(0, 3).map(a => (
                  <div key={a.id} className="flex gap-3 text-xs border-l-2 border-white/5 pl-3">
                    <div>
                       <p className="text-zinc-100 font-medium">{a.message}</p>
                       <p className="text-zinc-500">{a.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-dark border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-white font-bold">Project Health</h3>
            <button onClick={() => changeModule(AppModule.PROJECTS)} className="text-primary text-sm font-bold">Manage All</button>
          </div>
          <div className="divide-y divide-white/5">
            {projects.slice(0, 3).map(p => (
              <div key={p.id} className="p-4 px-6 flex items-center justify-between hover:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded bg-white/5 flex items-center justify-center font-bold">{p.name.charAt(0)}</div>
                  <div><p className="text-white font-bold">{p.name}</p><p className="text-zinc-500 text-xs">{p.client}</p></div>
                </div>
                <div className="flex items-center gap-8">
                   <div className="w-32"><div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{width: `${p.progress}%`}}></div></div></div>
                   <span className="text-white font-bold text-sm">{p.progress}%</span>
                   <button onClick={() => changeModule(AppModule.PROJECTS)} className="text-zinc-400 hover:text-white"><span className="material-symbols-outlined">chevron_right</span></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};