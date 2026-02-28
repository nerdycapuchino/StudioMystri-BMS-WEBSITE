import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, useCustomerStats, useCheckDuplicates } from '../hooks/useCustomers';
import { Customer, PrimarySource } from '../types';
import toast from 'react-hot-toast';

/* ─── BADGE HELPERS ───────────────────────────────────────── */

const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
   POS: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
   ECOMMERCE: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
   BMS_MANUAL: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300' },
   API: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300' },
   IMPORT: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
};

const TIER_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
   PLATINUM: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', icon: '💎' },
   GOLD: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', icon: '🥇' },
   SILVER: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', icon: '🥈' },
};

const STATUS_COLORS: Record<string, { bg: string; dot: string }> = {
   Active: { bg: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800', dot: 'bg-green-600' },
   Lead: { bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
   Inactive: { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700', dot: 'bg-slate-500' },
   'Past Client': { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700', dot: 'bg-slate-500' },
};

const formatINR = (n?: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const SourceBadge: React.FC<{ source?: PrimarySource }> = ({ source }) => {
   const s = SOURCE_COLORS[source || 'BMS_MANUAL'] || SOURCE_COLORS.BMS_MANUAL;
   const label = source === 'BMS_MANUAL' ? 'Manual' : source === 'ECOMMERCE' ? 'Ecommerce' : source || 'Manual';
   return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${s.bg} ${s.text}`}>{label}</span>;
};

const TierBadge: React.FC<{ tier?: string }> = ({ tier }) => {
   if (!tier) return null;
   const t = TIER_COLORS[tier] || { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', icon: '•' };
   return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${t.bg} ${t.text}`}>{t.icon} {tier}</span>;
};

/* ─── MAIN COMPONENT ──────────────────────────────────────── */

export const Customers: React.FC = () => {
   const { data: custData, isLoading, isError } = useCustomers();
   const { data: stats } = useCustomerStats();
   const createCustomer = useCreateCustomer();
   const updateCustomerMut = useUpdateCustomer();
   const deleteCustomerMut = useDeleteCustomer();
   const checkDups = useCheckDuplicates();

   const customers: Customer[] = Array.isArray(custData?.data || custData) ? (custData?.data || custData) as Customer[] : [];

   const [searchQuery, setSearchQuery] = useState('');

   // Advanced Filters State
   const [showFilters, setShowFilters] = useState(false);
   const [statusFilter, setStatusFilter] = useState<string[]>([]);
   const [sourceFilter, setSourceFilter] = useState<string[]>([]);
   const [tierFilter, setTierFilter] = useState<string[]>([]);
   const [minLtv, setMinLtv] = useState<string>('');
   const [maxLtv, setMaxLtv] = useState<string>('');
   const [minOutstanding, setMinOutstanding] = useState<string>('');
   const [maxOutstanding, setMaxOutstanding] = useState<string>('');
   const [startDate, setStartDate] = useState<string>('');
   const [endDate, setEndDate] = useState<string>('');

   // Drawer state
   const [drawerOpen, setDrawerOpen] = useState(false);
   const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
   const [duplicateWarnings, setDuplicateWarnings] = useState<any[]>([]);
   const drawerRef = useRef<HTMLDivElement>(null);

   const emptyForm = (): Partial<Customer> => ({
      name: '', contactName: '', email: '', phone: '', gstNumber: '',
      address: '', shippingAddress: '', notes: '', status: 'Active',
      tier: '', primarySource: 'BMS_MANUAL', paymentTerms: '', creditLimit: undefined,
   });
   const [form, setForm] = useState<Partial<Customer>>(emptyForm());

   const filteredCustomers = customers.filter(c => {
      const matchesSearch = !searchQuery || [c.name, c.email, c.phone, c.contactName, c.clientCode, c.gstNumber]
         .some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(c.status);
      const matchesSource = sourceFilter.length === 0 || sourceFilter.includes(c.primarySource);
      const matchesTier = tierFilter.length === 0 || (c.tier && tierFilter.includes(c.tier));

      const ltv = c.totalSpent || c.totalSpend || 0;
      const matchesMinLtv = !minLtv || ltv >= parseFloat(minLtv);
      const matchesMaxLtv = !maxLtv || ltv <= parseFloat(maxLtv);

      const out = c.outstandingBalance || 0;
      const matchesMinOut = !minOutstanding || out >= parseFloat(minOutstanding);
      const matchesMaxOut = !maxOutstanding || out <= parseFloat(maxOutstanding);

      const cDate = c.createdAt ? new Date(c.createdAt) : new Date();
      const matchesStart = !startDate || cDate >= new Date(startDate);
      const matchesEnd = !endDate || cDate <= new Date(endDate + 'T23:59:59');

      return matchesSearch && matchesStatus && matchesSource && matchesTier &&
         matchesMinLtv && matchesMaxLtv && matchesMinOut && matchesMaxOut &&
         matchesStart && matchesEnd;
   });

   const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
      setter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
   };

   // Escape to close drawer
   useEffect(() => {
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
   }, []);

   // Check duplicates on email/phone/name blur
   const onFieldBlur = useCallback(() => {
      if (!form.name && !form.email && !form.phone) return;
      if (editingCustomer) return; // skip during edit
      checkDups.mutate(
         { name: form.name || undefined, email: form.email || undefined, phone: form.phone || undefined, gstNumber: form.gstNumber || undefined },
         { onSuccess: (matches) => setDuplicateWarnings(matches.filter((m: any) => m.confidence >= 60)) }
      );
   }, [form.name, form.email, form.phone, form.gstNumber, editingCustomer]);

   const openNew = () => {
      setEditingCustomer(null);
      setForm(emptyForm());
      setDuplicateWarnings([]);
      setDrawerOpen(true);
   };

   const openEdit = (c: Customer) => {
      setEditingCustomer(c);
      setForm({
         name: c.name, contactName: c.contactName || '', email: c.email || '',
         phone: c.phone || '', gstNumber: c.gstNumber || '', address: c.address || '',
         shippingAddress: c.shippingAddress || '', notes: c.notes || '',
         status: c.status || 'Active', tier: c.tier || '', primarySource: c.primarySource || 'BMS_MANUAL',
         paymentTerms: c.paymentTerms || '', creditLimit: c.creditLimit,
      });
      setDuplicateWarnings([]);
      setDrawerOpen(true);
   };

   const closeDrawer = () => {
      setDrawerOpen(false);
      setEditingCustomer(null);
      setForm(emptyForm());
      setDuplicateWarnings([]);
   };

   const handleSave = () => {
      if (!form.name) { toast.error('Company name is required'); return; }

      if (editingCustomer) {
         updateCustomerMut.mutate({ id: editingCustomer.id, data: form }, {
            onSuccess: closeDrawer,
            onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update'),
         });
      } else {
         // Block if high-confidence duplicate
         if (duplicateWarnings.some((d: any) => d.confidence >= 85)) {
            toast.error('High-confidence duplicate detected. Please merge instead.');
            return;
         }
         createCustomer.mutate(form as any, {
            onSuccess: closeDrawer,
            onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create'),
         });
      }
   };

   const handleDelete = (id: string) => {
      if (window.confirm('Are you sure? This will soft-delete the client.')) {
         deleteCustomerMut.mutate(id);
      }
   };

   /* ── HEALTH INDICATOR ── */
   const getHealth = (c: Customer) => {
      const ltv = c.totalSpent || c.totalSpend || 0;
      const outstanding = c.outstandingBalance || 0;
      if (outstanding > ltv * 0.5) return { color: 'text-rose-500', icon: 'warning', label: 'At Risk' };
      if (ltv > 50000) return { color: 'text-green-500', icon: 'check_circle', label: 'Healthy' };
      return { color: 'text-amber-500', icon: 'info', label: 'Moderate' };
   };

   return (
      <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 relative overflow-hidden animation-fade-in z-10 w-full">
         <div className="flex-none p-6 pb-2 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">

               {/* ── HEADER ── */}
               <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="flex flex-col gap-1">
                     <h2 className="text-slate-900 dark:text-white text-4xl font-display font-medium leading-tight">Client Directory</h2>
                     <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Revenue intelligence hub • Attribution • Sync bridge</p>
                  </div>
                  <button className="flex items-center justify-center gap-2 px-5 h-11 rounded-xl bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-sm transition-all hover:shadow-md" onClick={openNew}>
                     <span className="material-symbols-outlined text-[20px]">add</span>
                     <span>Add Client</span>
                  </button>
               </div>

               {/* ── KPI CARDS ── */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                     { label: 'Total Clients', value: stats?.totalClients ?? customers.length, icon: 'groups', color: 'text-blue-500' },
                     { label: 'Active Clients', value: stats?.activeClients ?? customers.filter(c => c.status === 'Active').length, icon: 'person_check', color: 'text-green-500' },
                     { label: 'Total LTV', value: formatINR(stats?.totalLTV), icon: 'trending_up', color: 'text-emerald-500' },
                     { label: 'Outstanding', value: formatINR(stats?.totalOutstanding), icon: 'account_balance', color: 'text-rose-500' },
                  ].map(kpi => (
                     <div key={kpi.label} className="flex items-center gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] shadow-sm hover:shadow-md transition-shadow">
                        <div className={`size-11 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${kpi.color}`}>
                           <span className="material-symbols-outlined text-[22px]">{kpi.icon}</span>
                        </div>
                        <div>
                           <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{kpi.label}</p>
                           <p className="text-slate-900 dark:text-white text-xl font-bold font-display">{kpi.value}</p>
                        </div>
                     </div>
                  ))}
               </div>

               {/* ── FILTERS ── */}
               <div className="flex flex-col gap-3 bg-white dark:bg-[#1a2632] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex gap-3 items-center">
                     <div className="relative flex-1 min-w-[200px] group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                           <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                        <input className="block w-full pl-10 pr-3 py-2 border-none rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                           placeholder="Search clients, codes, GST..."
                           value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                     </div>

                     <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <span className="material-symbols-outlined text-[18px]">tune</span>
                        Filters {(statusFilter.length + sourceFilter.length + tierFilter.length + (minLtv ? 1 : 0) + (maxLtv ? 1 : 0) + (minOutstanding ? 1 : 0) + (maxOutstanding ? 1 : 0) + (startDate ? 1 : 0) + (endDate ? 1 : 0)) > 0 && `(${(statusFilter.length + sourceFilter.length + tierFilter.length + (minLtv ? 1 : 0) + (maxLtv ? 1 : 0) + (minOutstanding ? 1 : 0) + (maxOutstanding ? 1 : 0) + (startDate ? 1 : 0) + (endDate ? 1 : 0))})`}
                     </button>
                  </div>

                  {showFilters && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 border-t border-slate-100 dark:border-slate-700/50 mt-1">

                        {/* Multi-selects */}
                        <div className="col-span-1 md:col-span-2 flex flex-wrap gap-6">
                           {[
                              { label: 'Status', state: statusFilter, setter: setStatusFilter, options: ['Active', 'Lead', 'Inactive', 'Past Client'] },
                              { label: 'Tier', state: tierFilter, setter: setTierFilter, options: ['PLATINUM', 'GOLD', 'SILVER'] },
                              { label: 'Source', state: sourceFilter, setter: setSourceFilter, options: ['POS', 'ECOMMERCE', 'BMS_MANUAL', 'API', 'IMPORT'] },
                           ].map(f => (
                              <div key={f.label} className="flex flex-col gap-2">
                                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{f.label}</span>
                                 <div className="flex flex-wrap gap-1.5">
                                    {f.options.map(o => (
                                       <button key={o} onClick={() => toggleFilter(f.setter, o)}
                                          className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${f.state.includes(o) ? 'bg-primary text-white border-primary' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                          {o}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           ))}
                        </div>

                        {/* Ranges */}
                        <div className="flex flex-col gap-2">
                           <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">LTV Range (₹)</span>
                           <div className="flex items-center gap-2">
                              <input type="number" placeholder="Min" className="w-full px-3 py-1.5 text-sm rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none" value={minLtv} onChange={e => setMinLtv(e.target.value)} />
                              <span className="text-slate-400">-</span>
                              <input type="number" placeholder="Max" className="w-full px-3 py-1.5 text-sm rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none" value={maxLtv} onChange={e => setMaxLtv(e.target.value)} />
                           </div>
                           <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Outstanding (₹)</span>
                           <div className="flex items-center gap-2">
                              <input type="number" placeholder="Min" className="w-full px-3 py-1.5 text-sm rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none" value={minOutstanding} onChange={e => setMinOutstanding(e.target.value)} />
                              <span className="text-slate-400">-</span>
                              <input type="number" placeholder="Max" className="w-full px-3 py-1.5 text-sm rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none" value={maxOutstanding} onChange={e => setMaxOutstanding(e.target.value)} />
                           </div>
                        </div>

                        {/* Dates & Quick Clear */}
                        <div className="flex flex-col gap-2">
                           <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Created Between</span>
                           <input type="date" className="w-full px-3 py-1.5 text-sm rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 outline-none block" value={startDate} onChange={e => setStartDate(e.target.value)} />
                           <input type="date" className="w-full px-3 py-1.5 text-sm rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 outline-none block mt-1" value={endDate} onChange={e => setEndDate(e.target.value)} />

                           <button onClick={() => {
                              setStatusFilter([]); setSourceFilter([]); setTierFilter([]);
                              setMinLtv(''); setMaxLtv(''); setMinOutstanding(''); setMaxOutstanding('');
                              setStartDate(''); setEndDate('');
                           }} className="mt-3 w-full text-xs font-medium text-rose-500 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded py-1.5 transition-colors">
                              Clear All Filters
                           </button>
                        </div>

                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* ── TABLE ── */}
         <div className="flex-1 overflow-auto px-6 pb-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] shadow-sm overflow-hidden">
               <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                     <tr>
                        {['Client', 'Source', 'Tier', 'Status', 'LTV', 'Outstanding', 'Health', 'Actions'].map(h => (
                           <th key={h} className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider font-display text-slate-700 dark:text-slate-300 ${h === 'LTV' || h === 'Outstanding' ? 'text-right' : ''}`}>{h}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                     {isLoading ? (
                        <tr><td colSpan={8} className="text-center py-12 text-slate-500">
                           <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                           <p className="mt-2">Loading clients...</p>
                        </td></tr>
                     ) : isError ? (
                        <tr><td colSpan={8} className="text-center py-12 text-rose-500">
                           <span className="material-symbols-outlined text-3xl">error</span>
                           <p className="mt-2">Failed to load clients</p>
                        </td></tr>
                     ) : filteredCustomers.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-12 text-slate-500">
                           <span className="material-symbols-outlined text-4xl">person_search</span>
                           <p className="mt-2 font-medium">No clients found</p>
                           <p className="text-sm">Try adjusting your filters or add a new client</p>
                        </td></tr>
                     ) : filteredCustomers.map(c => {
                        const health = getHealth(c);
                        const st = STATUS_COLORS[c.status || 'Active'] || STATUS_COLORS.Active;
                        return (
                           <tr key={c.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => openEdit(c)}>
                              <td className="px-5 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-xs">
                                       {c.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                       <p className="font-display font-medium text-slate-900 dark:text-white text-sm">{c.name}</p>
                                       <p className="text-xs text-slate-500">{c.clientCode || '—'} {c.contactName ? `• ${c.contactName}` : ''}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-5 py-4"><SourceBadge source={c.primarySource} /></td>
                              <td className="px-5 py-4"><TierBadge tier={c.tier} /></td>
                              <td className="px-5 py-4">
                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${st.bg}`}>
                                    <span className={`size-1.5 rounded-full ${st.dot}`}></span>
                                    {c.status || 'Active'}
                                 </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                 <p className="font-display font-semibold text-slate-900 dark:text-white text-sm">{formatINR(c.totalSpent || c.totalSpend)}</p>
                              </td>
                              <td className="px-5 py-4 text-right">
                                 <p className={`font-display text-sm font-medium ${(c.outstandingBalance || 0) > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                    {formatINR(c.outstandingBalance)}
                                 </p>
                              </td>
                              <td className="px-5 py-4">
                                 <span className={`inline-flex items-center gap-1 text-xs font-medium ${health.color}`} title={health.label}>
                                    <span className="material-symbols-outlined text-[16px]">{health.icon}</span>
                                    {health.label}
                                 </span>
                              </td>
                              <td className="px-5 py-4">
                                 <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Edit">
                                       <span className="material-symbols-outlined text-[18px]">edit</span>
                                    </button>
                                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Delete">
                                       <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </div>

         {/* ── SLIDE-IN DRAWER ── */}
         {drawerOpen && (
            <>
               <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={closeDrawer} />
               <div ref={drawerRef}
                  className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-[#1a2632] shadow-2xl border-l border-slate-200 dark:border-slate-700 overflow-y-auto custom-scrollbar animate-slide-in-right flex flex-col">

                  {/* Drawer Header */}
                  <div className="sticky top-0 z-10 bg-white dark:bg-[#1a2632] border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
                     <h3 className="text-xl font-display font-medium text-slate-900 dark:text-white">
                        {editingCustomer ? 'Edit Client' : 'New Client'}
                     </h3>
                     <button onClick={closeDrawer} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                     </button>
                  </div>

                  <div className="flex-1 p-6 space-y-6">

                     {/* Duplicate Warning Banner */}
                     {duplicateWarnings.length > 0 && (
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                           <div className="flex items-start gap-3">
                              <span className="material-symbols-outlined text-amber-600 mt-0.5">warning</span>
                              <div>
                                 <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">Potential duplicates detected</p>
                                 {duplicateWarnings.map((d: any, i) => (
                                    <p key={i} className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                       <strong>{d.customer.name}</strong> — {d.confidence}% match on {d.matchField}
                                    </p>
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Section 1 — Identity */}
                     <fieldset>
                        <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                           <span className="material-symbols-outlined text-[16px]">badge</span> Identity
                        </legend>
                        <div className="grid grid-cols-2 gap-4">
                           <DrawerField label="Company Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} onBlur={onFieldBlur} />
                           <DrawerField label="Contact Person" value={form.contactName} onChange={v => setForm({ ...form, contactName: v })} />
                           <DrawerField label="Email" value={form.email} type="email" onChange={v => setForm({ ...form, email: v })} onBlur={onFieldBlur} />
                           <DrawerField label="Phone" value={form.phone} type="tel" onChange={v => setForm({ ...form, phone: v })} onBlur={onFieldBlur} />
                           <DrawerField label="GST Number" value={form.gstNumber} onChange={v => setForm({ ...form, gstNumber: v })} onBlur={onFieldBlur} />
                        </div>
                     </fieldset>

                     {/* Section 2 — Source */}
                     <fieldset>
                        <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                           <span className="material-symbols-outlined text-[16px]">call_split</span> Source
                        </legend>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Primary Source</label>
                              <select value={form.primarySource || 'BMS_MANUAL'} onChange={e => setForm({ ...form, primarySource: e.target.value as PrimarySource })}
                                 disabled={!!editingCustomer}
                                 className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60">
                                 {['BMS_MANUAL', 'POS', 'ECOMMERCE', 'API', 'IMPORT'].map(s => (
                                    <option key={s} value={s}>{s === 'BMS_MANUAL' ? 'Manual' : s}</option>
                                 ))}
                              </select>
                           </div>
                           <DrawerField label="Secondary Source" value={form.secondarySource} onChange={v => setForm({ ...form, secondarySource: v })} />
                        </div>
                     </fieldset>

                     {/* Section 3 — Classification */}
                     <fieldset>
                        <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                           <span className="material-symbols-outlined text-[16px]">category</span> Classification
                        </legend>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Tier</label>
                              <select value={form.tier || ''} onChange={e => setForm({ ...form, tier: e.target.value || undefined })}
                                 className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20">
                                 <option value="">None</option>
                                 <option value="PLATINUM">Platinum</option>
                                 <option value="GOLD">Gold</option>
                                 <option value="SILVER">Silver</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
                              <select value={form.status || 'Active'} onChange={e => setForm({ ...form, status: e.target.value })}
                                 className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20">
                                 <option value="Active">Active</option>
                                 <option value="Lead">Lead</option>
                                 <option value="Inactive">Inactive</option>
                                 <option value="Past Client">Past Client</option>
                              </select>
                           </div>
                        </div>
                     </fieldset>

                     {/* Section 4 — Address */}
                     <fieldset>
                        <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                           <span className="material-symbols-outlined text-[16px]">location_on</span> Address
                        </legend>
                        <div className="grid grid-cols-1 gap-4">
                           <DrawerField label="Billing Address" value={form.address} onChange={v => setForm({ ...form, address: v })} />
                           <DrawerField label="Shipping Address" value={form.shippingAddress} onChange={v => setForm({ ...form, shippingAddress: v })} />
                        </div>
                     </fieldset>

                     {/* Section 5 — Financial */}
                     <fieldset>
                        <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                           <span className="material-symbols-outlined text-[16px]">payments</span> Financial Setup
                        </legend>
                        <div className="grid grid-cols-2 gap-4">
                           <DrawerField label="Credit Limit (₹)" value={form.creditLimit?.toString() || ''} type="number" onChange={v => setForm({ ...form, creditLimit: v ? parseFloat(v) : undefined })} />
                           <DrawerField label="Payment Terms" value={form.paymentTerms} onChange={v => setForm({ ...form, paymentTerms: v })} placeholder="e.g. Net 30" />
                        </div>
                     </fieldset>

                     {/* Notes */}
                     <fieldset>
                        <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                           <span className="material-symbols-outlined text-[16px]">sticky_note_2</span> Notes
                        </legend>
                        <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })}
                           rows={3} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Internal notes..." />
                     </fieldset>
                  </div>

                  {/* Drawer Footer */}
                  <div className="sticky bottom-0 bg-white dark:bg-[#1a2632] border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3">
                     <button onClick={closeDrawer} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm">Cancel</button>
                     <button onClick={handleSave} disabled={createCustomer.isPending || updateCustomerMut.isPending}
                        className="flex-1 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                        {(createCustomer.isPending || updateCustomerMut.isPending) && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                        {editingCustomer ? 'Update Client' : 'Create Client'}
                     </button>
                  </div>
               </div>
            </>
         )}

         {/* Animation keyframe */}
         <style>{`
            @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
            .animate-slide-in-right { animation: slideInRight 0.25s ease-out; }
         `}</style>
      </div>
   );
};

/* ── REUSABLE FORM FIELD ─────────────────────────────────── */
const DrawerField: React.FC<{
   label: string; value?: string; type?: string;
   onChange: (v: string) => void; onBlur?: () => void;
   placeholder?: string;
}> = ({ label, value, type = 'text', onChange, onBlur, placeholder }) => (
   <div>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} onBlur={onBlur}
         placeholder={placeholder || label.replace(' *', '')}
         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20" />
   </div>
);
