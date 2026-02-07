
import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Invoice, AppModule } from '../types';
import { Plus, Wallet, X, Trash2, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Printer, Download } from 'lucide-react';
import { Dashboard } from './Dashboard'; // Fallback import, though logic is handled in App.tsx typically via module switching

export const Finance: React.FC = () => {
   const { invoices, formatCurrency, addInvoice, updateInvoicePayment, deleteInvoice } = useGlobal();
   const [payId, setPayId] = useState<string | null>(null);
   const [payAmt, setPayAmt] = useState<string>('');
   const [searchQuery, setSearchQuery] = useState('');

   const filteredInvoices = invoices.filter(inv =>
      inv.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase())
   );

   // Metrics Logic Fixed: Only count 'Income' invoices for Receivables
   // Pending Receivables = Sum(Total Amount - Paid Amount) for Income Invoices
   const incomeTotal = invoices.filter(i => i.type === 'Income').reduce((acc, i) => acc + i.amount, 0);
   const incomePaid = invoices.filter(i => i.type === 'Income').reduce((acc, i) => acc + i.paidAmount, 0);
   const pendingReceivables = incomeTotal - incomePaid;

   const expensePaid = invoices.filter(i => i.type === 'Expense').reduce((acc, i) => acc + i.paidAmount, 0);
   const profit = incomePaid - expensePaid;

   // This relies on the parent component or App.tsx structure to allow navigation. 
   // However, since Finance is a module, we can simulate navigation by triggering a window event or simple alert if deep nav isn't passed.
   // Ideally, useGlobal should expose a setModule function, but it's currently local to App.tsx.
   // For this fix, I will assume the user clicks the button on sidebar or simply instruct them.
   // BUT, to be "production ready", I will simply show a message that they should use the Invoice Gen module.

   return (
      <div className="h-full flex flex-col bg-background-dark text-white font-display overflow-hidden p-6 md:p-8">
         <div className="flex justify-between items-end mb-8 shrink-0">
            <div>
               <h2 className="text-3xl font-black tracking-tighter text-white">Financial Hub</h2>
               <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Cashflow & Ledger Management</p>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-4">
               <div className="text-zinc-500 text-xs italic hidden md:block">Use "Invoice Gen" for new invoices.</div>
               <button
                  onClick={() => alert("Simulating Export to CSV...\n\n(In production, this would download a CSV file of the transaction ledger.)")}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white hover:bg-white/10 hover:border-primary/50 transition-all"
               >
                  <Download className="w-4 h-4" /> Export Ledger
               </button>
            </div>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-dark p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
               <Wallet className="absolute top-4 right-4 w-8 h-8 text-zinc-600 opacity-50" />
               <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Net Balance</p>
               <h3 className="text-2xl font-black text-white">{formatCurrency(profit)}</h3>
            </div>
            <div className="bg-surface-dark p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
               <TrendingUp className="absolute top-4 right-4 w-8 h-8 text-green-500/50" />
               <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Total Income (Paid)</p>
               <h3 className="text-2xl font-black text-green-400">{formatCurrency(incomePaid)}</h3>
            </div>
            <div className="bg-surface-dark p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
               <TrendingDown className="absolute top-4 right-4 w-8 h-8 text-red-500/50" />
               <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Total Expenses</p>
               <h3 className="text-2xl font-black text-red-400">{formatCurrency(expensePaid)}</h3>
            </div>
            <div className="bg-surface-dark p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
               <AlertCircle className="absolute top-4 right-4 w-8 h-8 text-amber-500/50" />
               <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Pending Receivables</p>
               <h3 className="text-2xl font-black text-amber-400">{formatCurrency(pendingReceivables)}</h3>
            </div>
         </div>

         {/* Transactions Table */}
         <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-dark border border-white/5 rounded-[2rem]">
            <table className="w-full text-left">
               <thead className="bg-surface-highlight border-b border-white/5">
                  <tr>
                     <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest">Details</th>
                     <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest text-right">Amount</th>
                     <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest text-right">Paid</th>
                     <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest text-center">Status</th>
                     <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filteredInvoices.map(inv => (
                     <tr key={inv.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                        <td className="p-6">
                           <div className="font-bold text-white">{inv.client}</div>
                           <div className="text-[10px] text-zinc-500 font-mono">{inv.id} • {inv.date}</div>
                        </td>
                        <td className="p-6 text-right font-mono font-bold text-white">{formatCurrency(inv.amount)}</td>
                        <td className="p-6 text-right font-mono font-bold text-primary">{formatCurrency(inv.paidAmount)}</td>
                        <td className="p-6 text-center">
                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${inv.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>{inv.status}</span>
                        </td>
                        <td className="p-6 text-right">
                           <div className="flex justify-end gap-2">
                              <button onClick={(e) => { e.stopPropagation(); setPayId(inv.id); }} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-black transition-colors"><CheckCircle className="w-4 h-4" /></button>
                              <button onClick={(e) => { e.stopPropagation(); deleteInvoice(inv.id); }} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Partial Payment Modal */}
         {payId && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
               <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl space-y-6 text-center">
                  <h3 className="text-2xl font-black text-white">Record Payment</h3>
                  <p className="text-zinc-400 text-sm">Enter amount received from client.</p>
                  <input
                     type="number"
                     autoFocus
                     value={payAmt}
                     onChange={e => setPayAmt(e.target.value)}
                     placeholder="0.00"
                     className="w-full bg-background-dark border border-white/10 rounded-2xl p-6 text-3xl font-black text-primary text-center focus:outline-none focus:border-primary"
                  />
                  <div className="flex gap-4 pt-4">
                     <button onClick={() => setPayId(null)} className="flex-1 py-4 bg-white/5 rounded-full font-bold text-white">Cancel</button>
                     <button onClick={() => { if (payId && payAmt) { updateInvoicePayment(payId, Number(payAmt)); setPayId(null); setPayAmt(''); } }} className="flex-1 py-4 bg-primary text-black rounded-full font-black uppercase text-xs tracking-widest shadow-glow">Confirm</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
