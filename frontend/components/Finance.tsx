import React, { useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { Invoice, AppModule } from '../types';
import { Plus, Wallet, X, Trash2, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Printer, Download } from 'lucide-react';
import { TableSkeleton, InlineError } from './ui/Skeleton';
import api from '../services/api';
import toast from 'react-hot-toast';

export const Finance: React.FC = () => {
   const { data: invData, isLoading, isError, error, refetch } = useInvoices();
   // FORCE ARRAYS
   const invoices: any[] = Array.isArray(invData) ? invData as any[] : [];
   const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
   const [payId, setPayId] = useState<string | null>(null);
   const [payAmt, setPayAmt] = useState<string>('');
   const [searchQuery, setSearchQuery] = useState('');

   const filteredInvoices = invoices.filter((inv: any) =>
      inv.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id?.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const incomeTotal = invoices.filter((i: any) => i.type === 'Income').reduce((acc: number, i: any) => acc + (i.amount || 0), 0);
   const incomePaid = invoices.filter((i: any) => i.type === 'Income').reduce((acc: number, i: any) => acc + (i.paidAmount || 0), 0);
   const pendingReceivables = incomeTotal - incomePaid;
   const expensePaid = invoices.filter((i: any) => i.type === 'Expense').reduce((acc: number, i: any) => acc + (i.paidAmount || 0), 0);
   const profit = incomePaid - expensePaid;

   if (isLoading) return <div className="h-full p-8"><TableSkeleton /></div>;
   if (isError) return <div className="h-full p-8"><InlineError message={(error as Error)?.message || 'Failed to load'} onRetry={refetch} /></div>;

   return (
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 font-display overflow-hidden p-6 md:p-8">
         <div className="flex justify-between items-end mb-8 shrink-0">
            <div>
               <h2 className="text-3xl font-black tracking-tighter text-slate-800">Financial Hub</h2>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Cashflow & Ledger Management</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-slate-500 text-xs italic hidden md:block">Use "Invoice Gen" for new invoices.</div>
               <button
                  onClick={() => alert("Simulating Export to CSV...")}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-800 hover:bg-slate-100 hover:border-primary/50 transition-all"
               >
                  <Download className="w-4 h-4" /> Export Ledger
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-200/60 relative overflow-hidden">
               <Wallet className="absolute top-4 right-4 w-8 h-8 text-slate-400 opacity-50" />
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Net Balance</p>
               <h3 className="text-2xl font-black text-slate-800">{formatCurrency(profit)}</h3>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-200/60 relative overflow-hidden">
               <TrendingUp className="absolute top-4 right-4 w-8 h-8 text-green-500/50" />
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Income (Paid)</p>
               <h3 className="text-2xl font-black text-green-400">{formatCurrency(incomePaid)}</h3>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-200/60 relative overflow-hidden">
               <TrendingDown className="absolute top-4 right-4 w-8 h-8 text-red-500/50" />
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Expenses</p>
               <h3 className="text-2xl font-black text-red-400">{formatCurrency(expensePaid)}</h3>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-200/60 relative overflow-hidden">
               <AlertCircle className="absolute top-4 right-4 w-8 h-8 text-amber-500/50" />
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Pending Receivables</p>
               <h3 className="text-2xl font-black text-amber-400">{formatCurrency(pendingReceivables)}</h3>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-[2rem]">
            <table className="w-full text-left">
               <thead className="bg-slate-100 border-b border-slate-200/60">
                  <tr>
                     <th className="p-6 text-[10px] text-slate-500 font-black uppercase tracking-widest">Details</th>
                     <th className="p-6 text-[10px] text-slate-500 font-black uppercase tracking-widest text-right">Amount</th>
                     <th className="p-6 text-[10px] text-slate-500 font-black uppercase tracking-widest text-right">Paid</th>
                     <th className="p-6 text-[10px] text-slate-500 font-black uppercase tracking-widest text-center">Status</th>
                     <th className="p-6 text-[10px] text-slate-500 font-black uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filteredInvoices.map((inv: any) => (
                     <tr key={inv.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="p-6">
                           <div className="font-bold text-slate-800">{inv.client}</div>
                           <div className="text-[10px] text-slate-500 font-mono">{inv.id} • {inv.date}</div>
                        </td>
                        <td className="p-6 text-right font-mono font-bold text-slate-800">{formatCurrency(inv.amount || 0)}</td>
                        <td className="p-6 text-right font-mono font-bold text-primary">{formatCurrency(inv.paidAmount || 0)}</td>
                        <td className="p-6 text-center">
                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${inv.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>{inv.status}</span>
                        </td>
                        <td className="p-6 text-right">
                           <div className="flex justify-end gap-2">
                              <button onClick={(e) => { e.stopPropagation(); setPayId(inv.id); }} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-black transition-colors"><CheckCircle className="w-4 h-4" /></button>
                              <button onClick={(e) => { e.stopPropagation(); api.delete(`/invoices/${inv.id}`).then(() => { refetch(); toast.success('Deleted'); }).catch(() => toast.error('Failed')); }} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {payId && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
               <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-[2.5rem] p-10 w-full max-w-md shadow-xl shadow-slate-200/50 space-y-6 text-center">
                  <h3 className="text-2xl font-black text-slate-800">Record Payment</h3>
                  <p className="text-slate-500 text-sm">Enter amount received from client.</p>
                  <input
                     type="number"
                     autoFocus
                     value={payAmt}
                     onChange={e => setPayAmt(e.target.value)}
                     placeholder="0.00"
                     className="w-full bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-6 text-3xl font-black text-primary text-center focus:outline-none focus:border-primary"
                  />
                  <div className="flex gap-4 pt-4">
                     <button onClick={() => setPayId(null)} className="flex-1 py-4 bg-slate-50 rounded-full font-bold text-slate-800">Cancel</button>
                     <button onClick={() => { if (payId && payAmt) { api.put(`/invoices/${payId}/payment`, { amount: Number(payAmt) }).then(() => { refetch(); toast.success('Payment recorded'); }).catch(() => toast.error('Failed')); setPayId(null); setPayAmt(''); } }} className="flex-1 py-4 bg-primary text-black rounded-full font-black uppercase text-xs tracking-widest shadow-glow">Confirm</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
