import React, { useState } from 'react';
import { useDashboardStats, useRevenueChart, useRecentActivity } from '../hooks/useDashboard';
import { useNotifications, useMarkNotificationRead } from '../hooks/useNotifications';
import { CardSkeleton, ChartSkeleton, InlineError } from './ui/Skeleton';
import { AppModule } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Wallet, AlertTriangle, Clock, ShoppingCart, UserPlus, FileText } from 'lucide-react';

export const Dashboard: React.FC<{ changeModule: (m: AppModule) => void }> = ({ changeModule }) => {
   const { data: stats, isLoading: statsLoading, isError: statsError, error: statsErr, refetch: retryStats } = useDashboardStats();
   const { data: chartData, isLoading: chartLoading } = useRevenueChart('7d');
   const { data: activities } = useRecentActivity();
   const { data: notifications } = useNotifications();
   const markRead = useMarkNotificationRead();
   const [showNotifications, setShowNotifications] = useState(false);

   const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);

   // Fallback chart data if API hasn't returned yet
   const fallbackChartData = [
      { day: 'Mon', rev: 0 }, { day: 'Tue', rev: 0 }, { day: 'Wed', rev: 0 },
      { day: 'Thu', rev: 0 }, { day: 'Fri', rev: 0 }, { day: 'Sat', rev: 0 }
   ];
   const revData = chartData || fallbackChartData;
   const notifList = Array.isArray(notifications) ? notifications : [];
   const activityList = Array.isArray(activities) ? activities : [];

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
                  {notifList.some((n: any) => !n.read) && <span className="absolute top-2 right-2.5 size-2 bg-primary rounded-full animate-pulse shadow-glow"></span>}
               </button>

               {showNotifications && (
                  <div className="absolute top-12 right-0 w-72 md:w-80 bg-surface-dark border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                     <div className="p-3 border-b border-white/5 flex justify-between items-center">
                        <h3 className="font-bold text-white text-xs">Notifications</h3>
                        <button onClick={() => setShowNotifications(false)} className="text-zinc-500 hover:text-white"><span className="material-symbols-outlined text-[16px]">close</span></button>
                     </div>
                     <div className="max-h-64 overflow-y-auto">
                        {notifList.length === 0 ? <div className="p-4 text-center text-zinc-500 text-xs">No new alerts</div> :
                           notifList.map((n: any) => (
                              <div key={n.id} onClick={() => markRead.mutate(n.id)} className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${n.read ? 'opacity-50' : ''}`}>
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
            {statsLoading ? <CardSkeleton count={3} /> : statsError ? <InlineError message={(statsErr as Error)?.message || 'Failed to load'} onRetry={retryStats} /> : (
               <>
                  {/* Financial High-Level Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                     <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Daily Revenue</p>
                              <h3 className="text-2xl md:text-3xl font-black text-white">{formatCurrency(stats?.salesToday || 0)}</h3>
                           </div>
                           <div className="bg-primary/10 p-2 rounded-lg text-primary"><Wallet className="w-5 h-5" /></div>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-primary w-[65%]"></div></div>
                     </div>

                     <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Projects Active</p>
                              <h3 className="text-2xl md:text-3xl font-black text-white">{stats?.activeProjects || 0}</h3>
                           </div>
                           <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><ArrowUpRight className="w-5 h-5" /></div>
                        </div>
                        <p className="text-xs text-zinc-400 mt-2">Currently in execution phase</p>
                     </div>

                     <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Pipeline Leads</p>
                              <h3 className="text-2xl md:text-3xl font-black text-white">{stats?.pipelineLeads || 0}</h3>
                           </div>
                           <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500"><ArrowDownLeft className="w-5 h-5" /></div>
                        </div>
                        <p className="text-xs text-zinc-400 mt-2">Potential new business</p>
                     </div>
                  </div>

                  {/* Action Center Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                     <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Needs Attention</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-red-500/15 transition-colors" onClick={() => changeModule(AppModule.WAREHOUSE)}>
                              <div>
                                 <p className="text-red-400 text-xs font-bold uppercase">Low Stock</p>
                                 <p className="text-2xl font-black text-white">{stats?.lowStockCount || 0}</p>
                              </div>
                              <AlertTriangle className="w-6 h-6 text-red-500 opacity-50" />
                           </div>
                           <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-colors" onClick={() => changeModule(AppModule.FINANCE)}>
                              <div>
                                 <p className="text-amber-400 text-xs font-bold uppercase">Pending Inv.</p>
                                 <p className="text-2xl font-black text-white">{stats?.pendingInvoices || 0}</p>
                                 <p className="text-[10px] text-amber-300/70">{formatCurrency(stats?.pendingInvoiceAmount || 0)}</p>
                              </div>
                              <Clock className="w-6 h-6 text-amber-500 opacity-50" />
                           </div>
                        </div>
                     </div>

                     <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-primary" /> Quick Actions</h3>
                        <div className="grid grid-cols-3 gap-3">
                           <button onClick={() => changeModule(AppModule.POS)} className="flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/5 hover:border-primary/30 p-4 rounded-xl transition-all group">
                              <ShoppingCart className="w-6 h-6 text-zinc-400 group-hover:text-primary transition-colors" />
                              <span className="text-xs font-bold">New Sale</span>
                           </button>
                           <button onClick={() => changeModule(AppModule.CRM)} className="flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-blue-500/20 hover:text-blue-500 border border-white/5 hover:border-blue-500/30 p-4 rounded-xl transition-all group">
                              <UserPlus className="w-6 h-6 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                              <span className="text-xs font-bold">Add Lead</span>
                           </button>
                           <button onClick={() => changeModule(AppModule.INVOICE_GEN)} className="flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-purple-500/20 hover:text-purple-500 border border-white/5 hover:border-purple-500/30 p-4 rounded-xl transition-all group">
                              <FileText className="w-6 h-6 text-zinc-400 group-hover:text-purple-500 transition-colors" />
                              <span className="text-xs font-bold">Invoicing</span>
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Charts and Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[400px]">
                     <div className="lg:col-span-2 bg-surface-dark border border-white/5 rounded-2xl p-6 flex flex-col h-80 md:h-96">
                        <h3 className="text-white font-bold text-sm mb-6">Revenue Trend (Weekly)</h3>
                        <div className="flex-1 min-h-0">
                           {chartLoading ? <ChartSkeleton /> : (
                              <ResponsiveContainer width="100%" height="100%">
                                 <AreaChart data={revData}>
                                    <defs>
                                       <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#38e07b" stopOpacity={0.2} />
                                          <stop offset="95%" stopColor="#38e07b" stopOpacity={0} />
                                       </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 12 }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                       contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                       itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="rev" stroke="#38e07b" strokeWidth={2} fill="url(#colorRev)" />
                                 </AreaChart>
                              </ResponsiveContainer>
                           )}
                        </div>
                     </div>

                     <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 flex flex-col overflow-hidden h-80 md:h-96">
                        <h3 className="text-white font-bold text-sm mb-6">Recent System Activity</h3>
                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                           {activityList.slice(0, 6).map((act: any, i: number) => (
                              <div key={act.id || i} className="flex gap-3 relative">
                                 <div className="flex flex-col items-center">
                                    <div className={`size-2 rounded-full ${act.type === 'alert' ? 'bg-red-500' : 'bg-primary'}`}></div>
                                    {i !== activityList.length - 1 && <div className="w-px h-full bg-white/5 mt-1"></div>}
                                 </div>
                                 <div>
                                    <p className="text-xs text-zinc-300 font-medium leading-tight">{act.message}</p>
                                    <p className="text-[10px] text-zinc-600 mt-1 font-mono">{act.timestamp}</p>
                                 </div>
                              </div>
                           ))}
                           {activityList.length === 0 && <p className="text-zinc-600 text-xs italic">No recent activity logged.</p>}
                        </div>
                     </div>
                  </div>
               </>
            )}
         </div>
      </div>
   );
};
