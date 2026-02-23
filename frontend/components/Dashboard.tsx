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
      { day: 'Thu', rev: 0 }, { day: 'Fri', rev: 0 }, { day: 'Sat', rev: 0 }, { day: 'Sun', rev: 0 }
   ];

   const revData = Array.isArray(chartData) && chartData.length > 0 ? chartData : fallbackChartData;
   const activityList = Array.isArray(activities) ? activities : [];

   // Calculated properties for Donut chart
   const totalProjects = stats?.activeProjects || 0;
   const constructionCount = Math.round(totalProjects * 0.4);
   const schematicCount = Math.round(totalProjects * 0.3);
   const conceptCount = Math.round(totalProjects * 0.2);
   const otherCount = totalProjects > 0 ? totalProjects - (constructionCount + schematicCount + conceptCount) : 0;

   return (
      <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display relative z-10 w-full overflow-hidden animation-fade-in">
         {/* Scrollable Dashboard Content */}
         <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar pt-6">
            <div className="mx-auto max-w-7xl flex flex-col gap-8">

               {/* Welcome Section */}
               <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Studio Mystri Overview</h2>
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
                              {stats?.salesToday && stats.salesToday > 0 ? (
                                 <span className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                                    <span className="material-symbols-outlined text-[16px] mr-1">arrow_upward</span>
                                    Active
                                 </span>
                              ) : (
                                 <span className="text-sm text-slate-400">vs last period</span>
                              )}
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
                              {stats?.pipelineLeads ? (
                                 <span className="flex items-center text-sm font-medium text-primary">
                                    +{stats.pipelineLeads} pending approval
                                 </span>
                              ) : (
                                 <span className="text-sm text-slate-400">No pending projects</span>
                              )}
                           </div>
                        </div>

                        {/* System Health / Operations Card */}
                        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:shadow-md">
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Inventory Alerts</p>
                                 <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{stats?.lowStockCount || 0}</h3>
                              </div>
                              <div className="rounded-full bg-amber-50 dark:bg-amber-900/20 p-3 text-amber-600 dark:text-amber-400">
                                 <span className="material-symbols-outlined">inventory_2</span>
                              </div>
                           </div>
                           <div className="mt-4 flex items-center gap-2">
                              {stats?.lowStockCount ? (
                                 <span className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-400">
                                    <span className="material-symbols-outlined text-[16px] mr-1">warning</span>
                                    Low Stock Action Required
                                 </span>
                              ) : (
                                 <span className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                    Optimal Levels
                                 </span>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Charts Section */}
                     <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Revenue Trends (Main Chart) */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm lg:col-span-2">
                           <div className="mb-6 flex items-center justify-between">
                              <div>
                                 <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Trends</h3>
                                 <p className="text-sm text-slate-500 dark:text-slate-400">Performance Overview</p>
                              </div>
                              <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 p-1">
                                 <button className="rounded-md bg-white dark:bg-slate-700 px-3 py-1 text-xs font-medium text-slate-900 dark:text-white shadow-sm">12 Months</button>
                                 <button className="rounded-md px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">30 Days</button>
                                 <button className="rounded-md px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">7 Days</button>
                              </div>
                           </div>

                           {/* Recharts Implementation */}
                           <div className="relative h-[250px] w-full">
                              {chartLoading ? <ChartSkeleton /> : (
                                 <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revData}>
                                       <defs>
                                          <linearGradient id="colorRevValue" x1="0" y1="0" x2="0" y2="1">
                                             <stop offset="5%" stopColor="#137fec" stopOpacity={0.2} />
                                             <stop offset="95%" stopColor="#137fec" stopOpacity={0} />
                                          </linearGradient>
                                       </defs>
                                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                       <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                       <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${value}`} />
                                       <Tooltip
                                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                                          itemStyle={{ color: '#137fec', fontWeight: 'bold' }}
                                          formatter={(value: number) => formatCurrency(value)}
                                       />
                                       <Area type="monotone" dataKey="rev" stroke="#137fec" strokeWidth={2} fill="url(#colorRevValue)" />
                                    </AreaChart>
                                 </ResponsiveContainer>
                              )}
                           </div>
                        </div>

                        {/* Project Status (Secondary Widget) */}
                        <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                           <div className="mb-6">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Project Status</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Current active breakdown</p>
                           </div>
                           <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-2">
                              {/* Custom CSS Donut Chart */}
                              <div className="relative h-40 w-40">
                                 <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                    {/* Background Circle */}
                                    <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                                    {totalProjects > 0 ? (
                                       <>
                                          {/* Segment 1: Construction (Blue) */}
                                          <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="40, 100" strokeLinecap="round" strokeWidth="4"></path>
                                          {/* Segment 2: Schematic (Light Blue) */}
                                          <path className="text-blue-300 dark:text-blue-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="30, 100" strokeDashoffset="-45" strokeLinecap="round" strokeWidth="4"></path>
                                          {/* Segment 3: Concept (Gray) */}
                                          <path className="text-slate-300 dark:text-slate-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="20, 100" strokeDashoffset="-80" strokeLinecap="round" strokeWidth="4"></path>
                                       </>
                                    ) : null}
                                 </svg>
                                 {/* Center Text */}
                                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalProjects}</span>
                                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Total</span>
                                 </div>
                              </div>
                              <div className="grid w-full grid-cols-2 gap-4 mt-2">
                                 <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Construction</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-blue-300 dark:bg-blue-700"></span>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Schematic</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Concept</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-100 dark:bg-slate-800"></span>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Other</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Recent Activity / Projects Table */}
                     <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden mb-8">
                        <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                           <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Projects Activity</h3>
                           <button className="text-sm font-medium text-primary hover:text-blue-700 dark:hover:text-blue-400">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                           {activityList.length > 0 ? (
                              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                 <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                                    <tr>
                                       <th className="px-6 py-3 font-semibold tracking-wider">Project / Activity</th>
                                       <th className="px-6 py-3 font-semibold tracking-wider">Client / Type</th>
                                       <th className="px-6 py-3 font-semibold tracking-wider">Value</th>
                                       <th className="px-6 py-3 font-semibold tracking-wider">Status</th>
                                       <th className="px-6 py-3 font-semibold tracking-wider text-right">Action</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {activityList.slice(0, 5).map((act: any, i: number) => (
                                       <tr key={act.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                          <td className="whitespace-nowrap px-6 py-4">
                                             <div className="flex flex-col">
                                                <div className="font-medium text-slate-900 dark:text-white">{act.projectName || act.message}</div>
                                                {act.code && <div className="text-xs text-slate-500">{act.code}</div>}
                                             </div>
                                          </td>
                                          <td className="whitespace-nowrap px-6 py-4">{act.client || act.type || '-'}</td>
                                          <td className="whitespace-nowrap px-6 py-4">{act.budget ? formatCurrency(act.budget) : '-'}</td>
                                          <td className="whitespace-nowrap px-6 py-4">
                                             <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${(act.status || '').toLowerCase() === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'}`}>
                                                {act.status || 'Archived'}
                                             </span>
                                          </td>
                                          <td className="whitespace-nowrap px-6 py-4 text-right">
                                             <button className="text-slate-400 hover:text-primary dark:hover:text-white">
                                                <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                                             </button>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           ) : (
                              <div className="p-8 text-center text-slate-500">
                                 No recent activity recorded.
                              </div>
                           )}
                        </div>
                     </div>
                  </>
               )}
            </div>
         </div>
      </div>
   );
};
