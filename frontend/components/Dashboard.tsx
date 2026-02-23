import React from 'react';
import { useDashboardStats, useRevenueChart, useRecentActivity } from '../hooks/useDashboard';
import { CardSkeleton, InlineError } from './ui/Skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Plus, Users, Wallet, Rocket, HardHat, Package, ArrowUpRight, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
   const { data: stats, isLoading: statsLoading, isError: statsError, error: statsErr, refetch: retryStats } = useDashboardStats();
   const { data: chartData, isLoading: chartLoading } = useRevenueChart('7d');
   const { data: activities } = useRecentActivity();

   const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

   const fallbackChartData = [
      { day: 'Mon', rev: 0 }, { day: 'Tue', rev: 0 }, { day: 'Wed', rev: 0 },
      { day: 'Thu', rev: 0 }, { day: 'Fri', rev: 0 }, { day: 'Sat', rev: 0 }, { day: 'Sun', rev: 0 }
   ];

   const revData = Array.isArray(chartData) && chartData.length > 0 ? chartData : fallbackChartData;
   const activityList = Array.isArray(activities) ? activities : [];

   return (
      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#020617] text-foreground font-display relative z-10 w-full overflow-hidden animation-fade-in custom-scrollbar overflow-y-auto p-6 md:p-10">
         <div className="mx-auto max-w-7xl w-full flex flex-col gap-10">

            {/* Glassmorphism Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
               <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full"></div>
               <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-blue-500/10 blur-[80px] rounded-full"></div>

               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex flex-col gap-4 text-center md:text-left">
                     <Badge variant="secondary" className="bg-white/10 text-blue-200 border-white/10 backdrop-blur-md self-center md:self-start">
                        System Operational
                     </Badge>
                     <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                        Studio Mystri <span className="text-primary-light">Intelligence</span>
                     </h1>
                     <p className="text-slate-400 text-lg max-w-2xl">
                        Your architectural empire, visualized. Manage projects, monitor revenue, and lead your team with data-driven precision.
                     </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 shrink-0">
                     <Button variant="glass" size="lg" icon={Plus}>New Project</Button>
                     <Button variant="primary" size="lg" icon={Rocket}>Insights</Button>
                  </div>
               </div>
            </div>

            {statsLoading ? <CardSkeleton count={3} /> : statsError ? <InlineError message={(statsErr as Error)?.message || 'Failed to load'} onRetry={retryStats} /> : (
               <>
                  {/* Premium KPI Cards */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                     <Card variant="glass" className="relative group overflow-hidden border-white/5 bg-slate-900/40">
                        <div className="flex items-center justify-between">
                           <div className="space-y-2">
                              <p className="text-sm font-medium text-slate-400">Monthly Revenue</p>
                              <h3 className="text-4xl font-bold tracking-tight text-white">{formatCurrency(stats?.salesToday || 0)}</h3>
                           </div>
                           <div className="rounded-2xl bg-primary/20 p-4 text-primary group-hover:scale-110 transition-transform">
                              <Wallet className="w-8 h-8" />
                           </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2">
                           <Badge variant="success">Active</Badge>
                           <span className="text-xs text-slate-500">Live stats from ERP</span>
                        </div>
                     </Card>

                     <Card variant="glass" className="relative group overflow-hidden border-white/5 bg-slate-900/40">
                        <div className="flex items-center justify-between">
                           <div className="space-y-2">
                              <p className="text-sm font-medium text-slate-400">Total Projects</p>
                              <h3 className="text-4xl font-bold tracking-tight text-white">{stats?.activeProjects || 0}</h3>
                           </div>
                           <div className="rounded-2xl bg-blue-500/20 p-4 text-blue-400 group-hover:scale-110 transition-transform">
                              <HardHat className="w-8 h-8" />
                           </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2">
                           <span className="text-xs font-bold text-blue-400">+{stats?.pipelineLeads || 0} In Pipeline</span>
                        </div>
                     </Card>

                     <Card variant="glass" className="relative group overflow-hidden border-white/5 bg-slate-900/40">
                        <div className="flex items-center justify-between">
                           <div className="space-y-2">
                              <p className="text-sm font-medium text-slate-400">Inventory Alerts</p>
                              <h3 className="text-4xl font-bold tracking-tight text-white">{stats?.lowStockCount || 0}</h3>
                           </div>
                           <div className="rounded-2xl bg-indigo-500/20 p-4 text-indigo-400 group-hover:scale-110 transition-transform">
                              <Package className="w-8 h-8" />
                           </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2">
                           <Badge variant="warning" className="bg-amber-500/10 text-amber-300">Action Required</Badge>
                        </div>
                     </Card>
                  </div>

                  {/* Chart and Activity Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <Card className="lg:col-span-2 overflow-hidden border-slate-200/60 dark:border-white/5">
                        <div className="flex items-center justify-between mb-8">
                           <div className="space-y-1">
                              <h3 className="text-xl font-bold">Revenue Analytics</h3>
                              <p className="text-sm text-muted-foreground">Performance overview for the last 7 days</p>
                           </div>
                           <Button variant="outline" size="sm">Download CSV</Button>
                        </div>
                        <div className="h-[350px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={revData}>
                                 <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#137fec" stopOpacity={0.3} />
                                       <stop offset="95%" stopColor="#137fec" stopOpacity={0} />
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                 <YAxis hide />
                                 <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                 />
                                 <Area type="monotone" dataKey="rev" stroke="#137fec" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                     </Card>

                     <Card className="border-slate-200/60 dark:border-white/5 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                           <h3 className="text-xl font-bold">Recent Pulse</h3>
                           <Clock className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                           {activityList.length > 0 ? activityList.map((act: any, idx: number) => (
                              <div key={idx} className="flex gap-4 group cursor-pointer">
                                 <div className="mt-1 shrink-0 w-2 h-2 rounded-full bg-primary" />
                                 <div className="space-y-1">
                                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">{act.description}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                 </div>
                              </div>
                           )) : (
                              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                                 <Clock className="w-12 h-12 mb-4" />
                                 <p className="text-sm">No recent signals recorded</p>
                              </div>
                           )}
                        </div>
                        <Button variant="ghost" className="mt-6 w-full group">
                           View Full Log <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                     </Card>
                  </div>
               </>
            )}
         </div>
      </div>
   );
};
