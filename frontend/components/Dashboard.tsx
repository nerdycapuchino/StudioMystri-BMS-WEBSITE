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
      <div className="w-full animation-fade-in relative z-10">
         {/* Header Area */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
               <h1 className="font-playfair text-3xl text-text-primary tracking-wide mb-1">Command Center</h1>
               <p className="text-text-muted text-sm font-sans flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  Live Dashboard Analytics
               </p>
            </div>
            <div className="flex items-center gap-3">
               <button className="bg-surface-elevated border border-border-solid hover:border-border-hover text-text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">download</span>
                  Export PDF
               </button>
               <Link to="/pos" className="bg-primary hover:bg-primary-hover text-surface-darker px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-glow">
                  <span className="material-symbols-outlined text-lg">add</span>
                  New Sale
               </Link>
            </div>
         </div>

         {statsLoading ? <CardSkeleton count={3} /> : statsError ? <InlineError message={(statsErr as Error)?.message || 'Failed to load'} onRetry={retryStats} /> : (
            <>
               {/* KPI Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Daily Revenue */}
                  <div className="bg-surface-elevated border border-border-solid rounded-2xl p-6 relative overflow-hidden group hover:border-border-hover transition-colors">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-primary">account_balance_wallet</span>
                     </div>
                     <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest mb-2">Daily Revenue</h3>
                     <div className="flex items-end gap-3 mb-4">
                        <span className="text-3xl font-display font-medium text-text-primary tracking-tight">
                           {formatCurrency(stats?.salesToday || 0)}
                        </span>
                        <span className="text-success text-xs font-bold bg-success/10 px-2 py-1 rounded flex items-center mb-1">
                           <span className="material-symbols-outlined text-[14px]">trending_up</span> 12%
                        </span>
                     </div>
                     <div className="w-full bg-surface-dark rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: '68%' }}></div>
                     </div>
                  </div>

                  {/* Active Projects */}
                  <div className="bg-surface-elevated border border-border-solid rounded-2xl p-6 relative overflow-hidden group hover:border-border-hover transition-colors">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-bronze-DEFAULT">architecture</span>
                     </div>
                     <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest mb-2">Active Projects</h3>
                     <div className="flex items-end gap-3 mb-4">
                        <span className="text-3xl font-display font-medium text-text-primary tracking-tight">
                           {stats?.activeProjects || 0}
                        </span>
                        <span className="text-primary text-xs font-bold tracking-wide mb-1">
                           In Production
                        </span>
                     </div>
                     <div className="w-full bg-surface-dark rounded-full h-1.5 overflow-hidden">
                        <div className="bg-bronze-DEFAULT h-1.5 rounded-full" style={{ width: '45%' }}></div>
                     </div>
                  </div>

                  {/* Pending Quotes / Pipeline Leads */}
                  <div className="bg-surface-elevated border border-border-solid rounded-2xl p-6 relative overflow-hidden group hover:border-border-hover transition-colors">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-text-muted">receipt_long</span>
                     </div>
                     <h3 className="text-text-muted text-xs font-bold uppercase tracking-widest mb-2">Pending Pipeline Leads</h3>
                     <div className="flex items-end gap-3 mb-4">
                        <span className="text-3xl font-display font-medium text-text-primary tracking-tight">
                           {stats?.pipelineLeads || 0}
                        </span>
                        <span className="text-text-muted text-xs mb-1">
                           Awaiting Approval
                        </span>
                     </div>
                     <div className="w-full bg-surface-dark rounded-full h-1.5 overflow-hidden">
                        <div className="bg-text-muted h-1.5 rounded-full" style={{ width: '30%' }}></div>
                     </div>
                  </div>

                  {/* Inventory Alerts */}
                  <div className="bg-surface-elevated border border-error/30 rounded-2xl p-6 relative overflow-hidden group hover:border-error transition-colors">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-error">inventory_2</span>
                     </div>
                     <h3 className="text-error text-xs font-bold uppercase tracking-widest mb-2">Low Stock Alerts</h3>
                     <div className="flex items-end gap-3 mb-4">
                        <span className="text-3xl font-display font-medium text-text-primary tracking-tight">
                           {stats?.lowStockCount || 0}
                        </span>
                        <span className="text-error text-xs font-bold bg-error/10 px-2 py-1 rounded flex items-center mb-1">
                           Critical Items
                        </span>
                     </div>
                     <Link to="/inventory" className="text-xs text-error hover:text-white transition-colors underline underline-offset-4 decoration-error/50">
                        Review Inventory
                     </Link>
                  </div>
               </div>

               {/* Main Content Area */}
               <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Charts Section */}
                  <div className="xl:col-span-2 space-y-6">
                     <div className="bg-surface-elevated border border-border-solid rounded-2xl p-6 relative overflow-hidden h-[400px] flex flex-col">
                        <div className="industrial-grid-bg absolute inset-0 opacity-50"></div>
                        <div className="relative z-10 flex justify-between items-center mb-8">
                           <div>
                              <h3 className="text-text-primary font-bold text-lg">Revenue Trends</h3>
                              <p className="text-text-muted text-sm">Last 7 Days Performance</p>
                           </div>
                           <div className="flex gap-2 bg-surface-dark rounded-lg p-1 border border-border-solid">
                              <button className="px-3 py-1 text-xs font-medium bg-surface-elevated text-text-primary rounded shadow-sm border border-border-solid">7D</button>
                              <button className="px-3 py-1 text-xs font-medium text-text-muted hover:text-text-primary">30D</button>
                              <button className="px-3 py-1 text-xs font-medium text-text-muted hover:text-text-primary">YTD</button>
                           </div>
                        </div>

                        <div className="flex-1 w-full min-h-0 relative z-10 mask-linear-fade">
                           {chartLoading ? <ChartSkeleton /> : (
                              <ResponsiveContainer width="100%" height="100%">
                                 <AreaChart data={revData}>
                                    <defs>
                                       <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#38e07b" stopOpacity={0.2} />
                                          <stop offset="95%" stopColor="#38e07b" stopOpacity={0} />
                                       </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3830" vertical={false} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9eb7a8', fontSize: 12 }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                       contentStyle={{ backgroundColor: '#1a261e', border: '1px solid #2a3830', borderRadius: '8px', color: '#F9FAFB' }}
                                       itemStyle={{ color: '#38e07b', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="rev" stroke="#38e07b" strokeWidth={2} fill="url(#colorRev)" />
                                 </AreaChart>
                              </ResponsiveContainer>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Right Sidebar Area */}
                  <div className="space-y-6">
                     {/* Activity Log */}
                     <div className="bg-surface-elevated border border-border-solid rounded-2xl p-6 h-[400px] flex flex-col">
                        <h3 className="text-text-primary font-bold text-lg mb-6 flex items-center gap-2">
                           <span className="material-symbols-outlined text-primary">history</span>
                           System Logs
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                           {activityList.slice(0, 6).map((act: any, i: number) => (
                              <div key={act.id || i} className="flex gap-4 group">
                                 <div className="flex flex-col items-center">
                                    <div className={`w-2.5 h-2.5 rounded-full ${act.type === 'alert' ? 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_8px_rgba(56,224,123,0.3)]'} ring-4 ring-surface-dark z-10`}></div>
                                    {i !== activityList.length - 1 && <div className="w-px h-full bg-border-solid -mb-6 mt-1 group-hover:bg-border-hover transition-colors"></div>}
                                 </div>
                                 <div className="pb-1">
                                    <p className="text-sm text-text-primary">{act.message}</p>
                                    <p className="text-xs text-text-muted mt-1 font-mono">{act.timestamp || 'Just now'}</p>
                                 </div>
                              </div>
                           ))}
                           {activityList.length === 0 && <p className="text-text-muted text-sm italic">No recent activity logged.</p>}
                        </div>
                     </div>
                  </div>
               </div>
            </>
         )}
      </div>
   );
};
