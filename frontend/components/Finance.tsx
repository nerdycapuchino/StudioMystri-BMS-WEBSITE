import React, { useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { Invoice } from '../types';
import { Plus, Wallet, X, Trash2, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Printer, Download, Filter } from 'lucide-react';
import { TableSkeleton, InlineError } from './ui/Skeleton';
import api from '../services/api';
import toast from 'react-hot-toast';

export const Finance: React.FC = () => {
   const { data: invData, isLoading, isError, error, refetch } = useInvoices();
   const invoices: Invoice[] = Array.isArray(invData) ? invData as Invoice[] : [];

   const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

   const [searchQuery, setSearchQuery] = useState('');
   const [payId, setPayId] = useState<string | null>(null);
   const [payAmt, setPayAmt] = useState<string>('');

   const filteredInvoices = invoices.filter((inv) =>
      inv.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id?.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const incomeTotal = invoices.filter((i) => i.type === 'Income').reduce((acc, i) => acc + (i.amount || 0), 0);
   const incomePaid = invoices.filter((i) => i.type === 'Income').reduce((acc, i) => acc + (i.paidAmount || 0), 0);
   const pendingReceivables = incomeTotal - incomePaid;
   const expensePaid = invoices.filter((i) => i.type === 'Expense').reduce((acc, i) => acc + (i.paidAmount || 0), 0);
   const profit = incomePaid - expensePaid;

   // Expected assets fallback hook (returns empty for now to avoid dummy data)
   const assets: any[] = [];

   // KPI cards mapping based on the template
   // 1: Total Monthly Spending -> Total Expenses
   // 2: Budget Remaining -> Net Balance
   // 3: Budget Utilization -> Income vs Expense Ratio

   const utilizationRatio = incomePaid > 0 ? Math.min((expensePaid / incomePaid) * 100, 100).toFixed(2) : 0;

   if (isLoading) return <div className="h-full p-8"><TableSkeleton /></div>;
   if (isError) return <div className="h-full p-8"><InlineError message={(error as Error)?.message || 'Failed to load'} onRetry={refetch} /></div>;

   return (
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-8 h-full overflow-y-auto custom-scrollbar bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
         {/* Page Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
               <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Finance & Asset Operations</h2>
               <p className="text-slate-500 dark:text-slate-400">Manage company expenditures, income, and track studio machinery status.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="hidden sm:flex items-center bg-white dark:bg-[#1a2634] border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
                  <button onClick={() => toast.success("Exporting ledger...")} className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">Export</button>
                  <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                  <button className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded flex items-center gap-2">
                     <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                     This Month
                  </button>
               </div>
               <button onClick={() => toast("Use Invoice settings for manual entries", { icon: 'ℹ️' })} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg shadow-sm shadow-blue-500/30 transition-all font-semibold text-sm">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  New Entry
               </button>
            </div>
         </div>

         {/* Metrics Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Net Balance (Mapping Budget Remaining template style but for Net) */}
            <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                     <span className="material-symbols-outlined">account_balance_wallet</span>
                  </div>
                  <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${profit >= 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
                     Net Profit
                  </span>
               </div>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Balance</p>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(profit)}</h3>
               <div className="absolute -right-6 -bottom-6 text-slate-50 dark:text-slate-800/50 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-[120px]">account_balance_wallet</span>
               </div>
            </div>

            {/* Pending Receivables */}
            <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                     <span className="material-symbols-outlined">pending_actions</span>
                  </div>
               </div>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Receivables</p>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(pendingReceivables)}</h3>
               <div className="absolute -right-6 -bottom-6 text-slate-50 dark:text-slate-800/50 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-[120px]">schedule</span>
               </div>
            </div>

            {/* GST Summary */}
            <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-primary/20 dark:border-primary/20 shadow-sm relative overflow-hidden group">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                     <span className="material-symbols-outlined">receipt_long</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                     <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Tax Tracking
                  </span>
               </div>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400">GST Collected</p>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(invoices.filter(i => i.type === 'Income').reduce((acc, i) => acc + (i.taxAmount || 0), 0))}
               </h3>
               <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">GST Paid:</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                     {formatCurrency(invoices.filter(i => i.type === 'Expense').reduce((acc, i) => acc + (i.taxAmount || 0), 0))}
                  </span>
               </div>
               <div className="absolute -right-6 -bottom-6 text-primary/5 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-[120px]">receipt_long</span>
               </div>
            </div>

            {/* Expense per Income Ratio */}
            <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-1 flex flex-col justify-center">
               <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Efficiency</h4>
                  <span className="text-xs font-bold text-primary">{utilizationRatio}%</span>
               </div>
               <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-3 overflow-hidden relative">
                  <div className="relative bg-primary h-full rounded-full" style={{ width: `${utilizationRatio}%` }}></div>
               </div>
               <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">
                  <span>Exp: {formatCurrency(expensePaid)}</span>
                  <span>Inc: {formatCurrency(incomePaid)}</span>
               </div>
            </div>
         </div>

         <div className="grid lg:grid-cols-3 gap-6">
            {/* Ledger Section (Left - Wider) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
               <div className="bg-white dark:bg-[#1a2634] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ledger Log</h3>
                     <div className="flex items-center gap-2">
                        <div className="relative">
                           <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                           <input
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary w-40 sm:w-64 placeholder-slate-400 text-slate-700 dark:text-slate-200"
                              placeholder="Search transactions..."
                              type="text"
                           />
                        </div>
                        <button className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                           <span className="material-symbols-outlined text-[20px]">filter_list</span>
                        </button>
                     </div>
                  </div>

                  <div className="overflow-x-auto flex-1">
                     <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                           <tr>
                              <th className="px-6 py-3 font-semibold">Details</th>
                              <th className="px-6 py-3 font-semibold">Type</th>
                              <th className="px-6 py-3 font-semibold text-right">Amount</th>
                              <th className="px-6 py-3 font-semibold text-right">Tax (GST)</th>
                              <th className="px-6 py-3 font-semibold text-right">Paid</th>
                              <th className="px-6 py-3 font-semibold text-center">Status</th>
                              <th className="px-6 py-3 font-semibold text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                           {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                              <tr key={inv.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                 <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-900 dark:text-white">{inv.client}</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{inv.id} • {new Date(inv.date).toLocaleDateString()}</div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${inv.type === 'Income' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'}`}>
                                       {inv.type}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">{formatCurrency(inv.amount || 0)}</td>
                                 <td className="px-6 py-4 text-right text-slate-500">
                                    {inv.taxAmount ? (
                                       <div className="flex flex-col items-end">
                                          <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(inv.taxAmount)}</span>
                                          <span className="text-[10px] text-slate-400 font-mono">{(inv as any).gstNumber || inv.sellerGst || 'N/A'}</span>
                                       </div>
                                    ) : '—'}
                                 </td>
                                 <td className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">{formatCurrency(inv.paidAmount || 0)}</td>
                                 <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${inv.status === 'Paid' ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                                       <span className={`w-1.5 h-1.5 rounded-full ${inv.status === 'Paid' ? 'bg-green-500' : 'bg-amber-500'}`}></span> {inv.status}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => setPayId(inv.id)} className="p-1.5 text-slate-400 hover:text-primary rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" title="Record Payment">
                                          <span className="material-symbols-outlined text-[18px]">payments</span>
                                       </button>
                                       <button onClick={() => { api.delete(`/invoices/${inv.id}`).then(() => { refetch(); toast.success('Deleted'); }).catch(() => toast.error('Failed')); }} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" title="Delete">
                                          <span className="material-symbols-outlined text-[18px]">delete</span>
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           )) : (
                              <tr>
                                 <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    No ledger entries found.
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>

                  <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                     <span className="text-sm text-slate-500">Showing {filteredInvoices.length} entries</span>
                     <div className="flex gap-1">
                        <button className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-600 dark:text-slate-300" disabled>Previous</button>
                        <button className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-600 dark:text-slate-300" disabled={filteredInvoices.length < 10}>Next</button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Asset Management Section (Right - Narrower) */}
            <div className="lg:col-span-1">
               <div className="bg-white dark:bg-[#1a2634] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm h-full flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white">Studio Assets</h3>
                     <button className="text-sm font-semibold text-primary hover:text-primary/80">View All</button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {assets.length > 0 ? assets.map((asset, index) => (
                        <div key={index} className="flex items-start gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                           <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined">{asset.icon || 'architecture'}</span>
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                 <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{asset.name}</h4>
                                 <div className={`size-2.5 rounded-full ring-2 ${asset.status === 'Operational' ? 'bg-green-500 ring-green-100 dark:ring-green-900' : 'bg-orange-500 ring-orange-100 dark:ring-orange-900'}`} title={asset.status}></div>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">ID: #{asset.id}</p>
                           </div>
                        </div>
                     )) : (
                        <div className="flex flex-col items-center gap-3 p-8 text-center text-slate-400 dark:text-slate-500 mt-6 md:mt-12">
                           <span className="material-symbols-outlined text-[48px] opacity-40">inventory</span>
                           <p className="text-sm font-medium">No assets registered yet</p>
                        </div>
                     )}
                  </div>

                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                     <button onClick={() => toast('Asset registration not yet implemented', { icon: '🚧' })} className="w-full py-2 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors border border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-primary hover:bg-white dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Register New Asset
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Payment Modal */}
         {payId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
               <div className="bg-white dark:bg-[#1a2634] border border-slate-200 dark:border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-xl">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 text-center">Record Payment</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">Enter the amount received or paid.</p>

                  <div className="relative mb-8">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
                     <input
                        type="number"
                        autoFocus
                        value={payAmt}
                        onChange={e => setPayAmt(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-8 pr-4 text-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder-slate-300 dark:placeholder-slate-600"
                     />
                  </div>

                  <div className="flex gap-3">
                     <button onClick={() => setPayId(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                     <button onClick={() => {
                        if (payId && payAmt) {
                           api.put(`/invoices/${payId}/payment`, { amount: Number(payAmt) })
                              .then(() => { refetch(); toast.success('Payment recorded'); })
                              .catch(() => toast.error('Failed to log payment'));
                           setPayId(null);
                           setPayAmt('');
                        }
                     }} className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-blue-500/30">Confirm</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
