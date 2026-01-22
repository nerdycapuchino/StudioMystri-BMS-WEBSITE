
import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { AppModule } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Wallet, AlertTriangle } from 'lucide-react';

export const Dashboard: React.FC<{ changeModule: (m: AppModule) => void }> = ({ changeModule }) => {
  const { salesToday, projects, activities, inventory, leads, formatCurrency, notifications, markNotificationRead } = useGlobal();
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter only critical low stock for the alert line
  const criticalStock = inventory.filter(i => i.quantity <= i.reorderLevel);

  // Simplified chart data for overview
  const chartData = [
    { day: 'Mon', rev: 4000 }, { day: 'Tue', rev: 3000 }, { day: 'Wed', rev: 2000 },
    { day: 'Thu', rev: 2780 }, { day: 'Fri', rev: 1890 }, { day: 'Sat', rev: salesToday || 2390 }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-white/5 bg-background-dark shrink-0">
        <div>
           <h2 className="text-white text-xl md:text-2xl font-bold tracking-tight">Enterprise Overview</h2>
           <p className="text-zinc-500 text-xs mt-1">Real-time business intelligence.</p>
        </div>
        
        <div className="flex items-center gap-4 relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-lg bg-surface-dark border border-white/5 text-zinc-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {notifications.some(n => !n.read) && <span className="absolute top-2 right-2.5 size-2 bg-primary rounded-full animate-pulse shadow-glow"></span>}
          </button>
          
          {showNotifications && (
            <div className="absolute top-12 right-0 w-72 md:w-80 bg-surface-dark border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold text-white text-xs">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-zinc-500 hover:text-white"><span className="material-symbols-outlined text-[16px]">close</span></button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? <div className="p-4 text-center text-zinc-500 text-xs">No new alerts</div> : 
                  notifications.map(n => (
                    <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${n.read ? 'opacity-50' : ''}`}>
                      <p className="text-white text-xs font-bold">{n.title}</p>
                      <p className="text-zinc-400 text-[10px]">{n.message}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        
        {/* Financial High-Level Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
           <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Daily Revenue</p>
                    <h3 className="text-2xl md:text-3xl font-black text-white">{formatCurrency(salesToday)}</h3>
                 </div>
                 <div className="bg-primary/10 p-2 rounded-lg text-primary"><Wallet className="w-5 h-5"/></div>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-primary w-[65%]"></div>
              </div>
           </div>

           <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Projects Active</p>
                    <h3 className="text-2xl md:text-3xl font-black text-white">{projects.length}</h3>
                 </div>
                 <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><ArrowUpRight className="w-5 h-5"/></div>
              </div>
              <p className="text-xs text-zinc-400 mt-2">Currently in execution phase</p>
           </div>

           <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Pipeline Leads</p>
                    <h3 className="text-2xl md:text-3xl font-black text-white">{leads.filter(l => l.status === 'New').length}</h3>
                 </div>
                 <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500"><ArrowDownLeft className="w-5 h-5"/></div>
              </div>
               <p className="text-xs text-zinc-400 mt-2">Potential new business</p>
           </div>
        </div>

        {/* Status Rows */}
        {criticalStock.length > 0 && (
           <div className="mb-8 bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                 <div>
                    <h4 className="text-red-400 font-bold text-sm">Inventory Warning</h4>
                    <p className="text-red-500/70 text-xs">{criticalStock.length} items have dropped below reorder levels.</p>
                 </div>
              </div>
              <button onClick={() => changeModule(AppModule.WAREHOUSE)} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">
                 Review Stock
              </button>
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[400px]">
           {/* Chart Area */}
           <div className="lg:col-span-2 bg-surface-dark border border-white/5 rounded-2xl p-6 flex flex-col h-80 md:h-96">
              <h3 className="text-white font-bold text-sm mb-6">Revenue Trend (Weekly)</h3>
              <div className="flex-1 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#38e07b" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#38e07b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                       <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 12}} dy={10} />
                       <YAxis hide />
                       <Tooltip 
                          contentStyle={{backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff'}}
                          itemStyle={{color: '#fff'}}
                       />
                       <Area type="monotone" dataKey="rev" stroke="#38e07b" strokeWidth={2} fill="url(#colorRev)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Activity Feed */}
           <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 flex flex-col overflow-hidden h-80 md:h-96">
              <h3 className="text-white font-bold text-sm mb-6">Recent System Activity</h3>
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                 {activities.slice(0, 6).map((act, i) => (
                    <div key={i} className="flex gap-3 relative">
                       <div className="flex flex-col items-center">
                          <div className={`size-2 rounded-full ${act.type === 'alert' ? 'bg-red-500' : 'bg-primary'}`}></div>
                          {i !== activities.length - 1 && <div className="w-px h-full bg-white/5 mt-1"></div>}
                       </div>
                       <div>
                          <p className="text-xs text-zinc-300 font-medium leading-tight">{act.message}</p>
                          <p className="text-[10px] text-zinc-600 mt-1 font-mono">{act.timestamp}</p>
                       </div>
                    </div>
                 ))}
                 {activities.length === 0 && <p className="text-zinc-600 text-xs italic">No recent activity logged.</p>}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
