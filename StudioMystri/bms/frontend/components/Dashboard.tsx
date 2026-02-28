import React from 'react';
import { useDashboardStats, useRevenueChart, useRecentActivity } from '../hooks/useDashboard';
import { CardSkeleton, ChartSkeleton, InlineError } from './ui/Skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
   const { data: stats, isLoading: statsLoading, isError: statsError, error: statsErr, refetch: retryStats } = useDashboardStats();
   const { data: chartData, isLoading: chartLoading } = useRevenueChart('7d');
   const { data: activities } = useRecentActivity();

   const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

   // Fallback chart data if API hasn't returned yet
   const fallbackChartData = [
      { day: 'Mon', rev: 0 }, { day: 'Tue', rev: 0 }, { day: 'Wed', rev: 0 },
      { day: 'Thu', rev: 0 }, { day: 'Fri', rev: 0 }, { day: 'Sat', rev: 0 }
   ];

   const revData = Array.isArray(chartData) && chartData.length > 0 ? chartData : fallbackChartData;
   const activityList = Array.isArray(activities) ? activities : [];

   return (
      <div className="mx-auto max-w-7xl flex flex-col gap-8 animation-fade-in relative z-10">
         {/* Welcome Section */}
         <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, here's what's happening today.</p>
         </div>

         {statsLoading ? <CardSkeleton count={3} /> : statsError ? <InlineError message={(statsErr as Error)?.message || 'Failed to load'} onRetry={retryStats} /> : (
            <>
               {/* KPI Cards */}
               <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Revenue Card */}
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:shadow-md">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
                           <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{formatCurrency(stats?.salesToday || 0)}</h3>
                        </div>
                        <div className="rounded-full bg-green-50 dark:bg-green-900/20 p-3 text-green-600 dark:text-green-400">
                           <span className="material-symbols-outlined">trending_up</span>
                        </div>
                     </div>
                     <div className="mt-4 flex items-center gap-2">
                        <span className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                           <span className="material-symbols-outlined text-[16px] mr-1">arrow_upward</span>
                           12%
                        </span>
                        <span className="text-sm text-slate-400">vs last month</span>
                     </div>
                  </div>

                  {/* Active Projects Card */}
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:shadow-md">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Projects</p>
                           <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{stats?.activeProjects || 0}</h3>
                        </div>
                        <div className="rounded-full bg-primary/10 p-3 text-primary">
                           <span className="material-symbols-outlined">architecture</span>
                        </div>
                     </div>
                     <div className="mt-4 flex items-center gap-2">
                        <span className="flex items-center text-sm font-medium text-primary">
                           +{stats?.pipelineLeads || 0} pending
                        </span>
                        <span className="text-sm text-slate-400">approval</span>
                     </div>
                  </div>

                  {/* System Health Card or Inventory */}
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:shadow-md">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-sm font-medium text-slate-500 dark:text-slate-400">System Health (Inventory)</p>
                           <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                              {stats?.lowStockCount > 0 ? `${stats.lowStockCount} Low` : '98%'}
                           </h3>
                        </div>
                        <div className={`rounded-full p-3 ${stats?.lowStockCount > 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                           <span className="material-symbols-outlined">{stats?.lowStockCount > 0 ? 'inventory_2' : 'dns'}</span>
                        </div>
                     </div>
                     <div className="mt-4 flex items-center gap-2">
                        <Link to="/inventory" className={`flex items-center text-sm font-medium transition-colors ${stats?.lowStockCount > 0 ? 'text-red-600 dark:text-red-400 hover:text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                           <span className={`inline-block h-2 w-2 rounded-full mr-2 ${stats?.lowStockCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                           {stats?.lowStockCount > 0 ? 'Review Critical Items' : 'Operational'}
                        </Link>
                     </div>
                  </div>
               </div>

               {/* Charts Section */}
               <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-4">
                  {/* Revenue Trends */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm lg:col-span-2 flex flex-col min-h-[400px]">
                     <div className="mb-6 flex items-center justify-between">
                        <div>
                           <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Trends</h3>
                           <p className="text-sm text-slate-500 dark:text-slate-400">Local Performance</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 p-1">
                           <button className="rounded-md bg-white dark:bg-slate-700 px-3 py-1 text-xs font-medium text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600">7 Days</button>
                           <button className="rounded-md px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">30 Days</button>
                           <button className="rounded-md px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">12 Months</button>
                        </div>
                     </div>

                     <div className="relative flex-1 w-full min-h-0">
                        {chartLoading ? <ChartSkeleton /> : (
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={revData}>
                                 <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#137fec" stopOpacity={0.2} />
                                       <stop offset="95%" stopColor="#137fec" stopOpacity={0} />
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} strokeOpacity={0.2} />
                                 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                 <YAxis hide />
                                 <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                                    itemStyle={{ color: '#137fec', fontWeight: 'bold' }}
                                 />
                                 <Area type="monotone" dataKey="rev" stroke="#137fec" strokeWidth={2} fill="url(#colorRev)" />
                              </AreaChart>
                           </ResponsiveContainer>
                        )}
                     </div>
                  </div>

                  {/* System Logs */}
                  <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm min-h-[400px] h-[400px]">
                     <div className="mb-6 flex-shrink-0">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                           <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                           System Logs
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Recent activity stream</p>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                        {activityList.slice(0, 6).map((act: any, i: number) => (
                           <div key={act.id || i} className="flex gap-4 group">
                              <div className="flex flex-col items-center">
                                 <div className={`w-2.5 h-2.5 rounded-full ${act.type === 'alert' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_8px_rgba(19,127,236,0.3)]'} ring-4 ring-slate-50 dark:ring-slate-900 z-10`}></div>
                                 {i !== activityList.length - 1 && <div className="w-px h-full bg-slate-200 dark:bg-slate-700 -mb-6 mt-1 group-hover:bg-slate-300 dark:group-hover:bg-slate-600 transition-colors"></div>}
                              </div>
                              <div className="pb-1">
                                 <p className="text-sm text-slate-900 dark:text-white">{act.message}</p>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{act.timestamp || 'Just now'}</p>
                              </div>
                           </div>
                        ))}
                        {activityList.length === 0 && <p className="text-slate-500 text-sm italic">No recent activity logged.</p>}
                     </div>
                  </div>
               </div>
            </>
         )}
      </div>
   );
};
